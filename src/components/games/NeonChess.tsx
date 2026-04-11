import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import './NeonGames.css';

const NeonChess: React.FC = () => {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [status, setStatus] = useState('Sua vez');

  useEffect(() => {
    updateStatus();
  }, [fen]);

  const updateStatus = () => {
    if (game.isCheckmate()) {
      setStatus('Xeque-mate! Game Over.');
    } else if (game.isDraw()) {
      setStatus('Empate!');
    } else if (game.isCheck()) {
      setStatus('Xeque!');
    } else {
      setStatus(game.turn() === 'w' ? 'Vez das Brancas' : 'Vez das Pretas');
    }
  };

  const makeMove = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => {
    if (!targetSquare) return false;
    try {
      // Create a new instance because chess.js mutates state and React needs new refs sometimes
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // auto promote to queen for simplicity
      });

      if (move === null) return false;
      
      setGame(gameCopy);
      setFen(gameCopy.fen());
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleReset = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
  };

  return (
    <div className="neon-chess-container">
      <div className="neon-chess-header">
         <h3>Xadrez Neon</h3>
         <div className={`status-badge ${game.turn() === 'w' ? 'white-turn' : 'black-turn'}`}>
            {status}
         </div>
      </div>
      <div className="chessboard-wrapper">
        <Chessboard 
           options={{
             position: fen,
             onPieceDrop: makeMove,
             darkSquareStyle: { backgroundColor: 'rgba(var(--accent-rgb), 0.15)' },
             lightSquareStyle: { backgroundColor: 'rgba(255, 0, 255, 0.05)' },
             boardStyle: {
               borderRadius: '8px',
               boxShadow: '0 0 20px rgba(var(--accent-rgb), 0.2)',
               border: '2px solid var(--neon-cyan)'
             }
           }}
        />
      </div>
      <button className="reset-btn" onClick={handleReset}>Reiniciar Partida</button>
    </div>
  );
};

export default NeonChess;
