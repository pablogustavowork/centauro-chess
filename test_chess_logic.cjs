
const { Chess } = require('chess.js');

const pgn = "[Event 'Test'] 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6";
const chess = new Chess();
try {
    chess.loadPgn(pgn);
    console.log("PGN Loaded successfully");
} catch (e) {
    console.error("PGN Load failed", e);
}

const history = chess.history({ verbose: true });
console.log(`History length: ${history.length}`);

const replay = new Chess();
history.forEach((move, i) => {
    const fenBefore = replay.fen();
    console.log(`Move ${i + 1}: ${move.san} | FEN: ${fenBefore}`);

    try {
        const result = replay.move(move);
        if (!result) {
            console.error(`Move ${move.san} failed in replay`);
        }
    } catch (e) {
        console.error(`Move ${move.san} threw error:`, e.message);
    }
});
