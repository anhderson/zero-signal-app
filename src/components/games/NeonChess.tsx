import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useAppStore } from '../../store';
import { useGameSync } from '../../hooks/useGameSync';
import './NeonGames.css';

const NeonChess: React.FC = () => {
  const { gameSession, currentUser } = useAppStore();
  const { sendMove, resetGame } = useGameSync();
  const [game, setGame] = useState(new Chess(gameSession?.board || undefined));

  useEffect(() => {
    if (gameSession?.board && gameSession.board !== game.fen()) {
        setGame(new Chess(gameSession.board));
    }
  }, [gameSession?.board]);

  if (!gameSession) return null;

  const isWhite = gameSession.players[0] === currentUser?.id;
  const isMyTurn = (game.turn() === 'w' && isWhite) || (game.turn() === 'b' && !isWhite);

  const updateStatus = () => {
    if (game.isCheckmate()) return 'Xeque-mate! Game Over.';
    if (game.isDraw()) return 'Empate!';
    if (game.isCheck()) return 'Xeque!';
    return game.turn() === 'w' ? 'Vez das Brancas' : 'Vez das Pretas';
  };

  const status = updateStatus();

  function makeMove({ sourceSquare, targetSquare }: { sourceSquare: string, targetSquare: string }): boolean {
    if (!isMyTurn) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move === null) return false;
      
      const gameCopy = new Chess(game.fen());
      setGame(gameCopy);
      
      const otherPlayer = gameSession.players.find(p => p !== currentUser?.id);
      sendMove(gameCopy.fen(), otherPlayer!, game.isCheckmate() ? currentUser?.id : undefined);
      
      return true;
    } catch (e) {
      return false;
    }
  }

  const handleReset = () => {
    const newGame = new Chess();
    setGame(newGame);
    resetGame(newGame.fen());
  };

  return (
    <div className="neon-chess-container">
      <div className="neon-chess-header">
         <h3>Xadrez Neon {isWhite ? '(BRANCAS)' : '(PRETAS)'}</h3>
         <div className={`status-badge ${game.turn() === 'w' ? 'white-turn' : 'black-turn'} ${isMyTurn ? 'active-turn' : ''}`}>
            {isMyTurn ? `SUA VEZ (${status})` : `ESPERANDO (${status})`}
         </div>
      </div>
      <div className="chessboard-wrapper">
        <Chessboard 
           options={{
             position: game.fen(),
             onPieceDrop: makeMove,
             boardOrientation: isWhite ? 'white' : 'black',
             darkSquareStyle: { backgroundColor: 'rgba(0, 255, 255, 0.15)' },
             lightSquareStyle: { backgroundColor: 'rgba(255, 0, 255, 0.05)' }
           }}
        />
      </div>
      <button className="reset-btn" onClick={handleReset}>Reiniciar Partida</button>
    </div>
  );
};

export default NeonChess;
