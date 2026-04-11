import { useState, useEffect } from 'react';
import { Flame, ShieldAlert } from 'lucide-react';
import './GustWelcomeModal.css';

export const GustWelcomeModal = () => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // Show on mount
    const timer = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => setVisible(false), 800);
  };

  if (!visible) return null;

  return (
    <div className={`gust-welcome-overlay ${closing ? 'fade-out' : ''}`}>
      <div className="gust-welcome-card glass-panel">
        <div className="fire-container">
          <Flame size={64} className="neon-fire-icon" />
          <div className="fire-glow" />
        </div>
        
        <div className="gust-welcome-content">
          <h1 className="welcome-title">SEJA EXTREMAMENTE BEM-VINDO</h1>
          <div className="gust-identity">
            <ShieldAlert size={18} className="security-icon" />
            <span>ESTABELECENDO CONEXÃO SEGURA...</span>
          </div>
          
          <p className="gust-warning">
            O terminal está operacional. Lembre-se: o BOT <strong>Gust</strong> 
            está monitorando cada bit e cada pulso desta rede em tempo real.
          </p>
          
          <div className="security-status pulse">
            VIGILÂNCIA ATIVA: 100%
          </div>

          <button className="enter-btn" onClick={handleClose}>
            ACESSAR FREQUÊNCIA
          </button>
        </div>

        <div className="scan-line" />
      </div>
    </div>
  );
};
