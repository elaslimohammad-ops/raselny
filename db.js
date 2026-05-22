// Initialize Supabase client
const supabaseUrl = 'https://fbxpjvfbahnrzgqtaubm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZieHBqdmZiYWhucnpncXRhdWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NDI0MzYsImV4cCI6MjA5NTAxODQzNn0.Vz_f-YKAMSKOBt9Mv3orc5JiCEdeWyfvU331p3Q9ELU';

try {
  if (typeof supabase === 'undefined' || !supabase.createClient) {
    throw new Error('Supabase library not loaded');
  }
  window.supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);
} catch (e) {
  console.error('Supabase init failed:', e);
  window.supabase = null;
}

// Auth functions
window.signUp = async function(username, password, name) {
  if (!window.supabase) throw new Error('تعذر الاتصال بقاعدة البيانات');
  const email = username.toLowerCase().replace(/[^a-z0-9]/g, '') + '@raselny.app';
  const { data, error } = await window.supabase.auth.signUp({
    email,
    password,
    options: { data: { name, username } }
  });
  
  if (error) throw error;
  
  return data;
};

window.signIn = async function(username, password) {
  if (!window.supabase) throw new Error('تعذر الاتصال بقاعدة البيانات');
  const email = username.toLowerCase().replace(/[^a-z0-9]/g, '') + '@raselny.app';
  const { data, error } = await window.supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

window.signOut = async function() {
  if (!window.supabase) return;
  const { error } = await window.supabase.auth.signOut();
  if (error) throw error;
};

window.getUserProfile = async function(userId) {
  if (!window.supabase) throw new Error('تعذر الاتصال بقاعدة البيانات');
  const { data, error } = await window.supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
};

window.ensureProfile = async function(userId, email, name, username) {
  if (!window.supabase) return;
  const { error } = await window.supabase.from('users').upsert(
    { id: userId, email, name, username, created_at: new Date().toISOString() },
    { onConflict: 'id', ignoreDuplicates: true }
  );
  if (error) console.error('Profile ensure failed:', error);
};

window.getUserChats = async function(userId) {
  if (!window.supabase) throw new Error('تعذر الاتصال بقاعدة البيانات');
  const { data, error } = await window.supabase
    .from('chats')
    .select(`
      *,
      user1:user1_id(id, name, email, username),
      user2:user2_id(id, name, email, username)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
};

window.getOrCreateChat = async function(userId, otherUserId) {
  if (!window.supabase) throw new Error('تعذر الاتصال بقاعدة البيانات');
  const { data: existingChat, error } = await window.supabase
    .from('chats')
    .select('*')
    .or(`and(user1_id.eq.${userId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${userId})`)
    .maybeSingle();
    
  if (error) throw error;
  
  if (existingChat) return existingChat;
  
  const { data: newChat, error: insertError } = await window.supabase
    .from('chats')
    .insert([
      { user1_id: userId, user2_id: otherUserId, created_at: new Date().toISOString() }
    ])
    .select()
    .single();
    
  if (insertError) throw insertError;
  return newChat;
};

window.getMessages = async function(chatId, limit = 50) {
  if (!window.supabase) throw new Error('تعذر الاتصال بقاعدة البيانات');
  const { data, error } = await window.supabase
    .from('messages')
    .select(`
      *,
      user:user_id(id, name, username)
    `)
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })
    .limit(limit);
    
  if (error) throw error;
  return data || [];
};

window.sendMessage = async function(chatId, userId, content, type = 'text', isTemporary = false, expiresAt = null) {
  if (!window.supabase) throw new Error('تعذر الاتصال بقاعدة البيانات');
  const { data, error } = await window.supabase
    .from('messages')
    .insert([
      { 
        chat_id: chatId, 
        user_id: userId, 
        content, 
        type, 
        is_temporary: isTemporary,
        expires_at: expiresAt,
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

window.searchUsers = async function(query) {
  if (!window.supabase) throw new Error('تعذر الاتصال بقاعدة البيانات');
  const { data, error } = await window.supabase
    .from('users')
    .select('id, name, email, username')
    .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
    .limit(20);
    
  if (error) throw error;
  return data || [];
};

window.getAllUsers = async function() {
  if (!window.supabase) throw new Error('تعذر الاتصال بقاعدة البيانات');
  const { data, error } = await window.supabase
    .from('users')
    .select('id, name, email, username')
    .limit(100);
    
  if (error) throw error;
  return data || [];
};

// Real-time subscriptions
window.subscribeToMessages = function(chatId, callback) {
  if (!window.supabase) return null;
  const channel = window.supabase
    .channel(`chat-${chatId}`)
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` }, 
      payload => {
        callback(payload.new);
      }
    )
    .subscribe();
    
  return channel;
};

window.subscribeToUserChats = function(userId, callback) {
  if (!window.supabase) return null;
  const channel = window.supabase
    .channel(`user-chats-${userId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'chats', filter: `or(user1_id.eq.${userId},user2_id.eq.${userId})` }, 
      payload => {
        callback(payload);
      }
    )
    .subscribe();
    
  return channel;
};

// Encryption utilities for temporary messages
window.generateEncryptionKey = async function() {
  return await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

window.exportKey = async function(key) {
  return await crypto.subtle.exportKey('raw', key);
};

window.importKey = async function(rawKey) {
  return await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

window.encryptText = async function(key, text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);
  
  return btoa(String.fromCharCode(...new Uint8Array(combined)));
};

window.decryptText = async function(key, encryptedBase64) {
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const encryptedData = combined.slice(12);
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedData
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
};