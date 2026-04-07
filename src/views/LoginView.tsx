import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Target, Loader2, Mail, Lock, User } from 'lucide-react';
import './LoginView.css';

const LoginView = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const login = useAppStore(state => state.login);
  const signUp = useAppStore(state => state.signUp);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!username) {
          setErrorMsg('O nome de usuário é obrigatório.');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, username);
        if (error) setErrorMsg(error.message);
      } else {
        const { error } = await login(email, password);
        if (error) setErrorMsg('Email ou senha incorretos.');
      }
    } catch (err) {
      setErrorMsg('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box glass-panel">
        <Target size={64} className="login-logo" />
        <h2>{isRegister ? 'Crie sua conta' : 'Bem-vindo de volta'}</h2>
        <p>Acesse a rede segura do Zero Signal.</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="input-group">
              <User size={18} />
              <input 
                type="text" 
                placeholder="Nome de Usuário" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          )}

          <div className="input-group">
            <Mail size={18} />
            <input 
              type="email" 
              placeholder="Seu Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={18} />
            <input 
              type="password" 
              placeholder="Sua Senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {errorMsg && <div className="error-badge">{errorMsg}</div>}

          <button type="submit" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin-icon" /> : (isRegister ? 'Criar Conta' : 'Entrar')}
          </button>
        </form>

        <div className="login-footer">
          {isRegister ? (
            <p>Já tem uma conta? <span onClick={() => setIsRegister(false)}>Entrar</span></p>
          ) : (
            <p>Novo por aqui? <span onClick={() => setIsRegister(true)}>Cadastre-se</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginView;
