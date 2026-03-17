
/**
 * LICHESS SERVICE
 * Handles fetching games from the Lichess API.
 */

export const fetchLichessGames = async (username: string, count: number = 20, perfType: string = ''): Promise<string[]> => {
    let url = `https://lichess.org/api/games/user/${username}?max=${count}&pgnInJson=false&clocks=true&evals=false`;
    if (perfType && perfType !== 'all') {
        url += `&perfType=${perfType}`;
    }
    
    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/x-chess-pgn',
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Usuario no encontrado en Lichess.');
            }
            if (response.status === 429) {
                throw new Error('Demasiadas solicitudes a Lichess. Por favor espera un minuto.');
            }
            throw new Error('Error al conectar con la API de Lichess.');
        }

        const text = await response.text();
        
        // Robust split: search for [Event "..."] start of headers
        const games = text.split(/\n(?=\[Event )/).filter(g => g.trim().length > 0);
        
        return games;
    } catch (error: any) {
        console.error('Lichess fetch error:', error);
        throw error;
    }
};
