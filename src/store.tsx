import { create } from 'zustand';
import { supabase } from './lib/supabase';

export type UserStatus = 'Disponível' | 'Invisível' | 'Discreto' | 'Focado' | 'Dormindo';

export const BOT_GUST_ID = 'f1111111-1111-1111-1111-111111111111';
export const BOT_ZERO_ID = 'f0000000-0000-0000-0000-000000000000';
export const CREATOR_EMAIL = 'Anhderson1@gmail.com';


import { MessageSquare, Phone, Video, Users, Mail, Compass } from 'lucide-react';

const YinYangIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    <circle cx="100" cy="100" r="95" fill="white" stroke="currentColor" strokeWidth="10" />
    <path d="M 100 5 A 95 95 0 0 1 100 195 A 47.5 47.5 0 0 1 100 100 A 47.5 47.5 0 0 0 100 5" fill="currentColor" />
    <circle cx="100" cy="52.5" r="15" fill="white" />
    <circle cx="100" cy="147.5" r="15" fill="currentColor" />
  </svg>
);

export const ACHIEVEMENTS = [
  { id: 'creator',   name: 'Criador',         icon: <YinYangIcon size={18} />,   color: 'white',  hint: 'Arquiteto Supremo desta Realidade Digital.' },
  { id: 'pioneer',   name: 'Desbravador',     icon: <Compass size={18} />,       color: 'white',  hint: 'Iniciou sua jornada oficial no Zero Signal.' },
  { id: 'chat_1',    name: 'Primeiro Chat',   icon: <MessageSquare size={18} />, color: 'cyan',   hint: 'Enviou sua primeira mensagem no chat global.' },
  { id: 'audio_1',   name: 'Primeiro Áudio',  icon: <Phone size={18} />,         color: 'green',  hint: 'Iniciou ou participou de uma chamada de áudio.' },
  { id: 'video_1',   name: 'Primeiro Vídeo',  icon: <Video size={18} />,         color: 'purple', hint: 'Ativou sua câmera pela primeira vez.' },
  { id: 'meeting_1', name: 'Primeira Task',   icon: <Users size={18} />,         color: 'orange', hint: 'Participou de sua primeira reunião oficial.' },
  { id: 'inbox_1',   name: 'Primeiro Inbox',  icon: <Mail size={18} />,          color: 'yellow', hint: 'Enviou ou recebeu sua primeira mensagem direta.' },
  { id: 'chat_33',   name: 'Tagarela 33',     icon: <MessageSquare size={18} />, color: 'red',    hint: '33 transmissões realizadas no chat.' },
  { id: 'audio_33',  name: 'Voz Ativa 33',    icon: <Phone size={18} />,         color: 'white',  hint: '33 conexões de áudio estabelecidas.' },
  { id: 'video_33',  name: 'Visão 33',        icon: <Video size={18} />,         color: 'blue',   hint: '33 transmissões de vídeo concluídas.' },
  { id: 'meeting_33',name: 'Diplomata 33',    icon: <Users size={18} />,         color: 'cyan',   hint: '33 reuniões registradas no protocolo.' },
  { id: 'inbox_33',  name: 'Mensageiro 33',   icon: <Mail size={18} />,          color: 'magenta',hint: '33 mensagens privadas trocadas.' },
];

export const MEMBERSHIP_MEDALS = [
  { id: '1m',  label: '1 Mês',  months: 1,  color: 'white',  title: 'Novato do Protocolo' },
  { id: '3m',  label: '3 Meses', months: 3,  color: 'red',    title: 'Sobrevivente Digital' },
  { id: '6m',  label: '6 Meses', months: 6,  color: 'orange', title: 'Veterano do Vazio' },
  { id: '9m',  label: '9 Meses', months: 9,  color: 'yellow', title: 'Elite Sincronizada' },
  { id: '12m', label: '1 Ano',   months: 12, color: 'cyan',   title: 'Lenda de Zero Signal' },
  { id: 'a1',  label: 'Admin',   type: 'admin', color: '#ffcc00', title: 'PhantomTroupe Master' },
];

export const getAchievementName = (id: string) => {
  const ach = ACHIEVEMENTS.find(a => a.id === id);
  if (ach) return ach.name;
  const mm = MEMBERSHIP_MEDALS.find(m => m.id === id);
  if (mm) return mm.title;
  return id;
};

export const getAchievementDescription = (id: string) => {
  const ach = ACHIEVEMENTS.find(a => a.id === id);
  if (ach) return ach.hint;
  const mm = MEMBERSHIP_MEDALS.find(m => m.id === id);
  if (mm) return mm.label;
  return '';
};

export interface User {
  id: string;
  name: string;
  avatarStr: string;
  avatarColor?: string;
  email?: string;
  decorationId?: string;
  bannerColor?: string;
  bannerUrl?: string;
  entrySoundId?: string;
  exitSoundId?: string;
  friends?: string[];
  xp?: number;
  level?: number;
  registeredAt?: string;
  lastLoginDate?: string;
  status?: UserStatus;
  achievements?: string[];
  featuredAchievements?: string[];
  stats?: {
    chatCount: number;
    audioCount: number;
    videoCount: number;
    meetingCount: number;
    inboxCount: number;
  };
}

export type Permission = 
  | 'EDIT_MESSAGES' 
  | 'DELETE_MESSAGES' 
  | 'VOICE_KICK' 
  | 'VOICE_MUTE' 
  | 'CREATE_MEETINGS' 
  | 'MANAGE_ROLES'
  | 'MANAGE_EVENTS'
  | 'ADMIN';

export interface Role {
  id: string;
  name: string;
  color: string;
  permissions: Permission[];
  position: number; // For hierarchy
}

export interface Project {
  id: string;
  name: string;
  iconStr: string;
  iconUrl?: string;
  ownerId?: string;
  roles?: Role[];
  memberRoles?: Record<string, string[]>; // userId -> roleIds
  themeColor?: string;
  isPermanent?: boolean;
}

export interface GlobalEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  location: string;
  bannerType: string;
  createdBy: string;
  projectId: string;
  createdAt: string;
}

export interface Channel {
  id: string;
  projectId: string;
  name: string;
  type: 'text' | 'voice' | 'storage' | 'events';
}

export interface Message {
  id: string;
  channelId: string;
  text: string;
  imageUrl?: string;
  userId: string;
  username: string;
  avatarStr: string;
  avatarColor?: string;
  avatarUrl?: string;
  timestamp: string;
  featuredAchievements?: string[];
  level?: number;
  type?: 'text' | 'poll' | 'meeting';
  pollData?: {
    question: string;
    description?: string;
    scheduledTime?: string;
    options: { text: string; votes: string[] }[];
    isClosed?: boolean;
  };
  reactions?: { [emoji: string]: string[] };
}

export interface StorageFile {
  id: string;
  projectId: string;
  channelId?: string;
  name: string;
  type: 'folder' | 'file' | 'image' | 'audio' | 'video';
  date: string;
  size: string;
  storagePath?: string;
  fileUrl?: string;
}

export interface Member {
  id: string;
  name: string;
  avatarStr: string;
  avatarColor?: string;
  avatarPhoto?: string;
  isOnline: boolean;
  isCurrentUser: boolean;
  status?: UserStatus;
  xp?: number;
  level: number;
  decorationId?: string;
  featuredAchievements?: string[];
}

export interface Note {
  id: string;
  projectId: string;
  content: string;
  color: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  color: string;
  alarmTime?: string;
  completed: boolean;
}

export interface VoiceParticipant {
  id: string;
  name: string;
  avatarStr: string;
  avatarPhoto?: string;
  isMuted: boolean;
  isLocal: boolean;
  featuredAchievements: string[];
  channelId: string;
}

export interface ServerLog {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Email {
  id: string;
  fromId: string;
  toId: string;
  fromName: string;
  fromAvatar: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  fromId: string;
  toId: string;
  text?: string;
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

export interface Contact {
  id: string;
  contactId: string;
  name: string;
  avatarStr: string;
  avatarColor?: string;
  avatarPhoto?: string;
  status?: UserStatus;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'meeting' | 'system';
  title: string;
  content: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface AppState {
  currentUser: User | null;
  initialized: boolean;
  checkAuth: () => Promise<void>;
  login: (email: string, pass: string) => Promise<{ error: any }>;
  signUp: (email: string, pass: string, username: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  setUserStatus: (status: UserStatus) => Promise<void>;

  emails: Email[];
  loadEmails: () => Promise<void>;
  sendEmail: (toId: string, subject: string, body: string) => Promise<{ error: any }>;
  deleteEmail: (id: string) => Promise<void>;
  markEmailAsRead: (id: string) => Promise<void>;
  subscribeToEmails: () => (() => void);

  dms: DirectMessage[];
  loadDMs: (otherId: string) => Promise<void>;
  sendDM: (toId: string, text: string, imageUrl?: string) => Promise<{ error: any }>;
  markDMAsRead: (otherId: string) => Promise<void>;
  subscribeToDMs: () => (() => void);

  contacts: Contact[];
  loadContacts: () => Promise<void>;
  addContact: (contactId: string) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
  searchUsers: (query: string) => Promise<Contact[]>;
  
  notifications: Notification[];
  loadNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  sendNotification: (toUserId: string, type: Notification['type'], title: string, content: string, link?: string) => Promise<void>;
  subscribeToNotifications: () => (() => void);

  projects: Project[];
  activeProjectId: string | null;
  loadProjects: () => Promise<void>;
  createProject: (name: string) => Promise<string | null>;
  deleteProject: (id: string) => Promise<void>;
  setActiveProject: (id: string) => void;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;

  channels: Channel[];
  activeChannelId: string | null;
  loadChannels: (projectId: string) => Promise<void>;
  createChannel: (projectId: string, name: string, type: Channel['type']) => Promise<string | null>;
  setActiveChannel: (id: string) => void;
  subscribeToChannels: (projectId: string) => (() => void);
  _channelsSubscription: any;

  messages: Message[];
  _realtimeChannel: any;
  loadMessages: (channelId: string) => Promise<void>;
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  editMessage: (id: string, newText: string) => Promise<void>;
  votePoll: (messageId: string, optionIndex: number) => Promise<void>;
  closePoll: (messageId: string) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  joinMeeting: (messageId: string) => Promise<void>;


  members: Member[];
  loadMembers: () => Promise<void>;

  storageFiles: StorageFile[];
  loadStorageFiles: (projectId: string, channelId?: string) => Promise<void>;
  uploadFile: (projectId: string, channelId: string, file: File) => Promise<void>;
  downloadFile: (fileId: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;

  updateProfile: (data: Partial<User>) => Promise<void>;
  addFriend: (friendId: string) => Promise<void>;
  
  incrementStat: (key: 'chatCount' | 'audioCount' | 'videoCount' | 'meetingCount' | 'inboxCount') => Promise<void>;
  unlockAchievements: (ids: string[]) => Promise<void>;
  toggleFeaturedAchievement: (id: string) => Promise<void>;
  unlockedAchievement: string | null;
  setUnlockedAchievement: (id: string | null) => void;
  addXP: (userId: string, amount: number) => Promise<void>;
  subscribeToProfiles: () => void;

  appTheme: 'neon' | 'glass-blur' | 'tech-transparent';
  setAppTheme: (theme: 'neon' | 'glass-blur' | 'tech-transparent') => void;

  globalDesign: number;
  setGlobalDesign: (design: number) => void;

  voiceParticipants: VoiceParticipant[];
  voiceSpeaking: Set<string>;
  activeVoiceChannelId: string | null;
  voiceStartTime: number | null;
  loadVoiceParticipants: () => Promise<void>;
  subscribeToVoiceParticipants: () => (() => void);
  joinVoice: (channelId: string) => Promise<void>;
  leaveVoice: () => Promise<void>;
  setSpeaking: (userId: string, isSpeaking: boolean) => Promise<void>;
  toggleMuteSelf: () => Promise<void>;
  _voiceSubscription: any;

  notes: Note[];
  tasks: Task[];
  loadNotes: (projectId: string) => Promise<void>;
  addNote: (projectId: string, content: string, color: string) => Promise<void>;
  updateNote: (id: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  loadTasks: (projectId: string) => Promise<void>;
  addTask: (projectId: string, task: Omit<Task, 'id' | 'projectId' | 'completed'>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  uncheckAllTasks: (projectId: string) => Promise<void>;
  moveTask: (id: string, delta: number) => void;

  serverLogs: ServerLog[];
  showServerLogs: boolean;
  setShowServerLogs: (val: boolean) => void;
  loadServerLogs: (projectId: string) => Promise<void>;
  logEvent: (projectId: string, action: string, details?: string) => Promise<void>;

  globalEvents: GlobalEvent[];
  loadGlobalEvents: () => Promise<void>;
  addGlobalEvent: (event: Omit<GlobalEvent, 'id' | 'createdAt'>) => Promise<void>;
  deleteGlobalEvent: (id: string) => Promise<void>;
  
  eventRSVPs: Record<string, string[]>; // eventId -> userIds
  loadRSVPs: () => Promise<void>;
  toggleRSVP: (eventId: string) => Promise<void>;

  showEventCreateModal: boolean;
  setShowEventCreateModal: (val: boolean) => void;

  isCreator: () => boolean;
  canManageSincronicidade: (projectId: string) => boolean;

  showProfileSettings: boolean;
  activeProfileTab: 'profile' | 'friends' | 'gamification' | 'sounds';
  setProfileSettings: (show: boolean, tab?: 'profile' | 'friends' | 'gamification' | 'sounds') => void;

  userAliases: Record<string, string>;
  setUserAlias: (userId: string, alias: string) => void;

  // Roles
  createRole: (projectId: string, name: string, color: string, permissions: Permission[]) => void;
  updateRole: (projectId: string, roleId: string, updates: Partial<Role>) => void;
  deleteRole: (projectId: string, roleId: string) => void;
  assignRole: (projectId: string, userId: string, roleId: string) => void;
  removeRole: (projectId: string, userId: string, roleId: string) => void;
  hasPermission: (projectId: string, userId: string, permission: Permission) => boolean;

  // Security (Gust)
  isSecurityCritical: boolean;
  setSecurityCritical: (val: boolean) => void;
  userMutes: Record<string, number>; // userId -> timestamp of mute end
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  initialized: false,
  unlockedAchievement: null,
  setUnlockedAchievement: (id) => set({ unlockedAchievement: id }),
  _realtimeChannel: null,
  _channelsSubscription: null,
  activeProjectId: localStorage.getItem('zs_active_project'),
  activeChannelId: localStorage.getItem('zs_active_channel'),
  voiceStartTime: null,
  projects: [],
  channels: [],
  messages: [],
  members: [],
  storageFiles: [],
  appTheme: 'glass-blur',
  globalDesign: parseInt(localStorage.getItem('zs_global_design') || '7'), // Default 7 (White)
  voiceParticipants: [],
  voiceSpeaking: new Set<string>(),
  activeVoiceChannelId: null,
  notes: [],
  tasks: [],
  serverLogs: [],
  showServerLogs: false,
  showProfileSettings: false,
  _voiceSubscription: null,
  activeProfileTab: 'profile',
  userAliases: JSON.parse(localStorage.getItem('zs_user_aliases') || '{}'),
  isSecurityCritical: false,
  userMutes: {},
  messageHistory: {} as Record<string, number[]>, // Track timestamps for spam  
  
  checkAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    const calculateStatsLevel = (xp: number) => {
      const lvl = Math.floor(xp / 1000) + 1;
      return lvl > 360 ? 360 : lvl;
    };

    if (session?.user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (profile) {
        set({ 
          currentUser: { 
            id: profile.id, 
            name: profile.username || 'Novo Usuário', 
            avatarStr: profile.avatar_str || 'U',
            xp: profile.xp || 0,
            level: profile.level || calculateStatsLevel(profile.xp || 0),
            status: profile.status || 'Disponível',
            achievements: profile.achievements || [],
            featuredAchievements: profile.featured_achievements || [],
            registeredAt: profile.created_at,
            decorationId: profile.decoration_id || 'none',
            bannerColor: profile.banner_color || '#0a0a0c',
            bannerUrl: profile.banner_url,
            email: session.user.email
          },
          initialized: true 
        });

        // Pioneer auto-unlock
        if (!profile.achievements?.includes('pioneer')) {
          await get().unlockAchievements(['pioneer']);
        }

        // Creator auto-unlock
        const userEmail = session.user.email?.toLowerCase();
        const creatorEmailLower = CREATOR_EMAIL.toLowerCase();
        
        if (userEmail === creatorEmailLower && !profile.achievements?.includes('creator')) {
          await get().unlockAchievements(['creator']);
        }
        
        await get().loadMembers();
        get().subscribeToProfiles();
      } else {
        set({
          currentUser: {
            id: session.user.id,
            name: session.user.email?.split('@')[0] || 'User',
            avatarStr: 'U',
            xp: 0,
            level: 1,
            status: 'Disponível',
            achievements: [],
            featuredAchievements: [],
            registeredAt: new Date().toISOString(),
            decorationId: 'none',
            bannerColor: '#ff3131',
            email: session.user.email
          },
          initialized: true
        });
      }
      await get().loadProjects();
      await get().loadVoiceParticipants();
      get().subscribeToVoiceParticipants();
    } else {
      console.log('App initialization: No active session found.');
      set({ currentUser: null, initialized: true });
    }
  },

  login: async (email, pass) => {
    console.log('Attempting login for:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) {
        console.error('Login auth error:', error);
        return { error };
      }
      console.log('Login successful, fetching profile...');
      const { data: profile, error: profError } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      if (profError) console.warn('Profile fetch error:', profError);
      
      set({ currentUser: { 
        id: data.user.id, 
        name: profile?.username || data.user.email?.split('@')[0] || 'User', 
        avatarStr: profile?.avatar_str || 'US', 
        email: data.user.email, 
        bannerUrl: profile?.banner_url,
        status: profile?.status || 'Disponível',
        achievements: profile?.achievements || [],
        featuredAchievements: profile?.featured_achievements || [],
        stats: profile?.stats || { chatCount: 0, audioCount: 0, videoCount: 0, meetingCount: 0, inboxCount: 0 },
        registeredAt: profile?.created_at
      } });
      
      // Pioneer auto-unlock
      if (!profile?.achievements?.includes('pioneer')) {
        await get().unlockAchievements(['pioneer']);
      }
      
      console.log('Loading projects...');
      await get().loadProjects();
      await get().loadVoiceParticipants();
      get().subscribeToVoiceParticipants();
      console.log('Login sequence complete.');
      return { error: null };
    } catch (e: any) {
      console.error('Unexpected login error:', e);
      return { error: e };
    }
  },

  signUp: async (email, pass, username) => {
    const { data, error } = await supabase.auth.signUp({ email, password: pass, options: { data: { username } } });
    if (error) return { error };
    const profile = { id: data.user?.id, username, avatar_str: username.substring(0, 2).toUpperCase(), avatar_color: '#ff3131' };
    await supabase.from('profiles').upsert(profile);
    set({ currentUser: { id: data.user?.id || '', name: username, avatarStr: username.substring(0, 2).toUpperCase(), avatarColor: '#ff3131', email: data.user?.email || email, status: 'Disponível', achievements: [], stats: { chatCount: 0, audioCount: 0, videoCount: 0, meetingCount: 0, inboxCount: 0 } } });
    await get().loadProjects();
    return { error: null };
  },

  logout: async () => {
    const prevChannel = get()._realtimeChannel;
    if (prevChannel) await supabase.removeChannel(prevChannel);
    await supabase.auth.signOut();
    set({ currentUser: null, projects: [], channels: [], messages: [], storageFiles: [], members: [], _realtimeChannel: null, activeProjectId: null, activeChannelId: null, notes: [], tasks: [], serverLogs: [] });
  },

  loadProjects: async () => {
    try {
      const { data, error } = await supabase.from('projects').select('*').order('created_at');
      if (error) throw error;
      if (data) {
        const projects = data.map(p => ({ 
          id: p.id, 
          name: p.name, 
          iconStr: p.icon_str,
          ownerId: p.owner_id,
          iconUrl: p.icon_url,
          themeColor: p.color,
          roles: p.roles || [],
          isPermanent: p.is_permanent
        }));
        set({ projects });
        
        const persistedId = get().activeProjectId;
        const exists = data.some(p => p.id === persistedId);

        if (data.length > 0) {
          if (persistedId && exists) {
            get().setActiveProject(persistedId);
          } else {
            get().setActiveProject(data[0].id);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load projects:', e);
      set({ projects: [] });
    }
  },

  createProject: async (name) => {
    const iconStr = name.substring(0, 2).toUpperCase();
    const ownerId = get().currentUser?.id;
    
    // Default "Criador" role
    const creatorRole: Role = {
      id: 'role_creator',
      name: 'Criador',
      color: '#ffcc00',
      permissions: ['ADMIN'],
      position: 0
    };

    const { data, error } = await supabase.from('projects').insert({ 
      name, 
      icon_str: iconStr, 
      owner_id: ownerId,
      roles: [creatorRole]
    }).select().single();

    if (error) return null;
    const projectId = data.id;

    await supabase.from('channels').insert([
      { project_id: projectId, name: 'geral', type: 'text' },
      { project_id: projectId, name: 'Lounge', type: 'voice' },
      { project_id: projectId, name: 'Cápsula do Vazio', type: 'storage' },
      { project_id: projectId, name: 'Núcleo', type: 'storage' }
    ]);

    set(state => ({ projects: [...state.projects, { 
      id: projectId, 
      name, 
      iconStr, 
      ownerId, 
      roles: [creatorRole] 
    }] }));
    
    get().setActiveProject(projectId);
    return projectId;
  },

  deleteProject: async (id) => {
    const project = get().projects.find(p => p.id === id);
    if (project?.isPermanent) {
      throw new Error("Este servidor faz parte do núcleo permanente e não pode ser excluído.");
    }
    
    try {
      // 1. Delete all dependencies to prevent FK errors
      // The order is important: delete children before parents
      
      // Messages are linked to channels
      const { data: projChannels } = await supabase.from('channels').select('id').eq('project_id', id);
      if (projChannels && projChannels.length > 0) {
        const channelIds = projChannels.map(c => c.id);
        await supabase.from('messages').delete().in('channel_id', channelIds);
      }

      await supabase.from('server_logs').delete().eq('project_id', id);
      await supabase.from('tasks').delete().eq('project_id', id);
      await supabase.from('notes').delete().eq('project_id', id);
      await supabase.from('storage_files').delete().eq('project_id', id);
      await supabase.from('channels').delete().eq('project_id', id);
      
      // 2. Finally delete the project
      const { error } = await supabase.from('projects').delete().eq('id', id);
      
      if (error) throw error;

      // 3. Update local state
      const nextProjects = get().projects.filter(p => p.id !== id);
      set({ 
        projects: nextProjects, 
        activeProjectId: nextProjects[0]?.id || null,
        activeChannelId: null,
        messages: [],
        storageFiles: [],
        members: []
      });
      
    } catch (e) {
      console.error('Falha crítica ao excluir projeto:', e);
      throw e; // Pass to UI for alert
    }
  },

  setActiveProject: (id) => {
    set({ activeProjectId: id, activeChannelId: null, messages: [], storageFiles: [] });
    if (id) {
      localStorage.setItem('zs_active_project', id);
      get().loadChannels(id);
      get().loadStorageFiles(id);
      get().loadMembers();
      get().loadNotes(id);
      get().loadTasks(id);
      get().loadServerLogs(id);
    } else {
      get().loadMembers();
    }
  },

  updateProject: async (id, data) => {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.iconUrl) updateData.icon_url = data.iconUrl;
    if (data.themeColor) updateData.color = data.themeColor;
    
    const { error } = await supabase.from('projects').update(updateData).eq('id', id);
    if (!error) set(state => ({ projects: state.projects.map(p => p.id === id ? { ...p, ...data } : p) }));
  },

  loadChannels: async (projectId) => {
    // Fetch channels for the current project
    const { data: projectChannels } = await supabase.from('channels').select('*').eq('project_id', projectId).order('created_at');
    
    // Fetch all voice channels from permanent projects (Global Vortex)
    const { data: permanentProjectIds } = await supabase.from('projects').select('id').eq('is_permanent', true);
    const permIds = (permanentProjectIds || []).map(p => p.id);
    
    const { data: globalVoiceChannels } = await supabase.from('channels')
      .select('*')
      .in('project_id', permIds)
      .eq('type', 'voice')
      .order('created_at');

    if (projectChannels || globalVoiceChannels) {
      const allRaw = [...(projectChannels || [])];
      
      // Add global voice channels if they are not already in the project (avoid duplicates)
      const existingIds = new Set(allRaw.map(c => c.id));
      (globalVoiceChannels || []).forEach(c => {
        if (!existingIds.has(c.id)) {
          allRaw.push(c);
        }
      });

      const channels = allRaw.map(c => ({ id: c.id, projectId: c.project_id, name: c.name, type: c.type as Channel['type'] }));
      
      const currentActiveId = get().activeChannelId;
      const stillExists = channels.find(c => c.id === currentActiveId);
      
      if (stillExists) {
        set({ channels });
        await get().loadMessages(stillExists.id);
      } else {
        const firstText = channels.find(c => c.type === 'text');
        const defaultId = firstText?.id || channels[0]?.id || null;
        set({ channels, activeChannelId: defaultId });
        if (defaultId) await get().loadMessages(defaultId);
      }
    }
  },

  createChannel: async (projectId, name, type) => {
    const { data, error } = await supabase.from('channels').insert({ project_id: projectId, name, type }).select().single();
    if (error) {
      console.error('Falha ao registrar vórtex no Supabase:', error);
      return null;
    }
    
    if (data) {
      const newChan: Channel = { id: data.id, projectId: data.project_id, name: data.name, type: data.type };
      set(state => ({ 
        channels: state.channels.some(c => c.id === newChan.id) ? state.channels : [...state.channels, newChan] 
      }));
      get().logEvent(projectId, 'Criação de Canal', `Canal #${data.name} (${data.type}) criado.`);
      return data.id;
    }
    return null;
  },

  subscribeToChannels: (projectId) => {
    // Cleanup previous if exists
    const prev = get()._channelsSubscription;
    if (prev) {
      prev.unsubscribe();
      supabase.removeChannel(prev);
    }

    const chanName = `project-channels:${projectId}`;
    const channel = supabase.channel(chanName);

    channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'channels',
      filter: `project_id=eq.${projectId}`
    }, (payload) => {
      if (payload.eventType === 'INSERT') {
        const newChan: Channel = { 
          id: payload.new.id, 
          projectId: payload.new.project_id, 
          name: payload.new.name, 
          type: payload.new.type 
        };
        set(state => ({ 
          channels: state.channels.some(c => c.id === newChan.id) ? state.channels : [...state.channels, newChan] 
        }));
      } else if (payload.eventType === 'UPDATE') {
        set(state => ({
          channels: state.channels.map(c => c.id === payload.new.id ? {
            ...c,
            name: payload.new.name,
            type: payload.new.type
          } : c)
        }));
      } else if (payload.eventType === 'DELETE') {
        set(state => ({
          channels: state.channels.filter(c => c.id !== payload.old.id)
        }));
      }
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        set({ _channelsSubscription: channel });
      }
    });

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
      set({ _channelsSubscription: null });
    };
  },

  setActiveChannel: (id) => {
    set({ activeChannelId: id });
    if (id) localStorage.setItem('zs_active_channel', id);
    get().loadMessages(id);
  },

  loadMessages: async (channelId) => {
    // Basic cleanup of previous channel
    const prevChannel = get()._realtimeChannel;
    if (prevChannel) {
      await supabase.removeChannel(prevChannel);
      set({ _realtimeChannel: null });
    }

    const { data: messagesData } = await supabase.from('messages').select('*, profiles(username, avatar_str, avatar_color, banner_url, xp, featured_achievements)').eq('channel_id', channelId).order('created_at', { ascending: true }).limit(100);
    
    if (messagesData) {
      const messages: Message[] = messagesData.map(m => ({
        id: m.id,
        channelId: m.channel_id,
        text: m.text || '',
        imageUrl: m.image_url, 
        userId: m.user_id,
        type: m.type as any,
        pollData: m.poll_data as any,
        username: (m.profiles as any)?.username || 'Anon',
        avatarStr: (m.profiles as any)?.avatar_str || '??',
        avatarColor: (m.profiles as any)?.avatar_color,
        avatarUrl: (m.profiles as any)?.banner_url,
        level: Math.min(360, Math.floor(((m.profiles as any)?.xp || 0) / 1000) + 1),
        featuredAchievements: (m.profiles as any)?.featured_achievements || [],
        reactions: m.reactions || {},
        timestamp: new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }));
      set({ messages });
    }

    // Cleanup existing channel
    const existingChannel = get()._realtimeChannel;
    if (existingChannel) {
      existingChannel.unsubscribe();
      supabase.removeChannel(existingChannel);
    }

    // Create new channel
    const chanName = `chat:${channelId}`;
    
    // Safety check: if channel already exists in supabase client and is joined, we must remove it
    const activeChannels = supabase.getChannels();
    const duplicate = activeChannels.find(c => c.topic === `realtime:${chanName}`);
    if (duplicate) {
      await supabase.removeChannel(duplicate);
    }

    const channel = supabase.channel(chanName);
    
    channel.on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'messages', 
      filter: `channel_id=eq.${channelId}` 
    }, async (payload) => {
      if (payload.eventType === 'INSERT') {
        const { data: userData } = await supabase.from('profiles').select('username, avatar_str, avatar_color, banner_url, xp, level, featured_achievements').eq('id', payload.new.user_id).single();
        const newMsg = {
          id: payload.new.id, channelId: payload.new.channel_id, text: payload.new.text, 
          imageUrl: payload.new.image_url, userId: payload.new.user_id,
          type: payload.new.type, pollData: payload.new.poll_data,
          username: userData?.username || 'Anon', avatarStr: userData?.avatar_str || '??',
          avatarColor: userData?.avatar_color,
          avatarUrl: userData?.banner_url,
          level: userData?.level || Math.min(360, Math.floor((userData?.xp || 0) / 1000) + 1),
          featuredAchievements: userData?.featured_achievements || [],
          reactions: payload.new.reactions || {},
          timestamp: new Date(payload.new.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
        set(state => ({ messages: state.messages.some(m => m.id === newMsg.id) ? state.messages : [...state.messages, newMsg] }));
      } else if (payload.eventType === 'DELETE') {
        set(state => ({ messages: state.messages.filter(m => m.id !== payload.old.id) }));
      } else if (payload.eventType === 'UPDATE') {
        set(state => ({ 
          messages: state.messages.map(m => m.id === payload.new.id ? { 
            ...m, 
            text: payload.new.text,
            imageUrl: payload.new.image_url,
            type: payload.new.type,
            pollData: payload.new.poll_data 
          } : m) 
        }));
      }
    });

    channel.subscribe((status) => {
      console.log(`[Realtime] Subscription status for ${chanName}:`, status);
      if (status === 'SUBSCRIBED') {
        set({ _realtimeChannel: channel });
      }
    });
  },

  addMessage: async (msg) => {
    const userId = msg.userId;
    const nowTs = Date.now();
    
    // ---- GUST SPAM PROTECTION ----
    if (userId !== BOT_GUST_ID && userId !== BOT_ZERO_ID) {
      const history = (get() as any).messageHistory[userId] || [];
      const recentMessages = history.filter((ts: number) => nowTs - ts < 10000); // last 10 seconds
      
      if (recentMessages.length >= 3) {
        // Mute user for 60 seconds
        set(state => ({ userMutes: { ...state.userMutes, [userId]: nowTs + 60000 } }));
        
        // Gust Warning
        get().addMessage({
          channelId: msg.channelId,
          text: `[ALERTA DE SEGURANÇA] Usuário @${msg.username} silenciado temporariamente por detecção de SPAM. Fluxo de dados excedeu o limite de estabilidade.`,
          userId: BOT_GUST_ID,
          username: "Gust",
          avatarStr: "GS",
          avatarUrl: new URL(`./assets/bot/gust.jpg`, import.meta.url).href
        });
        return;
      }
      
      (get() as any).messageHistory[userId] = [...recentMessages, nowTs];
    }

    // Check if muted
    const muteEnd = get().userMutes[userId];
    if (muteEnd && nowTs < muteEnd) {
      console.warn("User is muted by GUST");
      return;
    }

    // Generate an optimistic temporary message
    const tempId = 'temp-' + Math.random().toString(36).substring(7);
    const user = get().members.find(m => m.id === userId) || {};
    const optimisticMsg: Message = {
      ...msg,
      id: tempId,
      userId: msg.userId,
      username: msg.username,
      avatarStr: msg.avatarStr,
      avatarUrl: msg.avatarUrl,
      featuredAchievements: (user as any).featuredAchievements || [],
      level: (user as any).level || 1,
      reactions: {},
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Add locally immediately
    set(state => ({ messages: [...state.messages, optimisticMsg] }));

    // Send to Supabase
    const { data: dbMsg, error } = await supabase.from('messages').insert({
      channel_id: msg.channelId,
      user_id: userId,
      text: msg.text,
      image_url: msg.imageUrl,
      type: msg.type || 'text',
      poll_data: msg.pollData
    }).select().single();

    if (error) {
      console.error('Falha crítica ao registrar vórtex no Supabase:', error);
      // Rollback: remove optimistic message on failure
      set(state => ({
        messages: state.messages.filter(m => m.id !== tempId)
      }));
      return;
    }
    
    if (dbMsg) {
      // Replace optimistic message with the real one from DB
      set(state => ({
        messages: state.messages.map(m => m.id === tempId ? { 
          ...optimisticMsg, 
          id: dbMsg.id,
          timestamp: new Date(dbMsg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        } : m)
      }));

      // GUST EPHEMERAL PROTOCOL: Messages from Gust disappear after 5 seconds
      if (userId === BOT_GUST_ID) {
        setTimeout(() => {
          get().deleteMessage(dbMsg.id);
        }, 5000);
      }

      // --- XP REWARDS & STATS ---
      await get().addXP(userId, 10);
      await get().incrementStat('chatCount');

      // Chat Geral Bonus (+15 XP)
      const currentChannel = get().channels.find(c => c.id === msg.channelId);
      if (currentChannel?.name.toLowerCase() === 'geral') {
        await get().addXP(userId, 15);
      }

      // Mentions logic
      const mentionRegex = /@(\w+)/g;
      const matches = [...msg.text.matchAll(mentionRegex)];
      if (matches.length > 0) {
        for (const match of matches) {
          const mentionedName = match[1];
          const mentionedUser = get().members.find(m => m.name.toLowerCase() === mentionedName.toLowerCase());
          if (mentionedUser && mentionedUser.id !== userId) {
            await get().sendNotification(mentionedUser.id, 'mention', 'Nova Menção', `@${get().currentUser?.name} mencionou você em um canal.`, `/chat/${msg.channelId}`);
            await get().addXP(mentionedUser.id, 5);
          }
        }
      }

      // Log project event
      const activeProject = get().activeProjectId;
      if (activeProject) {
        const chan = get().channels.find(c => c.id === msg.channelId);
        get().logEvent(activeProject, 'Nova Mensagem', `Canal #${chan?.name || '??'}: "${msg.text.substring(0, 30)}${msg.text.length > 30 ? '...' : ''}"`);
      }
    }
  },

  deleteMessage: async (id) => {
    // Optimistic UI deletion
    const msgToDelete = get().messages.find(m => m.id === id);
    set(state => ({ messages: state.messages.filter(m => m.id !== id) }));

    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) {
      // Rollback if failed
      if (msgToDelete) set(state => ({ messages: [...state.messages, msgToDelete] }));
      return;
    }
    
    const activeProject = get().activeProjectId;
    if (activeProject && msgToDelete) {
      get().logEvent(activeProject, 'Mensagem Excluída', `Mensagem removida de ${msgToDelete.username}.`);
    }
  },

  editMessage: async (id, newText) => {
    const { error } = await supabase.from('messages').update({ text: newText }).eq('id', id);
    if (error) return;
    const activeProject = get().activeProjectId;
    if (activeProject) get().logEvent(activeProject, 'Mensagem Editada', `Novo conteúdo: "${newText.substring(0, 30)}..."`);
  },
  
  votePoll: async (messageId, optionIndex) => {
    const userId = get().currentUser?.id;
    if (!userId) return;
    const msg = get().messages.find(m => m.id === messageId);
    if (!msg || !msg.pollData || msg.pollData.isClosed) return;

    const newPollData = JSON.parse(JSON.stringify(msg.pollData));
    const option = newPollData.options[optionIndex];
    
    // Toggle vote
    if (option.votes.includes(userId)) {
      option.votes = option.votes.filter((id: string) => id !== userId);
    } else {
      // Remove from other options (single choice)
      newPollData.options.forEach((opt: any) => {
        opt.votes = (opt.votes || []).filter((id: string) => id !== userId);
      });
      if (!option.votes) option.votes = [];
      option.votes.push(userId);
    }

    const { error } = await supabase.from('messages').update({ poll_data: newPollData }).eq('id', messageId);
    if (!error) {
      set(state => ({
        messages: state.messages.map(m => m.id === messageId ? { ...m, pollData: newPollData } : m)
      }));
    }
  },

  closePoll: async (messageId) => {
    const msg = get().messages.find(m => m.id === messageId);
    const userId = get().currentUser?.id;
    if (!msg || !msg.pollData || msg.pollData.isClosed || !userId) return;
    
    // Check if creator
    if (msg.userId !== userId) return;

    const newPollData = { ...msg.pollData, isClosed: true };
    const { error } = await supabase.from('messages').update({ poll_data: newPollData }).eq('id', messageId);
    
    if (!error) {
      set(state => ({
        messages: state.messages.map(m => m.id === messageId ? { ...m, pollData: newPollData } : m)
      }));
      
      const activeProject = get().activeProjectId;
      if (activeProject) {
        get().logEvent(activeProject, 'Protocolo Finalizado', `A enquete "${msg.pollData.question}" foi encerrada.`);
      }
    }
  },

  joinMeeting: async (messageId) => {
    const userId = get().currentUser?.id;
    if (!userId) return;
    const msg = get().messages.find(m => m.id === messageId);
    if (!msg || !msg.pollData || msg.pollData.isClosed) return;

    const newPollData = JSON.parse(JSON.stringify(msg.pollData));
    if (!newPollData.options || newPollData.options.length === 0) {
      newPollData.options = [{ text: 'Participar', votes: [] }];
    }
    
    const option = newPollData.options[0];
    if (option.votes.includes(userId)) {
      option.votes = option.votes.filter((id: string) => id !== userId);
    } else {
      option.votes.push(userId);
    }

    const { error } = await supabase.from('messages').update({ poll_data: newPollData }).eq('id', messageId);
    if (!error) {
      set(state => ({
        messages: state.messages.map(m => m.id === messageId ? { ...m, pollData: newPollData } : m)
      }));
      await get().incrementStat('meetingCount');
    }
  },

  loadMembers: async () => {
    const currentUserId = get().currentUser?.id;
    const { data: profiles, error } = await supabase.from('profiles').select('id, username, avatar_str, avatar_color, status, banner_url, xp, level, featured_achievements, decoration_id');

    const calculateStatsLevel = (xp: number) => {
      const lvl = Math.floor(xp / 1000) + 1;
      return lvl > 360 ? 360 : lvl;
    };

    let allMembers: Member[] = [];
    
    if (profiles && !error) {
      allMembers = profiles.map(p => ({
        id: p.id, 
        name: p.username || 'Usuário', 
        avatarStr: p.avatar_str || '??',
        avatarColor: p.avatar_color,
        avatarPhoto: p.banner_url,
        status: (p.id === BOT_ZERO_ID) ? 'Discreto' : (p.id === BOT_GUST_ID ? 'Focado' : (p.status || 'Disponível')),
        level: p.level || calculateStatsLevel(p.xp || 0),
        featuredAchievements: p.featured_achievements || [],
        decorationId: p.decoration_id || 'none',
        isOnline: p.id === currentUserId || (p.id === BOT_ZERO_ID || p.id === BOT_GUST_ID) || (p.status !== 'Invisível' && p.status !== undefined), 
        isCurrentUser: p.id === currentUserId
      }));
    }

    if (!allMembers.some(m => m.id === currentUserId) && get().currentUser) {
      const me = get().currentUser!;
      allMembers.push({
        id: me.id,
        name: me.name,
        avatarStr: me.avatarStr,
        avatarPhoto: me.bannerUrl,
        status: me.status || 'Disponível',
        level: me.level || 1,
        featuredAchievements: me.featuredAchievements || [],
        decorationId: me.decorationId,
        isOnline: true,
        isCurrentUser: true
      });
    }

    // Always ensure bots are present
    if (!allMembers.some(m => m.id === BOT_ZERO_ID)) {
      allMembers.push({
        id: BOT_ZERO_ID, name: 'Zero', avatarStr: 'Z', status: 'Discreto', level: 360, featuredAchievements: [], isOnline: true, isCurrentUser: false
      });
    }
    if (!allMembers.some(m => m.id === BOT_GUST_ID)) {
      allMembers.push({
        id: BOT_GUST_ID, name: 'Gust', avatarStr: 'GS', status: 'Focado', level: 99, featuredAchievements: [], isOnline: true, isCurrentUser: false
      });
    }

    set({ members: allMembers });
  },

  loadStorageFiles: async (projectId, channelId) => {
    let query = supabase.from('storage_files').select('*').eq('project_id', projectId);
    if (channelId) query = query.eq('channel_id', channelId);
    
    const { data } = await query.order('created_at', { ascending: false });
    
    if (data) {
      set({ 
        storageFiles: data.map(f => ({ 
          id: f.id, 
          projectId: f.project_id, 
          channelId: f.channel_id,
          name: f.name, 
          type: f.type as StorageFile['type'], 
          size: f.size, 
          date: new Date(f.created_at).toLocaleDateString('pt-BR'),
          storagePath: f.storage_path,
          fileUrl: f.storage_path ? supabase.storage.from('project-files').getPublicUrl(f.storage_path).data.publicUrl : ''
        })) 
      });
    }
  },

  uploadFile: async (projectId, channelId, file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${projectId}/${channelId}/${fileName}`;

    // 1. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return;
    }

    // 2. Determine type
    let type: StorageFile['type'] = 'file';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('audio/')) type = 'audio';
    else if (file.type.startsWith('video/')) type = 'video';

    // 3. Save metadata to DB
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = parseFloat(sizeInMB) >= 0.1 ? `${sizeInMB} MB` : `${(file.size / 1024).toFixed(0)} KB`;

    const { data, error: dbError } = await supabase.from('storage_files').insert({ 
      project_id: projectId, 
      channel_id: channelId,
      name: file.name, 
      type, 
      size: sizeStr, 
      storage_path: filePath,
      uploaded_by: get().currentUser?.id 
    }).select().single();

    if (dbError) {
      console.error('DB error:', dbError);
      return;
    }

    // 4. Update UI
    const publicUrl = supabase.storage.from('project-files').getPublicUrl(filePath).data.publicUrl;
    const newFile: StorageFile = {
      id: data.id,
      projectId: data.project_id,
      channelId: data.channel_id,
      name: data.name,
      type: data.type as StorageFile['type'],
      size: data.size,
      date: new Date(data.created_at).toLocaleDateString('pt-BR'),
      storagePath: data.storage_path,
      fileUrl: publicUrl
    };

    set(state => ({ storageFiles: [newFile, ...state.storageFiles] }));
    get().logEvent(projectId, 'Upload de Arquivo', `Novo arquivo em #${get().channels.find(c => c.id === channelId)?.name}: ${file.name}`);
  },

  downloadFile: async (fileId) => {
    const file = get().storageFiles.find(f => f.id === fileId);
    if (!file || !file.storagePath) return;

    const { data, error } = await supabase.storage
      .from('project-files')
      .download(file.storagePath);

    if (error) {
      console.error('Download error:', error);
      return;
    }

    // Trigger browser download
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    get().logEvent(file.projectId, 'Download efetuado', `Arquivo baixado: ${file.name}`);
  },

  deleteFile: async (fileId) => {
    const file = get().storageFiles.find(f => f.id === fileId);
    if (!file || !file.storagePath) return;

    // 1. Delete from Storage
    await supabase.storage.from('project-files').remove([file.storagePath]);

    // 2. Delete from DB
    await supabase.from('storage_files').delete().eq('id', fileId);

    // 3. Update UI
    set(state => ({ storageFiles: state.storageFiles.filter(f => f.id !== fileId) }));
    get().logEvent(file.projectId, 'Arquivo removido', `Arquivo deletado: ${file.name}`);
  },

  setProfileSettings: (show, tab) => {
    set({ showProfileSettings: show, activeProfileTab: tab || 'profile' });
  },

  setUserAlias: (userId, alias) => {
    const newAliases = { ...get().userAliases, [userId]: alias };
    set({ userAliases: newAliases });
    localStorage.setItem('zs_user_aliases', JSON.stringify(newAliases));
  },

  createRole: (projectId, name, color, permissions) => {
    const projects = get().projects;
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return;

    const newRole: Role = {
      id: Math.random().toString(36).substring(7),
      name,
      color,
      permissions,
      position: (projects[projectIndex].roles?.length || 0) + 1
    };

    const newProjects = [...projects];
    newProjects[projectIndex] = {
      ...newProjects[projectIndex],
      roles: [...(newProjects[projectIndex].roles || []), newRole]
    };

    set({ projects: newProjects });
  },

  updateRole: (projectId, roleId, updates) => {
    const projects = get().projects;
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return;

    const newProject = { ...projects[projectIndex] };
    newProject.roles = newProject.roles?.map(r => r.id === roleId ? { ...r, ...updates } : r);

    const newProjects = [...projects];
    newProjects[projectIndex] = newProject;
    set({ projects: newProjects });
  },

  deleteRole: (projectId, roleId) => {
    const projects = get().projects;
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return;

    const newProject = { ...projects[projectIndex] };
    newProject.roles = newProject.roles?.filter(r => r.id !== roleId);
    
    // Also remove from member assignments
    if (newProject.memberRoles) {
      const newMemberRoles = { ...newProject.memberRoles };
      Object.keys(newMemberRoles).forEach(uid => {
        newMemberRoles[uid] = newMemberRoles[uid].filter(id => id !== roleId);
      });
      newProject.memberRoles = newMemberRoles;
    }

    const newProjects = [...projects];
    newProjects[projectIndex] = newProject;
    set({ projects: newProjects });
  },

  assignRole: (projectId, userId, roleId) => {
    const projects = get().projects;
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return;

    const newProject = { ...projects[projectIndex] };
    const memberRoles = { ...(newProject.memberRoles || {}) };
    const userRoles = [...(memberRoles[userId] || [])];
    if (!userRoles.includes(roleId)) {
      userRoles.push(roleId);
    }
    memberRoles[userId] = userRoles;
    newProject.memberRoles = memberRoles;

    const newProjects = [...projects];
    newProjects[projectIndex] = newProject;
    set({ projects: newProjects });
  },

  removeRole: (projectId, userId, roleId) => {
    const projects = get().projects;
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return;

    const newProject = { ...projects[projectIndex] };
    if (newProject.memberRoles?.[userId]) {
      const newMemberRoles = { ...newProject.memberRoles };
      newMemberRoles[userId] = newMemberRoles[userId].filter(id => id !== roleId);
      newProject.memberRoles = newMemberRoles;
    }

    const newProjects = [...projects];
    newProjects[projectIndex] = newProject;
    set({ projects: newProjects });
  },

  hasPermission: (projectId, userId, permission) => {
    // Global Creator bypass: has all permissions everywhere
    if (get().isCreator()) return true;

    const project = get().projects.find(p => p.id === projectId);
    if (!project) return false;

    // Project Owner bypass: has all permissions in their own project
    if (project.ownerId === userId) return true;

    const userRoleIds = project.memberRoles?.[userId] || [];
    const roles = project.roles || [];
    
    return roles.some(r => 
      userRoleIds.includes(r.id) && 
      (r.permissions.includes(permission) || r.permissions.includes('ADMIN'))
    );
  },

  updateProfile: async (data: Partial<User>) => {
    const userId = get().currentUser?.id;
    if (!userId) return;

    const updateData: any = {};
    if (data.name !== undefined) updateData.username = data.name;
    if (data.avatarStr !== undefined) updateData.avatar_str = data.avatarStr;
    if (data.decorationId !== undefined) updateData.decoration_id = data.decorationId;
    if (data.bannerColor !== undefined) updateData.banner_color = data.bannerColor;
    if (data.bannerUrl !== undefined) updateData.banner_url = data.bannerUrl;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.entrySoundId !== undefined) updateData.entry_sound_id = data.entrySoundId;
    if (data.exitSoundId !== undefined) updateData.exit_sound_id = data.exitSoundId;
    if (data.xp !== undefined) updateData.xp = data.xp;
    
    const { error } = await supabase.from('profiles').update(updateData).eq('id', userId);
    
    if (!error) {
      set(state => {
        const nextUser = state.currentUser ? { ...state.currentUser, ...data } : null;
        
        // Sync members list so UI reflects changes immediately everywhere
        const nextMembers = state.members.map(m => {
          if (m.id === userId) {
            const updatedMember: Member = {
              ...m,
              name: data.name !== undefined ? data.name : m.name,
              avatarStr: data.avatarStr !== undefined ? data.avatarStr : m.avatarStr,
              avatarPhoto: data.bannerUrl !== undefined ? data.bannerUrl : m.avatarPhoto,
              status: data.status !== undefined ? data.status : m.status,
              decorationId: data.decorationId !== undefined ? data.decorationId : m.decorationId,
              isOnline: m.isOnline,
              isCurrentUser: m.isCurrentUser,
              level: data.xp !== undefined ? Math.min(360, Math.floor(data.xp / 1000) + 1) : m.level
            };
            return updatedMember;
          }
          return m;
        });

        return { currentUser: nextUser, members: nextMembers };
      });
    } else {
      console.error('Profile update failed:', error);
    }
  },

  addFriend: async (friendId) => {
    const userId = get().currentUser?.id;
    if (!userId) return;
    const currentFriends = get().currentUser?.friends || [];
    if (currentFriends.includes(friendId)) return;
    const newFriends = [...currentFriends, friendId];
    const { error } = await supabase.from('profiles').update({ friends: newFriends }).eq('id', userId);
    if (!error) set(state => ({ currentUser: state.currentUser ? { ...state.currentUser, friends: newFriends } : null }));
  },

  setAppTheme: (theme) => set({ appTheme: theme }),

  setGlobalDesign: (design) => {
    localStorage.setItem('zs_global_design', design.toString());
    set({ globalDesign: design });
  },

  loadVoiceParticipants: async () => {
    const { data, error } = await supabase.from('voice_participants').select('*, profiles(username, avatar_str, banner_url, featured_achievements)');
    if (error) return;
    if (data) {
      const participants: VoiceParticipant[] = data.map(p => ({
        id: p.user_id,
        name: (p.profiles as any)?.username || 'Anon',
        avatarStr: (p.profiles as any)?.avatar_str || '??',
        avatarPhoto: (p.profiles as any)?.banner_url,
        isMuted: p.is_muted,
        isLocal: p.user_id === get().currentUser?.id,
        featuredAchievements: (p.profiles as any)?.featured_achievements || [],
        channelId: p.channel_id
      }));
      const speaking = new Set<string>(data.filter(p => p.is_speaking).map(p => p.user_id));
      set({ voiceParticipants: participants, voiceSpeaking: speaking });
    }
  },

  subscribeToVoiceParticipants: () => {
    const prev = get()._voiceSubscription;
    if (prev) {
      prev.unsubscribe();
      supabase.removeChannel(prev);
    }

    const channel = supabase.channel('global-voice-sync');
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'voice_participants' }, () => {
      get().loadVoiceParticipants();
    }).subscribe((status) => {
      if (status === 'SUBSCRIBED') set({ _voiceSubscription: channel });
    });

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
      set({ _voiceSubscription: null });
    };
  },

  joinVoice: async (channelId) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    // Entrance sound logic
    const entrySounds: Record<string, string> = {
      'tech': 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
      'cyber': 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      'digital': 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      'default': 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'
    };
    const soundUrl = entrySounds[currentUser.entrySoundId || 'default'];
    new Audio(soundUrl).play().catch(() => {});

    const channel = get().channels.find(c => c.id === channelId);
    
    // Sync with Supabase
    await supabase.from('voice_participants').upsert({
      user_id: currentUser.id,
      channel_id: channelId,
      is_muted: false,
      is_speaking: false
    });

    const activeProject = get().activeProjectId;
    if (activeProject) get().logEvent(activeProject, 'Chamada: Entrada', `Entrou no canal de voz: ${channel?.name || 'Voz'}`);
    
    // XP reward for joining voice (+50 XP)
    get().addXP(currentUser.id, 50);

    set({ voiceStartTime: Date.now(), activeVoiceChannelId: channelId });
    get().loadVoiceParticipants();
  },

  leaveVoice: async () => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    // Exit sound logic
    const exitSounds: Record<string, string> = {
      'shutdown': 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      'data': 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      'fade': 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
      'default': 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'
    };
    const soundUrl = exitSounds[currentUser.exitSoundId || 'default'];
    new Audio(soundUrl).play().catch(() => {});
    get().incrementStat('audioCount');

    // Sync with Supabase
    await supabase.from('voice_participants').delete().eq('user_id', currentUser.id);

    const startTime = get().voiceStartTime;
    const activeProject = get().activeProjectId;
    if (startTime && activeProject) {
      const dur = Math.round((Date.now() - startTime) / 1000);
      const mins = Math.floor(dur / 60);
      const secs = dur % 60;
      get().logEvent(activeProject, 'Chamada: Saída', `Saiu da chamada. Duração: ${mins}m ${secs}s`);
    }

    set(state => ({ 
      voiceSpeaking: new Set([...state.voiceSpeaking].filter(id => id !== currentUser.id)), 
      voiceStartTime: null,
      activeVoiceChannelId: null
    }));
    get().loadVoiceParticipants();
  },

  setSpeaking: async (userId, isSpeaking) => {
    const currentUser = get().currentUser;
    if (currentUser && userId === currentUser.id) {
       await supabase.from('voice_participants').update({ is_speaking: isSpeaking }).eq('user_id', userId);
    }
    
    set(state => {
      const next = new Set(state.voiceSpeaking);
      if (isSpeaking) next.add(userId); else next.delete(userId);
      return { voiceSpeaking: next };
    });
  },

  toggleMuteSelf: async () => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const me = get().voiceParticipants.find(p => p.id === currentUser.id);
    const newMuted = !me?.isMuted;

    await supabase.from('voice_participants').update({ is_muted: newMuted, is_speaking: false }).eq('user_id', currentUser.id);

    set(state => ({
      voiceParticipants: state.voiceParticipants.map(p => p.id === currentUser.id ? { ...p, isMuted: newMuted } : p),
      voiceSpeaking: newMuted ? new Set([...state.voiceSpeaking].filter(id => id !== currentUser.id)) : state.voiceSpeaking
    }));
  },

  loadNotes: async (projectId) => {
    const { data } = await supabase.from('notes').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
    if (data) set({ notes: data.map(n => ({ id: n.id, projectId: n.project_id, content: n.content, color: n.color })) });
  },
  addNote: async (projectId, content, color) => {
    const { data, error } = await supabase.from('notes').insert({ project_id: projectId, content, color }).select().single();
    if (!error && data) {
      set(state => ({ notes: [{ id: (data as any).id, projectId, content, color }, ...state.notes] }));
      get().logEvent(projectId, 'Nota Criada', 'Uma nova nota neon foi pendurada.');
    }
  },
  updateNote: async (id, content) => {
    await supabase.from('notes').update({ content }).eq('id', id);
    set(state => ({ notes: state.notes.map(n => n.id === id ? { ...n, content } : n) }));
  },
  deleteNote: async (id) => {
    const note = get().notes.find(n => n.id === id);
    await supabase.from('notes').delete().eq('id', id);
    set(state => ({ notes: state.notes.filter(n => n.id !== id) }));
    if (note) get().logEvent(note.projectId, 'Nota Removida', 'Uma nota foi retirada do quadro.');
  },

  loadTasks: async (projectId) => {
    const { data } = await supabase.from('tasks').select('*').eq('project_id', projectId).order('position', { ascending: true });
    if (data) set({ tasks: data.map(t => ({ id: t.id, projectId: t.project_id, title: t.title, color: t.color, completed: t.completed, alarmTime: t.alarm_time as string })) });
  },
  addTask: async (projectId, t) => {
    const { data, error } = await supabase.from('tasks').insert({ project_id: projectId, title: t.title, color: t.color, alarm_time: t.alarmTime, position: get().tasks.length }).select().single();
    if (!error && data) {
      set(state => ({ tasks: [...state.tasks, { id: (data as any).id, projectId, title: (data as any).title, color: (data as any).color, completed: (data as any).completed, alarmTime: (data as any).alarm_time as string }] }));
      get().logEvent(projectId, 'Objetivo Adicionado', `Meta: ${t.title}`);
    }
  },
  toggleTask: async (id) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return;
    const { error } = await supabase.from('tasks').update({ completed: !task.completed }).eq('id', id);
    if (!error) {
      set(state => ({ tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t) }));
      get().logEvent(task.projectId, 'Status de Objetivo', `Meta "${task.title}" marcada como ${!task.completed ? 'concluída' : 'pendente'}.`);
    }
  },
  deleteTask: async (id) => {
    await supabase.from('tasks').delete().eq('id', id);
    set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
  },
  uncheckAllTasks: async (projectId) => {
    const { error } = await supabase.from('tasks').update({ completed: false }).eq('project_id', projectId);
    if (!error) {
      set(state => ({ tasks: state.tasks.map(t => t.projectId === projectId ? { ...t, completed: false } : t) }));
      get().logEvent(projectId, 'Reset de Objetivos', 'Todos os objetivos foram marcados como pendentes.');
    }
  },
  moveTask: (id, delta) => {
    const projectTasks = get().tasks.filter(t => t.projectId === get().activeProjectId);
    const otherTasks = get().tasks.filter(t => t.projectId !== get().activeProjectId);
    const idx = projectTasks.findIndex(t => t.id === id);
    if (idx === -1) return;
    const newIdx = idx + delta;
    if (newIdx < 0 || newIdx >= projectTasks.length) return;
    const updated = [...projectTasks];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    set({ tasks: [...updated, ...otherTasks] });
  },

  setShowServerLogs: (val) => set({ showServerLogs: val }),
  loadServerLogs: async (projectId) => {
    const { data } = await supabase.from('server_logs').select('*').eq('project_id', projectId).order('timestamp', { ascending: false }).limit(200);
    if (data) {
      const { data: profiles } = await supabase.from('profiles').select('id, username');
      const profileMap = new Map(profiles?.map(p => [p.id, p.username]) || []);
      set({ serverLogs: data.map(l => ({
        id: l.id, projectId: l.project_id, userId: l.user_id,
        userName: profileMap.get(l.user_id) || 'Sistema',
        action: l.action, details: l.details, timestamp: l.timestamp
      })) });
    }
  },
  logEvent: async (projectId, action, details) => {
    const user = get().currentUser;
    const { data, error } = await supabase.from('server_logs').insert({ project_id: projectId, user_id: user?.id, action, details }).select().single();
    if (!error && data) {
      const newLog: ServerLog = { 
        id: (data as any).id, 
        projectId, 
        userId: user?.id || 'system', 
        userName: user?.name || 'Sistema', 
        action, 
        details: (details as any) || 'Sem detalhes', 
        timestamp: (data as any).timestamp 
      };
      set(state => ({ serverLogs: [newLog, ...state.serverLogs].slice(0, 1000) }));
    }
  },
  setUserStatus: async (status) => {
    const user = get().currentUser;
    if (!user) return;
    
    // 1. Update DB (async)
    supabase.from('profiles').update({ status }).eq('id', user.id).then();
    
    // 2. Local Optimistic Update
    set(state => ({ 
      currentUser: { ...user, status },
      members: state.members.map(m => m.id === user.id ? { ...m, status } : m)
    }));
  },

  emails: [],
  loadEmails: async () => {
    const user = get().currentUser;
    if (!user) return;
    const { data } = await supabase
      .from('emails')
      .select('*, from:profiles!from_id(username, avatar_str)')
      .eq('to_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) {
      set({ emails: data.map(e => ({
        id: e.id, fromId: e.from_id, toId: e.to_id, 
        fromName: e.from?.username || 'Sistema', 
        fromAvatar: e.from?.avatar_str || 'A',
        subject: e.subject, body: e.body, isRead: e.is_read, createdAt: e.created_at
      })) });
    }
  },
  sendEmail: async (toId, subject, body) => {
    const user = get().currentUser;
    if (!user) return { error: 'Not logged in' };
    const { error } = await supabase.from('emails').insert({ from_id: user.id, to_id: toId, subject, body });
    if (!error) {
      await get().incrementStat('inboxCount');
      // XP reward for recipient (+20 XP)
      await get().addXP(toId, 20);
    }
    return { error };
  },
  deleteEmail: async (id) => {
    const { error } = await supabase.from('emails').delete().eq('id', id);
    if (!error) set(state => ({ emails: state.emails.filter(e => e.id !== id) }));
  },
  markEmailAsRead: async (id) => {
    const { error } = await supabase.from('emails').update({ is_read: true }).eq('id', id);
    if (!error) set(state => ({ emails: state.emails.map(e => e.id === id ? { ...e, isRead: true } : e) }));
  },
  subscribeToEmails: () => {
    const user = get().currentUser;
    if (!user) return () => {};
    const channel = supabase.channel('emails_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emails', filter: `to_id=eq.${user.id}` }, 
      () => { get().loadEmails(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  dms: [],
  loadDMs: async (otherId) => {
    const user = get().currentUser;
    if (!user) return;
    const { data } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(from_id.eq.${user.id},to_id.eq.${otherId}),and(from_id.eq.${otherId},to_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    
    if (data) {
      set({ dms: data.map(d => ({
        id: d.id, fromId: d.from_id, toId: d.to_id,
        text: d.text, imageUrl: d.image_url, isRead: d.is_read, createdAt: d.created_at, metadata: d.metadata
      })) });
    }
  },
  sendDM: async (toId, text, imageUrl) => {
    const user = get().currentUser;
    if (!user) return { error: 'Not logged in' };
    const { error } = await supabase.from('direct_messages').insert({ from_id: user.id, to_id: toId, text, image_url: imageUrl });
    if (!error) await get().incrementStat('inboxCount');
    return { error };
  },
  markDMAsRead: async (otherId) => {
    const user = get().currentUser;
    if (!user) return;
    await supabase.from('direct_messages').update({ is_read: true }).match({ from_id: otherId, to_id: user.id });
  },
  subscribeToDMs: () => {
    const user = get().currentUser;
    if (!user) return () => {};
    const channel = supabase.channel('dms_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `to_id=eq.${user.id}` }, 
      () => { 
        // We could load all DMs or just the active one, 
        // but for simplicity we'll just reload if a conversation is active
        // This is generic, UI will call loadDMs for specific user if needed
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  contacts: [],
  loadContacts: async () => {
    const user = get().currentUser;
    if (!user) return;
    const { data } = await supabase
      .from('contacts')
      .select('*, contact:profiles!contact_id(*)')
      .eq('user_id', user.id);
    
    if (data) {
      set({ contacts: data.map(c => ({
        id: c.id,
        contactId: c.contact_id,
        name: c.contact.username,
        avatarStr: c.contact.avatar_str,
        avatarColor: c.contact.avatar_color,
        avatarPhoto: c.contact.banner_url,
        status: c.contact.status
      })) });
    }
  },
  addContact: async (contactId) => {
    const user = get().currentUser;
    if (!user) return;
    const { error } = await supabase.from('contacts').insert({ user_id: user.id, contact_id: contactId });
    if (!error) get().loadContacts();
  },
  removeContact: async (id) => {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (!error) set(state => ({ contacts: state.contacts.filter(c => c.id !== id) }));
  },
  searchUsers: async (query) => {
    const user = get().currentUser;
    if (!user) return [];
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${query}%`)
      .neq('id', user.id)
      .limit(10);
    
    return data?.map(u => ({
      id: '', contactId: u.id, name: u.username, avatarStr: u.avatar_str, avatarColor: u.avatar_color, avatarPhoto: u.banner_url, status: u.status
    })) || [];
  },
  setSecurityCritical: (val) => set({ isSecurityCritical: val }),

  incrementStat: async (key) => {
    const user = get().currentUser;
    if (!user || !user.stats) return;

    const newStats = { ...user.stats, [key]: (user.stats[key] || 0) + 1 };
    
    // Check achievements
    const news: string[] = [];
    const ach = user.achievements || [];
    
    if (newStats.chatCount >= 1 && !ach.includes('chat_1')) news.push('chat_1');
    if (newStats.chatCount >= 33 && !ach.includes('chat_33')) news.push('chat_33');
    if (newStats.audioCount >= 1 && !ach.includes('audio_1')) news.push('audio_1');
    if (newStats.audioCount >= 33 && !ach.includes('audio_33')) news.push('audio_33');
    if (newStats.videoCount >= 1 && !ach.includes('video_1')) news.push('video_1');
    if (newStats.videoCount >= 33 && !ach.includes('video_33')) news.push('video_33');
    if (newStats.meetingCount >= 1 && !ach.includes('meeting_1')) news.push('meeting_1');
    if (newStats.meetingCount >= 33 && !ach.includes('meeting_33')) news.push('meeting_33');
    if (newStats.inboxCount >= 1 && !ach.includes('inbox_1')) news.push('inbox_1');
    if (newStats.inboxCount >= 33 && !ach.includes('inbox_33')) news.push('inbox_33');

    const updateData: any = { stats: newStats };
    if (news.length > 0) {
      updateData.achievements = [...ach, ...news];
      set({ unlockedAchievement: news[0] });
    }

    const { error } = await supabase.from('profiles').update(updateData).eq('id', user.id);
    if (!error) {
      set({ currentUser: { ...user, stats: newStats, achievements: updateData.achievements || ach } });
    }
  },

  unlockAchievements: async (ids) => {
    const user = get().currentUser;
    if (!user) return;
    const current = user.achievements || [];
    const news = ids.filter(id => !current.includes(id));
    if (news.length === 0) return;

    const next = [...current, ...news];
    await supabase.from('profiles').update({ achievements: next }).eq('id', user.id);
    set({ 
      currentUser: { ...user, achievements: next },
      unlockedAchievement: news[0] 
    });
  },

  toggleFeaturedAchievement: async (id) => {
    const user = get().currentUser;
    if (!user) return;
    
    const current = user.featuredAchievements || [];
    let next: string[];
    
    if (current.includes(id)) {
      next = current.filter(x => x !== id);
    } else {
      // Limit to 4 featured medals
      next = [...current, id].slice(-4);
    }
    
    await supabase.from('profiles').update({ featured_achievements: next }).eq('id', user.id);
    set({ currentUser: { ...user, featuredAchievements: next } });
  },

  toggleReaction: async (messageId, emoji) => {
    const userId = get().currentUser?.id;
    if (!userId) return;

    const message = get().messages.find(m => m.id === messageId);
    if (!message) return;

    const reactions = { ...(message.reactions || {}) };
    if (!reactions[emoji]) reactions[emoji] = [];

    if (reactions[emoji].includes(userId)) {
      reactions[emoji] = reactions[emoji].filter(id => id !== userId);
      if (reactions[emoji].length === 0) delete reactions[emoji];
    } else {
      reactions[emoji].push(userId);
    }

    const { error } = await supabase.from('messages').update({ reactions }).eq('id', messageId);
    if (!error) {
      set(state => ({
        messages: state.messages.map(m => m.id === messageId ? { ...m, reactions } : m)
      }));
    }
  },

  notifications: [],
  loadNotifications: async () => {
    const user = get().currentUser;
    if (!user) return;
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) {
      set({ 
        notifications: data.map(n => ({
          id: n.id, userId: n.user_id, type: n.type, title: n.title, content: n.content, link: n.link, isRead: n.is_read, createdAt: n.created_at
        }))
      });
    }
  },
  markNotificationAsRead: async (id) => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (!error) set(state => ({ notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n) }));
  },
  sendNotification: async (userId, type, title, content, link) => {
    await supabase.from('notifications').insert({ user_id: userId, type, title, content, link });
  },
  subscribeToNotifications: () => {
    const user = get().currentUser;
    if (!user) return () => {};
    const channel = supabase.channel(`notifications:${user.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
      const n = payload.new;
      const newN: Notification = { 
        id: n.id, 
        userId: n.user_id, 
        type: n.type as any, 
        title: n.title, 
        content: n.content, 
        link: n.link, 
        isRead: n.is_read, 
        createdAt: n.created_at 
      };
      set(state => ({ notifications: [newN, ...state.notifications] }));
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  globalEvents: [],
  loadGlobalEvents: async () => {
    const { data } = await supabase.from('global_events').select('*').order('event_date', { ascending: true });
    if (data) {
      set({ globalEvents: data.map(e => ({
        id: e.id, title: e.title, description: e.description, eventDate: e.event_date,
        startTime: e.start_time, location: e.location, bannerType: e.banner_type,
        createdBy: e.created_by, projectId: e.project_id, createdAt: e.created_at
      }))});
    }
  },
  addGlobalEvent: async (event) => {
    const { error } = await supabase.from('global_events').insert({
      title: event.title,
      description: event.description,
      event_date: event.eventDate,
      start_time: event.startTime,
      location: event.location,
      banner_type: event.bannerType,
      created_by: event.createdBy,
      project_id: event.projectId
    });
    if (!error) get().loadGlobalEvents();
  },
  deleteGlobalEvent: async (id) => {
    const { error } = await supabase.from('global_events').delete().eq('id', id);
    if (!error) get().loadGlobalEvents();
  },

  eventRSVPs: {},
  loadRSVPs: async () => {
    const { data } = await supabase.from('event_rsvps').select('*');
    if (data) {
      const rsvps: Record<string, string[]> = {};
      data.forEach(r => {
        if (!rsvps[r.event_id]) rsvps[r.event_id] = [];
        rsvps[r.event_id].push(r.user_id);
      });
      set({ eventRSVPs: rsvps });
    }
  },
  toggleRSVP: async (eventId) => {
    const userId = get().currentUser?.id;
    if (!userId) return;

    const current = get().eventRSVPs[eventId] || [];
    const isConfirmed = current.includes(userId);

    if (isConfirmed) {
      await supabase.from('event_rsvps').delete().eq('event_id', eventId).eq('user_id', userId);
    } else {
      await supabase.from('event_rsvps').insert({ event_id: eventId, user_id: userId });
    }
    get().loadRSVPs();
  },

  showEventCreateModal: false,
  setShowEventCreateModal: (val) => set({ showEventCreateModal: val }),

  isCreator: () => {
    const user = get().currentUser;
    return user?.email === CREATOR_EMAIL;
  },

  canManageSincronicidade: (projectId) => {
    if (get().isCreator()) return true;
    const project = get().projects.find(p => p.id === projectId);
    const userId = get().currentUser?.id;
    if (!userId || !project) return false;
    
    // Check if user is project owner OR has MANAGE_EVENTS permission
    return project.ownerId === userId || get().hasPermission(projectId, userId, 'MANAGE_EVENTS');
  },

  addXP: async (userId, amount) => {
    if (userId === BOT_GUST_ID || userId === BOT_ZERO_ID) return;
    
    try {
      // 1. Fetch current XP from DB (safest way to ensure consistency)
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('xp')
        .eq('id', userId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const currentXP = profile?.xp || 0;
      const newXP = currentXP + amount;
      
      // 2. Update DB
      const newLevel = Math.floor(newXP / 1000) + 1;
      const finalLevel = newLevel > 360 ? 360 : newLevel;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          xp: newXP,
          level: finalLevel
        })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      // 3. Update local state
      if (get().currentUser?.id === userId) {
        set(state => ({
          currentUser: state.currentUser ? { 
            ...state.currentUser, 
            xp: newXP,
            level: finalLevel
          } : null
        }));
      }

      // Update member list so UI reflects everywhere
      set(state => ({
        members: state.members.map(m => m.id === userId ? {
          ...m,
          xp: newXP,
          level: finalLevel
        } : m)
      }));

    } catch (e) {
      console.error('[XP System] Error adding XP:', e);
    }
  },

  subscribeToProfiles: () => {
    supabase.channel('global_profiles_realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        const updated = payload.new as any;
        const currentUserId = get().currentUser?.id;

        // 1. Update Current User if needed
        if (updated.id === currentUserId) {
          set(state => ({
            currentUser: state.currentUser ? {
              ...state.currentUser,
              name: updated.username || state.currentUser.name,
              avatarStr: updated.avatar_str || state.currentUser.avatarStr,
              status: updated.status || state.currentUser.status,
              decorationId: updated.decoration_id || state.currentUser.decorationId,
              bannerColor: updated.banner_color || state.currentUser.bannerColor,
              xp: updated.xp !== undefined ? updated.xp : state.currentUser.xp,
              level: updated.level !== undefined ? updated.level : state.currentUser.level
            } : null
          }));
        }

        // 2. Update Member List in real-time
        set(state => ({
          members: state.members.map(m => m.id === updated.id ? {
            ...m,
            name: updated.username || m.name,
            avatarStr: updated.avatar_str || m.avatarStr,
            status: (updated.id === BOT_ZERO_ID) ? 'Discreto' : (updated.id === BOT_GUST_ID ? 'Focado' : (updated.status || m.status)),
            xp: updated.xp !== undefined ? updated.xp : m.xp,
            level: updated.level !== undefined ? updated.level : m.level,
            decorationId: updated.decoration_id || m.decorationId
          } : m)
        }));
      })
      .subscribe();
  }
}));
