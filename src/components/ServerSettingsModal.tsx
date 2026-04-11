import React, { useState } from 'react';
import { useAppStore } from '../store';
import { X, Shield } from 'lucide-react';
import './ServerSettingsModal.css';

interface ServerSettingsModalProps {
  onClose: () => void;
}

import type { Role, Permission } from '../store';

const AVAILABLE_PERMISSIONS: { id: Permission; label: string; desc: string }[] = [
  { id: 'ADMIN', label: 'Administrador', desc: 'Permissão total. Ignora todas as outras restrições.' },
  { id: 'MANAGE_ROLES', label: 'Gerenciar Cargos', desc: 'Criar, editar e excluir cargos no servidor.' },
  { id: 'EDIT_MESSAGES', label: 'Alterar Mensagens', desc: 'Permite editar mensagens de qualquer usuário.' },
  { id: 'DELETE_MESSAGES', label: 'Apagar Mensagens', desc: 'Permite excluir mensagens de qualquer usuário.' },
  { id: 'VOICE_KICK', label: 'Expulsar de Voz', desc: 'Pode desconectar usuários de canais de voz.' },
  { id: 'VOICE_MUTE', label: 'Silenciar Membros', desc: 'Pode silenciar (server mute) usuários em canais de voz.' },
  { id: 'CREATE_MEETINGS', label: 'Criar Reuniões', desc: 'Pode iniciar chamadas de vídeo e reuniões formais.' },
  { id: 'MANAGE_EVENTS', label: 'Gerenciar Alinhamentos', desc: 'Permite criar e gerenciar eventos de "Sincronicidade".' },
];

const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({ onClose }) => {
  const { activeProjectId, projects, updateProject, deleteProject, currentUser } = useAppStore();
  const project = projects.find(p => p.id === activeProjectId);
  const isOwner = project?.ownerId === currentUser?.id;

  const [activeTab, setActiveTab] = useState<'geral' | 'cargos'>('geral');
  const [roles, setRoles] = useState<Role[]>(() => {
    if (project?.roles && project.roles.length > 0) return project.roles;
    return [
      { id: 'owner', name: 'Diretoria', color: '#ffffff', permissions: ['ADMIN'], position: 0 },
      { id: 'member', name: 'Operativo', color: '#ff8800', permissions: ['CREATE_MEETINGS'], position: 1 }
    ];
  });
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || '');
  const [iconPreview, setIconPreview] = useState<string | null>(project?.iconUrl || null);
  const [serverName, setServerName] = useState<string>(project?.name || '');
  const [themeColor, setThemeColor] = useState<string>(project?.themeColor || '#ff8800');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const activeRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  const handleDeleteProject = async () => {
    if (!project) return;
    const confirmName = window.prompt(`ALERTA CRÍTICO: Para confirmar a EXCLUSÃO PERMANENTE do servidor "${project.name}", digite o nome dele abaixo:`);
    
    if (confirmName === project.name) {
      try {
        await deleteProject(project.id);
        onClose();
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Falha ao excluir servidor. Verifique o console para detalhes.');
      }
    } else if (confirmName !== null) {
      alert("Nome incorreto. Operação cancelada.");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecione uma imagem.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Imagem muito grande. Máximo 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setIconPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleAddRole = () => {
    const newRole: Role = {
      id: `role_${Date.now()}`,
      name: 'Novo Cargo',
      color: '#00ffff',
      permissions: ['CREATE_MEETINGS'],
      position: roles.length
    };
    setRoles([...roles, newRole]);
    setSelectedRoleId(newRole.id);
  };

  const handleUpdateRole = (updates: Partial<Role>) => {
    setRoles(roles.map(r => r.id === activeRole.id ? { ...r, ...updates } : r));
  };

  const handleTogglePermission = (permId: Permission) => {
    if (activeRole.id === 'owner' || activeRole.id === 'role_creator') return; // Creator/Owner cannot lose permissions
    const currentPerms = activeRole.permissions;
    const newPerms = currentPerms.includes(permId)
      ? currentPerms.filter(p => p !== permId)
      : [...currentPerms, permId];
    handleUpdateRole({ permissions: newPerms as Permission[] });
  };

  const handleSave = async () => {
    if (project) {
      await updateProject(project.id, { 
        name: serverName,
        roles,
        iconUrl: iconPreview || undefined,
        themeColor
      });
    }
    onClose();
  };

  if (!project) return null;

  return (
    <div className="server-settings-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="server-settings-modal glass-panel">
        <div className="settings-sidebar">
          <div className="sidebar-section-title">{project.name}</div>
          <button className={`sidebar-item ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>
            Visão Geral
          </button>
          <button className={`sidebar-item ${activeTab === 'cargos' ? 'active' : ''}`} onClick={() => setActiveTab('cargos')}>
            Cargos e Permissões
          </button>
          <div className="spacer" />
          {isOwner && !project?.isPermanent && (
            <button className="sidebar-item danger" onClick={handleDeleteProject}>
              Excluir Servidor
            </button>
          )}
          <button className="sidebar-item logout" onClick={onClose}>Fechar</button>
        </div>

        <div className="settings-content">
          <div className="content-header">
            <h3>{activeTab === 'geral' ? 'Visão Geral do Servidor' : 'Cargos e Permissões'}</h3>
            <button className="close-btn" onClick={onClose}><X size={20} /></button>
          </div>

          <div className="content-scroll">
            {activeTab === 'geral' ? (
              <div className="general-tab">
                
                <div className="server-photo-section">
                  <div 
                     className="server-photo-preview" 
                     onClick={() => fileInputRef.current?.click()}
                     title="Clique para trocar a foto do servidor"
                  >
                    {iconPreview ? (
                      <img src={iconPreview} alt="Server Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span className="server-photo-initials">{project.iconStr || 'SRV'}</span>
                    )}
                    <div className="server-photo-overlay">
                       <span>Trocar Foto</span>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleImageSelect}
                  />
                  <div className="server-photo-info">
                     <h4>Foto do Servidor</h4>
                     <p>Recomendado: 512x512. Máximo 10MB.</p>
                  </div>
                </div>

                <div className="settings-group">
                  <label>COR DO TEMA (BORDAS)</label>
                  <input 
                    type="color" 
                    className="color-picker" 
                    value={themeColor} 
                    onChange={(e) => setThemeColor(e.target.value)}
                  />
                  <p className="hint-text">Define a cor principal das bordas temáticas e neon do servidor.</p>
                </div>

                <div className="settings-group">
                  <label>NOME DO SERVIDOR</label>
                  <input 
                    type="text" 
                    className="settings-input" 
                    value={serverName} 
                    onChange={(e) => setServerName(e.target.value)}
                  />
                  <p className="hint-text">O nome geral do servidor. Projetos permanentes podem ser renomeados.</p>
                </div>
              </div>
            ) : (
              <div className="roles-tab">
                <div className="roles-layout">
                  <div className="roles-list">
                    <label>CARGOS</label>
                    {roles.map(r => (
                      <button 
                        key={r.id} 
                        className={`role-item ${activeRole.id === r.id ? 'active' : ''}`}
                        onClick={() => setSelectedRoleId(r.id)}
                      >
                        <Shield size={14} color={r.color} />
                        <span>{r.name}</span>
                      </button>
                    ))}
                    <button className="add-role-btn" onClick={handleAddRole}>+ Criar Cargo</button>
                  </div>
                  
                  {activeRole && (
                    <div className="role-editor">
                      <div className="settings-group">
                        <label>NOME DO CARGO</label>
                        <input 
                          type="text" 
                          className="settings-input" 
                          value={activeRole.name} 
                          onChange={(e) => handleUpdateRole({ name: e.target.value })}
                          disabled={activeRole.id === 'owner'}
                        />
                      </div>
                      <div className="settings-group">
                        <label>COR DO CARGO</label>
                        <input 
                          type="color" 
                          className="color-picker" 
                          value={activeRole.color}
                          onChange={(e) => handleUpdateRole({ color: e.target.value })}
                        />
                      </div>

                      <div className="settings-group permissions">
                        <label>PERMISSÕES</label>
                        {AVAILABLE_PERMISSIONS.map(perm => (
                          <div key={perm.id} className="permission-toggle">
                            <div className="perm-info">
                              <span className="perm-name">{perm.label}</span>
                              <p className="perm-desc">{perm.desc}</p>
                            </div>
                            <label className="switch">
                              <input 
                                type="checkbox" 
                                checked={activeRole.permissions.includes(perm.id)}
                                onChange={() => handleTogglePermission(perm.id)}
                                disabled={activeRole.id === 'owner'}
                              />
                              <span className="slider round"></span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="actions-footer">
            <button className="save-btn" onClick={handleSave}>Salvar Alterações</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerSettingsModal;
