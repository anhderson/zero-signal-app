import './MembersSidebar.css';

interface Member {
  id: string;
  name: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  role?: string;
  avatarStr: string;
  color?: string;
}

const mockMembers: Member[] = [
  { id: '1', name: 'Zero Signal Dev', status: 'online', role: 'Admin', avatarStr: 'ZS' },
  { id: '2', name: 'User', status: 'idle', avatarStr: 'US', color: 'var(--accent-success)' },
  { id: '3', name: 'Convidado_01', status: 'dnd', avatarStr: '01', color: '#E67E22' },
  { id: '4', name: 'Desconectado', status: 'offline', avatarStr: 'DC', color: '#95A5A6' }
];

const MembersSidebar = () => {
  // Group members by status for a Discord-like feel
  const onlineMembers = mockMembers.filter(m => m.status !== 'offline');
  const offlineMembers = mockMembers.filter(m => m.status === 'offline');

  return (
    <div className="members-sidebar glass-panel">
      
      {onlineMembers.length > 0 && (
        <div className="member-group">
          <div className="group-title">Online - {onlineMembers.length}</div>
          {onlineMembers.map(member => (
            <div key={member.id} className="member-item">
              <div className="member-avatar" style={{backgroundColor: member.color || 'var(--accent-primary)'}}>
                {member.avatarStr}
                <div className={`status-indicator ${member.status}`}></div>
              </div>
              <div className="member-info">
                <span className="member-name">{member.name}</span>
                {member.role && <span className="member-role">{member.role}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {offlineMembers.length > 0 && (
        <div className="member-group">
          <div className="group-title">Offline - {offlineMembers.length}</div>
          {offlineMembers.map(member => (
            <div key={member.id} className="member-item offline">
              <div className="member-avatar" style={{backgroundColor: member.color || 'var(--accent-primary)'}}>
                {member.avatarStr}
                <div className={`status-indicator ${member.status}`}></div>
              </div>
              <div className="member-info">
                <span className="member-name">{member.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default MembersSidebar;
