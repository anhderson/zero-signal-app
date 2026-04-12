import { useEffect } from 'react';
import { useAppStore } from '../store';
import { Trophy, Compass, MessageSquare, Phone, Video, Users, Mail, X } from 'lucide-react';
import './AchievementModal.css';

const ACHIEVEMENT_DETAILS: Record<string, { name: string; icon: any; color: string }> = {
  pioneer:   { name: 'Desbravador',     icon: <Compass size={40} />,       color: 'white' },
  chat_1:    { name: 'Primeiro Chat',   icon: <MessageSquare size={40} />, color: 'cyan' },
  audio_1:   { name: 'Primeiro Áudio',  icon: <Phone size={40} />,         color: 'green' },
  video_1:   { name: 'Primeiro Vídeo',  icon: <Video size={40} />,         color: 'purple' },
  meeting_1: { name: 'Primeira Task',   icon: <Users size={40} />,         color: 'orange' },
  inbox_1:   { name: 'Primeiro Inbox',  icon: <Mail size={40} />,          color: 'yellow' },
  chat_33:   { name: 'Tagarela 33',     icon: <MessageSquare size={40} />, color: 'red' },
  audio_33:  { name: 'Voz Ativa 33',    icon: <Phone size={40} />,         color: 'white' },
  video_33:  { name: 'Visão 33',        icon: <Video size={40} />,         color: 'blue' },
  meeting_33:{ name: 'Diplomata 33',    icon: <Users size={40} />,         color: 'cyan' },
  inbox_33:  { name: 'Mensageiro 33',   icon: <Mail size={40} />,          color: 'magenta' },
};

const AchievementModal = () => {
  const { unlockedAchievement, clearUnlockedAchievement } = useAppStore();

  useEffect(() => {
    if (unlockedAchievement) {
      // Opt: Play achievement sound
      const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  }, [unlockedAchievement]);

  if (!unlockedAchievement) return null;

  const detail = ACHIEVEMENT_DETAILS[unlockedAchievement];
  if (!detail) return null;

  return (
    <div className="achievement-modal-overlay">
      <div className="achievement-card">
        <button className="close-btn" onClick={() => clearUnlockedAchievement()}>
          <X size={20} />
        </button>

        <div className="card-header">
          <Trophy className="trophy-icon" size={24} />
          <span>CONQUISTA DESBLOQUEADA</span>
        </div>

        <div className={`achievement-icon-wrapper ${detail.color}`}>
          <div className="glow-effect" />
          {detail.icon}
        </div>

        <h2 className="achievement-title">{detail.name}</h2>
        <p className="achievement-subtitle">O seu protocolo foi atualizado com sucesso.</p>

        <button className="confirm-btn" onClick={() => clearUnlockedAchievement()}>
          CONTINUAR
        </button>
      </div>
    </div>
  );
};

export default AchievementModal;
