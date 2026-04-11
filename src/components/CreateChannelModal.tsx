import { useState } from 'react';
import { X, Hash, Volume2, Folder, Calendar, Sparkles } from 'lucide-react';
import { useAppStore } from '../store';
import './CreateChannelModal.css';

interface CreateChannelModalProps {
  onClose: () => void;
  projectId: string;
  initialType?: 'text' | 'voice' | 'storage' | 'events';
  onCreated?: (channelId: string) => void;
}

const CreateChannelModal = ({ onClose, projectId, initialType = 'text', onCreated }: CreateChannelModalProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState(initialType);
  const [isCreating, setIsCreating] = useState(false);
  const { createChannel, setActiveChannel, canManageSincronicidade } = useAppStore();
  
  const isMod = canManageSincronicidade(projectId);

  const handleAction = async () => {
    if (!name.trim() || isCreating) return;
    setIsCreating(true);
    try {
      // Small formatting to make it look like a typical channel name
      const formattedName = name.trim().toLowerCase().replace(/\s+/g, '-');
      const channelId = await createChannel(projectId, formattedName, type);
      if (channelId) {
        setActiveChannel(channelId);
        if (onCreated) onCreated(channelId);
        onClose();
      }
    } catch (error) {
      console.error('Falha ao manifestar vórtex:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const types = [
    { id: 'text',    label: 'Vórtex de Texto',  icon: <Hash size={18} />,     desc: 'Comunicação baseada em dados textuais.' },
    { id: 'voice',   label: 'Vórtex de Voz',    icon: <Volume2 size={18} />,  desc: 'Transmissão síncrona de áudio e vídeo.' },
    { id: 'storage', label: 'Caixa de Pandora', icon: <Folder size={18} />,   desc: isMod ? 'Repositório de fragmentos.' : 'Só a moderação pode criar.', disabled: !isMod },
    { id: 'events',  label: 'Alinhamento',      icon: <Calendar size={18} />, desc: isMod ? 'Sincronização temporal.' : 'Só a moderação pode criar.', disabled: !isMod },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-channel-modal glass-panel neon-border" onClick={e => e.stopPropagation()}>
        <div className="create-channel-header">
          <div className="header-icon-stack">
            {types.find(t => t.id === type)?.icon}
            <Sparkles size={14} className="sparkle-overlay" />
          </div>
          <h1>MANIFESTAR VÓRTEX</h1>
          <p>Estabeleça um novo ponto de conexão na rede</p>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="create-channel-body">
          <div className="input-group-neon">
            <label>NOME DO VÓRTEX</label>
            <div className="neon-input-wrapper">
              <span className="channel-prefix">{type === 'text' ? '#' : '>'}</span>
              <input 
                type="text" 
                placeholder="novo-vortex" 
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleAction()}
              />
              <div className="input-glow" />
            </div>
          </div>

          <div className="type-selection">
            <label className="section-label">TIPO DE FREQUÊNCIA</label>
            <div className="type-grid">
              {types.map(t => (
                <div 
                  key={t.id} 
                  className={`type-card ${type === t.id ? 'active' : ''} ${t.disabled ? 'disabled' : ''}`}
                  onClick={() => !t.disabled && setType(t.id as any)}
                >
                  <div className="type-icon">{t.icon}</div>
                  <div className="type-info">
                    <span>{t.label}</span>
                    <p>{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="create-channel-footer">
          <button className="cancel-pill" onClick={onClose}>ABORTAR</button>
          <button 
            className={`create-pill ${!name.trim() || isCreating ? 'disabled' : ''}`} 
            onClick={handleAction}
            disabled={!name.trim() || isCreating}
          >
            {isCreating ? 'SINCRONIZANDO...' : 'ATIVAR CONEXÃO'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChannelModal;
