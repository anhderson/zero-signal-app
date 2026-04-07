import React, { useState, useRef } from 'react';
import TopBar from '../components/TopBar';
import { Folder, FileText, FileImage, Download, Search, MoreVertical, Upload } from 'lucide-react';
import { useAppStore } from '../store';
import './StorageView.css';

const StorageView = () => {
  const { storageFiles, addStorageFile, activeProjectId, channels, activeChannelId } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const projectFiles = storageFiles.filter(f => f.projectId === activeProjectId);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProjectId) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = parseFloat(sizeInMB) >= 0.1 ? `${sizeInMB} MB` : `${(file.size / 1024).toFixed(0)} KB`;
    const type = file.type.startsWith('image/') ? 'image' : 'file';
    const now = new Date();
    const timeString = `Hoje às ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    addStorageFile({ projectId: activeProjectId, name: file.name, type, date: timeString, size: sizeStr });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredItems = projectFiles.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'folder': return <Folder size={20} className="file-icon folder" />;
      case 'image': return <FileImage size={20} className="file-icon" style={{ color: '#4752C4' }} />;
      default: return <FileText size={20} className="file-icon" style={{ color: '#DA373C' }} />;
    }
  };

  return (
    <div className="view-container">
      <TopBar title={activeChannel?.name ?? 'Arquivos do Projeto'} icon={<Folder size={24} className="topbar-icon" />} />

      <div className="storage-content">
        <div className="storage-toolbar">
          <div className="search-bar storage-search">
            <input
              type="text"
              placeholder="Buscar arquivos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} className="search-icon" />
          </div>
          <button className="upload-btn" onClick={handleUploadClick}>
            <Upload size={16} style={{ marginRight: '8px' }} /> Upload
          </button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
        </div>

        <div className="file-list">
          <div className="file-list-header">
            <div className="col name">Nome</div>
            <div className="col date">Data de modificação</div>
            <div className="col size">Tamanho</div>
            <div className="col actions"></div>
          </div>

          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <div key={item.id} className="file-item">
                <div className="col name">
                  {getIcon(item.type)}
                  <span>{item.name}</span>
                </div>
                <div className="col date">{item.date}</div>
                <div className="col size">{item.size}</div>
                <div className="col actions">
                  {item.type !== 'folder' && <Download size={16} className="action-icon" />}
                  <MoreVertical size={16} className="action-icon" />
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhum arquivo encontrado. Clique em Upload para adicionar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorageView;
