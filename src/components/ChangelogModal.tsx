import { useEffect, useState } from 'react';
import { Sparkles, Terminal, Activity, X } from 'lucide-react';
import pkg from '../../package.json';
import './ChangelogModal.css';

export default function ChangelogModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if the current version is different from the last seen version
    const lastVersion = localStorage.getItem('zs_last_version');
    if (lastVersion !== pkg.version) {
      // Don't show if there's no last version (meaning it's a first time install)
      // Actually, if lastVersion is null, maybe just set it so we don't nag new users.
      // But typically it's nice to show it anyway, or not.
      if (!lastVersion) {
        // First run ever: just set it and stay silent
        localStorage.setItem('zs_last_version', pkg.version);
      } else {
        // It's a real update
        const timer = setTimeout(() => setShow(true), 1500); // slight delay after app loads
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('zs_last_version', pkg.version);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="changelog-overlay fadeIn">
      <div className="changelog-box">
        <div className="changelog-header">
          <div className="changelog-branding">
            <Sparkles size={24} className="changelog-icon pulse" />
            <h2>SISTEMA ATUALIZADO <span>v{pkg.version}</span></h2>
          </div>
          <button className="changelog-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="changelog-content">
          <p className="changelog-intro">
            A matriz foi reconectada e o protocolo principal sofreu melhorias estruturais. 
            Confira as últimas alterações aplicadas no servidor:
          </p>

          <div className="changelog-features">
            <div className="feature-item">
              <div className="feature-icon"><Activity size={18} /></div>
              <div className="feature-text">
                <h4>Módulo de Atualização Nativo</h4>
                <p>Implementamos o auto-updater integrado. Agora o sistema capta novos lançamentos direto do grid de transmissão e se atualiza de modo fluido!</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon"><Terminal size={18} /></div>
              <div className="feature-text">
                <h4>Otimização do Protocolo</h4>
                <p>As linhas de código receberam refinamentos na performance gráfica e no gerenciamento de estado interno.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="changelog-footer">
          <button className="changelog-action-btn" onClick={handleClose}>
            INICIAR OPERAÇÃO
          </button>
        </div>
      </div>
    </div>
  );
}
