import { useEffect, useState } from 'react';
import './UpdateModule.css';
import { DownloadCloud, RefreshCw, AlertTriangle, X } from 'lucide-react';

export default function UpdateModule() {
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'available' | 'downloaded' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Only subscribe if electronAPI is available
    const win = window as any;
    if (win.electronAPI) {
      win.electronAPI.onUpdateAvailable(() => {
        setUpdateStatus('available');
      });

      win.electronAPI.onUpdateDownloaded(() => {
        setUpdateStatus('downloaded');
      });

      win.electronAPI.onUpdateError((event: any, msg: string) => {
        setUpdateStatus('error');
        // event param is the IpcRendererEvent, msg is the second argument
        setErrorMsg(typeof event === 'string' ? event : (msg || 'Erro desconhecido ao atualizar'));
      });
    }
  }, []);

  const handleRestart = () => {
    const win = window as any;
    if (win.electronAPI) {
      win.electronAPI.restartApp();
    }
  };

  const closeNotification = () => {
    setUpdateStatus('idle');
  };

  if (updateStatus === 'idle') return null;

  return (
    <div className="update-module-overlay">
      <div className="update-module-box">
        <button className="update-close-btn" onClick={closeNotification}>
          <X size={18} />
        </button>

        {updateStatus === 'available' && (
          <div className="update-content">
            <DownloadCloud size={32} className="update-icon pulse-animation" />
            <h3>Atualização Encontrada</h3>
            <p>A versão mais recente está sendo transferida pelas nossas linhas de transmissão. Por favor, aguarde...</p>
          </div>
        )}

        {updateStatus === 'downloaded' && (
          <div className="update-content">
            <RefreshCw size={32} className="update-icon success-color" />
            <h3>Transmissão Concluída</h3>
            <p>O pacote de atualização foi recebido e está pronto para ser injetado. Reinicialize o sistema para aplicar as melhorias.</p>
            <button className="update-action-btn" onClick={handleRestart}>
              REINICIALIZAR E ATUALIZAR
            </button>
          </div>
        )}

        {updateStatus === 'error' && (
          <div className="update-content">
            <AlertTriangle size={32} className="update-icon error-color" />
            <h3>Falha na Conexão</h3>
            <p>Ocorreu uma anomalia durante o processo de atualização. A matriz detectou o seguinte erro:</p>
            <code className="update-error-text">{errorMsg}</code>
            <button className="update-action-btn neutral-btn" onClick={closeNotification}>
              CONTINUAR OPERANDO
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
