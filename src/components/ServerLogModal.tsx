import React from 'react';
import { Activity, User, Clock, Info, ChevronLeft } from 'lucide-react';
import { useAppStore } from '../store';
import './ServerLogModal.css';

interface ServerLogModalProps {
  onClose: () => void;
}

export const ServerLogModal: React.FC<ServerLogModalProps> = ({ onClose }) => {
  const { serverLogs, activeProjectId } = useAppStore();
  
  const filteredLogs = serverLogs.filter(log => log.projectId === activeProjectId);

  return (
    <div className="log-modal-overlay">
      <div className="log-modal-container">
      <div className="log-modal-header">
        <div className="header-title">
          <Activity className="log-icon-neon" />
          <span>Auditoria de Atividades</span>
        </div>
        <button className="close-log-btn" onClick={onClose}>
          <ChevronLeft size={16} /> VOLTAR AO CHAT
        </button>
      </div>

      <div className="log-list">
        {filteredLogs.length === 0 ? (
          <div className="empty-logs">
            <Info size={40} />
            <p>Nenhuma atividade registrada no sistema.</p>
          </div>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} className="log-item">
              <div className="log-time">
                <Clock size={12} />
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>
              <div className="log-user">
                <User size={12} />
                <span>{log.userName}</span>
              </div>
              <div className="log-action">
                <span className="action-tag">{log.action}</span>
                <p className="action-details">{log.details}</p>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
};
