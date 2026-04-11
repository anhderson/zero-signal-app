import { FileStack, Crown } from 'lucide-react';
import { useAppStore, BOT_ZERO_ID, BOT_GUST_ID, getAchievementName } from '../store';
import './MembersSidebar.css';


const getBotImage = () => {
  const day = new Date().getDay();
  return new URL(`../assets/bot/bot_${day}.png`, import.meta.url).href;
};

const getGustImage = () => {
  return new URL(`../assets/bot/gust.jpg`, import.meta.url).href;
};

const getBotColor = (day: number) => {
  const colors = [
    '#0055ff', // Navy (Sun)
    '#ff3131', // Red (Mon)
    '#ff8800', // Orange (Tue)
    '#faff00', // Yellow (Wed)
    '#00ff41', // Green (Thu)
    '#00f3ff', // Cyan (Fri)
    '#7b00ff'  // Violet (Sat)
  ];
  return colors[day];
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'Disponível': return '#00cc44';
    case 'Invisível': return '#8e9297';
    case 'Discreto': return '#faff00';
    case 'Focado': return '#ff3131';
    case 'Dormindo': return '#7b00ff';
    default: return '#00cc44';
  }
};

const MembersSidebar = () => {
const { members, setShowServerLogs, activeProjectId, projects, voiceSpeaking } = useAppStore();
  const activeProject = projects.find(p => p.id === activeProjectId);
  const ownerId = activeProject?.ownerId;

  const onlineMembers = members.filter(m => m.isOnline);
  const offlineMembers = members.filter(m => !m.isOnline);

  // Sorting: Me -> Bots -> Others
  const sortedOnline = [...onlineMembers].sort((a, b) => {
    if (a.isCurrentUser) return -1;
    if (b.isCurrentUser) return 1;
    if (a.id === BOT_ZERO_ID || a.id === BOT_GUST_ID) return -1;
    if (b.id === BOT_ZERO_ID || b.id === BOT_GUST_ID) return 1;
    return a.name.localeCompare(b.name);
  });

  // Offline sorting
  const sortedOffline = [...offlineMembers].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="members-sidebar glass-panel">
      
      <div className="member-list-scrollable">
        {members.length === 0 ? (
          <div className="members-empty">
            <span>Nenhum membro encontrado</span>
          </div>
        ) : (
          <div className="member-list-inner">
            {sortedOnline.length > 0 && (
              <div className="member-group">
                <div className="group-title">Online — {sortedOnline.length}</div>
                {sortedOnline.map(member => {
                  const isSpeaking = voiceSpeaking.has(member.id);
                  return (
                    <div key={member.id} className={`member-item ${isSpeaking ? 'is-speaking' : ''}`}>
                      <div 
                        className={`member-avatar ${isSpeaking ? 'speaking' : ''}`} 
                        style={{ 
                          backgroundColor: member.id === BOT_ZERO_ID 
                            ? `rgba(var(--accent-rgb), 0.1)` 
                            : member.avatarColor || `rgba(114, 118, 125, 0.1)`,
                          boxShadow: member.id === BOT_ZERO_ID 
                            ? `0 0 15px #00ff41` 
                            : member.avatarColor ? `0 0 8px ${member.avatarColor}44` : undefined,
                          padding: 0,
                          position: 'relative'
                        }}
                      >
                        <div className="avatar-content-inner" style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {member.id === BOT_ZERO_ID 
                            ? <img src={getBotImage()} alt="ZERO" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : member.id === BOT_GUST_ID
                              ? <img src={getGustImage()} alt="GUST" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : member.avatarPhoto 
                                ? <img src={member.avatarPhoto} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : member.avatarStr
                          }
                        </div>
                        <div className="status-indicator-wrapper">
                          <div className="status-indicator online" style={{ backgroundColor: getStatusColor(member.status) }} />
                        </div>
                      </div>
                      <div className="member-info">
                        <div className="member-name-row">
                          <span 
                            className="member-name"
                            style={member.id === BOT_ZERO_ID ? { color: getBotColor(new Date().getDay()) } : (member.id === BOT_GUST_ID ? { color: '#ff1111' } : {})}
                          >
                            {member.name}
                            <span className="global-level-tag chat-level">LV.{member.level || 1}</span>
                            {member.featuredAchievements && member.featuredAchievements.length > 0 && (
                              <div className="tiny-featured-medals" style={{ display: 'inline-flex', marginLeft: '4px' }}>
                                {member.featuredAchievements.map(id => (
                                  <div key={id} className={`mini-medal-badge ${id}`} title={getAchievementName(id)}>
                                    {id === 'creator' ? '☯' : (id.includes('m') || id.includes('a') ? id.toUpperCase() : '★')}
                                  </div>
                                ))}
                              </div>
                            )}
                            {member.id === BOT_ZERO_ID && <span className="bot-tag">BOT</span>}
                            {member.id === BOT_GUST_ID && <span className="bot-tag security">SECURITY</span>}
                          </span>
                          {member.id === ownerId && (
                            <span className="creator-tag" title="Criador do Servidor">
                              <Crown size={10} style={{ color: '#ffcc00' }} />
                            </span>
                          )}
                        </div>
                        <span className="member-role">
                          {isSpeaking ? 'Transmitindo voz...' : (member.status || 'Online')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {sortedOffline.length > 0 && (
              <div className="member-group">
                <div className="group-title">Offline — {sortedOffline.length}</div>
                {sortedOffline.map(member => (
                  <div key={member.id} className="member-item offline">
                    <div 
                      className="member-avatar" 
                      style={{ 
                        backgroundColor: member.avatarColor ? `${member.avatarColor}44` : '#2f3136',
                        padding: 0,
                        position: 'relative'
                      }}
                    >
                      <div className="avatar-content-inner" style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {member.id === BOT_ZERO_ID 
                          ? <img src={getBotImage()} alt="ZERO" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
                          : member.id === BOT_GUST_ID
                            ? <img src={getGustImage()} alt="GUST" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3, filter: 'grayscale(1)' }} />
                            : member.avatarPhoto 
                              ? <img src={member.avatarPhoto} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3, filter: 'grayscale(1)' }} />
                              : member.avatarStr
                        }
                      </div>
                      <div className="status-indicator-wrapper">
                        <div className="status-indicator offline" style={{ backgroundColor: '#747f8d' }} />
                      </div>
                    </div>
                    <div className="member-info">
                      <span className="member-name">{member.name}</span>
                      <span className="member-role">Offline</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="members-footer">
        <button className="log-btn-neon" onClick={() => setShowServerLogs(true)}>
          <FileStack size={14} /> AUDITORIA / LOGS
        </button>
      </div>

    </div>
  );
};

export default MembersSidebar;
