import React, { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import { Calendar, MapPin, Clock, Plus, X, Trash2 } from 'lucide-react';
import { useAppStore } from '../store';
import './EventsView.css';

const EventsView = () => {
  const { 
    globalEvents, loadGlobalEvents, addGlobalEvent, deleteGlobalEvent, 
    eventRSVPs, loadRSVPs, toggleRSVP,
    activeProjectId, projects, currentUser,
    showEventCreateModal, setShowEventCreateModal
  } = useAppStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    startTime: '',
    location: '',
    bannerType: 'project-sync'
  });

  const project = projects.find(p => p.id === activeProjectId);
  const isOwner = project?.ownerId === currentUser?.id;

  useEffect(() => {
    loadGlobalEvents();
    loadRSVPs();
  }, [loadGlobalEvents, loadRSVPs]);

  const handleAddEvent = () => {
    setShowEventCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeProjectId) return;

    await addGlobalEvent({
      ...formData,
      createdBy: currentUser.id,
      projectId: activeProjectId
    });

    setShowEventCreateModal(false);
    setFormData({
      title: '',
      description: '',
      eventDate: '',
      startTime: '',
      location: '',
      bannerType: 'project-sync'
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    return {
      month: months[date.getUTCMonth()],
      day: date.getUTCDate()
    };
  };

  return (
    <div className="view-container">
      <TopBar title="Sincronicidade // Eventos Globais" icon={<Calendar size={24} className="topbar-icon" />} />
      
      <div className="events-content">
        <div className="events-header">
          <div className="header-info">
            <h2>Agenda da Rede</h2>
            <p>Sincronização de eventos entre os 12 servidores core.</p>
          </div>
          {isOwner && (
            <button className="create-event-btn" onClick={handleAddEvent}>
              <Plus size={18} /> Criar Evento
            </button>
          )}
        </div>

        <div className="events-grid">
          {globalEvents.map(event => {
            const { month, day } = formatDate(event.eventDate);
            const canDelete = isOwner && event.projectId === activeProjectId;
            const creatorProject = projects.find(p => p.id === event.projectId);
            const participants = eventRSVPs[event.id] || [];
            const isConfirmed = currentUser && participants.includes(currentUser.id);
            const rsvpCount = participants.length;

            return (
              <div key={event.id} className="event-card glass-panel">
                <div className={`event-banner ${event.bannerType}`} />
                <div className="event-body">
                  <div className="event-date">
                    <span className="month">{month}</span>
                    <span className="day">{day}</span>
                  </div>
                  <div className="event-info">
                    <div className="event-title-row">
                      <h3>{event.title}</h3>
                      {canDelete && (
                        <button className="delete-event-btn" onClick={() => deleteGlobalEvent(event.id)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className="event-desc">{event.description}</p>
                    <div className="event-meta">
                      <span><Clock size={14} /> {event.startTime}</span>
                      <span><MapPin size={14} /> {event.location}</span>
                      {creatorProject && (
                        <span className="event-origin">
                          <div className="origin-dot" style={{ backgroundColor: creatorProject.themeColor }} />
                          Originado em: {creatorProject.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="event-footer">
                  <div className="participant-count">
                    <strong>{rsvpCount}</strong> {rsvpCount === 1 ? 'pessoa confirmada' : 'pessoas confirmadas'}
                  </div>
                  <button 
                    className={`event-action ${isConfirmed ? 'secondary' : 'primary'}`}
                    onClick={() => toggleRSVP(event.id)}
                  >
                    {isConfirmed ? 'Cancelar Presença' : 'Confirmar Presença'}
                  </button>
                </div>
              </div>
            );
          })}

          {globalEvents.length === 0 && (
            <div className="empty-events">
               <Calendar size={48} className="empty-icon" />
               <p>Nenhuma sincronização agendada no momento.</p>
               {isOwner && (
                 <button className="create-event-btn-large" onClick={handleAddEvent}>
                   <Plus size={20} /> Agendar Primeira Sincronização
                 </button>
               )}
            </div>
          )}
        </div>
      </div>

      {showEventCreateModal && (
        <div className="event-modal-overlay" onClick={() => setShowEventCreateModal(false)}>
          <div className="event-modal glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agendar Sincronicidade</h3>
              <button className="close-modal" onClick={() => setShowEventCreateModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-group">
                <label>TÍTULO DO EVENTO</label>
                <input 
                  type="text" 
                  required 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Reunião Geral de Alinhamento"
                />
              </div>
              <div className="form-group">
                <label>DESCRIÇÃO</label>
                <textarea 
                  required 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Detalhes sobre o evento..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>DATA</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.eventDate}
                    onChange={e => setFormData({...formData, eventDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>HORÁRIO</label>
                  <input 
                    type="time" 
                    required 
                    value={formData.startTime}
                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>LOCALIZAÇÃO / CANAL</label>
                <input 
                  type="text" 
                  required 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="Ex: Canal Lounge ou Sala B"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEventCreateModal(false)}>Cancelar</button>
                <button type="submit" className="confirm-btn">Publicar na Rede</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsView;
