const { Chess } = require('chess.js');

const userPgn = `[Event "luisalberto2626 vs. knights_Armour2304"]
[Site "https://chessify.page.link/main"]
[Date "2025-12-02"]
[Round "?"]
[White "luisalberto2626"]
[Black "knights_Armour2304"]
[Result "1-0"]
[WhiteElo "1760"]
[BlackElo "1732"]
[TimeControl "600"]
[Termination "Victoria de luisalberto2626 por jaque mate"]
[AnalyzedBy "Stockfish 13 time:0.0s per move, Chessis App"]

1. Nf3 d5 2. c4 d4 3. d3 c5 4. e3 e6 5. Be2 Nc6 6. exd4 Nxd4 7. Nxd4 cxd4 8. O-O Bc5 9. Bf4 a5 10. a4 b6 11. Nd2 Bb7 12. Nb3 Nf6 13. Bf3 Bxf3 14. Qxf3 Rc8 15. Qb7 O-O 16. Rfe1 Nh5 17. Bd2 Rb8 18. Qf3 Qh4 19. Re4 Qxe4 20. Qxe4 Nf6 21. Qf3 Rfe8 22. Rb1 e5 23. Nxc5 bxc5 24. Bxa5 e4 25. dxe4 Nxe4 26. Re1 Nf6 27. Rxe8+ Rxe8 28. h3 h6 29. Bb6 Re1+ 30. Kh2 Ne4 31. a5 g6 32. a6 f5 33. a7 Ra1 34. g4 d3 35. gxf5 d2 36. Qxe4 d1=Q 37. a8=Q+ Kg7 38. Qe5+ Kf7 39. Qb7+ Kf8 40. Qee7+ Kg8 41. Qg7# 1-0`;

console.log("--- Testing User PGN Parsing ---");
try {
    const game = new Chess();
    game.loadPgn(userPgn);
    console.log("PGN Loaded successfully");

    // Check history (this was the failing point before refactor, now checking new logic)
    const history = game.history({ verbose: true });
    console.log(`History length: ${history.length}`);

    if (history.length > 0) {
        const firstMove = history[0];
        console.log("First move has 'before'?", 'before' in firstMove);
        console.log("First move value 'before':", firstMove.before);
    }

} catch (e) {
    console.error("PGN Load failed:", e.message);

    // Try workaround logic from service
    console.log("--- Retrying with simplistic cleanup ---");
    const simplePgn = userPgn.replace(/\{.*?\}/gs, '').replace(/\(.*\)/gs, '');
    try {
        const g2 = new Chess();
        g2.loadPgn(simplePgn);
        console.log("Cleanup PGN Loaded successfully");
    } catch (e2) {
        console.error("Cleanup PGN failed:", e2.message);
    }
}
