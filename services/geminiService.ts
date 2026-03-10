
import { GoogleGenAI, Type } from "@google/genai";
import { Puzzle, ErrorType } from "../types";

// NOTA: En producción, nunca expongas keys en el cliente.
// Para esta demo, asumimos que process.env.API_KEY está disponible.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateAdaptivePuzzles = async (errorType: ErrorType): Promise<Puzzle[]> => {
  const model = "gemini-2.5-flash";

  let promptTheme = "táctica general";
  if (errorType === ErrorType.TACTICAL_GRAVE) promptTheme = "patrones de mate, piezas colgadas y errores tácticos graves";
  if (errorType === ErrorType.POSITIONAL_STRONG) promptTheme = "estructura de peones, casillas débiles y mejorar la actividad de las piezas";
  if (errorType === ErrorType.OPENING_IMPRECISION) promptTheme = "castigar errores de apertura, ventaja de desarrollo y control del centro";

  const prompt = `Genera 6 problemas de ajedrez adecuados para un jugador intermedio que lucha con: ${errorType}. 
  Enfócate en: ${promptTheme}.
  Devuelve un array JSON donde cada objeto tenga:
  - fen: La cadena FEN de la posición.
  - solution: La mejor jugada en Notación Algebraica Estándar (SAN), ej: "Cf3".
  - theme: Una etiqueta corta de 2-3 palabras en español sobre el tema táctico.
  - description: Una pista de una frase en español.
  
  Asegúrate de que los FENs sean válidos y resolubles.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              fen: { type: Type.STRING },
              solution: { type: Type.STRING },
              theme: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["fen", "solution", "theme", "description"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    return JSON.parse(text) as Puzzle[];
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback puzzles if API fails or key is missing
    return [
      {
        fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
        solution: "Bb5",
        theme: "Apertura",
        description: "Desarrolla con tempo (Ruy Lopez)."
      },
      {
        fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5",
        solution: "d3",
        theme: "Estructura Sólida",
        description: "Apoya el centro."
      }
    ];
  }
};

export const getGameCoachComment = async (pgn: string, accuracy: number, result: string): Promise<string> => {
  const model = "gemini-2.5-flash";
  // Truncate PGN to avoid token limits if very long
  const safePgn = pgn.length > 2000 ? pgn.substring(0, 2000) + "..." : pgn;

  const prompt = `Act as a friendly, encouraging chess coach.
    Review this game summary:
    - Result: ${result}
    - Player Accuracy: ${accuracy}%
    - PGN (partial): ${safePgn}

    Write ONE single sentence (max 20 words) in Spanish summarizing the player's performance.
    Be positive but honest. If accuracy is low, suggest learning. If high, praise calculation.
    Example: "¡Gran partida! Has controlado el centro a la perfección, aunque hubo un pequeño desliz en el final."`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text?.trim() || "¡Buena partida! Sigue practicando para mejorar tu precisión.";
  } catch (error) {
    console.error("Gemini Coach Error:", error);
    return "¡Bien jugado! Analiza tus errores para seguir mejorando.";
  }
};
