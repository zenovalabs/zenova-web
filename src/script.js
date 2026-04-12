document.documentElement.classList.add('js-ready');

const LANGUAGE_PREFERENCE_KEY = 'zenova_preferred_language';
const CONSENT_CHOICE_KEY = 'zenova_consent_choice';

const toggleBtn = document.getElementById('lang-toggle');
const headerEl = document.querySelector('.site-header');
const navToggle = document.getElementById('nav-toggle');
const cookieBanner = document.getElementById('consent-banner');
const cookieAccept = document.getElementById('consent-accept');
const cookieDecline = document.getElementById('consent-decline');

const currentLang = document.documentElement.lang || 'sk';
const pathname = window.location.pathname;
const isRootEntry = pathname === '/' || pathname === '/index.html';
const browserPrefersSlovak =
  (navigator.languages || [])
    .concat(navigator.language || [])
    .some((value) => String(value).toLowerCase().startsWith('sk'));

const getStoredLanguage = () => {
  try {
    return window.localStorage.getItem(LANGUAGE_PREFERENCE_KEY);
  } catch (err) {
    return null;
  }
};

const setStoredLanguage = (value) => {
  try {
    window.localStorage.setItem(LANGUAGE_PREFERENCE_KEY, value);
  } catch (err) {
    // Ignore storage failures.
  }
};

const maybeRedirectRootLocale = () => {
  if (!isRootEntry || currentLang !== 'sk') {
    return;
  }

  const preferred = getStoredLanguage();
  if (preferred === 'en') {
    window.location.replace('/en/');
    return;
  }

  if (!preferred && !browserPrefersSlovak) {
    window.location.replace('/en/');
  }
};

const applyStagger = () => {
  document.querySelectorAll('.stagger').forEach((group) => {
    let visibleIndex = 0;
    Array.from(group.children).forEach((child) => {
      if (window.getComputedStyle(child).display === 'none') {
        child.style.removeProperty('--stagger');
        return;
      }
      child.style.setProperty('--stagger', visibleIndex);
      visibleIndex += 1;
    });
  });
};

const setNavState = (isOpen) => {
  if (!headerEl || !navToggle) {
    return;
  }
  headerEl.classList.toggle('nav-open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
};

if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    const targetLang = toggleBtn.dataset.targetLang;
    if (targetLang === 'sk' || targetLang === 'en') {
      setStoredLanguage(targetLang);
    }
  });
}

if (navToggle && headerEl) {
  navToggle.addEventListener('click', () => {
    const isOpen = !headerEl.classList.contains('nav-open');
    setNavState(isOpen);
  });

  document.querySelectorAll('.site-nav a, .nav-cta a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        setNavState(false);
      }
    });
  });
}

const updateHeaderState = () => {
  if (!headerEl) {
    return;
  }
  headerEl.classList.toggle('is-compact', window.scrollY > 20);
};

let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      updateHeaderState();
      scrollTicking = false;
    });
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 900) {
    setNavState(false);
  }
});

const setChoiceCookie = (value) => {
  try {
    document.cookie = `${CONSENT_CHOICE_KEY}=${value};path=/;max-age=${60 * 60 * 24 * 365}`;
  } catch (err) {
    // Ignore cookie errors.
  }
};

const getChoiceCookie = () => {
  try {
    return document.cookie
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${CONSENT_CHOICE_KEY}=`))
      ?.split('=')[1];
  } catch (err) {
    return null;
  }
};

const ensureGtag = () => {
  if (typeof window.dataLayer === 'undefined') {
    window.dataLayer = [];
  }
  if (typeof window.gtag !== 'function') {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }
};

const updateConsent = (value) => {
  ensureGtag();
  const gaId = window.GA_ID || 'G-W93VQRBXYL';
  if (value === 'accepted') {
    window.gtag('consent', 'update', { ad_storage: 'denied', analytics_storage: 'granted' });
    window.gtag('config', gaId);
  } else if (value === 'declined') {
    window.gtag('consent', 'update', { ad_storage: 'denied', analytics_storage: 'denied' });
  }
};

const updateCookieBanner = () => {
  if (!cookieBanner) {
    return;
  }

  cookieBanner.classList.remove('hidden');
  try {
    const choice = window.localStorage.getItem(CONSENT_CHOICE_KEY) || getChoiceCookie();
    const hasChoice = Boolean(choice);
    cookieBanner.classList.toggle('hidden', hasChoice);
    if (choice) {
      updateConsent(choice);
    }
  } catch (err) {
    cookieBanner.classList.remove('hidden');
  }
};

const setCookieChoice = (value) => {
  if (!cookieBanner) {
    return;
  }

  try {
    window.localStorage.setItem(CONSENT_CHOICE_KEY, value);
  } catch (err) {
    // Ignore storage errors.
  }
  setChoiceCookie(value);
  cookieBanner.classList.add('hidden');
  updateConsent(value);
};

if (cookieAccept) {
  cookieAccept.addEventListener('click', () => {
    setCookieChoice('accepted');
  });
}

if (cookieDecline) {
  cookieDecline.addEventListener('click', () => {
    setCookieChoice('declined');
  });
}

maybeRedirectRootLocale();
applyStagger();
updateHeaderState();
updateCookieBanner();

const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
