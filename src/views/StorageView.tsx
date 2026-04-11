import React, { useState, useRef, useEffect } from 'react';
import TopBar from '../components/TopBar';
import { 
  Folder, FileText, FileImage, Download, Search, 
  Upload, Music, Film, Trash2 
} from 'lucide-react';
import { useAppStore } from '../store';
import './StorageView.css';

const StorageView = () => {
  const { 
    storageFiles, loadStorageFiles, uploadFile, 
    downloadFile, deleteFile, activeProjectId, 
    channels, activeChannelId 
  } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeChannel = channels.find(c => c.id === activeChannelId);

  useEffect(() => {
    if (activeProjectId) {
      loadStorageFiles(activeProjectId, activeChannelId || undefined);
    }
  }, [activeProjectId, activeChannelId]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProjectId || !activeChannelId) return;

    setIsUploading(true);
    try {
      await uploadFile(activeProjectId, activeChannelId, file);
    } catch (err) {
      console.error('Falha no upload:', err);
      alert('Erro ao enviar arquivo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredItems = storageFiles.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'image':  return <FileImage size={20} className="file-icon" style={{ color: '#44ff44' }} />;
      case 'audio':  return <Music size={20} className="file-icon" style={{ color: '#ff44ff' }} />;
      case 'video':  return <Film size={20} className="file-icon" style={{ color: '#ffcc00' }} />;
      default:       return <FileText size={20} className="file-icon" style={{ color: '#00f3ff' }} />;
    }
  };

  return (
    <div className="view-container">
      <TopBar 
        title={activeChannel?.name ?? 'Arquivos do Projeto'} 
        icon={<Folder size={24} className="topbar-icon" />} 
      />

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
          <button className="upload-btn" onClick={handleUploadClick} disabled={isUploading}>
            <Upload size={16} style={{ marginRight: '8px' }} /> 
            {isUploading ? 'Enviando...' : 'Upload'}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileChange} 
          />
        </div>

        <div className="file-list">
          <div className="file-list-header">
            <div className="col name">Nome</div>
            <div className="col date">Data</div>
            <div className="col size">Tamanho</div>
            <div className="col actions">Ações</div>
          </div>

          <div className="file-items-container">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <div key={item.id} className="file-item">
                  <div className="col name">
                    {getIcon(item.type)}
                    <span title={item.name}>{item.name}</span>
                  </div>
                  <div className="col date">{item.date}</div>
                  <div className="col size">{item.size}</div>
                  <div className="col actions">
                    <button className="action-btn" onClick={() => downloadFile(item.id)} title="Baixar">
                      <Download size={16} />
                    </button>
                    <button className="action-btn danger" onClick={() => {
                      if (confirm(`Excluir ${item.name}?`)) deleteFile(item.id);
                    }} title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-storage-msg">
                {isUploading ? 'Sincronizando setor de dados...' : 'Nenhum arquivo detectado neste módulo.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageView;
