import React from 'react';
import { Search, Bell, Inbox, HelpCircle, Hash, Palette } from 'lucide-react';
import { useAppStore } from '../store';
import InboxView from '../views/InboxView';
import './TopBar.css';

interface TopBarProps {
  title: string;
  icon?: React.ReactNode;
}

const TopBar = ({ title, icon = <Hash size={20} className="topbar-hash" /> }: TopBarProps) => {
  const globalDesign = useAppStore(state => state.globalDesign);
  const setGlobalDesign = useAppStore(state => state.setGlobalDesign);
  const [showHelp, setShowHelp] = React.useState(false);
  const [showInbox, setShowInbox] = React.useState(false);

  return (
    <div className="top-bar">
      <div className="topbar-left">
        {icon}
      </div>

      <div className="topbar-center">
        <h3 className="topbar-title">{title}</h3>
      </div>

      <div className="topbar-right">
        <div className="search-bar">
          <Search size={14} className="search-icon" />
          <input type="text" placeholder="Buscar" />
        </div>
        <div className="topbar-icon" title="Notificações">
          <Bell size={18} />
        </div>
        <div className="topbar-icon" title="Caixa de entrada" onClick={() => setShowInbox(true)}>
          <Inbox size={18} />
        </div>
        <div className="topbar-icon" title="Ajuda" onClick={() => setShowHelp(true)}>
          <HelpCircle size={18} />
        </div>
        <div 
          className="topbar-icon global-design-toggle" 
          title="Trocar Design Visual Geral"
          onClick={() => setGlobalDesign((globalDesign + 1) % 9)}
        >
          <Palette size={18} />
        </div>
      </div>

      {showInbox && (
        <InboxView onClose={() => setShowInbox(false)} />
      )}

      {showHelp && (
        <div className="help-modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-modal-content" onClick={e => e.stopPropagation()}>
            <div className="help-modal-header">
              <HelpCircle size={32} className="help-icon-neon" />
              <h2>PROTOCOLO DE ORIENTAÇÃO</h2>
            </div>
            <div className="help-modal-body">
              <p className="philosophy-msg">
                "A maior ajuda que você pode ter é enfrentar seus próprios medos."
              </p>
              <div className="support-info">
                <p>Se precisar de acompanhamento, conselho, suporte ou apenas uma amizade sincera, nossa rede está ativa.</p>
                <div className="contact-hints">
                  <span>Procure pelos <strong>Supervisores</strong></span>
                  <span className="dot-sep">•</span>
                  <span>Fale com os <strong>Mediadores</strong></span>
                </div>
              </div>
            </div>
            <button className="help-close-btn" onClick={() => setShowHelp(false)}>ENTENDIDO</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;
