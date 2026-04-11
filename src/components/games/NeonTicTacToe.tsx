import React, { useState } from 'react';
import './NeonGames.css';

const NeonTicTacToe: React.FC = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const calculateWinner = (squares: any[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handlePlay = (i: number) => {
    if (board[i] || calculateWinner(board)) return;
    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(square => square !== null);

  let status;
  if (winner) status = `Vencedor: ${winner}`;
  else if (isDraw) status = 'Empate!';
  else status = `Vez de: ${xIsNext ? 'X' : 'O'}`;

  return (
    <div className="neon-ttt-container">
      <h3>Jogo da Velha Neon</h3>
      <div className="status-badge ttt-status">
        {status}
      </div>

      <div className="ttt-board">
        {board.map((cell, i) => (
          <div 
             key={i} 
             className={`ttt-cell ${cell === 'X' ? 'cell-x' : cell === 'O' ? 'cell-o' : ''}`}
             onClick={() => handlePlay(i)}
          >
             {cell}
          </div>
        ))}
      </div>

      <button className="reset-btn" onClick={reset}>Nova Partida</button>
    </div>
  );
};

export default NeonTicTacToe;
