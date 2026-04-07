import TopBar from '../components/TopBar';
import { Calendar, MapPin, Clock } from 'lucide-react';
import './EventsView.css';

const EventsView = () => {
  return (
    <div className="view-container">
      <TopBar title="Eventos e Novidades" icon={<Calendar size={24} className="topbar-icon" />} />
      
      <div className="events-content">
        <div className="events-header">
          <h2>Próximos Eventos</h2>
          <button className="create-event-btn">Criar Evento</button>
        </div>

        <div className="events-grid">
          {/* Mock Event 1 */}
          <div className="event-card glass-panel">
            <div className="event-banner project-sync" />
            <div className="event-body">
              <div className="event-date">
                <span className="month">ABR</span>
                <span className="day">15</span>
              </div>
              <div className="event-info">
                <h3>Sincronização do Projeto</h3>
                <p className="event-desc">Reunião geral para alinhar as metas da Sprint 4 do Time Zero.</p>
                <div className="event-meta">
                  <span><Clock size={14} /> 14:00 - 15:30</span>
                  <span><MapPin size={14} /> Canal: Lounge</span>
                </div>
              </div>
            </div>
            <div className="event-footer">
              <button className="event-action primary">Confirmar Presença</button>
            </div>
          </div>

          {/* Mock Event 2 */}
          <div className="event-card glass-panel">
            <div className="event-banner dev-talk" />
            <div className="event-body">
              <div className="event-date">
                <span className="month">ABR</span>
                <span className="day">22</span>
              </div>
              <div className="event-info">
                <h3>Tech Talk: Frontend</h3>
                <p className="event-desc">Apresentação sobre Performance React e Vite na nova stack.</p>
                <div className="event-meta">
                  <span><Clock size={14} /> 10:00 - 11:00</span>
                  <span><MapPin size={14} /> Sala de Reunião B</span>
                </div>
              </div>
            </div>
            <div className="event-footer">
              <button className="event-action secondary">Ver Detalhes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsView;
