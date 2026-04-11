import React, { useState, useEffect } from 'react';
import { X, Gamepad2, Grid3X3 } from 'lucide-react';
import NeonChess from './NeonChess';
import NeonTicTacToe from './NeonTicTacToe';
import NeonSnake from './NeonSnake';
import { useAppStore } from '../../store';
import './NeonGames.css';

interface ActivitiesOverlayProps {
  onClose: () => void;
}

const ActivitiesOverlay: React.FC<ActivitiesOverlayProps> = ({ onClose }) => {
  const [activeGame, setActiveGame] = useState<'menu' | 'chess' | 'tictactoe' | 'snake'>('menu');
  const { logEvent, activeProjectId } = useAppStore();

  const gameNames: Record<string, string> = {
    chess: 'Xadrez Neon',
    tictactoe: 'Jogo da Velha',
    snake: 'Neon Snake'
  };

  useEffect(() => {
    if (activeGame !== 'menu' && activeProjectId) {
      logEvent(activeProjectId, 'Atividade: Iniciada', `O usuário começou a jogar: ${gameNames[activeGame]}`);
    }
    
    // Cleanup function as a surrogate for "closed game"
    return () => {
      // Note: This logic only works if we know which game was active before menu or close
      // But for simplicity, we'll log it when the overlay itself closes or game switches back to menu
    };
  }, [activeGame]);

  const handleSelectGame = (game: 'chess' | 'tictactoe' | 'snake') => {
    setActiveGame(game);
  };

  const handleClose = () => {
    if (activeGame !== 'menu' && activeProjectId) {
      logEvent(activeProjectId, 'Atividade: Encerrada', `O usuário fechou o jogo: ${gameNames[activeGame]}`);
    }
    onClose();
  };

  return (
    <div className="games-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="games-header">
        <button className="close-games-btn" onClick={handleClose} title="Fechar Atividades">
          <X size={24} />
        </button>
      </div>

      {activeGame === 'menu' && (
        <>
          <Gamepad2 size={64} style={{ color: 'var(--neon-cyan)', marginBottom: 20, opacity: 0.8 }} />
          <h2 style={{ fontFamily: 'var(--font-tech)', fontSize: 24, marginBottom: 10 }}>Atividades do Servidor</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 30 }}>Escolha um jogo para aproveitar com a galera da chamada:</p>
          
          <div className="games-menu">
            <div className="game-card" onClick={() => handleSelectGame('chess')}>
               <Gamepad2 size={40} />
               <h4>Xadrez Neon</h4>
            </div>
            <div className="game-card" onClick={() => handleSelectGame('tictactoe')}>
               <Grid3X3 size={40} style={{ color: 'var(--neon-magenta)' }} />
               <h4 style={{ color: 'var(--neon-magenta)' }}>Jogo da Velha</h4>
            </div>
            <div className="game-card" onClick={() => handleSelectGame('snake')}>
               <Gamepad2 size={40} style={{ color: 'var(--neon-lime)' }} />
               <h4 style={{ color: 'var(--neon-lime)' }}>Neon Snake</h4>
            </div>
          </div>
        </>
      )}

      {activeGame === 'chess' && <NeonChess />}
      {activeGame === 'tictactoe' && <NeonTicTacToe />}
      {activeGame === 'snake' && <NeonSnake />}
      
      {activeGame !== 'menu' && (
        <button 
          className="back-to-menu-btn" 
          onClick={() => {
            if (activeProjectId) logEvent(activeProjectId, 'Atividade: Encerrada', `O usuário fechou o jogo: ${gameNames[activeGame]}`);
            setActiveGame('menu');
          }}
        >
          Sair do Jogo
        </button>
      )}
    </div>
  );
};

export default ActivitiesOverlay;
