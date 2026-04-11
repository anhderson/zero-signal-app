import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, Lock, AlertTriangle, FileText } from 'lucide-react';
import './IntegrityProtocolModal.css';

const IntegrityProtocolModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const lastAccepted = localStorage.getItem('integrity_protocol_accepted');
    const now = new Date().getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    if (!lastAccepted || (now - parseInt(lastAccepted)) > oneWeek) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    if (!agreed) return;
    localStorage.setItem('integrity_protocol_accepted', new Date().getTime().toString());
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="integrity-overlay">
      <div className="integrity-modal glass-panel neon-border-red">
        <div className="integrity-header">
          <ShieldAlert size={40} className="alert-icon-flicker" />
          <div className="header-text">
            <h1>PROTOCOLO DE INTEGRIDADE</h1>
            <span className="sub-header">// SISTEMA CRIPTOGRÁFICO ATIVO</span>
          </div>
        </div>

        <div className="integrity-content">
          <div className="content-scroll">
            <div className="warning-box">
              <AlertTriangle size={18} />
              <span>CONFIDENCIALIDADE NÍVEL A-1</span>
            </div>
            
            <p className="protocol-text">
              <strong>Protocolo de Integridade e Confidencialidade:</strong><br />
              O uso deste aplicativo é restrito a membros autorizados da organização. Todas as comunicações são confidenciais e protegidas pela Lei Geral de Proteção de Dados Pessoais. É proibido compartilhar, gravar ou divulgar qualquer informação a terceiros não autorizados. O usuário é responsável pelo uso do acesso e pela preservação do sigilo. Qualquer vazamento ou uso indevido será considerado infração grave, podendo resultar em sanções internas e responsabilização judicial, nos termos da legislação vigente.
            </p>

            <div className="protocol-details">
              <div className="detail-item">
                <Lock size={14} />
                <span>Criptografia de Ponta-a-Ponta</span>
              </div>
              <div className="detail-item">
                <FileText size={14} />
                <span>Log de Auditoria Ativado</span>
              </div>
            </div>
          </div>
        </div>

        <div className="integrity-footer">
          <label className={`agree-checkbox ${agreed ? 'checked' : ''}`}>
            <input 
              type="checkbox" 
              checked={agreed} 
              onChange={(e) => setAgreed(e.target.checked)} 
            />
            <div className="custom-check">
              {agreed && <CheckCircle2 size={16} />}
            </div>
            <span>Compreendo e aceito os termos do protocolo.</span>
          </label>

          <button 
            className={`accept-btn ${!agreed ? 'disabled' : ''}`}
            onClick={handleAccept}
            disabled={!agreed}
          >
            CONFIRMAR IDENTIDADE E ACESSO
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrityProtocolModal;
