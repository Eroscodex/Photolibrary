/**
 * Karl & Lezil Photo Library - Minimalist JS Code
 */

// Allowed credentials
const ALLOWED_USERS = [
  { email: 'karlnickoalondra02@gmail.com', password: 'Karl123!', name: 'Karl', username: 'karl' },
  { email: 'lezorgasa@gmail.com', password: 'Lezil123!', name: 'Lezil', username: 'lezil' }
];

// Default playlist seeds
const DEFAULT_PLAYLIST = [
  { id: '3MFMBC2P8Oc', title: '14 - Silent Sanctuary' },
  { id: '0p-tM6UfVjU', title: 'Kundiman - Silent Sanctuary' },
  { id: 'YqNlhU253gA', title: 'Pasensya Ka Na - Silent Sanctuary' }
];

// Initial seeder memories
const DEFAULT_MEMORIES = [
  {
    id: 'seed-1',
    title: 'Our Journey Begins',
    caption: 'Welcome to our digital journal! Page 2 of 1,000 pages of our sweet memories together. 💙',
    date: '2026-01-01',
    pageNumber: 2,
    fileData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%"><rect width="100%" height="100%" fill="%23eff6ff"/><path d="M200 230 C120 160 100 100 160 80 C190 70 200 90 200 90 C200 90 210 70 240 80 C300 100 280 160 200 230 Z" fill="%233b82f6"/><text x="50%" y="87%" font-family="sans-serif" font-weight="bold" font-size="14" fill="%238b5cf6" text-anchor="middle">Memory Page 2</text></svg>',
    fileType: 'image',
    privacy: 'public',
    uploadedBy: 'karl',
    isFavorite: true
  },
  {
    id: 'seed-2',
    title: 'A Secret Letter',
    caption: 'This is a private memory. Log in as Lezil to view this card on Page 3! 🤫💜',
    date: '2026-02-14',
    pageNumber: 3,
    fileData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%"><rect width="100%" height="100%" fill="%23f5f3ff"/><path d="M150 130 L250 130 L250 200 L150 200 Z" fill="%238b5cf6"/><path d="M150 130 L200 165 L250 130" fill="none" stroke="%23111827" stroke-width="2"/><text x="50%" y="85%" font-family="sans-serif" font-weight="bold" font-size="14" fill="%233b82f6" text-anchor="middle">Private Entry Page 3</text></svg>',
    fileType: 'image',
    privacy: 'private',
    uploadedBy: 'lezil',
    isFavorite: false
  }
];

// App States
let currentUser = null;
let memories = [];
let playlist = [];
let currentPage = 1; // Left page index on Desktop
let currentFilter = 'all';
let ytPlayer = null;
let progressInterval = null;
let currentTheme = 'dark'; // default theme

// DOM nodes
const bodyNode = document.body;
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const authControls = document.getElementById('auth-controls');
const openLoginBtn = document.getElementById('open-login-btn');
const loginModal = document.getElementById('login-modal');
const closeLoginModal = document.getElementById('close-login-modal');
const cancelLoginBtn = document.getElementById('cancel-login-btn');
const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const storageFill = document.getElementById('storage-fill');
const storagePct = document.getElementById('storage-pct');

// Page jumpers
const pageInput = document.getElementById('page-input');
const pageSlider = document.getElementById('page-slider');
const leftPageFooterNum = document.getElementById('left-page-footer-num');
const rightPageFooterNum = document.getElementById('right-page-footer-num');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const prevPageCorner = document.getElementById('prev-page-corner');
const nextPageCorner = document.getElementById('next-page-corner');
const bookPages = document.getElementById('book-pages');

// Music elements
const vinylDisc = document.getElementById('vinyl-disc');
const currentSongTitle = document.getElementById('current-song-title');
const currentSongArtist = document.getElementById('current-song-artist');
const playBtn = document.getElementById('play-btn');
const playSvg = document.getElementById('play-svg');
const pauseSvg = document.getElementById('pause-svg');
const songProgressBar = document.getElementById('song-progress-bar');
const songProgressFill = document.getElementById('song-progress-fill');
const playerTime = document.getElementById('player-time');
const playlistSelect = document.getElementById('playlist-select');
const managePlaylistBtn = document.getElementById('manage-playlist-btn');
const playlistModal = document.getElementById('playlist-modal');
const closePlaylistModal = document.getElementById('close-playlist-modal');
const closePlaylistMgrBtn = document.getElementById('close-playlist-mgr-btn');
const playlistManagerList = document.getElementById('playlist-manager-list');
const modalPlaylistAddForm = document.getElementById('modal-playlist-add-form');
const modalAddSongTitle = document.getElementById('modal-add-song-title');
const modalAddSongUrl = document.getElementById('modal-add-song-url');

// Upload nodes
const uploadModal = document.getElementById('upload-modal');
const closeUploadModal = document.getElementById('close-upload-modal');
const cancelUploadBtn = document.getElementById('cancel-upload-btn');
const uploadForm = document.getElementById('upload-form');
const uploadDropzone = document.getElementById('upload-dropzone');
const mediaFileInput = document.getElementById('media-file');
const uploadPreviewBox = document.getElementById('upload-preview-box');

// Edit nodes
const editModal = document.getElementById('edit-modal');
const closeEditModal = document.getElementById('close-edit-modal');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const editForm = document.getElementById('edit-form');
const editMediaId = document.getElementById('edit-media-id');
const editMediaTitle = document.getElementById('edit-media-title');
const editMediaCaption = document.getElementById('edit-media-caption');
const editMediaDate = document.getElementById('edit-media-date');
const editMediaPage = document.getElementById('edit-media-page');
const editMediaPrivacy = document.getElementById('edit-media-privacy');

// Grid container
const mediaContainer = document.getElementById('media-container');

// Toast nodes
const toast = document.getElementById('toast-notification');
const toastMessage = document.getElementById('toast-message');

/* ==========================================================================
   1. Initialization & Theme Controllers
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // 1. Theme Configuration
  const savedTheme = localStorage.getItem('k&l_theme');
  if (savedTheme) {
    currentTheme = savedTheme;
  }
  applyTheme();
  themeToggleBtn.onclick = toggleTheme;

  // 2. Authentication Session
  const savedUser = localStorage.getItem('k&l_logged_in_user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateAuthUI();
  }

  // 3. Database seeds
  const storedMemories = localStorage.getItem('k&l_photo_library_memories');
  if (!storedMemories) {
    localStorage.setItem('k&l_photo_library_memories', JSON.stringify(DEFAULT_MEMORIES));
    memories = [...DEFAULT_MEMORIES];
  } else {
    memories = JSON.parse(storedMemories);
  }

  // 4. Playlist setup
  let storedPlaylist = localStorage.getItem('k&l_playlist');
  // Migration: If user loaded the broken old IDs, force reset to the working official ID
  if (storedPlaylist && (storedPlaylist.includes('P5P311i3_0A') || storedPlaylist.includes('ni2SvHwfrvE'))) {
    localStorage.removeItem('k&l_playlist');
    storedPlaylist = null;
  }
  if (!storedPlaylist) {
    localStorage.setItem('k&l_playlist', JSON.stringify(DEFAULT_PLAYLIST));
    playlist = [...DEFAULT_PLAYLIST];
  } else {
    playlist = JSON.parse(storedPlaylist);
  }

  // Bind forms & navigation
  bindEvents();

  // Load and draw initial screens
  updateStorageMeter();
  populatePlaylistSelector();
  renderScrapbookPages();

  // Handle window resizing dynamically
  window.addEventListener('resize', () => {
    renderScrapbookPages();
    updateBookScale();
  });
  updateBookScale();
}

function applyTheme() {
  if (currentTheme === 'light') {
    bodyNode.classList.remove('dark-theme');
    bodyNode.classList.add('light-theme');
  } else {
    bodyNode.classList.remove('light-theme');
    bodyNode.classList.add('dark-theme');
  }
}

function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  localStorage.setItem('k&l_theme', currentTheme);
  applyTheme();
}

/* ==========================================================================
   2. Auth UI & Verification
   ========================================================================== */

function bindEvents() {
  // Book 3D Open/Close Animation Triggers
  const bookNode = document.getElementById('book');
  const openBookBtn = document.getElementById('open-book-btn');
  const closeBookBtn = document.getElementById('close-book-btn');

  openBookBtn.onclick = () => {
    bookNode.classList.remove('closed');
    bookNode.classList.add('open');
    closeBookBtn.style.display = 'flex';
    const navContainer = document.querySelector('.nav-controls-container');
    if (navContainer) navContainer.style.display = 'flex';
    renderScrapbookPages();
    updateBookScale();
  };

  closeBookBtn.onclick = () => {
    bookNode.classList.remove('open');
    bookNode.classList.add('closed');
    closeBookBtn.style.display = 'none';
    const navContainer = document.querySelector('.nav-controls-container');
    if (navContainer) navContainer.style.display = 'none';
    updateBookScale();
  };

  // Auth Triggers
  openLoginBtn.onclick = () => openModal(loginModal);
  closeLoginModal.onclick = () => closeModal(loginModal);
  cancelLoginBtn.onclick = () => closeModal(loginModal);
  loginForm.onsubmit = verifyLogin;

  // Playlist Manager Modal Triggers
  managePlaylistBtn.onclick = () => {
    openModal(playlistModal);
    renderPlaylistManagerList();
  };
  closePlaylistModal.onclick = () => closeModal(playlistModal);
  closePlaylistMgrBtn.onclick = () => closeModal(playlistModal);

  // Generic modal overlays
  window.onclick = (e) => {
    if (e.target === loginModal) closeModal(loginModal);
    if (e.target === uploadModal) closeModal(uploadModal);
    if (e.target === editModal) closeModal(editModal);
    if (e.target === playlistModal) closeModal(playlistModal);
  };

  // Page slider & inputs listeners
  pageInput.oninput = (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) return;
    if (val < 1) val = 1;
    if (val > 1000) val = 1000;
    jumpToPage(val);
  };

  pageSlider.oninput = (e) => {
    jumpToPage(parseInt(e.target.value));
  };

  prevBtn.onclick = () => turnPage('prev');
  nextBtn.onclick = () => turnPage('next');
  prevPageCorner.onclick = () => turnPage('prev');
  nextPageCorner.onclick = () => turnPage('next');

  closeUploadModal.onclick = () => closeModal(uploadModal);
  cancelUploadBtn.onclick = () => closeModal(uploadModal);
  uploadForm.onsubmit = handleUploadMemory;

  // Drag & drop file loaders
  bindFileDragAndDrop();

  // Edit details binds
  closeEditModal.onclick = () => closeModal(editModal);
  cancelEditBtn.onclick = () => closeModal(editModal);
  editForm.onsubmit = handleUpdateDetails;

  // Filtering actions
  const filters = document.querySelectorAll('.filter-btn');
  filters.forEach(btn => {
    btn.onclick = (e) => {
      filters.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.getAttribute('data-filter');
      renderScrapbookPages();
    };
  });
}

function verifyLogin() {
  const email = loginEmail.value.trim().toLowerCase();
  const password = loginPassword.value;
  loginError.textContent = '';

  const user = ALLOWED_USERS.find(u => u.email === email && u.password === password);
  if (user) {
    currentUser = { email: user.email, name: user.name, username: user.username };
    localStorage.setItem('k&l_logged_in_user', JSON.stringify(currentUser));
    
    closeModal(loginModal);
    updateAuthUI();
    showToast(`Welcome back, ${user.name}!`);
    renderScrapbookPages();
  } else {
    loginError.textContent = 'Invalid login credentials.';
    loginForm.classList.add('shake');
    setTimeout(() => loginForm.classList.remove('shake'), 400);
  }
}

function updateAuthUI() {
  const ownerControls = document.getElementById('owner-header-controls');
  const welcomeSub = document.getElementById('welcome-sub');
  if (currentUser) {
    // Show logged in options
    authControls.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:0.8rem; font-weight:600; color:var(--violet-accent);">Hello, ${currentUser.name}</span>
        <button class="btn btn-danger" onclick="logout()">Logout</button>
      </div>
    `;
    managePlaylistBtn.style.display = 'flex';
    if (ownerControls) ownerControls.style.display = 'flex';
    if (welcomeSub) welcomeSub.textContent = `Welcome back to our sanctuary, ${currentUser.name}`;
  } else {
    // Show logged out defaults
    authControls.innerHTML = `<button class="btn btn-primary" id="open-login-btn">Login</button>`;
    document.getElementById('open-login-btn').onclick = () => openModal(loginModal);
    
    managePlaylistBtn.style.display = 'none';
    if (ownerControls) ownerControls.style.display = 'none';
    if (welcomeSub) welcomeSub.textContent = 'Explore our favorite moments';
  }
}

window.logout = function() {
  localStorage.removeItem('k&l_logged_in_user');
  currentUser = null;
  updateAuthUI();
  showToast('Logged out. Secure view restored.');
  
  // Close the book automatically on logout
  const bookNode = document.getElementById('book');
  const closeBookBtn = document.getElementById('close-book-btn');
  bookNode.classList.remove('open');
  bookNode.classList.add('closed');
  closeBookBtn.style.display = 'none';
  
  const navContainer = document.querySelector('.nav-controls-container');
  if (navContainer) navContainer.style.display = 'none';
  updateBookScale();

  // Return to Page 1
  jumpToPage(1);
};

/* ==========================================================================
   3. Page Navigation (1000 Pages System)
   ========================================================================== */

function jumpToPage(num) {
  currentPage = num;
  pageInput.value = num;
  pageSlider.value = num;
  renderScrapbookPages();
}

function turnPage(direction) {
  const isMobile = false;
  const step = 2;

  // Add flip transition overlay
  bookPages.classList.add('page-turning');

  if (direction === 'next') {
    currentPage = Math.min(1000, currentPage + step);
  } else {
    currentPage = Math.max(1, currentPage - step);
  }

  // Desktop adjustment: make sure left page index is odd
  if (currentPage > 1 && currentPage % 2 === 0) {
    currentPage -= 1;
  }

  // Sync inputs
  pageInput.value = currentPage;
  pageSlider.value = currentPage;

  setTimeout(() => {
    renderScrapbookPages();
    bookPages.classList.remove('page-turning');
  }, 350);
}

function getMemoriesOnPage(pageNo) {
  return memories.filter(item => {
    if (parseInt(item.pageNumber) !== pageNo) return false;
    
    // Privacy filters
    const isPublic = item.privacy === 'public';
    const isOwner = currentUser && item.uploadedBy === currentUser.username;
    if (!isPublic && !isOwner) return false;

    // Type filters
    if (currentFilter === 'favorites') return item.isFavorite;
    if (currentFilter === 'photos') return item.fileType === 'image';
    if (currentFilter === 'videos') return item.fileType === 'video';
    return true;
  });
}

function renderScrapbookPages() {
  const isMobile = false; // Always 2-page side-by-side book layout
  
  // Hide or show nav elements on extreme limits
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= 999;
  prevPageCorner.style.display = currentPage <= 1 ? 'none' : 'block';
  nextPageCorner.style.display = (currentPage >= 999) ? 'none' : 'block';

  // Desktop/Proportional layout shows left (odd) & right (even) pages side by side
  if (currentPage % 2 === 0 && currentPage > 1) {
    currentPage -= 1;
  }
  
  leftPageFooterNum.textContent = `Page ${currentPage}`;
  rightPageFooterNum.textContent = `Page ${currentPage + 1}`;

  const leftAlbum = document.getElementById('left-album-container');

  if (currentPage === 1) {
    // Left Page 1 is always Static welcome
    document.querySelector('.welcome-panel').style.display = 'flex';
    document.querySelector('.book-page-right .album-panel').style.display = 'flex';
    if (leftAlbum) leftAlbum.style.display = 'none';
    
    // Page 2 contains Right Page contents
    drawPageMedia(2);
  } else {
    // Both Left (currentPage) & Right (currentPage+1) are Album pages.
    document.querySelector('.welcome-panel').style.display = 'none';
    document.querySelector('.book-page-right .album-panel').style.display = 'flex';
    
    // Draw Left Page contents
    drawLeftPageAlbum(currentPage);
    // Draw Right Page contents
    drawPageMedia(currentPage + 1);
  }
}

// Render memories or blank slots on Right Page
function drawPageMedia(pageNo) {
  const pageItems = getMemoriesOnPage(pageNo);
  mediaContainer.innerHTML = '';

  if (pageItems.length === 0) {
    mediaContainer.appendChild(createBlankPlaceholder(pageNo));
  } else {
    pageItems.forEach(item => {
      mediaContainer.appendChild(createMediaCard(item));
    });
  }
}

// Draw album layout in Left Page (when it is not showing welcome layout)
function drawLeftPageAlbum(pageNo) {
  const leftPageDiv = document.querySelector('.book-page-left');
  
  // Wipe welcome and inject custom album list wrapper if not present
  let albumContainer = document.getElementById('left-album-container');
  if (!albumContainer) {
    albumContainer = document.createElement('div');
    albumContainer.id = 'left-album-container';
    albumContainer.className = 'album-panel';
    albumContainer.style.height = '100%';
    leftPageDiv.appendChild(albumContainer);
  }

  const pageItems = getMemoriesOnPage(pageNo);
  
  // Render structure
  albumContainer.innerHTML = `
    <h3 style="font-size:1.1rem; font-weight:600; margin-bottom:20px;">Page ${pageNo} Album</h3>
    <div class="media-container" id="left-media-container"></div>
    <div class="page-number-footer" style="margin-top:auto;">
      <span>Page ${pageNo}</span>
      <span>Karl & Lezil</span>
    </div>
  `;

  const itemsList = document.getElementById('left-media-container');
  if (pageItems.length === 0) {
    itemsList.appendChild(createBlankPlaceholder(pageNo));
  } else {
    pageItems.forEach(item => {
      itemsList.appendChild(createMediaCard(item));
    });
  }
}

function createBlankPlaceholder(pageNo) {
  const div = document.createElement('div');
  div.className = 'blank-page-placeholder';
  
  if (currentUser) {
    div.innerHTML = `
      <h4>Upload Photos</h4>
      <p style="font-size: 0.75rem; margin-top: 5px; color: var(--text-muted);">Page ${pageNo}</p>
    `;
    div.onclick = () => {
      document.getElementById('media-date').valueAsDate = new Date();
      document.getElementById('media-page').value = pageNo;
      openModal(uploadModal);
    };
  } else {
    div.className = 'blank-page-placeholder disabled';
    div.innerHTML = `
      <h4>Page is Empty</h4>
    `;
  }
  return div;
}

function createMediaCard(item) {
  const card = document.createElement('div');
  card.className = 'media-card';
  
  const isOwner = currentUser && item.uploadedBy === currentUser.username;
  const isPrivate = item.privacy === 'private';
  
  let mediaHTML = '';
  if (item.fileType === 'video') {
    mediaHTML = `
      <video class="card-video" controls preload="metadata">
        <source src="${item.fileData}">
      </video>
    `;
  } else {
    mediaHTML = `<img class="card-img" src="${item.fileData}" alt="${escapeHTML(item.title)}" loading="lazy">`;
  }

  card.innerHTML = `
    ${isPrivate ? `
      <div class="card-badge private" title="Private entry">
        <svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
        Private
      </div>` : ''}
    
    <div class="card-frame">
      ${mediaHTML}
    </div>
    
    <div class="card-details">
      <span class="card-title">${escapeHTML(item.title)}</span>
      <span class="card-caption">${escapeHTML(item.caption)}</span>
      <span class="card-meta">By ${item.uploadedBy === 'karl' ? 'Karl' : 'Lezil'} • ${formatDate(item.date)}</span>
    </div>
    
    <div class="card-actions">
      <!-- Hearts favorite toggle -->
      <button class="action-icon-btn favorite ${item.isFavorite ? 'active' : ''}" onclick="toggleFavorite('${item.id}')" title="Mark as Favorite">
        <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      </button>
      
      <!-- Only owners can Edit/Delete -->
      ${isOwner ? `
        <button class="action-icon-btn" onclick="openEditModal('${item.id}')" title="Edit details">
          <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
        </button>
        <button class="action-icon-btn" onclick="deleteMemory('${item.id}')" title="Delete entry">
          <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      ` : ''}
    </div>
  `;
  
  return card;
}

/* ==========================================================================
   4. Photo & Video Upload / Edit Logic (CRUD)
   ========================================================================== */

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const MAX_DIM = 1000;
        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressed);
      };
      img.onerror = (e) => reject(e);
    };
    reader.onerror = (e) => reject(e);
  });
}

function readVideoBase64(file) {
  return new Promise((resolve, reject) => {
    if (file.size > 1.5 * 1024 * 1024) {
      reject(new Error('Video size exceeds the 1.5MB limit. Please upload shorter/smaller videos.'));
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (e) => reject(e);
  });
}

async function handleUploadMemory() {
  const title = document.getElementById('media-title').value.trim();
  const caption = document.getElementById('media-caption').value.trim();
  const date = document.getElementById('media-date').value;
  const pageNo = parseInt(document.getElementById('media-page').value);
  const isPrivate = document.getElementById('media-privacy').checked;
  const fileInput = mediaFileInput;
  const file = fileInput.files[0];

  if (pageNo < 2 || pageNo > 1000) {
    showToast('Invalid page number (must be 2 to 1000)');
    return;
  }

  if (!file) {
    showToast('Please select a photo or video to upload.');
    return;
  }

  showToast('Compressing and saving memory...');
  
  try {
    let fileData = '';
    let fileType = '';

    if (file.type.startsWith('image/')) {
      fileData = await compressImage(file);
      fileType = 'image';
    } else if (file.type.startsWith('video/')) {
      fileData = await readVideoBase64(file);
      fileType = 'video';
    } else {
      showToast('Unsupported media format.');
      return;
    }

    const item = {
      id: 'mem-' + Date.now(),
      title,
      caption,
      date,
      pageNumber: pageNo,
      fileData,
      fileType,
      privacy: isPrivate ? 'private' : 'public',
      uploadedBy: currentUser.username,
      isFavorite: false
    };

    memories.unshift(item);
    saveMemories();
    closeModal(uploadModal);
    
    // Reset forms
    uploadForm.reset();
    uploadPreviewBox.innerHTML = '';
    uploadPreviewBox.style.display = 'none';

    // Jump to the upload target page to see it
    jumpToPage(pageNo);
    showToast('Memory successfully saved! 💙');
  } catch (error) {
    console.error(error);
    alert(error.message);
    showToast('Upload failed.');
  }
}

window.deleteMemory = function(id) {
  if (confirm('Are you sure you want to remove this memory?')) {
    memories = memories.filter(m => m.id !== id);
    saveMemories();
    renderScrapbookPages();
    showToast('Memory deleted.');
  }
};

window.openEditModal = function(id) {
  const item = memories.find(m => m.id === id);
  if (!item) return;

  editMediaId.value = item.id;
  editMediaTitle.value = item.title;
  editMediaCaption.value = item.caption;
  editMediaDate.value = item.date;
  editMediaPage.value = item.pageNumber;
  editMediaPrivacy.checked = item.privacy === 'private';

  openModal(editModal);
};

function handleUpdateDetails() {
  const id = editMediaId.value;
  const item = memories.find(m => m.id === id);
  if (!item) return;

  const newPage = parseInt(editMediaPage.value);
  if (newPage < 2 || newPage > 1000) {
    showToast('Page must be 2 - 1000.');
    return;
  }

  item.title = editMediaTitle.value.trim();
  item.caption = editMediaCaption.value.trim();
  item.date = editMediaDate.value;
  item.pageNumber = newPage;
  item.privacy = editMediaPrivacy.checked ? 'private' : 'public';

  saveMemories();
  closeModal(editModal);
  
  // Jump to updated page
  jumpToPage(newPage);
  showToast('Details updated.');
}

window.toggleFavorite = function(id) {
  const item = memories.find(m => m.id === id);
  if (!item) return;

  item.isFavorite = !item.isFavorite;
  saveMemories();
  renderScrapbookPages();
  showToast(item.isFavorite ? 'Added to Favorites! 💜' : 'Removed from Favorites.');
};

function saveMemories() {
  localStorage.setItem('k&l_photo_library_memories', JSON.stringify(memories));
  updateStorageMeter();
}

function updateStorageMeter() {
  let size = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      size += (key.length + localStorage[key].length) * 2;
    }
  }

  const LIMIT_5MB = 5 * 1024 * 1024;
  const pct = Math.min(100, Math.round((size / LIMIT_5MB) * 100));

  storagePct.textContent = `${pct}%`;
  storageFill.style.width = `${pct}%`;

  storageFill.classList.remove('warn', 'danger');
  if (pct >= 85) {
    storageFill.classList.add('danger');
  } else if (pct >= 60) {
    storageFill.classList.add('warn');
  }
}

/* ==========================================================================
   5. Dynamic Music Turntable Player (YouTube API Integration)
   ========================================================================== */

function populatePlaylistSelector() {
  const currentSelectedId = playlistSelect.value || (playlist[0] ? playlist[0].id : '');

  playlistSelect.innerHTML = '';
  playlist.forEach((track) => {
    const opt = document.createElement('option');
    opt.value = track.id;
    opt.textContent = track.title;
    playlistSelect.appendChild(opt);
  });

  if (currentSelectedId) {
    playlistSelect.value = currentSelectedId;
  }

  playlistSelect.onchange = (e) => {
    playTrack(e.target.value);
  };

  // Populate visual tracklist on Page 1
  const tracklistContainer = document.getElementById('page1-tracklist');
  if (tracklistContainer) {
    tracklistContainer.innerHTML = '';
    playlist.forEach((track, index) => {
      const isCurrent = playlistSelect.value === track.id;
      const isPlaying = isCurrent && vinylDisc.classList.contains('playing');
      
      const item = document.createElement('div');
      item.className = `tracklist-item ${isCurrent ? 'active' : ''}`;
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.justifyContent = 'space-between';
      item.style.padding = '8px 10px';
      item.style.borderRadius = '6px';
      item.style.cursor = 'pointer';
      item.style.transition = 'all 0.2s';
      item.style.border = '1px solid transparent';

      const idxStr = String(index + 1).padStart(2, '0');
      
      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; min-width: 0; flex-grow: 1; text-align: left;">
          <span style="font-size: 0.75rem; color: ${isCurrent ? 'var(--violet-accent)' : 'var(--text-muted)'}; font-weight: 600;">${idxStr}</span>
          <span style="font-size: 0.8rem; font-weight: ${isCurrent ? '600' : '500'}; color: var(--text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${escapeHTML(track.title)}
          </span>
        </div>
        ${isPlaying ? `
          <div class="playing-indicator" style="display: flex; gap: 2.5px; align-items: flex-end; height: 12px; flex-shrink: 0; padding-bottom: 2px;">
            <div class="bar" style="width: 2.5px; height: 100%; background: var(--violet-accent); animation: bounce 0.8s ease-in-out infinite alternate;"></div>
            <div class="bar" style="width: 2.5px; height: 50%; background: var(--violet-accent); animation: bounce 0.6s ease-in-out infinite alternate; animation-delay: 0.2s;"></div>
            <div class="bar" style="width: 2.5px; height: 75%; background: var(--violet-accent); animation: bounce 0.7s ease-in-out infinite alternate; animation-delay: 0.1s;"></div>
          </div>
        ` : ''}
      `;

      item.onclick = () => {
        playTrack(track.id);
      };

      tracklistContainer.appendChild(item);
    });
  }
}

function playTrack(videoId) {
  if (!ytPlayer) return;
  
  const track = playlist.find(t => t.id === videoId);
  if (!track) return;

  currentSongTitle.textContent = track.title.split(' - ')[0];
  currentSongArtist.textContent = track.title.split(' - ')[1] || 'Unknown Artist';
  playlistSelect.value = videoId;

  ytPlayer.cueVideoById(videoId);
  setTimeout(() => {
    ytPlayer.playVideo();
    populatePlaylistSelector();
  }, 300);
}

// Extract YouTube ID from url
function getYtIdFromUrl(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function renderPlaylistManagerList() {
  playlistManagerList.innerHTML = '';
  playlist.forEach((track) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.justifyContent = 'space-between';
    row.style.background = 'var(--input-bg)';
    row.style.padding = '8px 12px';
    row.style.borderRadius = '6px';
    row.style.border = '1px solid var(--border-color)';
    row.style.gap = '10px';
    row.style.marginBottom = '6px';

    const isCurrent = playlistSelect.value === track.id;

    row.innerHTML = `
      <div style="flex-grow: 1; min-width: 0; text-align: left;">
        <span style="font-size: 0.8rem; font-weight: 500; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; ${isCurrent ? 'color: var(--violet-accent); font-weight: 600;' : ''}">
          ${escapeHTML(track.title)}
        </span>
      </div>
      <div style="display: flex; gap: 4px; flex-shrink: 0;">
        <button class="action-icon-btn" onclick="playTrack('${track.id}'); renderPlaylistManagerList();" title="Play Song" style="${isCurrent ? 'color: var(--violet-accent);' : ''}">
          <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <button class="action-icon-btn" onclick="editPlaylistTrack('${track.id}')" title="Rename Track">
          <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
        </button>
        <button class="action-icon-btn" onclick="deletePlaylistTrack('${track.id}')" title="Delete Track">
          <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      </div>
    `;
    playlistManagerList.appendChild(row);
  });
}

window.editPlaylistTrack = function(id) {
  const track = playlist.find(t => t.id === id);
  if (!track) return;

  const newTitle = prompt('Edit song title:', track.title);
  if (newTitle === null) return; // Cancelled

  const currentUrl = `https://www.youtube.com/watch?v=${track.id}`;
  const newUrl = prompt('Edit YouTube Video URL:', currentUrl);
  if (newUrl === null) return; // Cancelled

  const wasPlaying = playlistSelect.value === id;
  let updated = false;

  // Title change
  if (newTitle.trim() && newTitle.trim() !== track.title) {
    track.title = newTitle.trim();
    updated = true;
  }

  // URL change
  if (newUrl.trim() && newUrl.trim() !== currentUrl) {
    const ytid = getYtIdFromUrl(newUrl.trim());
    if (!ytid) {
      alert('Invalid YouTube Link. URL update cancelled.');
      return;
    }
    
    // Check if ID already exists on another track
    if (playlist.some(t => t.id === ytid && t.id !== id)) {
      alert('This song/URL already exists in the playlist.');
      return;
    }

    track.id = ytid;
    updated = true;
  }

  if (updated) {
    savePlaylist();
    populatePlaylistSelector();
    renderPlaylistManagerList();

    if (wasPlaying) {
      playTrack(track.id);
    }
    showToast('Track details updated.');
  }
};

window.deletePlaylistTrack = function(id) {
  if (confirm('Are you sure you want to remove this song from the playlist?')) {
    const wasPlaying = playlistSelect.value === id;
    
    playlist = playlist.filter(t => t.id !== id);
    
    if (playlist.length === 0) {
      playlist = [...DEFAULT_PLAYLIST];
    }
    
    savePlaylist();
    populatePlaylistSelector();
    renderPlaylistManagerList();

    if (wasPlaying) {
      playTrack(playlist[0].id);
    }
    showToast('Track deleted.');
  }
};

function savePlaylist() {
  localStorage.setItem('k&l_playlist', JSON.stringify(playlist));
}

// Add custom YouTube track inside the modal form
modalPlaylistAddForm.onsubmit = () => {
  const title = modalAddSongTitle.value.trim();
  const url = modalAddSongUrl.value.trim();
  const ytid = getYtIdFromUrl(url);

  if (!ytid) {
    showToast('Invalid YouTube Link. Please enter a valid URL.');
    return;
  }

  if (playlist.some(t => t.id === ytid)) {
    showToast('Track already exists in the playlist.');
    return;
  }

  const newTrack = { id: ytid, title };
  playlist.push(newTrack);
  savePlaylist();
  
  populatePlaylistSelector();
  renderPlaylistManagerList();
  
  modalPlaylistAddForm.reset();
  showToast('New track added! 🎶');
  playTrack(ytid);
};

// Start loading YouTube script dynamically
(function() {
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})();

window.onYouTubeIframeAPIReady = function() {
  const initialVideo = playlist[0] ? playlist[0].id : '3MFMBC2P8Oc';
  
  ytPlayer = new YT.Player('yt-player', {
    videoId: initialVideo,
    playerVars: {
      playsinline: 1,
      controls: 0,
      disablekb: 1,
      rel: 0,
      modestbranding: 1
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
};

function onPlayerReady() {
  // Setup display title
  const track = playlist[0] || DEFAULT_PLAYLIST[0];
  currentSongTitle.textContent = track.title.split(' - ')[0];
  currentSongArtist.textContent = track.title.split(' - ')[1] || 'Silent Sanctuary';
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    playSvg.style.display = 'none';
    pauseSvg.style.display = 'block';
    vinylDisc.classList.add('playing');
    populatePlaylistSelector();

    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      if (ytPlayer && ytPlayer.getCurrentTime) {
        const cur = ytPlayer.getCurrentTime();
        const dur = ytPlayer.getDuration() || 1;
        const pct = (cur / dur) * 100;
        
        songProgressFill.style.width = `${pct}%`;
        playerTime.textContent = `${formatTime(cur)} / ${formatTime(dur)}`;
      }
    }, 500);
  } else {
    playSvg.style.display = 'block';
    pauseSvg.style.display = 'none';
    vinylDisc.classList.remove('playing');
    populatePlaylistSelector();
    clearInterval(progressInterval);
  }
}

playBtn.onclick = () => {
  if (!ytPlayer) return;
  const state = ytPlayer.getPlayerState();
  if (state === YT.PlayerState.PLAYING) {
    ytPlayer.pauseVideo();
  } else {
    ytPlayer.playVideo();
  }
};

songProgressBar.onclick = (e) => {
  if (!ytPlayer || !ytPlayer.getDuration) return;
  const rect = songProgressBar.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const ratio = clickX / rect.width;
  const targetTime = ytPlayer.getDuration() * ratio;
  ytPlayer.seekTo(targetTime, true);
};

/* ==========================================================================
   6. General UI Helper functions
   ========================================================================== */

function bindFileDragAndDrop() {
  const box = uploadDropzone;
  const input = mediaFileInput;

  box.onclick = () => input.click();
  box.ondragover = (e) => {
    e.preventDefault();
    box.style.borderColor = 'var(--blue-accent)';
  };
  box.ondragleave = () => {
    box.style.borderColor = 'var(--border-color)';
  };
  box.ondrop = (e) => {
    e.preventDefault();
    box.style.borderColor = 'var(--border-color)';
    if (e.dataTransfer.files.length) {
      input.files = e.dataTransfer.files;
      renderFilePreview(input.files[0]);
    }
  };
  input.onchange = () => {
    if (input.files.length) {
      renderFilePreview(input.files[0]);
    }
  };
}

function renderFilePreview(file) {
  uploadPreviewBox.innerHTML = '';
  uploadPreviewBox.style.display = 'block';

  if (file.type.startsWith('image/')) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    uploadPreviewBox.appendChild(img);
  } else if (file.type.startsWith('video/')) {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = true;
    uploadPreviewBox.appendChild(video);
  }
}

function openModal(modal) {
  modal.classList.add('active');
}

function closeModal(modal) {
  modal.classList.remove('active');
  if (modal === loginModal) {
    loginForm.reset();
    loginError.textContent = '';
  }
}

function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.add('active');
  setTimeout(() => {
    toast.classList.remove('active');
  }, 3500);
}

function formatTime(secs) {
  if (isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const opt = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-US', opt);
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

function updateBookScale() {
  // Disabled - mobile responsiveness is handled natively by CSS media query now!
}
