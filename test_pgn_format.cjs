const { Chess } = require('chess.js');

const validPgn = "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6";
const partialPgn = "cxd4 8. O-O Bc5 9. Bf4 a5 10. a4 b6";

// Test 1: Valid PGN
console.log("--- Test 1: Valid PGN ---");
try {
    const game = new Chess();
    game.loadPgn(validPgn);
    console.log("Valid PGN loaded successfully.");
    console.log("History length:", game.history().length);
} catch (e) {
    console.error("Valid PGN failed:", e.message);
}

// Test 2: Partial PGN
console.log("\n--- Test 2: Partial PGN ---");
try {
    const game = new Chess();
    game.loadPgn(partialPgn);
    console.log("Partial PGN loaded successfully (Unexpected).");
} catch (e) {
    console.error("Partial PGN failed (Expected):", e.message);
}

// Test 3: Partial PGN with simple cleanup logic (mimicking service)
console.log("\n--- Test 3: Partial PGN with cleanup ---");
const simplePgn = partialPgn.replace(/\{.*?\}/gs, '').replace(/\(.*\)/gs, '');
try {
    const game = new Chess();
    game.loadPgn(simplePgn);
    console.log("Cleaned Partial PGN loaded successfully.");
} catch (e) {
    console.error("Cleaned Partial PGN failed:", e.message);
}
