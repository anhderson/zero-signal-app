import React from 'react';
import { useAppStore } from '../../store';
import { useGameSync } from '../../hooks/useGameSync';
import './NeonGames.css';

const NeonTicTacToe: React.FC = () => {
  const { gameSession, currentUser } = useAppStore();
  const { sendMove, resetGame } = useGameSync();

  if (!gameSession) return null;

  const board = gameSession.board || Array(9).fill(null);
  const isMyTurn = gameSession.turn === currentUser?.id;
  const mySymbol = gameSession.players[0] === currentUser?.id ? 'X' : 'O';

  const calculateWinner = (squares: any[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every((square: any) => square !== null);

  const handlePlay = (i: number) => {
    if (board[i] || winner || !isMyTurn) return;
    
    const newBoard = [...board];
    newBoard[i] = mySymbol;
    
    const otherPlayer = gameSession.players.find(p => p !== currentUser?.id);
    const win = calculateWinner(newBoard);
    
    sendMove(newBoard, win || isDraw ? gameSession.turn! : otherPlayer!, win);
  };

  const reset = () => {
    resetGame(Array(9).fill(null));
  };

  let status;
  if (winner) status = `Vencedor: ${winner}`;
  else if (isDraw) status = 'Empate!';
  else status = isMyTurn ? `Sua vez (${mySymbol})` : `Aguardando oponente...`;

  return (
    <div className="neon-ttt-container">
      <h3>Jogo da Velha Neon</h3>
      <div className={`status-badge ttt-status ${isMyTurn && !winner && !isDraw ? 'active-turn' : ''}`}>
        {status}
      </div>

      <div className="ttt-board">
        {board.map((cell: string | null, i: number) => (
          <div 
             key={i} 
             className={`ttt-cell ${cell === 'X' ? 'cell-x' : cell === 'O' ? 'cell-o' : ''} ${!cell && isMyTurn ? 'cell-playable' : ''}`}
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
