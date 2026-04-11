import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Target, Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import './LoginView.css';

const LoginView = () => {
  const [isRegister, setIsRegister] = useState(false);
  
  // Load saved emails from localStorage
  const getSavedEmails = (): string[] => {
    const saved = localStorage.getItem('zs_saved_emails');
    return saved ? JSON.parse(saved) : [];
  };

  const [savedEmailList, setSavedEmailList] = useState<string[]>(getSavedEmails());
  const [email, setEmail] = useState(savedEmailList[0] || ''); // Pre-fill with last used
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const login = useAppStore(state => state.login);
  const signUp = useAppStore(state => state.signUp);

  const saveEmail = (newEmail: string) => {
    if (!newEmail) return;
    const updated = [newEmail, ...savedEmailList.filter(e => e !== newEmail)].slice(0, 5);
    setSavedEmailList(updated);
    localStorage.setItem('zs_saved_emails', JSON.stringify(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!username) {
          setErrorMsg('O nome de usuário é obrigatório.');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, username);
        if (error) {
          setErrorMsg(
            error.message.toLowerCase().includes('rate limit') 
              ? 'Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.' 
              : error.message
          );
          setLoading(false);
          return;
        }
        saveEmail(email);
        setSuccessMsg('CONTA CRIADA COM SUCESSO! VERIFIQUE SEU EMAIL PARA CONFIRMAR O CADASTRO ANTES DE ENTRAR.');
        setLoading(false);
        return; // Stay on screen to show message
      } else {
        const { error } = await login(email, password);
        if (error) {
          setErrorMsg(
            error.status === 429 || error.message.toLowerCase().includes('rate limit')
              ? 'Muitas tentativas de login. Por segurança, aguarde alguns minutos e tente novamente.'
              : 'Email ou senha incorretos.'
          );
          setLoading(false);
          return;
        }
        saveEmail(email);
      }
      // If successful, the App.tsx ProtectedRoute will handle redirect
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(
        err?.status === 429 
          ? 'Muitas tentativas. Por segurança, aguarde alguns minutos.' 
          : 'Certifique-se de que os dados estão corretos ou tente novamente.'
      );
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box glass-panel flicker">
        <Target size={64} className="login-logo" />
        <h2 className="neon-text">{isRegister ? 'SISTEMA DE CADASTRO' : 'BEM-VINDO DE VOLTA'}</h2>
        <p>ACESSE A REDE SEGURA DO ZERO SIGNAL.</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="input-group">
              <User size={18} />
              <input 
                type="text" 
                placeholder="NOME DE USUÁRIO" 
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
              placeholder="EMAIL_ADDR" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              list="saved-emails"
              required
            />
            <datalist id="saved-emails">
              {savedEmailList.map((e, i) => (
                <option key={i} value={e} />
              ))}
            </datalist>
          </div>

          <div className="input-group">
            <Lock size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="PASS_TOKEN" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button 
              type="button" 
              className="toggle-pass" 
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errorMsg && <div className="error-badge">{errorMsg}</div>}
          {successMsg && <div className="success-badge">{successMsg}</div>}

          <button id="submit-auth" type="submit" disabled={loading} className="cyber-button">
            {loading ? <Loader2 size={18} className="spin-icon" /> : (isRegister ? 'CRIAR CONTA' : 'ENTRAR')}
          </button>
        </form>

        <div className="login-footer">
          {isRegister ? (
            <p>JÁ TEM UMA CONTA? <span onClick={() => { setIsRegister(false); setErrorMsg(''); setSuccessMsg(''); }}>RETORNAR</span></p>
          ) : (
            <p>NOVO POR AQUI? <span onClick={() => { setIsRegister(true); setErrorMsg(''); setSuccessMsg(''); }}>CADASTRE-SE</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginView;
