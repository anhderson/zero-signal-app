import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Target, Loader2 } from 'lucide-react';
import './LoginView.css';

const LoginView = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAppStore(state => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !loading) {
      setLoading(true);
      await login(name.trim());
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box glass-panel">
        <Target size={64} className="login-logo" />
        <h2>Bem-vindo ao Zero Signal</h2>
        <p>A nova era da comunicação descentralizada começa aqui.</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <label>Como devemos chamar você?</label>
          <input 
            type="text" 
            placeholder="Nome de Usuário" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            disabled={loading}
          />
          <button type="submit" disabled={!name.trim() || loading}>
            {loading ? <><Loader2 size={18} className="spin-icon" /> Conectando...</> : 'Acessar o Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
