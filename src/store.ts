import { create } from 'zustand';
import { supabase } from './lib/supabase';

export interface User {
  id: string;
  name: string;
  avatarStr: string;
  email?: string;
}

export interface Project {
  id: string;
  name: string;
  iconStr: string;
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
  userId: string;
  username: string;
  avatarStr: string;
  timestamp: string;
}

export interface StorageFile {
  id: string;
  projectId: string;
  name: string;
  type: 'folder' | 'file' | 'image';
  date: string;
  size: string;
}

interface AppState {
  // Auth
  currentUser: User | null;
  initialized: boolean;
  checkAuth: () => Promise<void>;
  login: (email: string, pass: string) => Promise<{ error: any }>;
  signUp: (email: string, pass: string, username: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;

  // Projects
  projects: Project[];
  activeProjectId: string | null;
  loadProjects: () => Promise<void>;
  createProject: (name: string) => Promise<void>;
  setActiveProject: (id: string) => void;

  // Channels
  channels: Channel[];
  activeChannelId: string | null;
  loadChannels: (projectId: string) => Promise<void>;
  createChannel: (projectId: string, name: string, type: Channel['type']) => Promise<void>;
  setActiveChannel: (id: string) => void;

  // Messages
  messages: Message[];
  loadMessages: (channelId: string) => Promise<void>;
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;

  // Storage
  storageFiles: StorageFile[];
  loadStorageFiles: (projectId: string) => Promise<void>;
  addStorageFile: (file: Omit<StorageFile, 'id'>) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // ==================== AUTH ====================
  currentUser: null,
  initialized: false,

  checkAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      set({ 
        currentUser: { 
          id: session.user.id, 
          name: profile?.username || session.user.email?.split('@')[0] || 'User', 
          avatarStr: profile?.avatar_str || 'US',
          email: session.user.email
        },
        initialized: true 
      });
      await get().loadProjects();
    } else {
      set({ currentUser: null, initialized: true });
    }
  },

  login: async (email, pass) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return { error };

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    set({ 
      currentUser: { 
        id: data.user.id, 
        name: profile?.username || data.user.email?.split('@')[0] || 'User', 
        avatarStr: profile?.avatar_str || 'US',
        email: data.user.email
      } 
    });
    await get().loadProjects();
    return { error: null };
  },

  signUp: async (email, pass, username) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password: pass,
      options: { data: { username } } 
    });
    
    if (error) return { error };

    // Wait a bit for the trigger to finish or just set locally
    set({ 
      currentUser: { 
        id: data.user?.id || '', 
        name: username, 
        avatarStr: username.substring(0, 2).toUpperCase(),
        email: data.user?.email || email
      } 
    });
    await get().loadProjects();
    return { error: null };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ currentUser: null, projects: [], channels: [], messages: [], storageFiles: [] });
  },

  // ==================== PROJECTS ====================
  projects: [],
  activeProjectId: null,

  loadProjects: async () => {
    const { data } = await supabase.from('projects').select('*').order('created_at');
    if (data) {
      set({
        projects: data.map(p => ({ id: p.id, name: p.name, iconStr: p.icon_str })),
        activeProjectId: data.length > 0 ? data[0].id : null
      });
      if (data.length > 0) {
        await get().loadChannels(data[0].id);
      }
    }
  },

  createProject: async (name: string) => {
    const iconStr = name.substring(0, 2).toUpperCase();
    const { data, error } = await supabase
      .from('projects')
      .insert({ name, icon_str: iconStr, owner_id: get().currentUser?.id })
      .select()
      .single();

    if (error) { console.error(error); return; }

    const projectId = data.id;
    await supabase.from('channels').insert([
      { project_id: projectId, name: 'geral', type: 'text' },
      { project_id: projectId, name: 'Lounge', type: 'voice' },
      { project_id: projectId, name: 'Arquivos', type: 'storage' }
    ]);

    set(state => ({
      projects: [...state.projects, { id: projectId, name, iconStr }],
      activeProjectId: projectId
    }));

    await get().loadChannels(projectId);
  },

  setActiveProject: (id: string) => {
    set({ activeProjectId: id, activeChannelId: null, messages: [] });
    if (id) {
      get().loadChannels(id);
      get().loadStorageFiles(id);
    }
  },

  // ==================== CHANNELS ====================
  channels: [],
  activeChannelId: null,

  loadChannels: async (projectId: string) => {
    const { data } = await supabase
      .from('channels')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');

    if (data) {
      const channels = data.map(c => ({
        id: c.id, projectId: c.project_id, name: c.name, type: c.type as Channel['type']
      }));
      const firstText = channels.find(c => c.type === 'text');
      set({ channels, activeChannelId: firstText?.id || channels[0]?.id || null });

      if (firstText) {
        await get().loadMessages(firstText.id);
      }
      await get().loadStorageFiles(projectId);
    }
  },

  createChannel: async (projectId: string, name: string, type: Channel['type']) => {
    const { data, error } = await supabase
      .from('channels')
      .insert({ project_id: projectId, name, type })
      .select()
      .single();

    if (error) { console.error(error); return; }

    set(state => ({
      channels: [...state.channels, { id: data.id, projectId: data.project_id, name: data.name, type: data.type }]
    }));
  },

  setActiveChannel: (id: string) => {
    set({ activeChannelId: id });
    get().loadMessages(id);
  },

  // ==================== MESSAGES ====================
  messages: [],

  loadMessages: async (channelId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles:user_id(username, avatar_str)')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (data) {
      const messages: Message[] = data.map(m => {
        const profile = m.profiles as any;
        return {
          id: m.id,
          channelId: m.channel_id,
          text: m.text,
          userId: m.user_id,
          username: profile?.username || 'Anon',
          avatarStr: profile?.avatar_str || '??',
          timestamp: new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
      });
      set({ messages });
    }

    supabase
      .channel(`chat:${channelId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      }, async (payload) => {
        const { data: userData } = await supabase
          .from('profiles')
          .select('username, avatar_str')
          .eq('id', payload.new.user_id)
          .single();

        const newMsg: Message = {
          id: payload.new.id,
          channelId: payload.new.channel_id,
          text: payload.new.text,
          userId: payload.new.user_id,
          username: userData?.username || 'Anon',
          avatarStr: userData?.avatar_str || '??',
          timestamp: new Date(payload.new.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        set(state => ({
          messages: state.messages.some(m => m.id === newMsg.id) 
            ? state.messages 
            : [...state.messages, newMsg]
        }));
      })
      .subscribe();
  },

  addMessage: async (msg) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({ channel_id: msg.channelId, user_id: msg.userId, text: msg.text })
      .select()
      .single();

    if (error) { console.error(error); return; }

    const newMsg: Message = {
      id: data.id,
      channelId: data.channel_id,
      text: data.text,
      userId: msg.userId,
      username: msg.username,
      avatarStr: msg.avatarStr,
      timestamp: new Date(data.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    set(state => ({ messages: [...state.messages, newMsg] }));
  },

  // ==================== STORAGE ====================
  storageFiles: [],

  loadStorageFiles: async (projectId: string) => {
    const { data } = await supabase
      .from('storage_files')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (data) {
      set({
        storageFiles: data.map(f => ({
          id: f.id, projectId: f.project_id, name: f.name,
          type: f.type as StorageFile['type'], size: f.size,
          date: new Date(f.created_at).toLocaleDateString('pt-BR')
        }))
      });
    }
  },

  addStorageFile: async (file) => {
    const { data, error } = await supabase
      .from('storage_files')
      .insert({
        project_id: file.projectId, name: file.name,
        type: file.type, size: file.size, uploaded_by: get().currentUser?.id
      })
      .select()
      .single();

    if (error) { console.error(error); return; }

    set(state => ({
      storageFiles: [{
        id: data.id, projectId: data.project_id, name: data.name,
        type: data.type, size: data.size,
        date: new Date(data.created_at).toLocaleDateString('pt-BR')
      }, ...state.storageFiles]
    }));
  }
}));
