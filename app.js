/* ==========================================================================
   Aura Glow — Interactive Application State & Controller Logic
   ========================================================================== */

// Global State Object
const state = {
  currentScreen: 'splash',
  wireframeMode: false,
  activeOnboardingSlide: 0,
  currentUser: {
    name: 'Sophia Sterling',
    email: 'sophia@example.com',
    avatar: 'S'
  },
  selectedCategory: 'All',
  selectedService: null,
  selectedStylist: 'Amara',
  selectedDate: '21',
  selectedTimeSlot: '11:30 AM',
  lastBookingId: null,
  bookings: [],
  theme: 'dark',
  isAdmin: true
};

// Mock Treatments Database
const treatments = [
  {
    id: 't-hydrafacial',
    name: 'Luxury HydraFacial',
    category: 'Facial',
    price: 80,
    duration: '45 mins',
    rating: '4.9',
    reviewCount: '142',
    icon: '✨',
    bgImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=120',
    description: 'A premium facial purification that hydrates the epidermal layers using a proprietary suction and skin-infused serum formula.'
  },
  {
    id: 't-hairritual',
    name: 'Aura Signature Hair Ritual',
    category: 'Hair',
    price: 110,
    duration: '60 mins',
    rating: '5.0',
    reviewCount: '98',
    icon: '💇‍♀️',
    bgImage: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=120',
    description: 'Deep cleansing hair mask combined with hot oil treatments and customizable styling cuts administered by our senior stylist.'
  },
  {
    id: 't-nailart',
    name: 'Amethyst Luxury Manicure',
    category: 'Nails',
    price: 65,
    duration: '40 mins',
    rating: '4.8',
    reviewCount: '76',
    icon: '💅',
    bgImage: 'https://images.unsplash.com/photo-1604654894610-df4906b241af?auto=format&fit=crop&q=80&w=120',
    description: 'Nail shaping, cuticle restoration, organic oils rub-down and elite chip-resistant amethyst glow gel styling.'
  },
  {
    id: 't-massage',
    name: 'Radiant Glow Body Therapy',
    category: 'Massage',
    price: 140,
    duration: '75 mins',
    rating: '4.9',
    reviewCount: '210',
    icon: '🧖‍♀️',
    bgImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=120',
    description: 'A soothing volcanic basalt warm stone massage designed to decompress muscle tissue and leave the skin feeling radiant.'
  }
];

// Screen mapping to UX steps for auto-scrolling guide highlights
const screenToStepMap = {
  'splash': 'step-1',
  'onboarding': 'step-6',
  'auth': 'step-7',
  'home': 'step-8',
  'service': 'step-9',
  'booking': 'step-10',
  'payment': 'step-10',
  'confirm': 'step-11',
  'profile': 'step-12',
  'admin': 'step-12'
};

/* ==========================================================================
   Initialization
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initLocalStorage();
  loadServicesList();
  renderCalendar();
  
  // Set default active states
  state.selectedService = treatments[0];
  updateServiceDetailsScreen();
  updateBookingSummaryFooter();
  refreshHistoryList();
  
  // High fidelity default setting
  const chassis = document.querySelector('.phone-chassis');
  chassis.classList.add('hi-fi-active');

  // Load user data from state
  updateUserInterfaceElements();
});

// Update the simulator clock every second
function initClock() {
  const updateTime = () => {
    const timeEl = document.getElementById('phoneTime');
    if (timeEl) {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      hours = hours < 10 ? '0' + hours : hours;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      timeEl.textContent = `${hours}:${minutes}`;
    }
  };
  updateTime();
  setInterval(updateTime, 1000);
}

// Local Storage Setup (Populate initial past bookings if clean)
function initLocalStorage() {
  const localBookings = localStorage.getItem('auraglow_bookings');
  if (localBookings) {
    state.bookings = JSON.parse(localBookings);
  } else {
    // Add default past items to make history look realistic and satisfying
    state.bookings = [
      {
        id: 'AG-9830219',
        serviceName: 'Amethyst Luxury Manicure',
        stylist: 'Nadia (Nail Stylist)',
        date: 'April 14th, 2026',
        time: '02:00 PM',
        price: '$65.00',
        status: 'completed'
      },
      {
        id: 'AG-9104882',
        serviceName: 'Aura Signature Hair Ritual',
        stylist: 'Julian (Hair Artist)',
        date: 'May 02nd, 2026',
        time: '10:30 AM',
        price: '$110.00',
        status: 'completed'
      }
    ];
    saveBookingsToLocalStorage();
  }
}

function saveBookingsToLocalStorage() {
  localStorage.setItem('auraglow_bookings', JSON.stringify(state.bookings));
}

/* ==========================================================================
   Navigation Engine
   ========================================================================== */
function navigateTo(screenId) {
  // Hide all screens
  const screens = document.querySelectorAll('.screen-container');
  screens.forEach(s => s.classList.remove('active'));

  // Show target screen
  const targetScreen = document.getElementById(`screen-${screenId}`);
  if (targetScreen) {
    targetScreen.classList.add('active');
    state.currentScreen = screenId;
  }

  // Update simulator navigation bar highlights
  updateBottomNavBarHighlight(screenId);

  // Sync scroll guide to corresponding step
  syncGuidePaneToScreen(screenId);
}

function updateBottomNavBarHighlight(screenId) {
  const navBar = document.getElementById('phoneNavBar');
  const navItems = document.querySelectorAll('.phone-nav-item');
  
  // Hide/Show navigation bar depending on context (e.g. hide on splash/onboarding/auth/confirm)
  const noNavScreens = ['splash', 'onboarding', 'auth', 'confirm', 'payment', 'admin'];
  if (noNavScreens.includes(screenId)) {
    navBar.style.display = 'none';
  } else {
    navBar.style.display = 'grid';
  }

  // Set active class
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.id === `nav-${screenId}`) {
      item.classList.add('active');
    }
  });
}

/* ==========================================================================
   Guide Linkage Functions
   ========================================================================== */
function syncGuidePaneToScreen(screenId) {
  const stepId = screenToStepMap[screenId];
  if (!stepId) return;

  const targetStep = document.getElementById(stepId);
  const allSteps = document.querySelectorAll('.timeline-step');

  // Highlight step card in explorer
  allSteps.forEach(step => step.classList.remove('highlighted'));
  if (targetStep) {
    targetStep.classList.add('highlighted');
    
    // Smooth scroll the explorer container
    const guidePane = document.getElementById('guidePane');
    const offsetTop = targetStep.offsetTop - guidePane.offsetTop - 20;
    guidePane.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }
}

// Jumping simulator to screen when step is clicked in guide
function linkStepToScreen(screenId) {
  navigateTo(screenId);
  
  // If moving to guide on mobile, slide back into display
  switchMobileTab('prototype');
}

/* ==========================================================================
   Onboarding Flow Carousel (Step 6)
   ========================================================================== */
function nextOnboardingSlide() {
  const maxSlides = 3;
  const nextSlide = state.activeOnboardingSlide + 1;

  if (nextSlide >= maxSlides) {
    // Navigate to auth
    navigateTo('auth');
  } else {
    // Transition slides
    const currentSlideEl = document.getElementById(`slide-${state.activeOnboardingSlide}`);
    const currentDotEl = document.getElementById(`dot-${state.activeOnboardingSlide}`);
    
    currentSlideEl.classList.remove('active');
    currentDotEl.classList.remove('active');

    state.activeOnboardingSlide = nextSlide;

    const nextSlideEl = document.getElementById(`slide-${state.activeOnboardingSlide}`);
    const nextDotEl = document.getElementById(`dot-${state.activeOnboardingSlide}`);

    nextSlideEl.classList.add('active');
    nextDotEl.classList.add('active');

    // Change onboarding next button icon on last slide
    const nextIcon = document.getElementById('onboardingNextIcon');
    if (state.activeOnboardingSlide === maxSlides - 1) {
      nextIcon.className = 'fa-solid fa-check';
    } else {
      nextIcon.className = 'fa-solid fa-chevron-right';
    }
  }
}

/* ==========================================================================
   Auth Handling (Step 7)
   ========================================================================== */
function toggleAuthTab(tab) {
  const tabs = document.querySelectorAll('.auth-tab-btn');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  tabs.forEach(t => t.classList.remove('active'));
  document.querySelector(`.auth-tab-btn[data-tab="${tab}"]`).classList.add('active');

  if (tab === 'login') {
    loginForm.style.display = 'flex';
    signupForm.style.display = 'none';
  } else {
    loginForm.style.display = 'none';
    signupForm.style.display = 'flex';
  }
}

function handleAuthSubmit(event, type) {
  event.preventDefault();
  
  if (type === 'signup') {
    const nameVal = document.getElementById('signupName').value.trim();
    if (nameVal) {
      state.currentUser.name = nameVal;
      state.currentUser.email = nameVal.toLowerCase().replace(/\s+/g, '') + '@example.com';
      state.currentUser.avatar = nameVal.charAt(0).toUpperCase();
    }
  }

  // Update UI and navigate to dashboard
  updateUserInterfaceElements();
  showToastNotification('Secure Login Success!', 'Synchronizing your premium beauty cards...', 'success');
  
  setTimeout(() => {
    navigateTo('home');
  }, 1000);
}

function handleLogout() {
  state.currentUser = {
    name: 'Guest Member',
    email: 'guest@auraglow.com',
    avatar: 'G'
  };
  updateUserInterfaceElements();
  navigateTo('auth');
  showToastNotification('Logged Out Safely', 'Session cleaned successfully.', 'info');
}

function updateUserInterfaceElements() {
  // Update dashboard details
  document.getElementById('homeUsernameDisplay').textContent = state.currentUser.name;
  document.getElementById('homeUserAvatar').textContent = state.currentUser.avatar;
  
  // Update profile details
  document.getElementById('profileUsernameDisplay').textContent = state.currentUser.name;
  document.getElementById('profileEmailDisplay').textContent = state.currentUser.email;
  document.getElementById('profileUserAvatar').textContent = state.currentUser.avatar;
}

/* ==========================================================================
   Services Grid Loader & Category Badges (Step 8 & 9)
   ========================================================================== */
function loadServicesList() {
  const container = document.getElementById('servicesGridContainer');
  if (!container) return;

  container.innerHTML = '';

  const filtered = treatments.filter(t => state.selectedCategory === 'All' || t.category === state.selectedCategory);

  filtered.forEach(t => {
    const card = document.createElement('div');
    card.className = 'popular-card';
    card.onclick = () => selectServiceItem(t);

    card.innerHTML = `
      <div class="popular-img-wire">${t.icon}</div>
      <div class="popular-info">
        <div>
          <h4 class="popular-name">${t.name}</h4>
          <span style="font-size: 10px; color: hsl(var(--text-secondary));">${t.duration} • Aura Exclusive</span>
        </div>
        <div class="popular-meta">
          <span class="popular-price">$${t.price}</span>
          <span class="popular-rating"><i class="fa-solid fa-star"></i> ${t.rating}</span>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function filterServices(category) {
  // Set active pills
  const pills = document.querySelectorAll('.category-pill');
  pills.forEach(p => {
    p.classList.remove('active');
    if (p.textContent.includes(category)) {
      p.classList.add('active');
    }
  });

  state.selectedCategory = category;
  loadServicesList();
}

function selectServiceItem(treatment) {
  state.selectedService = treatment;
  updateServiceDetailsScreen();
  updateBookingSummaryFooter();
  navigateTo('service');
}

function updateServiceDetailsScreen() {
  const t = state.selectedService;
  if (!t) return;

  document.getElementById('serviceDetailsTitle').textContent = t.name;
  document.getElementById('serviceDetailsCategory').textContent = t.category;
  document.getElementById('serviceDetailsDuration').textContent = t.duration;
  document.getElementById('serviceDetailsRating').textContent = `${t.rating} (${t.reviewCount}+)`;
  document.getElementById('serviceDetailsDesc').textContent = t.description;
  document.getElementById('serviceDetailsPrice').textContent = `$${t.price}`;
  
  // Set real unsplash photos dynamically inside selector when active
  const heroImg = document.getElementById('serviceHeroImg');
  heroImg.style.backgroundImage = `url('${t.bgImage}')`;
}

function selectStylist(name, element) {
  const cards = document.querySelectorAll('.stylist-card');
  cards.forEach(c => c.classList.remove('active'));
  element.classList.add('active');
  state.selectedStylist = name;
  
  updateBookingSummaryFooter();
}

/* ==========================================================================
   Calendar Generator (Step 10)
   ========================================================================== */
function renderCalendar() {
  const grid = document.getElementById('calendarDaysGrid');
  if (!grid) return;

  // Clear previous days (keep week header rows 0-6)
  const days = grid.querySelectorAll('.cal-day');
  days.forEach(d => d.remove());

  // Generate calendar days for May 2026 (May starts on Friday = offset 4 days in grid)
  const offset = 4;
  const daysInMonth = 31;

  // Empty padding cells
  for (let i = 0; i < offset; i++) {
    const pad = document.createElement('div');
    pad.className = 'cal-day disabled';
    pad.textContent = '';
    grid.appendChild(pad);
  }

  // Active slots days
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    cell.className = 'cal-day';
    
    // Disable past simulated days (assuming today is May 19th, 2026)
    if (d < 19) {
      cell.classList.add('disabled');
    }
    
    if (String(d) === state.selectedDate) {
      cell.classList.add('active');
    }

    cell.textContent = d;
    cell.onclick = () => {
      if (d >= 19) {
        selectCalendarDate(d, cell);
      }
    };

    grid.appendChild(cell);
  }
}

function selectCalendarDate(date, element) {
  const allDays = document.querySelectorAll('.cal-day');
  allDays.forEach(d => d.classList.remove('active'));
  
  element.classList.add('active');
  state.selectedDate = String(date);
  
  updateBookingSummaryFooter();
}

function selectTimeSlot(time, element) {
  const buttons = document.querySelectorAll('.slot-btn');
  buttons.forEach(b => b.classList.remove('active'));
  element.classList.add('active');
  
  state.selectedTimeSlot = time;
  updateBookingSummaryFooter();
}

function updateBookingSummaryFooter() {
  const footerEl = document.getElementById('bookingSummaryDetails');
  if (footerEl) {
    footerEl.textContent = `May ${state.selectedDate}th, ${state.selectedTimeSlot} (${state.selectedStylist})`;
  }
}

/* ==========================================================================
   Booking & Receipts Flow (Step 11 & 12)
   ========================================================================== */
function confirmBooking() {
  // Generate random order ID
  const bookingId = 'AG-' + Math.floor(1000000 + Math.random() * 9000000);
  state.lastBookingId = bookingId;

  // Get full stylist name with role
  let fullStylistName = 'Amara (Skin Expert)';
  if (state.selectedStylist === 'Julian') fullStylistName = 'Julian (Hair Artist)';
  if (state.selectedStylist === 'Nadia') fullStylistName = 'Nadia (Nail Stylist)';

  const newBooking = {
    id: bookingId,
    serviceName: state.selectedService.name,
    stylist: fullStylistName,
    date: `May ${state.selectedDate}th, 2026`,
    time: state.selectedTimeSlot,
    price: `$${state.selectedService.price}.00`,
    status: 'confirmed'
  };

  // Push to local state and update localstorage
  state.bookings.unshift(newBooking);
  saveBookingsToLocalStorage();

  // Populate receipt screen slots
  document.getElementById('confirmReceiptID').textContent = bookingId;
  document.getElementById('confirmReceiptService').textContent = newBooking.serviceName;
  document.getElementById('confirmReceiptStylist').textContent = newBooking.stylist;
  document.getElementById('confirmReceiptDate').textContent = newBooking.date;
  document.getElementById('confirmReceiptTime').textContent = newBooking.time;
  document.getElementById('confirmReceiptPrice').textContent = newBooking.price;

  // Show Toast
  showToastNotification('Appointment Booked!', `Your slot on May ${state.selectedDate}th has been secured.`, 'success');

  // Trigger sound indicator (subtle modern synth wave / pop)
  triggerMockSound();

  // Load upcoming elements into Home
  displayUpcomingBookingOnDashboard(newBooking);

  // Refresh lists
  refreshHistoryList();

  // Transition to confirmation screen
  navigateTo('confirm');
}

function displayUpcomingBookingOnDashboard(booking) {
  const banner = document.getElementById('upcomingBanner');
  const serviceText = document.getElementById('upcomingBannerService');
  const timeText = document.getElementById('upcomingBannerTime');

  if (banner && serviceText && timeText) {
    serviceText.textContent = booking.serviceName;
    timeText.textContent = `${booking.date} @ ${booking.time}`;
    banner.style.display = 'flex';
  }
}

function refreshHistoryList() {
  const container = document.getElementById('upcomingHistoryList');
  if (!container) return;

  container.innerHTML = '';

  state.bookings.forEach(b => {
    const card = document.createElement('div');
    card.className = 'history-card';
    
    card.innerHTML = `
      <div class="history-info">
        <span class="history-service">${b.serviceName}</span>
        <span class="history-meta">${b.date} at ${b.time} • ${b.stylist}</span>
      </div>
      <span class="history-status-badge ${b.status}">${b.status.toUpperCase()}</span>
    `;

    container.appendChild(card);
  });
}

/* ==========================================================================
   Aesthetics and Interactive Utilities
   ========================================================================== */
function toggleWireframeMode() {
  const chassis = document.querySelector('.phone-chassis');
  const btn = document.getElementById('wireframeToggleBtn');

  state.wireframeMode = !state.wireframeMode;

  if (state.wireframeMode) {
    chassis.classList.remove('hi-fi-active');
    chassis.classList.add('wireframe-mode');
    btn.innerHTML = `<i class="fa-solid fa-image"></i> <span>Toggle High-Fi UI</span>`;
    showToastNotification('Low-Fi Wireframe Active', 'Styling tokens disabled.', 'info');
  } else {
    chassis.classList.remove('wireframe-mode');
    chassis.classList.add('hi-fi-active');
    btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Toggle Wireframe</span>`;
    showToastNotification('High-Fi Premium Active', 'Visual design system fully enabled.', 'success');
  }
}

// Toast System
function showToastNotification(title, message, type = 'success') {
  const toast = document.getElementById('appNotificationToast');
  const titleEl = document.getElementById('notifToastTitle');
  const descEl = document.getElementById('notifToastDesc');

  if (toast && titleEl && descEl) {
    titleEl.textContent = title;
    descEl.textContent = message;
    
    // Set custom icon colors
    const icon = toast.querySelector('i');
    if (type === 'success') {
      icon.className = 'fa-solid fa-circle-check';
      icon.style.color = '#1D9A4C';
    } else if (type === 'info') {
      icon.className = 'fa-solid fa-circle-info';
      icon.style.color = '#DE8E30';
    }

    // Slide up
    toast.style.bottom = '30px';

    // Slide down after 3.5s
    setTimeout(() => {
      toast.style.bottom = '-100px';
    }, 3500);
  }
}

function triggerMockNotification() {
  const userFirst = state.currentUser.name.split(' ')[0];
  showToastNotification(`Alert for ${userFirst}`, 'Special Offer: Claim 20% loyalty credits on therapies today!', 'info');
}

function triggerMockSound() {
  // Web Audio Context synth sound for interactive confirmation "ping"
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    
    // Luxury elegant chord ping (F5 to C6)
    oscillator.frequency.setValueAtTime(698.46, audioCtx.currentTime); // F5
    gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
    
    oscillator.start();
    
    // Frequency slide
    oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.15); // C6
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
    
    oscillator.stop(audioCtx.currentTime + 0.4);
  } catch (e) {
    console.log("Audio not supported or interaction blocked.");
  }
}

/* ==========================================================================
   Payment Flow (Expansion)
   ========================================================================== */
function proceedToPayment() {
  const price = `$${state.selectedService.price}.00`;
  document.getElementById('paymentTotalDisplay').textContent = price;
  navigateTo('payment');
}

function updateCardDisplay(input) {
  let val = input.value.replace(/\D/g, '');
  if (val.length > 16) val = val.substring(0, 16);
  
  // Format with spaces
  let formatted = '';
  for (let i = 0; i < val.length; i++) {
    if (i > 0 && i % 4 === 0) formatted += ' ';
    formatted += val[i];
  }
  input.value = formatted;
  
  document.getElementById('ccDisplay').textContent = formatted || '•••• •••• •••• ••••';
  document.getElementById('ccNameDisplay').textContent = state.currentUser.name;
}

function processPayment(event, isQuickPay = false) {
  if (event) event.preventDefault();
  
  showToastNotification('Processing Payment...', 'Please wait securely validating.', 'info');
  
  setTimeout(() => {
    confirmBooking();
  }, 1200);
}

/* ==========================================================================
   Admin Dashboard (Expansion)
   ========================================================================== */
function openAdminDashboard() {
  // Calculate total revenue and bookings
  let rev = 0;
  state.bookings.forEach(b => {
    rev += parseInt(b.price.replace(/[^0-9]/g, ''));
  });
  
  document.getElementById('adminTotalBookings').textContent = state.bookings.length;
  document.getElementById('adminTotalRevenue').textContent = `$${rev}.00`;
  
  const tbody = document.getElementById('adminTableBody');
  if (tbody) {
    tbody.innerHTML = '';
    state.bookings.forEach(b => {
      tbody.innerHTML += `
        <tr>
          <td style="font-weight: 600; color: #fff;">${b.serviceName.substring(0, 15)}...</td>
          <td style="color: hsl(var(--text-secondary));">${b.date.split(',')[0]}</td>
          <td><span style="background: hsl(var(--accent-green)); color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 8px;">${b.status}</span></td>
        </tr>
      `;
    });
  }
  
  navigateTo('admin');
}

/* ==========================================================================
   Theme Engine (Expansion)
   ========================================================================== */
function toggleTheme(themeName) {
  state.theme = themeName;
  document.documentElement.setAttribute('data-theme', themeName);
  
  if (themeName === 'light') {
    showToastNotification('Light Mode Active', 'Switched to clean daytime aesthetics.', 'info');
  } else if (themeName === 'rosegold') {
    showToastNotification('Rose Gold Active', 'Switched to premium rose gold aesthetics.', 'info');
  } else {
    document.documentElement.removeAttribute('data-theme');
    showToastNotification('Midnight Mode Active', 'Switched to classic midnight aesthetics.', 'info');
  }
}

/* ==========================================================================
   Responsive Tablet/Mobile Switcher
   ========================================================================== */
function switchMobileTab(tab) {
  const tabProto = document.getElementById('tabBtnProto');
  const tabGuide = document.getElementById('tabBtnGuide');
  const paneProto = document.getElementById('phonePane');
  const paneGuide = document.getElementById('guidePane');

  if (tab === 'prototype') {
    tabProto.classList.add('active');
    tabGuide.classList.remove('active');
    paneProto.classList.remove('hidden-tab');
    paneGuide.classList.add('hidden-tab');
  } else {
    tabProto.classList.remove('active');
    tabGuide.classList.add('active');
    paneProto.classList.add('hidden-tab');
    paneGuide.classList.remove('hidden-tab');
  }
}
