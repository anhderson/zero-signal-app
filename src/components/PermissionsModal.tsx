import React from 'react';
import { Shield, Mic, Camera, Bell, Monitor, CheckCircle, Info } from 'lucide-react';
import './PermissionsModal.css';

interface PermissionsModalProps {
  onComplete: () => void;
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({ onComplete }) => {
  const [step, setStep] = React.useState(1);
  const [granted, setGranted] = React.useState<Set<string>>(new Set());

  const requestPermission = async (type: 'media' | 'notifications') => {
    try {
      if (type === 'media') {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach(track => track.stop());
        setGranted(prev => new Set(prev).add('camera').add('mic'));
      } else if (type === 'notifications') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setGranted(prev => new Set(prev).add('notifications'));
        }
      }
    } catch (err) {
      console.error('Permission request failed:', err);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      localStorage.setItem('zs_first_run_complete', 'true');
      onComplete();
    }
  };

  return (
    <div className="permissions-overlay">
      <div className="permissions-modal">
        <div className="permissions-header">
          <Shield className="shield-icon" />
          <h2>Configuração de Segurança</h2>
          <p>O Zero Signal precisa de algumas permissões para funcionar corretamente.</p>
        </div>

        <div className="permissions-steps">
          <div className="step-indicator">
            {[1, 2, 3].map(s => (
              <div key={s} className={`step-dot ${step === s ? 'active' : ''} ${step > s ? 'completed' : ''}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="permission-card animate-slide-in">
              <div className="card-icon-wrap">
                <Mic className="card-icon" />
                <Camera className="card-icon" />
              </div>
              <h3>Áudio & Vídeo</h3>
              <p>Permita o acesso à sua câmera e microfone para participar de reuniões e canais de voz.</p>
              <button 
                className={`request-btn ${granted.has('camera') ? 'granted' : ''}`}
                onClick={() => requestPermission('media')}
              >
                {granted.has('camera') ? <><CheckCircle size={16} /> Ativado</> : 'Solicitar Acesso'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="permission-card animate-slide-in">
              <div className="card-icon-wrap">
                <Bell className="card-icon" />
              </div>
              <h3>Notificações</h3>
              <p>Receba alertas de reuniões, mensagens importantes e avisos do servidor em tempo real.</p>
              <button 
                className={`request-btn ${granted.has('notifications') ? 'granted' : ''}`}
                onClick={() => requestPermission('notifications')}
              >
                {granted.has('notifications') ? <><CheckCircle size={16} /> Ativado</> : 'Ativar Notificações'}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="permission-card animate-slide-in">
              <div className="card-icon-wrap">
                <Monitor className="card-icon" />
              </div>
              <h3>Compartilhamento de Tela</h3>
              <p>O sistema já está configurado para permitir a captura de tela nativa do Windows.</p>
              <div className="status-badge">
                <CheckCircle size={14} /> Configuração Nativa Ativa
              </div>
              <div className="info-box">
                <Info size={14} />
                <span>O Windows pode perguntar novamente na primeira vez que você compartilhar.</span>
              </div>
            </div>
          )}
        </div>

        <div className="permissions-footer">
          <button className="next-btn" onClick={handleNext}>
            {step < 3 ? 'Próximo Passo' : 'Finalizar Configuração'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionsModal;
