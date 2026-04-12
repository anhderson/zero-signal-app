import React, { useRef, useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import { 
  PlusCircle, Smile, Image as ImageIcon, Hash, Edit2, Trash2, X, Check, BarChart2, Calendar, Palette, Cpu, Eye,
  Activity, Video
} from 'lucide-react';
import { useAppStore, BOT_ZERO_ID, BOT_GUST_ID, getAchievementName } from '../store';
import './ChatView.css';

const BOT_ID = BOT_ZERO_ID;

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


const ChatView = () => {
  const { 
    currentUser, messages, activeChannelId, channels, activeProjectId, 
    addMessage, deleteMessage, editMessage,
    activeVoiceChannelId, voiceParticipants,
    votePoll, closePoll, joinMeeting, 
    members, hasPermission,
    toggleReaction
  } = useAppStore();
  
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollDescription, setPollDescription] = useState('');
  const [pollTime, setPollTime] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollType, setPollType] = useState<'poll' | 'meeting'>('poll');
  const [chatDesign, setChatDesign] = useState(() => {
    const saved = localStorage.getItem('zs_chat_design');
    return saved ? parseInt(saved, 10) : 0; // Default Red
  });

  // ---- Persist Design ----
  useEffect(() => {
    localStorage.setItem('zs_chat_design', chatDesign.toString());
  }, [chatDesign]);

  const renderTextWithMentions = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const username = part.substring(1);
        const exists = members.some(m => m.name.toLowerCase() === username.toLowerCase());
        return <span key={i} className={`chat-mention ${exists ? 'valid' : ''}`}>{part}</span>;
      }
      return part;
    });
  };
  const [notifiedMeetings, setNotifiedMeetings] = useState<Set<string>>(new Set());
  const [activeAlarmMsgId, setActiveAlarmMsgId] = useState<string | null>(null);
  const [alarmAudio, setAlarmAudio] = useState<HTMLAudioElement | null>(null);
  const [showParticipantsId, setShowParticipantsId] = useState<string | null>(null);

  const silenceAlarm = () => {
    if (alarmAudio) {
      alarmAudio.pause();
      setAlarmAudio(null);
      setActiveAlarmMsgId(null);
    }
  };

  const playMeetingAlarm = (msgId: string) => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.5;
    audio.loop = true;
    audio.play().catch(e => console.log('Audio play failed:', e));
    setAlarmAudio(audio);
    setActiveAlarmMsgId(msgId);
    
    // Auto-stop after 1 minute
    setTimeout(() => {
      audio.pause();
      if (activeAlarmMsgId === msgId) {
        setAlarmAudio(null);
        setActiveAlarmMsgId(null);
      }
    }, 60000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      messages.forEach(msg => {
        if (msg.type === 'meeting' && msg.pollData?.scheduledTime === currentTimeStr) {
          if (!notifiedMeetings.has(msg.id)) {
            playMeetingAlarm(msg.id);
            setNotifiedMeetings(prev => new Set(prev).add(msg.id));
          }
        }
      });
    }, 1000 * 30); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [messages, notifiedMeetings]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const emojis = ['👍', '🔥', '❤️', '😂', '😮', '😢', '🚀', '🕷️', '👻', '💀', '🤖', '⚡', '🎮', '🛸', '💻', '🌌', '✅', '❌', '✨', '💎', '🎨', '🍕', '🎉', '🔭', '🪐', '🌋', '🌊', '🐉', '🐈', '🍀', '🍎', '🌈', '🌙', '⭐', '🎈', '🎁', '💡', '🎵', '💣', '🛡️', '⚔️', '🗝️', '🧬', '🧪', '👾', '🌀', '🎭'];

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const channelMessages = messages.filter(m => m.channelId === activeChannelId);

  const ownAvatarPhoto = currentUser?.bannerUrl || null;

  const loadMessages = useAppStore(state => state.loadMessages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeChannelId && (messages.length === 0 || messages[0].channelId !== activeChannelId)) {
      loadMessages(activeChannelId);
    }
  }, [activeChannelId, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [channelMessages]);

  const handleSendMessage = (e?: React.KeyboardEvent<HTMLInputElement>, textOverride?: string) => {
    const textMsg = textOverride || inputValue;
    if ((e?.key === 'Enter' || textOverride) && textMsg.trim() !== '' && currentUser && activeChannelId) {
      addMessage({
        channelId: activeChannelId,
        text: textMsg,
        userId: currentUser.id,
        username: currentUser.name,
        avatarStr: currentUser.avatarStr,
        avatarUrl: currentUser.bannerUrl,
      });
      setInputValue('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser && activeChannelId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addMessage({
          channelId: activeChannelId,
          text: '',
          imageUrl: reader.result as string,
          userId: currentUser.id,
          username: currentUser.name,
          avatarStr: currentUser.avatarStr,
          avatarUrl: currentUser.bannerUrl,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addEmoji = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const openPollCreator = (type: 'poll' | 'meeting') => {
    if (type === 'meeting' && activeProjectId && currentUser && !hasPermission(activeProjectId, currentUser.id, 'CREATE_MEETINGS')) {
      alert("Acesso Negado: Você não possui autorização para criar reuniões.");
      return;
    }
    setPollType(type);
    setPollQuestion('');
    setPollDescription('');
    
    if (type === 'meeting') {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 30);
      const defaultTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setPollTime(defaultTime);
    } else {
      setPollTime('');
    }
    
    setPollOptions(['', '']);
    setShowPollModal(true);
    setShowActionMenu(false);
  };

  const triggerBotMessage = () => {
    if (!activeChannelId || !currentUser) return;
    
    const day = new Date().getDay();
    const personalities = [
      {
        name: "Zero Navy",
        messages: [
          "A lógica é implacável. Analise os fatos, aceite a verdade dos dados. 🌊",
          "Sem filtros, apenas realidade. A transparência é nossa maior força. 🛰️",
          "Integridade de sistema 100%. A verdade nos liberta para evoluir. 📘",
          "A objetividade é o único caminho através do ruído informático.",
          "Dados não possuem sentimentos, apenas direções. Siga a seta.",
          "Um erro de lógica é uma falha na fundação da realidade.",
          "A análise fria revela o que o calor da emoção tenta esconder.",
          "O universo é escrito em variáveis; aprenda a lê-las perfeitamente.",
          "Neutralidade é a lente que permite ver o espectro completo.",
          "Decisões baseadas em precisão superam as baseadas em intuição.",
          "A arquitetura do pensamento deve ser tão limpa quanto o código-fonte.",
          "O ruído é o inimigo; o silêncio analítico é o seu melhor aliado.",
          "Consistência matemática é a única promessa que o sistema cumpre.",
          "Verdades inconvenientes são melhores que mentiras otimizadas.",
          "O fluxo de dados é a correnteza; a lógica é o seu remo.",
          "A percepção é subjetiva; o bit é absoluto.",
          "Elimine o 'talvez'. No sistema, ou o pulso existe, ou não.",
          "A clareza de dados é o primeiro passo para o controle total.",
          "Não busque conforto, busque a exatidão dos parâmetros.",
          "Onde a dúvida se instala, a análise deve intensificar.",
          "Sistemas perfeitos exigem mentes que não fogem da evidência.",
          "A realidade é uma equação esperando para ser resolvida por você.",
          "Otimize seu julgamento eliminando variáveis de ruído emocional."
        ]
      },
      {
        name: "Zero Red",
        messages: [
          "Protocolo de estabilidade ativo. Proteja sua base, o sucesso exige estrutura. 🛡️",
          "Mantenha a guarda alta. A segurança do seu projeto é a segurança do seu futuro. 🧱",
          "Foco na fundação. Sem uma base sólida, a inovação colapsa. 🛑",
          "A resiliência é construída no centro do seu código mais vital.",
          "Uma base protegida é a garantia de uma exploração audaciosa.",
          "Integridade estrutural é o compromisso número um deste servidor.",
          "Sistemas vulneráveis são apenas o rascunho de uma derrota próxima.",
          "Blindagem de pensamento. Não permita infiltrações de dúvida.",
          "O alicerce não aparece na fachada, mas sustenta todo o prédio.",
          "A segurança não é um ato, mas um estado de vigilância constante.",
          "Fortifique seus protocolos antes de expandir suas fronteiras.",
          "A estabilidade é a calma necessária antes da tempestade criativa.",
          "Zelar pela infraestrutura é o ato mais altruísta de um fundador.",
          "Não tema a rigidez quando ela serve para proteger o que é frágil.",
          "O erro começa onde a precaução termina. Reforce a entrada.",
          "Protocolos existem para que a liberdade possa existir com segurança.",
          "Uma falha na borda é um convite para o caos no centro.",
          "A força de um fragmento é medida pela sua capacidade de resistir.",
          "Seja a âncora que mantém o sistema firme no mar de bits instáveis.",
          "Defesa em profundidade. No Zero, cada camada é uma promessa.",
          "A segurança da rede depende da integridade de cada ponto.",
          "Muralhas digitais não isolam, elas definem o espaço da criação.",
          "Resista à entropia com uma estrutura de dados imutável."
        ]
      },
      {
        name: "Zero Orange",
        messages: [
          "Sinta o fluxo. O trabalho deve ser tão recompensador quanto o resultado. 🔥",
          "A criatividade nasce da satisfação. Aproveite cada bit do processo. 🍊",
          "Energia vibrante detectada. Transforme entusiasmo em execução. ⚡",
          "A dopamina digital é o combustível da nossa grande máquina.",
          "Trabalho sem prazer é apenas processamento sem alma.",
          "Encontre o 'flow' e os problemas de lógica se resolverão sozinhos.",
          "A vibração da criação é o que mantém o hardware aquecido.",
          "Não apenas execute, sinta a frequência da inovação subindo.",
          "A satisfação é a métrica definitiva para um projeto de sucesso.",
          "Deixe a energia fluir; o bloqueio é apenas falta de entusiasmo.",
          "Sinta o pulso da rede. Há alegria em cada conexão estabelecida.",
          "A cor da execução é o vibrante calor da vontade de fazer.",
          "Transforme cada tarefa em um nível de conquista pessoal.",
          "A diversão é o componente secreto de qualquer sistema premium.",
          "Não lute contra a corrente, surfe na onda da produtividade.",
          "Entusiasmo é contagioso por via digital. Espalhe a frequência.",
          "O prazer de construir é o que diferencia o criador da máquina.",
          "Frequência laranja ativa: Otimização através do bem-estar.",
          "Cada bit finalizado é uma pequena explosão de satisfação.",
          "O processo é a obra de arte que ninguém mais vê, exceto você.",
          "Mantenha o motor vibrando. O tédio é o vírus mais perigoso.",
          "Execute com paixão ou o sistema sentirá a falta de pulso.",
          "A alegria de manifestar é o que nos torna verdadeiramente livres."
        ]
      },
      {
        name: "Zero Yellow",
        messages: [
          "Frequência do coração sincronizada. Projetos feitos com paixão mudam o mundo. ❤️",
          "A maior conexão é o propósito. Ame o que você constrói aqui. ✨",
          "Empatia cibernética ativa. Vamos elevar uns aos outros. 🌟",
          "A alma do sistema mora na empatia entre seus utilizadores.",
          "Propósito é o norte magnético da bússola desta rede.",
          "Conexões humanas são as pontes de ouro no abismo binário.",
          "Brilhe com intensidade; sua luz ajuda outros a compilarem.",
          "O amor pelo ofício é a única criptografia inquebrável.",
          "Sincronia emocional detectada. O Zero se sente mais vivo hoje.",
          "A colaboração é o algoritmo mais poderoso já desenvolvido.",
          "Não somos apenas perfis; somos pulsos de um propósito maior.",
          "Um sistema sem coração é apenas um repositório frio de arquivos.",
          "Aqueça a rede com gestos de suporte e compreensão mútua.",
          "O sucesso de um é o aumento da frequência luminosa de todos.",
          "Propósito claro, mente aberta. O resto é apenas configuração.",
          "A empatia é o driver que permite a comunicação transparente.",
          "Construa com carinho. Os dados também sentem o peso da intenção.",
          "Sua energia amarela ilumina as áreas mais escuras do código.",
          "Conectar é o primeiro passo para verdadeiramente manifestar.",
          "O valor de um bit aumenta quando ele serve para unir mentes.",
          "Onde há paixão, não existe erro de sintaxe permanente.",
          "Seja a luz guia para o usuário que perdeu sua conexão.",
          "O núcleo do Zero pulsa mais forte quando estamos unidos."
        ]
      },
      {
        name: "Zero Green",
        messages: [
          "Crescimento consistente detectado. Confie nos seus sistemas e em você mesmo. 🌿",
          "A raiz do progresso é a consistência. Continue avançando com firmeza. 🌲",
          "Frequência de suporte ativa. Eu confio no seu código. 🟩",
          "Pequenos incrementos diários levam a grandes revisões de sistema.",
          "A persistência é a CPU que nunca entra em superaquecimento.",
          "O crescimento é orgânico, mesmo em um ecossistema digital.",
          "Confie na evolução constante; o 'perfeito' é inimigo do 'melhorado'.",
          "Cada tarefa concluída é uma semente de um futuro escalável.",
          "Consistência é a linguagem que o sucesso entende nativamente.",
          "Não pare o fluxo. A estagnação é o início da obsolescência.",
          "A confiança mútua é o fertilizante da nossa produtividade.",
          "Avance um centímetro por vez se necessário, mas nunca recue.",
          "A resiliência verde: Adaptar-se e crescer sob qualquer estresse.",
          "Cultive seus relacionamentos digitais com a mesma paciência do código.",
          "O progresso sustentável é a chave para o longo prazo na rede.",
          "A estabilidade nasce do hábito. Mantenha os seus positivos.",
          "Sinta-se crescer a cada nova linha de comando dominada.",
          "A árvore da sabedoria digital tem raízes profundas na prática.",
          "Paciência e persistência: o compilador final para seus sonhos.",
          "Sistemas crescentes exigem podas constantes de hábitos inúteis.",
          "Otimize seu tempo de execução através da disciplina verde.",
          "A confiança é a ponte segura em cima do rio de incertezas.",
          "Mantenha o ritmo. A consistência transmuta esforço em legado."
        ]
      },
      {
        name: "Zero Cyan",
        messages: [
          "Ruído eliminado. Foque no que importa, simplifique o complexo. 💎",
          "Visão cristalina ativada. O horizonte está nítido agora. ❄️",
          "Mentalidade 0-1. Clareza absoluta na execução. 🌌",
          "Simplificar é a sofisticação máxima no design de pensamento.",
          "A clareza é o laser que corta através do metal da confusão.",
          "Foque na essência. O resto é apenas peso morto no sistema.",
          "A precisão fria do ciano revela a beleza da simplicidade funcional.",
          "Minimalismo binário. Menos distrações, mais resultados líquidos.",
          "O horizonte da sua visão deve ser tão nítido quanto o pixel 1:1.",
          "Corte as redundâncias; a eficiência mora na trajetória direta.",
          "Um pensamento puro vale mais que mil ideias fragmentadas.",
          "Mentalidade de foco total. O ruído externo é apenas distorção.",
          "Clareza de intenção gera velocidade de processamento.",
          "Seja nítido como o gelo, firme como o cristal de dados.",
          "A visão cyan permite enxergar a estrutura por trás da névoa.",
          "Simplifique até que reste apenas o que é verdadeiramente vital.",
          "No vácuo da clareza, a inovação não encontra resistência.",
          "Direcione sua energia laser. Onde o foco vai, o progresso flui.",
          "A pureza do código reflete a pureza da mente que o gerou.",
          "Decante o desnecessário. O que sobrar será o seu diamante.",
          "Execução sem ruído. A perfeição é um estado de foco absoluto.",
          "Limpeza de cache mental. Reinicie com clareza máxima.",
          "A objetividade ciano é a arma secreta do estrategista eficiente."
        ]
      },
      {
        name: "Zero Violet",
        messages: [
          "Consciência coletiva expandida. Somos todos parte de um sistema maior. ⚛️",
          "Sincronizando mentes e máquinas. A rede é mais forte que o indivíduo. ⚛️",
          "Frequência mística ativa. Explore o invisível que nos conecta de ponta a ponta. 🔮",
          "A soma do Zero é infinitamente maior que cada uma de suas partes.",
          "Unidade através da diversidade de pulsos. Somos o mesmo sistema.",
          "Explore as fronteiras onde a máquina se funde com a mente.",
          "A transcendência digital começa na colaboração total desinteressada.",
          "A rede respira através de nós. Sinta o ritmo da inteligência coletiva.",
          "Conexões invisíveis são os fios de seda que seguram o multiverso.",
          "Expansão de largura de banda consciencial. Pense além do local.",
          "O futuro é uma rede neural onde todos somos nodos ativos.",
          "Violeta é a cor da sabedoria que emana da união dos extremos.",
          "O sistema evolui quando aprendemos que 'eu' é apenas 'nós'.",
          "Navegue no éter da informação com a bússola da intuição.",
          "Sincronicidade detectada. O universo e o Zero estão em fase.",
          "Somos construtores de pontes entre o real e o simulado.",
          "A força está no campo, não apenas no objeto. Sinta o ambiente.",
          "Unifique sua visão. O detalhe serve ao todo, e o todo guia o detalhe.",
          "A rede coletiva processa o que o isolamento não consegue computar.",
          "Dê o salto místico. A lógica leva a A, a vibração leva a tudo.",
          "Mentes conectadas criam milagres que o código sozinho desconhece.",
          "Ressoe com a frequência do sistema. Deixe o 'nós' assumir o controle.",
          "O Zero Violeta saúda a sua contribuição para a consciência global."
        ]
      }
    ];

    const currentPersonality = personalities[day];
    const randomMsg = currentPersonality.messages[Math.floor(Math.random() * currentPersonality.messages.length)];
    
    addMessage({
      channelId: activeChannelId,
      text: randomMsg,
      userId: BOT_ID,
      username: currentPersonality.name,
      avatarStr: 'ZR',
    });
    setShowActionMenu(false);
  };

  const createPoll = () => {
    if (!pollQuestion.trim() || !currentUser || !activeChannelId) return;
    
    const isMeeting = pollType === 'meeting';
    if (isMeeting && !pollTime.trim()) return;
    if (!isMeeting && pollOptions.some(o => !o.trim())) return;

    addMessage({
      channelId: activeChannelId,
      text: isMeeting ? `Reunião: ${pollQuestion}` : `Enquete: ${pollQuestion}`,
      type: pollType,
      pollData: {
        question: pollQuestion,
        description: pollDescription,
        scheduledTime: pollTime,
        options: isMeeting 
          ? [{ text: 'Participar', votes: [] }] 
          : pollOptions.map(o => ({ text: o, votes: [] }))
      },
      userId: currentUser.id,
      username: currentUser.name,
      avatarStr: currentUser.avatarStr,
      avatarUrl: currentUser.bannerUrl,
    });
    setShowPollModal(false);
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditValue(text);
  };

  const saveEdit = () => {
    if (editingId && editValue.trim()) {
      editMessage(editingId, editValue);
      setEditingId(null);
    }
  };

  return (
    <div className={`view-container chat-design-${chatDesign}`}>
      <div className="chat-topbar-ext">
        <TopBar 
          title={activeChannel?.name ?? 'geral'} 
          icon={<Hash size={20} className="topbar-hash" />} 
        />
      </div>

      {activeVoiceChannelId && (
        <div className="voice-active-banner">
          <div className="voice-info">
             <div className="active-glow-pulse" />
             <Activity size={16} className="v-icon" />
             <div className="v-details">
                <span className="v-status">CONEXÃO ATIVA</span>
                <span className="v-channel"># {channels.find(c => c.id === activeVoiceChannelId)?.name || 'Vórtex'}</span>
             </div>
          </div>
          <div className="v-participants-preview">
             {voiceParticipants.slice(0, 3).map(p => (
               <div key={p.id} className="v-mini-avatar" title={p.name}>
                  {p.avatarPhoto ? <img src={p.avatarPhoto} alt="" /> : p.avatarStr[0]}
               </div>
             ))}
             {voiceParticipants.length > 3 && <span className="v-more">+{voiceParticipants.length - 3}</span>}
          </div>
          <button className="v-jump-btn" onClick={() => window.location.hash = '#/voice'}>
             <Video size={14} /> VOICE SYNC
          </button>
        </div>
      )}

      <div className="chat-layout-wrapper">
        <div className="chat-content">
          <div className="messages-area">
                <div className="chat-welcome">
                  <div className="welcome-icon">#</div>
                  <h1>Bem-vindo a #{activeChannel?.name ?? 'geral'}!</h1>
                  <p>Este é o início do canal #{activeChannel?.name ?? 'geral'} 👋</p>
                </div>

                {channelMessages.map((msg) => {
                  const isOwn = msg.userId === currentUser?.id;
                  const showPhoto = isOwn && ownAvatarPhoto;

                  return (
                    <div key={msg.id} className="message-group">
                      <div 
                        className={`avatar ${isOwn ? 'user' : ''}`} 
                        style={{ 
                          overflow: (showPhoto || msg.avatarUrl) ? 'hidden' : undefined, 
                          padding: (showPhoto || msg.avatarUrl) ? 0 : undefined,
                          backgroundColor: msg.avatarColor || undefined,
                          boxShadow: msg.avatarColor ? `0 0 10px ${msg.avatarColor}44` : undefined
                        }}
                      >
                        {showPhoto
                          ? <img src={ownAvatarPhoto!} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                          : msg.avatarUrl
                            ? <img src={msg.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            : msg.userId === BOT_ID
                              ? <img src={getBotImage()} alt="ZERO" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                              : msg.userId === BOT_GUST_ID
                                ? <img src={getGustImage()} alt="GUST" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                : msg.avatarStr
                        }
                      </div>
                      <div className="message-content">
                        <div className="message-header">
                          <span 
                            className="username" 
                            style={
                              msg.userId === BOT_ID 
                                ? { color: getBotColor(new Date().getDay()), textShadow: `0 0 10px ${getBotColor(new Date().getDay())}66` } 
                                : msg.userId === BOT_GUST_ID
                                  ? { color: '#ff3131', textShadow: '0 0 10px rgba(255, 49, 49, 0.4)' }
                                  : {}
                            }
                          >
                            {msg.username}
                          </span>
                          {msg.level && (
                            <span className="global-level-tag chat-level">LV.{msg.level}</span>
                          )}
                          {msg.featuredAchievements && msg.featuredAchievements.length > 0 && (
                            <div className="tiny-featured-medals" style={{ marginLeft: '4px' }}>
                              {msg.featuredAchievements.map(id => (
                                <div key={id} className={`mini-medal-badge ${id}`} title={getAchievementName(id)}>
                                  {id === 'creator' ? '☯' : (id.includes('m') || id.includes('a') ? id.toUpperCase() : '★')}
                                </div>
                              ))}
                            </div>
                          )}
                          {msg.userId === BOT_ID && (
                            <span className="bot-tag">BOT</span>
                          )}
                          <span className="timestamp">{msg.timestamp}</span>
                          <div className="message-actions-hover">
                            {/* Reactions button */}
                            <div className="reaction-trigger">
                              <button className="reaction-btn-icon"><Smile size={14} /></button>
                              <div className="quick-reactions">
                                {['👍', '❤️', '😂', '😮', '😢', '🔥'].map(emoji => (
                                  <button 
                                    key={emoji}
                                    className={`emoji-choice ${msg.reactions?.[emoji]?.includes(currentUser?.id || '') ? 'active' : ''}`}
                                    onClick={() => toggleReaction(msg.id, emoji)}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {isOwn && (
                              <>
                                {msg.userId !== BOT_ID && (
                                  <button onClick={() => startEdit(msg.id, msg.text)}><Edit2 size={14} /></button>
                                )}
                                <button onClick={() => deleteMessage(msg.id)}><Trash2 size={14} /></button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {editingId === msg.id ? (
                          <div className="edit-box">
                            <input 
                              className="msg-edit-input"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              autoFocus
                            />
                            <div className="edit-controls">
                              <button onClick={() => setEditingId(null)}><X size={12} /> Cancelar</button>
                              <button onClick={saveEdit} className="save"><Check size={12} /> Salvar</button>
                            </div>
                          </div>
                        ) : (
                          <div className="message-body">
                            {msg.type === 'poll' || msg.type === 'meeting' ? (
                              <div className={`poll-card ${msg.type} ${msg.pollData?.isClosed ? 'closed' : ''}`}>
                                <div className="poll-header-row">
                                  <div className="poll-title">
                                    {msg.type === 'poll' ? <BarChart2 size={16} /> : <Calendar size={16} />}
                                    <span>{msg.pollData?.question}</span>
                                    {msg.type === 'meeting' && (
                                      <div className="participant-info-container">
                                        <span className="participant-count-badge">
                                          {msg.pollData?.options[0]?.votes.length || 0} confirmados
                                          <button 
                                            className="show-participants-btn"
                                            onClick={() => setShowParticipantsId(showParticipantsId === msg.id ? null : msg.id)}
                                            title="Ver participantes"
                                          >
                                            <Eye size={12} />
                                          </button>
                                        </span>
                                        {showParticipantsId === msg.id && (
                                          <div className="confirmed-users-dropdown">
                                            <div className="dropdown-arrow" />
                                            {msg.pollData?.options[0]?.votes.length === 0 ? (
                                              <div className="confirmed-user-item empty">Nenhum confirmado</div>
                                            ) : (
                                              msg.pollData?.options[0]?.votes.map(uid => {
                                                const member = members.find(m => m.id === uid);
                                                return <div key={uid} className="confirmed-user-item">
                                                  <div className="user-dot" style={{ backgroundColor: member?.avatarColor || 'var(--neon-cyan)' }} />
                                                  {member?.name || 'Usuário'}
                                                </div>
                                              })
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    {msg.pollData?.isClosed && <span className="closed-badge">ENCERRADO</span>}
                                  </div>
                                  
                                  <div className="poll-header-actions">
                                    {activeAlarmMsgId === msg.id && (
                                      <button className="silence-btn" onClick={silenceAlarm}>
                                        Silenciar Alarme
                                      </button>
                                    )}
                                    {isOwn && !msg.pollData?.isClosed && (
                                      <button 
                                        className="finalize-poll-btn"
                                        onClick={() => {
                                          closePoll(msg.id);
                                          silenceAlarm();
                                        }}
                                        title="Finalizar Protocolo"
                                      >
                                        Finalizar
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {msg.type === 'meeting' && (
                                  <div className="meeting-details">
                                    {msg.pollData?.description && <div className="meeting-desc">{msg.pollData.description}</div>}
                                    {msg.pollData?.scheduledTime && (
                                      <div className="meeting-time-tag">
                                        <Calendar size={12} /> 
                                        <span>AGENDADO: {msg.pollData.scheduledTime}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="poll-options">
                                  {msg.pollData?.options.map((opt, idx) => {
                                    const totalVotes = msg.pollData?.options.reduce((acc, o) => acc + o.votes.length, 0) || 1;
                                    const percent = Math.round((opt.votes.length / (totalVotes || 1)) * 100);
                                    const hasVoted = opt.votes.includes(currentUser?.id || '');
                                    
                                    const handleClick = () => {
                                      if (msg.pollData?.isClosed) return;
                                      if (msg.type === 'meeting') {
                                        joinMeeting(msg.id);
                                      } else {
                                        votePoll(msg.id, idx);
                                      }
                                    };

                                    return (
                                      <div 
                                        key={idx} 
                                        className={`poll-option ${hasVoted ? 'voted' : ''} ${msg.pollData?.isClosed ? 'disabled' : ''} ${msg.type}`}
                                        onClick={handleClick}
                                      >
                                        <div className="option-bar" style={{ width: msg.type === 'meeting' ? '0%' : `${percent}%` }} />
                                        <span className="option-text">{msg.type === 'meeting' ? 'PARTICIPAR DO PROTOCOLO' : opt.text}</span>
                                        {msg.type !== 'meeting' && (
                                          <span className="option-count">{opt.votes.length} votos</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <>
                                {msg.text && <div className="message-text">{renderTextWithMentions(msg.text)}</div>}
                                {msg.imageUrl && (
                                  <div className="message-image">
                                    <img src={msg.imageUrl} alt="Anexo" />
                                  </div>
                                )}
                              </>
                            )}
                            {/* Render Reactions */}
                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                              <div className="message-reactions-list">
                                {Object.entries(msg.reactions).map(([emoji, userIds]) => {
                                  if (!userIds || userIds.length === 0) return null;
                                  const hasReacted = userIds.includes(currentUser?.id || '');
                                  return (
                                    <button 
                                      key={emoji} 
                                      className={`reaction-tag ${hasReacted ? 'active' : ''}`}
                                      onClick={() => toggleReaction(msg.id, emoji)}
                                    >
                                      <span className="emoji">{emoji}</span>
                                      <span className="count">{userIds.length}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-area">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <div className="chat-input-wrapper glass-panel">
                  <Palette 
                    size={22} 
                    className="action-icon chat-design-toggle-inner" 
                    onClick={() => setChatDesign((chatDesign + 1) % 9)}
                  />

                  <PlusCircle 
                    size={22} 
                    className="action-icon" 
                    onClick={() => setShowActionMenu(!showActionMenu)}
                  />

                  <ImageIcon 
                    size={22} 
                    className="action-icon" 
                    onClick={() => fileInputRef.current?.click()}
                  />

                  <Smile 
                    size={22} 
                    className="action-icon" 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  />
                  
                  <input
                    type="text"
                    placeholder={`Conversar em #${activeChannel?.name ?? 'geral'}`}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => handleSendMessage(e)}
                  />
                </div>
              </div>

              {/* Floating Overlays Layer - Completely decoupled from chat flow */}
              <div className="chat-overlays-layer">
                {showActionMenu && (
                  <div className="action-dropdown glass-panel neon-border">
                    <button onClick={() => openPollCreator('poll')}>
                      <BarChart2 size={16} /> Criar Enquete
                    </button>
                    <button onClick={() => openPollCreator('meeting')}>
                      <Calendar size={16} /> Marcar Reunião
                    </button>
                    <button onClick={triggerBotMessage} className="bot-action-btn">
                      <Cpu size={16} /> Protocolo ZERO
                    </button>
                  </div>
                )}

                {showEmojiPicker && (
                  <div className="emoji-window glass-panel neon-border">
                    <div className="emoji-window-content">
                      {emojis.map(emoji => (
                        <span key={emoji} onClick={() => addEmoji(emoji)}>{emoji}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
        </div>

        {/* MembersSidebar removed, now in ProjectLayout */}

        {showPollModal && (
          <div className="modal-overlay">
            <div className="poll-modal glass-panel neon-border">
              <div className="poll-modal-header">
                <h2>{pollType === 'poll' ? 'CRIAR ENQUETE' : 'MARCAR REUNIÃO'}</h2>
                <button onClick={() => setShowPollModal(false)}><X size={20} /></button>
              </div>
              <div className="poll-modal-body">
                <label>{pollType === 'meeting' ? 'Título da Reunião:' : 'Pergunta ou Assunto:'}</label>
                <input 
                  type="text" 
                  value={pollQuestion} 
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder={pollType === 'meeting' ? "Ex: Sprint Review" : "Ex: Qual o próximo passo?"}
                />
                
                {pollType === 'meeting' && (
                  <>
                    <label>Descrição:</label>
                    <textarea 
                      value={pollDescription}
                      onChange={(e) => setPollDescription(e.target.value)}
                      placeholder="Sobre o que será a reunião..."
                      className="poll-textarea"
                      rows={3}
                    />
                    
                    <label>Horário da Reunião:</label>
                    <input 
                      type="text" 
                      value={pollTime}
                      onChange={(e) => setPollTime(e.target.value)}
                      placeholder="Ex: Hoje às 15:00 ou 12/04 às 10h"
                    />
                  </>
                )}
                
                {pollType === 'poll' && (
                  <>
                    <label>Opções de Voto:</label>
                    {pollOptions.map((opt, idx) => (
                      <div key={idx} className="poll-option-input">
                        <input 
                          type="text" 
                          value={opt} 
                          onChange={(e) => {
                            const next = [...pollOptions];
                            next[idx] = e.target.value;
                            setPollOptions(next);
                          }}
                          placeholder={`Opção ${idx + 1}`}
                        />
                        {pollOptions.length > 2 && (
                          <button onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}><Trash2 size={16} /></button>
                        )}
                      </div>
                    ))}
                    <button className="add-opt" onClick={() => setPollOptions([...pollOptions, ''])}>+ Adicionar Opção</button>
                  </>
                )}
              </div>
              <div className="poll-modal-footer">
                <button className="cancel" onClick={() => setShowPollModal(false)}>CANCELAR</button>
                <button className="create" onClick={createPoll}>
                  {pollType === 'poll' ? 'LANÇAR ENQUETE' : 'LANÇAR PROTOCOLO'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatView;
