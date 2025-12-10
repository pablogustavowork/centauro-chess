
import { supabase } from './supabase';
import { GameData, AnalysisResult, CriticalMoment, ErrorType } from '../types';

export const saveGame = async (gameData: GameData, userId: string): Promise<GameData | null> => {
    if (!userId) return null;

    const { data, error } = await supabase
        .from('games')
        .insert([
            {
                user_id: userId,
                white: gameData.white,
                black: gameData.black,
                result: gameData.result,
                input_pgn: gameData.pgn,
                average_cpl: gameData.averageCpl,
                dominant_error: gameData.dominantError,
                analysis_json: {
                    criticalMoments: gameData.criticalMoments,
                    id: gameData.id, // original random ID
                    date: gameData.date
                }
            }
        ])
        .select()
        .single();

    if (error) {
        console.error('Error saving game:', error);
        return null;
    }

    // Return the game with the Real DB ID if needed, 
    // or just return the original if we don't need to swap IDs immediately
    return {
        ...gameData,
        id: data.id // Use the UUID from DB
    };
};

export const getUserGames = async (userId: string): Promise<GameData[]> => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching games:', error);
        return [];
    }

    // Map DB rows back to GameData
    return data.map((row: any) => ({
        id: row.id,
        white: row.white,
        black: row.black,
        result: row.result,
        pgn: row.input_pgn,
        averageCpl: row.average_cpl,
        dominantError: row.dominant_error as ErrorType,
        date: row.created_at, // Use created_at as date
        criticalMoments: row.analysis_json?.criticalMoments || []
    }));
};
