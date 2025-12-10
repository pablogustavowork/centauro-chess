const { Chess } = require('chess.js');

const chess = new Chess();
chess.loadPgn("1. e4 e5");
const history = chess.history({ verbose: true });

console.log("History item keys:", Object.keys(history[0]));
console.log("Sample item:", JSON.stringify(history[0], null, 2));
console.log("Has 'before'?", 'before' in history[0]);
console.log("Has 'after'?", 'after' in history[0]);
