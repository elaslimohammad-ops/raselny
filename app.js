// ========== State ==========
let currentUser = null;
let currentChatId = null;
let currentChatUser = null;
let messagesSubscription = null;
let chatsSubscription = null;
let chats = [];
let isTemporaryMessage = localStorage.getItem('tempDefault') === 'true';
let deferredPrompt = null;
let currentLang = localStorage.getItem('lang') || 'ar';
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let authInProgress = false;

// ========== Translations ==========
const translations = {
  ar: {
    appTitle: 'raselny - محادثات آمنة',
    loading: 'جارٍ التحقق من الجلسة...',
    sidebarTitle: 'المحادثات',
    newChat: 'محادثة جديدة',
    welcomeTitle: 'ابدأ محادثة جديدة',
    welcomeDesc: 'اختر جهة تواصل من القائمة أو ابدأ محادثة جديدة',
    messageInput: 'اكتب رسالة...',
    loginTitle: 'تسجيل الدخول',
    loginDesc: 'أهلاً بعودتك! سجل دخولك للمتابعة',
    signupTitle: 'إنشاء حساب جديد',
    signupDesc: 'انضم إلى المحادثات الآمنة',
    emailPlaceholder: 'البريد الإلكتروني',
    passwordPlaceholder: 'كلمة المرور',
    namePlaceholder: 'الاسم الكامل',
    loginBtn: 'تسجيل الدخول',
    signupBtn: 'إنشاء حساب',
    noAccount: 'ليس لديك حساب؟',
    haveAccount: 'لديك حساب بالفعل؟',
    createAccount: 'إنشاء حساب جديد',
    searchChat: 'البحث عن محادثة...',
    settings: 'الإعدادات',
    darkMode: 'الوضع الداكن',
    tempDefault: 'الرسائل المؤقتة افتراضيًا',
    language: 'اللغة',
    logout: 'تسجيل الخروج',
    installApp: 'ثبت التطبيق لتجربة أفضل',
    install: 'تثبيت',
    noChats: 'لا توجد محادثات بعد',
    temporary: 'مؤقتة',
    now: 'الآن',
    minutes: 'د',
    hours: 'س',
    days: 'ي',
    fileAttached: 'ملف مرفق',
    imageAttached: 'صورة',
    voiceAttached: 'تسجيل صوتي',
    videoAttached: 'فيديو',
    searchUser: 'ابحث عن مستخدم...',
    searchUserTitle: 'بدء محادثة جديدة',
    searchUserDesc: 'ابحث عن مستخدم لبدء محادثة معه',
    noUsers: 'لا يوجد مستخدمين',
    online: 'متصل',
    featureComing: 'هذه الميزة قيد التطوير',
    errorLogin: 'فشل تسجيل الدخول. تحقق من البريد وكلمة المرور',
    errorSignup: 'فشل إنشاء الحساب. قد يكون البريد مستخدماً بالفعل',
    errorConfirmEmail: 'يجب تأكيد البريد الإلكتروني أولاً. تحقق من بريدك الوارد',
    signupSuccess: 'تم إنشاء الحساب بنجاح!',
    signupSuccessDesc: 'يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب ثم تسجيل الدخول',
    loginNow: 'تسجيل الدخول الآن',
    or: 'أو',
  },
  en: {
    appTitle: 'raselny - Secure Chat',
    loading: 'Checking session...',
    sidebarTitle: 'Chats',
    newChat: 'New Chat',
    welcomeTitle: 'Start a New Chat',
    welcomeDesc: 'Select a contact from the list or start a new conversation',
    messageInput: 'Type a message...',
    loginTitle: 'Login',
    loginDesc: 'Welcome back! Sign in to continue',
    signupTitle: 'Create Account',
    signupDesc: 'Join secure conversations',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    namePlaceholder: 'Full Name',
    loginBtn: 'Login',
    signupBtn: 'Sign Up',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    createAccount: 'Create New Account',
    searchChat: 'Search chats...',
    settings: 'Settings',
    darkMode: 'Dark Mode',
    tempDefault: 'Temporary messages by default',
    language: 'Language',
    logout: 'Logout',
    installApp: 'Install the app for a better experience',
    install: 'Install',
    noChats: 'No chats yet',
    temporary: 'Temporary',
    now: 'now',
    minutes: 'm',
    hours: 'h',
    days: 'd',
    fileAttached: 'File attached',
    imageAttached: 'Image',
    voiceAttached: 'Voice recording',
    videoAttached: 'Video',
    searchUser: 'Search users...',
    searchUserTitle: 'Start New Chat',
    searchUserDesc: 'Search for a user to start chatting',
    noUsers: 'No users found',
    online: 'Online',
    featureComing: 'This feature is under development',
    errorLogin: 'Login failed. Check email and password',
    errorSignup: 'Signup failed. Email may already be in use',
    errorConfirmEmail: 'Email confirmation required. Check your inbox',
    signupSuccess: 'Account created successfully!',
    signupSuccessDesc: 'Please check your email to confirm your account, then login',
    loginNow: 'Login now',
    or: 'or',
  }
};

function t(key) { return translations[currentLang][key] || key; }

// ========== DOM ==========
const app = document.getElementById('app');
const loadingScreen = document.getElementById('loading-screen');
const authModal = document.getElementById('auth-modal');
const loginView = document.getElementById('login-view');
const signupView = document.getElementById('signup-view');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginError = document.getElementById('login-error');
const signupError = document.getElementById('signup-error');
const signupSuccess = document.getElementById('signup-success');
const chatList = document.getElementById('chat-list');
const messageForm = document.getElementById('message-form');
const messagesContainer = document.getElementById('messages');
const chatWelcome = document.getElementById('chat-welcome');
const chatContainer = document.getElementById('chat-container');
const chatTitle = document.getElementById('chat-title');
const chatHeaderAvatar = document.getElementById('chat-header-avatar');
const langToggle = document.getElementById('lang-toggle');
const menuToggle = document.getElementById('menu-toggle');
const newChatBtn = document.getElementById('new-chat-btn');
const tempToggle = document.getElementById('temp-toggle');
const fileInput = document.getElementById('file-input');
const attachmentBtn = document.getElementById('attachment-btn');
const videoCallBtn = document.getElementById('video-call-btn');
const voiceCallBtn = document.getElementById('voice-call-btn');
const installBanner = document.getElementById('install-banner');
const installBtn = document.getElementById('install-btn');
const closeBanner = document.getElementById('close-banner');
const darkModeCheckbox = document.getElementById('dark-mode');
const tempDefaultCheckbox = document.getElementById('temp-msgs');
const languageSelect = document.getElementById('language-select');
const logoutBtn = document.getElementById('logout-btn');
const toast = document.getElementById('toast');
const sidebarToggle = document.getElementById('sidebar-toggle');
const chatSearch = document.getElementById('chat-search');

// ========== Helpers ==========
function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

let toastTimeout;
function showToast(msg, duration) {
  clearTimeout(toastTimeout);
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = 'block';
  toast.style.transform = 'translateY(0)';
  toastTimeout = setTimeout(() => {
    toast.style.display = 'none';
  }, duration || 3000);
}

function featureComing() { showToast(t('featureComing')); }
videoCallBtn?.addEventListener('click', featureComing);
voiceCallBtn?.addEventListener('click', featureComing);

// ========== Language ==========
function applyLanguage() {
  document.documentElement.lang = currentLang === 'ar' ? 'ar' : 'en';
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.title = t('appTitle');
  document.getElementById('loading-text').textContent = t('loading');
  document.getElementById('lang-toggle').textContent = currentLang === 'ar' ? 'EN' : 'عربي';

  const ids = {
    'sidebar-title': 'sidebarTitle',
    'new-chat-text': 'newChat',
    'welcome-title': 'welcomeTitle',
    'welcome-desc': 'welcomeDesc',
    'chat-search': 'searchChat',
    'login-title': 'loginTitle',
    'login-desc': 'loginDesc',
    'login-email': 'emailPlaceholder',
    'login-password': 'passwordPlaceholder',
    'login-btn': 'loginBtn',
    'signup-title': 'signupTitle',
    'signup-desc': 'signupDesc',
    'signup-name': 'namePlaceholder',
    'signup-email': 'emailPlaceholder',
    'signup-password': 'passwordPlaceholder',
    'signup-btn': 'signupBtn',
    'settings-title': 'settingsTitle',
    'dark-mode-label': 'darkMode',
    'temp-default-label': 'tempDefault',
    'lang-label': 'language',
    'logout-btn': 'logout',
    'install-text': 'installApp',
    'install-btn': 'install',
    'search-user-title': 'searchUserTitle',
    'search-user-desc': 'searchUserDesc',
    'user-search-input': 'searchUser',
    'signup-success-title': 'signupSuccess',
    'signup-success-desc': 'signupSuccessDesc',
  };

  Object.entries(ids).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = t(key);
      else el.textContent = t(key);
    }
  });

  messageInput.placeholder = t('messageInput');

  // Footer links
  document.querySelector('#login-view .modal-footer p').innerHTML =
    `${t('noAccount')} <a href="#" id="show-signup">${t('createAccount')}</a>`;
  document.querySelector('#signup-view .modal-footer p').innerHTML =
    `${t('haveAccount')} <a href="#" id="show-login">${t('loginBtn')}</a>`;

  updateTempToggle();
}

// ========== Temp Toggle ==========
function updateTempToggle() {
  if (!tempToggle) return;
  const svg = tempToggle.querySelector('svg');
  if (svg) svg.style.stroke = isTemporaryMessage ? '#ff9800' : '';
  tempToggle.title = isTemporaryMessage ? t('temporary') : '';
  tempToggle.querySelector('.temp-dot')?.remove();
  if (isTemporaryMessage) {
    const dot = document.createElement('span');
    dot.className = 'temp-dot';
    tempToggle.style.position = 'relative';
    tempToggle.appendChild(dot);
  }
}

tempToggle?.addEventListener('click', () => {
  isTemporaryMessage = !isTemporaryMessage;
  updateTempToggle();
});

// ========== Auth ==========
async function checkSession() {
  try {
    const { data: { session }, error } = await window.supabase.auth.getSession();
    if (error) throw error;
    if (session) {
      currentUser = session.user;
      await showApp();
      await initApp();
    } else {
      showAuth();
    }
  } catch (err) {
    console.error('Session check failed:', err);
    showAuth();
  }
}

function showAuth() {
  loadingScreen.classList.add('done');
  hideAllAuthErrors();
  authModal.style.display = 'flex';
  loginView.classList.remove('hidden');
  signupView.classList.add('hidden');
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
}

async function showApp() {
  loadingScreen.classList.add('done');
  authModal.style.display = 'none';
  app.classList.remove('hidden');
}

function hideAllAuthErrors() {
  loginError.classList.add('hidden');
  signupError.classList.add('hidden');
  signupSuccess.classList.add('hidden');
}

function showLoginError(msg) {
  loginError.textContent = msg;
  loginError.classList.remove('hidden');
}

function showSignupError(msg) {
  signupError.textContent = msg;
  signupError.classList.remove('hidden');
}

function showSignupSuccess() {
  signupSuccess.classList.remove('hidden');
  signupForm.classList.add('hidden');
  signupError.classList.add('hidden');
}

// Toggle login/signup views
document.addEventListener('click', (e) => {
  if (e.target.id === 'show-signup') {
    e.preventDefault();
    hideAllAuthErrors();
    loginView.classList.add('hidden');
    signupView.classList.remove('hidden');
    signupForm.classList.remove('hidden');
    signupSuccess.classList.add('hidden');
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
  }
  if (e.target.id === 'show-login') {
    e.preventDefault();
    hideAllAuthErrors();
    signupView.classList.add('hidden');
    loginView.classList.remove('hidden');
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
  }

  // Close modals on overlay click
  if (e.target === authModal && !authInProgress) {
    // Can't close auth modal without being logged in
  }
  if (e.target === document.getElementById('settings-modal')) {
    document.getElementById('settings-modal').style.display = 'none';
  }
  if (e.target === document.getElementById('user-search-modal')) {
    document.getElementById('user-search-modal').style.display = 'none';
  }
});

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (authInProgress) return;
  authInProgress = true;

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('login-btn');
  btn.textContent = '...';
  btn.disabled = true;

  hideAllAuthErrors();

  try {
    const data = await window.signIn(email, password);
    currentUser = data.user;
    await showApp();
    await initApp();
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('Email not confirmed') || msg.includes('email_not_confirmed')) {
      showLoginError(t('errorConfirmEmail'));
    } else {
      showLoginError(t('errorLogin'));
    }
  } finally {
    btn.textContent = t('loginBtn');
    btn.disabled = false;
    authInProgress = false;
  }
});

// Signup
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (authInProgress) return;
  authInProgress = true;

  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const btn = document.getElementById('signup-btn');
  btn.textContent = '...';
  btn.disabled = true;

  hideAllAuthErrors();

  try {
    await window.signUp(email, password, name);
    showSignupSuccess();
  } catch (err) {
    showSignupError(t('errorSignup'));
  } finally {
    btn.textContent = t('signupBtn');
    btn.disabled = false;
    authInProgress = false;
  }
});

// ========== App Init ==========
async function initApp() {
  isTemporaryMessage = localStorage.getItem('tempDefault') === 'true';
  if (tempDefaultCheckbox) tempDefaultCheckbox.checked = isTemporaryMessage;
  await loadChats();
  applyLanguage();
  applyTheme();
  registerServiceWorker();
  setupRealtimeSubscriptions();
}

// ========== Chats ==========
async function loadChats() {
  try {
    chats = await window.getUserChats(currentUser.id);
    renderChatList();
  } catch (err) {
    console.error('Failed to load chats:', err);
  }
}

function renderChatList(filter) {
  chatList.innerHTML = '';
  let filtered = chats;
  if (filter) {
    const q = filter.toLowerCase();
    filtered = chats.filter(c => {
      const other = c.user1_id === currentUser.id ? c.user2 : c.user1;
      return other && ((other.name || '').toLowerCase().includes(q) || (other.email || '').toLowerCase().includes(q));
    });
  }
  if (!filtered.length) {
    chatList.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-light);font-size:0.9rem;">${t('noChats')}</div>`;
    return;
  }
  filtered.forEach(chat => {
    const other = chat.user1_id === currentUser.id ? chat.user2 : chat.user1;
    if (!other) return;
    const item = document.createElement('div');
    item.className = 'chat-item' + (chat.id === currentChatId ? ' active' : '');
    item.dataset.chatId = chat.id;
    item.dataset.userId = other.id;
    item.innerHTML = `
      <div class="chat-item-avatar">${(other.name || other.email)[0].toUpperCase()}</div>
      <div class="chat-item-info">
        <div class="chat-item-name">${escapeHtml(other.name || other.email)}</div>
        <div class="chat-item-preview">${escapeHtml(other.email)}</div>
      </div>
    `;
    item.addEventListener('click', () => {
      selectChat(chat.id, other);
      if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
    });
    chatList.appendChild(item);
  });
}

chatSearch?.addEventListener('input', (e) => renderChatList(e.target.value.trim()));

// ========== Chat Selection ==========
async function selectChat(chatId, otherUser) {
  currentChatId = chatId;
  currentChatUser = otherUser;
  document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
  const item = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
  if (item) item.classList.add('active');
  chatWelcome.classList.add('hidden');
  chatContainer.classList.remove('hidden');
  chatTitle.textContent = otherUser.name || otherUser.email;
  if (chatHeaderAvatar) chatHeaderAvatar.textContent = (otherUser.name || otherUser.email)[0].toUpperCase();
  await loadMessages();
  setupMessageSubscription();
}

async function loadMessages() {
  try {
    const msgs = await window.getMessages(currentChatId);
    renderMessages(msgs);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  } catch (err) {
    console.error('Failed to load messages:', err);
  }
}

function setupMessageSubscription() {
  if (messagesSubscription) window.supabase.removeChannel(messagesSubscription);
  messagesSubscription = window.subscribeToMessages(currentChatId, async (newMsg) => {
    try {
      const { data: user } = await window.supabase.from('users').select('id, name').eq('id', newMsg.user_id).single();
      newMsg.user = user || { id: newMsg.user_id, name: 'Unknown' };
    } catch (_) {
      newMsg.user = { id: newMsg.user_id, name: 'Unknown' };
    }
    if (newMsg.is_temporary && newMsg.expires_at && new Date(newMsg.expires_at) <= new Date()) return;
    appendMessage(newMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
}

function renderMessages(msgs) {
  messagesContainer.innerHTML = '';
  msgs.forEach(msg => {
    if (msg.is_temporary && msg.expires_at && new Date(msg.expires_at) <= new Date()) return;
    appendMessage(msg);
  });
}

function appendMessage(msg) {
  const sent = msg.user_id === currentUser.id;
  const div = document.createElement('div');
  div.className = `message ${sent ? 'sent' : 'received'}`;
  let contentHtml = '';
  const displayContent = msg.content;

  switch (msg.type) {
    case 'image':
      contentHtml = `<img src="${displayContent}" alt="${t('imageAttached')}" class="message-image" loading="lazy">`;
      break;
    case 'video':
      contentHtml = `<video src="${displayContent}" controls class="message-video"></video>`;
      break;
    case 'audio':
      contentHtml = `<audio src="${displayContent}" controls class="message-audio"></audio>`;
      break;
    case 'file':
      contentHtml = `<a href="${displayContent}" target="_blank" class="message-file">${t('fileAttached')}</a>`;
      break;
    default:
      contentHtml = escapeHtml(displayContent);
  }

  const time = formatTime(msg.created_at);
  let statusHtml = '';
  if (msg.is_temporary) {
    statusHtml = `<span class="message-status">
      <svg viewBox="0 0 24 24" fill="none" stroke="#ff9800" stroke-width="2" stroke-linecap="round" style="width:12px;height:12px;vertical-align:middle;">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg> ${t('temporary')}
    </span>`;
  }

  div.innerHTML = `
    <div class="message-content">${contentHtml}</div>
    <div class="message-meta">
      <span class="message-time">${time}</span>
      ${statusHtml}
    </div>`;
  messagesContainer.appendChild(div);
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return t('now');
  if (diff < 3600000) return Math.floor(diff / 60000) + t('minutes');
  if (diff < 86400000) return Math.floor(diff / 3600000) + t('hours');
  return Math.floor(diff / 86400000) + t('days');
}

// ========== Real-time ==========
function setupRealtimeSubscriptions() {
  if (chatsSubscription) window.supabase.removeChannel(chatsSubscription);
  chatsSubscription = window.subscribeToUserChats(currentUser.id, () => loadChats());
}

// ========== Send Message ==========
messageForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentChatId || !currentUser) return;
  const content = messageInput.value.trim();
  if (!content) return;
  let expiresAt = null;
  if (isTemporaryMessage) expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  try {
    await window.sendMessage(currentChatId, currentUser.id, content, 'text', isTemporaryMessage, expiresAt);
    messageInput.value = '';
    messageInput.style.height = 'auto';
  } catch (_) {
    showToast('فشل الإرسال');
  }
});

messageInput?.addEventListener('input', () => {
  messageInput.style.height = 'auto';
  messageInput.style.height = messageInput.scrollHeight + 'px';
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) messageForm?.dispatchEvent(new Event('submit'));
});

// ========== New Chat / User Search ==========
newChatBtn?.addEventListener('click', openUserSearch);

async function openUserSearch() {
  const modal = document.getElementById('user-search-modal');
  modal.style.display = 'flex';
  const input = document.getElementById('user-search-input');
  const results = document.getElementById('user-search-results');
  input.value = '';
  results.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-light);">...</div>';

  try {
    const users = await window.getAllUsers();
    renderUserResults(users.filter(u => u.id !== currentUser.id));
  } catch (_) {
    results.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-light);">خطأ في تحميل المستخدمين</div>';
  }

  input.oninput = async (e) => {
    const q = e.target.value.trim();
    if (!q) {
      try {
        const users = await window.getAllUsers();
        renderUserResults(users.filter(u => u.id !== currentUser.id));
      } catch (_) {}
      return;
    }
    try {
      const users = await window.searchUsers(q);
      renderUserResults(users.filter(u => u.id !== currentUser.id));
    } catch (_) {}
  };
}

function renderUserResults(users) {
  const results = document.getElementById('user-search-results');
  results.innerHTML = '';
  if (!users.length) {
    results.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-light);">${t('noUsers')}</div>`;
    return;
  }
  users.forEach(u => {
    const div = document.createElement('div');
    div.className = 'user-search-item';
    div.innerHTML = `
      <div class="user-search-avatar">${(u.name || u.email)[0].toUpperCase()}</div>
      <div class="user-search-info">
        <h4>${escapeHtml(u.name || u.email)}</h4>
        <span>${escapeHtml(u.email)}</span>
      </div>
    `;
    div.addEventListener('click', async () => {
      document.getElementById('user-search-modal').style.display = 'none';
      try {
        const chat = await window.getOrCreateChat(currentUser.id, u.id);
        await loadChats();
        selectChat(chat.id, u);
      } catch (_) {
        showToast('فشل بدء المحادثة');
      }
    });
    results.appendChild(div);
  });
}

// ========== File Attachment ==========
attachmentBtn?.addEventListener('click', () => fileInput?.click());

fileInput?.addEventListener('change', async (e) => {
  const files = e.target.files;
  if (!files.length || !currentChatId) return;
  for (const file of files) {
    try {
      const path = `${currentUser.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await window.supabase.storage.from('chat-media').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = window.supabase.storage.from('chat-media').getPublicUrl(path);
      let type = 'file';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';
      let expiresAt = null;
      if (isTemporaryMessage) expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await window.sendMessage(currentChatId, currentUser.id, publicUrl, type, isTemporaryMessage, expiresAt);
    } catch (_) {
      showToast('فشل رفع الملف');
    }
  }
  fileInput.value = '';
});

// ========== Sidebar Toggle ==========
sidebarToggle?.addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// ========== Language Toggle ==========
langToggle?.addEventListener('click', () => {
  currentLang = currentLang === 'ar' ? 'en' : 'ar';
  localStorage.setItem('lang', currentLang);
  applyLanguage();
});

// ========== Settings ==========
menuToggle?.addEventListener('click', () => {
  const modal = document.getElementById('settings-modal');
  modal.style.display = 'flex';
  if (darkModeCheckbox) darkModeCheckbox.checked = isDarkMode;
  if (tempDefaultCheckbox) tempDefaultCheckbox.checked = localStorage.getItem('tempDefault') === 'true';
  if (languageSelect) languageSelect.value = currentLang;
});

darkModeCheckbox?.addEventListener('change', () => {
  isDarkMode = darkModeCheckbox.checked;
  localStorage.setItem('darkMode', isDarkMode);
  applyTheme();
});

tempDefaultCheckbox?.addEventListener('change', () => {
  localStorage.setItem('tempDefault', tempDefaultCheckbox.checked);
  isTemporaryMessage = tempDefaultCheckbox.checked;
  updateTempToggle();
});

languageSelect?.addEventListener('change', () => {
  currentLang = languageSelect.value;
  localStorage.setItem('lang', currentLang);
  applyLanguage();
});

document.getElementById('close-user-search')?.addEventListener('click', () => {
  document.getElementById('user-search-modal').style.display = 'none';
});

document.querySelector('.close-settings')?.addEventListener('click', () => {
  document.getElementById('settings-modal').style.display = 'none';
});

logoutBtn?.addEventListener('click', async () => {
  try {
    await window.signOut();
  } catch (_) {}
  currentUser = null;
  currentChatId = null;
  currentChatUser = null;
  chats = [];
  if (chatList) chatList.innerHTML = '';
  if (messagesContainer) messagesContainer.innerHTML = '';
  if (chatContainer) chatContainer.classList.add('hidden');
  if (chatWelcome) chatWelcome.classList.remove('hidden');
  if (messagesSubscription) { window.supabase.removeChannel(messagesSubscription); messagesSubscription = null; }
  if (chatsSubscription) { window.supabase.removeChannel(chatsSubscription); chatsSubscription = null; }
  document.getElementById('settings-modal').style.display = 'none';
  app.classList.add('hidden');
  showAuth();
});

// ========== Theme ==========
function applyTheme() {
  document.body.classList.toggle('dark-mode', isDarkMode);
}

// ========== PWA Install ==========
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBanner) installBanner.style.display = 'block';
});

installBtn?.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted' && installBanner) installBanner.style.display = 'none';
    deferredPrompt = null;
  }
});

closeBanner?.addEventListener('click', () => { if (installBanner) installBanner.style.display = 'none'; });
window.addEventListener('appinstalled', () => { if (installBanner) installBanner.style.display = 'none'; });

// ========== Service Worker ==========
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }
}

// ========== Init ==========
document.addEventListener('DOMContentLoaded', () => {
  applyLanguage();
  applyTheme();
  checkSession();
});