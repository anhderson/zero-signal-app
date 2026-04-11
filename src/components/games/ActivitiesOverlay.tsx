import React, { useState, useEffect } from 'react';
import { X, Gamepad2, Grid3X3, UserPlus } from 'lucide-react';
import NeonChess from './NeonChess';
import NeonTicTacToe from './NeonTicTacToe';
import NeonSnake from './NeonSnake';
import { useAppStore } from '../../store';
import { useGameSync } from '../../hooks/useGameSync';
import './NeonGames.css';

interface ActivitiesOverlayProps {
  onClose: () => void;
}

const ActivitiesOverlay: React.FC<ActivitiesOverlayProps> = ({ onClose }) => {
  const [activeGame, setActiveGame] = useState<'menu' | 'chess' | 'tictactoe' | 'snake' | 'inviting'>('menu');
  const [targetGame, setTargetGame] = useState<any>(null);
  const { logEvent, activeProjectId, voiceParticipants, gameInvite, setGameInvite, gameSession, setGameSession } = useAppStore();
  const { invitePlayer, acceptInvite } = useGameSync();

  const gameNames: Record<string, string> = {
    chess: 'Xadrez Neon',
    tictactoe: 'Jogo da Velha',
    snake: 'Neon Snake',
    inviting: 'Convidando...'
  };

  useEffect(() => {
    if (gameSession && activeGame === 'inviting') {
        setActiveGame(gameSession.type as any);
    }
  }, [gameSession, activeGame]);

  const handleSelectGame = (game: 'chess' | 'tictactoe' | 'snake') => {
    setTargetGame(game);
    setActiveGame('inviting');
  };

  const handleClose = () => {
    if (activeGame !== 'menu' && activeProjectId) {
      logEvent(activeProjectId, 'Atividade: Encerrada', `O usuário fechou o jogo: ${gameNames[activeGame]}`);
    }
    onClose();
  };

  const handleInvite = (userId: string) => {
    invitePlayer(userId, targetGame);
    if (activeProjectId) logEvent(activeProjectId, 'Atividade: Convite', `Convidou um aliado para ${gameNames[targetGame]}`);
  };

  return (
    <div className="games-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="games-header">
        {gameInvite && (
           <div className="game-invite-toast">
              <span>{voiceParticipants.find(p => p.id === gameInvite.from)?.name || 'Aliado'} te convidou para {gameNames[gameInvite.type]}!</span>
              <div className="invite-actions">
                <button className="accept-btn" onClick={acceptInvite}>Aceitar</button>
                <button className="reject-btn" onClick={() => setGameInvite(null)}>Recusar</button>
              </div>
           </div>
        )}
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

      {activeGame === 'inviting' && (
        <div className="invite-screen">
            <h3>Convidar para {gameNames[targetGame]}</h3>
            <p>Selecione alguém na chamada para desafiar:</p>
            <div className="invite-list">
                {voiceParticipants.filter(p => !p.isLocal).map(p => (
                    <div key={p.id} className="invite-row">
                        <span>{p.name}</span>
                        <button className="invite-btn" onClick={() => handleInvite(p.id)}>
                            <UserPlus size={16} /> Convidar
                        </button>
                    </div>
                ))}
                {voiceParticipants.filter(p => !p.isLocal).length === 0 && (
                    <p style={{ opacity: 0.5, fontStyle: 'italic' }}>Nenhum aliado disponível no momento.</p>
                )}
            </div>
            <button className="back-btn" onClick={() => setActiveGame('menu')}>Voltar</button>
        </div>
      )}

      {activeGame === 'chess' && <NeonChess />}
      {activeGame === 'tictactoe' && <NeonTicTacToe />}
      {activeGame === 'snake' && <NeonSnake />}
      
      {['chess', 'tictactoe', 'snake'].includes(activeGame) && (
        <button 
          className="back-to-menu-btn" 
          onClick={() => {
            if (activeProjectId) logEvent(activeProjectId, 'Atividade: Encerrada', `O usuário fechou o jogo: ${gameNames[activeGame]}`);
            setGameSession(null);
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
