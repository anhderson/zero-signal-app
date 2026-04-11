import { useState } from 'react';
import { X, Sparkles, Zap, Shield, Globe, Key } from 'lucide-react';
import { useAppStore } from '../store';
import './CreateServerModal.css';

interface CreateServerModalProps {
  onClose: () => void;
  onCreated: (projectId: string) => void;
}

const CreateServerModal = ({ onClose, onCreated }: CreateServerModalProps) => {
  const [name, setName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<'standard' | 'invite' | 'combat'>('standard');
  const [isCreating, setIsCreating] = useState(false);
  const { createProject } = useAppStore();

  const handleAction = async () => {
    if (selectedTemplate === 'invite') {
      if (!accessCode.trim() || accessCode.length !== 7 || isCreating) return;
      // Logical placeholder for joining with code
      setIsCreating(true);
      setTimeout(() => {
        alert("Sincronizando Frequência... Acesso Negado: Código Expirado ou Inválido.");
        setIsCreating(false);
      }, 1500);
      return;
    }

    if (!name.trim() || isCreating) return;
    setIsCreating(true);
    try {
      const projectId = await createProject(name.trim());
      if (projectId) {
        onCreated(projectId);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-server-modal glass-panel neon-border" onClick={e => e.stopPropagation()}>
        <div className="create-server-header">
          <div className="header-icon-stack">
            <Globe size={32} className="neon-icon-blue" />
            <Sparkles size={16} className="sparkle-overlay" />
          </div>
          <h1>MANIFESTAR FRAGMENTO</h1>
          <p>Crie um novo espaço na rede Zero Signal</p>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="create-server-body">
          <div className="input-group-neon">
            <label>
              {selectedTemplate === 'invite' ? 'CÓDIGO DE ACESSO (7 DÍGITOS)' : 'NOME DO FRAGMENTO'}
            </label>
            <div className="neon-input-wrapper">
              {selectedTemplate === 'invite' ? (
                <input 
                  type="text" 
                  placeholder="X7-K89-Z..." 
                  maxLength={7}
                  value={accessCode}
                  onChange={e => setAccessCode(e.target.value.toUpperCase())}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleAction()}
                />
              ) : (
                <input 
                  type="text" 
                  placeholder="Ex: Operação Ether..." 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleAction()}
                />
              )}
              <div className="input-glow" />
            </div>
          </div>

          <div className="template-grid">
            <div 
              className={`template-card ${selectedTemplate === 'standard' ? 'active' : ''}`}
              onClick={() => setSelectedTemplate('standard')}
            >
              <div className="card-icon"><Zap size={20} /></div>
              <div className="card-info">
                <span>PADRÃO ZERO</span>
                <p>Canais essenciais de texto e voz ativados.</p>
              </div>
            </div>
            
            <div 
              className={`template-card ${selectedTemplate === 'invite' ? 'active' : ''}`}
              onClick={() => setSelectedTemplate('invite')}
            >
              <div className="card-icon"><Key size={20} /></div>
              <div className="card-info">
                <span>CONVITE ESPECIAL</span>
                <p>Acesso via Código. Use a chave do Fundador.</p>
              </div>
            </div>

            <div 
              className={`template-card disabled`}
              onClick={() => {}}
            >
              <div className="card-icon"><Shield size={20} /></div>
              <div className="card-info">
                <span>ESTAÇÃO DE COMBATE</span>
                <p>Bloqueado: Requer Nível 2</p>
              </div>
            </div>
          </div>

          <p className="creation-policy">
            Ao criar este fragmento, você concorda com os protocolos de integridade do sistema.
          </p>
        </div>

        <div className="create-server-footer">
          <button className="cancel-pill" onClick={onClose}>ABORTAR</button>
          <button 
            className={`create-pill ${
              (selectedTemplate === 'invite' ? !accessCode.trim() : !name.trim()) ? 'disabled' : ''
            }`} 
            onClick={handleAction}
            disabled={(selectedTemplate === 'invite' ? !accessCode.trim() : !name.trim()) || isCreating}
          >
            {isCreating ? 'PROCESSANDO...' : (selectedTemplate === 'invite' ? 'VALIDAR ACESSO' : 'INICIAR MANIFESTAÇÃO')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateServerModal;
