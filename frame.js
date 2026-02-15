/* ==========================================================================
   mobile-device-frames — DeviceFrame class, navigation, responsive logic
   v1.0.0 | MIT License | github.com/phucsystem/mobile-device-frames
   ========================================================================== */

const DEVICES = {
  'iphone-16-pro-max': { width: 430, height: 932, radius: 55, notch: 'dynamic-island', home: true },
  'iphone-16-pro':     { width: 393, height: 852, radius: 55, notch: 'dynamic-island', home: true },
  'iphone-16':         { width: 390, height: 844, radius: 47, notch: 'notch',           home: true },
  'iphone-se':         { width: 375, height: 667, radius: 0,  notch: 'none',            home: false },
  'galaxy-s24-ultra':  { width: 412, height: 915, radius: 48, notch: 'punch-hole',      home: true },
  'galaxy-s24':        { width: 360, height: 780, radius: 42, notch: 'punch-hole',      home: true },
  'pixel-9-pro':       { width: 412, height: 892, radius: 44, notch: 'punch-hole',      home: true },
  'pixel-9':           { width: 393, height: 851, radius: 42, notch: 'punch-hole',      home: true },
};

const DEFAULT_DEVICE = 'iphone-16-pro';

class DeviceFrame {
  constructor(config = {}) {
    const userConfig = window.DeviceFrameConfig || {};
    this.config = { ...userConfig, ...config };
    this.device = this.config.device || DEFAULT_DEVICE;
    this.orientation = this.config.orientation || 'portrait';
    this.title = this.config.title || '';
    this.screens = this.config.screens || [];
    this.url = this.config.url || '';
    this.accentColor = this.config.accentColor || '#1976D2';
    this.targetEl = null;
    this.iframeEl = null;
    this._savedContent = null;
    this.navOpen = true;
  }

  init() {
    this.targetEl = document.querySelector('[data-device]');
    if (!this.targetEl) return;

    const attrDevice = this.targetEl.getAttribute('data-device');
    if (attrDevice && attrDevice !== 'auto' && DEVICES[attrDevice]) {
      this.device = attrDevice;
    }

    const attrUrl = this.targetEl.getAttribute('data-url');
    if (attrUrl) {
      this.url = attrUrl;
    }

    const attrOrientation = this.targetEl.getAttribute('data-orientation');
    if (attrOrientation === 'landscape' || attrOrientation === 'portrait') {
      this.orientation = attrOrientation;
    }

    this.wrapContent();
    this.renderNotch();
    this.renderHomeIndicator();
    this.renderButtons();

    if (this.screens.length > 0) {
      this.buildNavigation();
    }

    this.setupAnimations();
    this.setupResponsive();
  }

  wrapContent() {
    const stage = document.createElement('div');
    stage.className = 'df-stage';

    const frame = document.createElement('div');
    frame.className = 'df-frame';
    frame.setAttribute('data-device', this.device);
    if (this.orientation === 'landscape') {
      frame.setAttribute('data-orientation', 'landscape');
    }

    const screen = document.createElement('div');
    screen.className = 'df-screen';

    if (this.url) {
      this._renderIframe(screen, this.url);
    } else {
      while (this.targetEl.firstChild) {
        screen.appendChild(this.targetEl.firstChild);
      }
    }

    frame.appendChild(screen);
    stage.appendChild(frame);

    this.targetEl.parentNode.replaceChild(stage, this.targetEl);

    this.stageEl = stage;
    this.frameEl = frame;
    this.screenEl = screen;
  }

  _renderIframe(container, url) {
    const loading = document.createElement('div');
    loading.className = 'df-iframe-loading';
    loading.innerHTML = '<div class="df-iframe-spinner"></div>';
    container.appendChild(loading);

    const iframe = document.createElement('iframe');
    iframe.className = 'df-iframe';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('allowfullscreen', '');
    iframe.src = url;

    iframe.addEventListener('load', () => {
      loading.classList.add('hidden');
      setTimeout(() => loading.remove(), 300);
    });

    iframe.addEventListener('error', () => {
      loading.remove();
      this._renderIframeError(container, url);
    });

    container.appendChild(iframe);
    this.iframeEl = iframe;
  }

  _renderIframeError(container, url) {
    const existing = container.querySelector('.df-iframe-error');
    if (existing) existing.remove();

    const errorEl = document.createElement('div');
    errorEl.className = 'df-iframe-error';
    errorEl.innerHTML = `
      <div class="df-iframe-error-icon">!</div>
      <div class="df-iframe-error-text">Unable to load this URL. The site may block iframe embedding (X-Frame-Options).</div>
      <div class="df-iframe-error-url">${url}</div>
    `;
    container.appendChild(errorEl);
  }

  loadUrl(url) {
    if (!this.screenEl) return;
    this.url = url;

    if (url) {
      if (!this._savedContent) {
        this._savedContent = document.createDocumentFragment();
        while (this.screenEl.firstChild) {
          this._savedContent.appendChild(this.screenEl.firstChild);
        }
      } else {
        this.screenEl.innerHTML = '';
      }
      this._renderIframe(this.screenEl, url);
    } else {
      this.screenEl.innerHTML = '';
      this.iframeEl = null;
      if (this._savedContent) {
        this.screenEl.appendChild(this._savedContent);
        this._savedContent = null;
      }
    }
  }

  renderNotch() {
    const spec = DEVICES[this.device];
    if (!spec || spec.notch === 'none') return;

    const notch = document.createElement('div');
    notch.className = `df-notch--${spec.notch}`;
    this.frameEl.appendChild(notch);
  }

  renderHomeIndicator() {
    const spec = DEVICES[this.device];
    if (!spec || !spec.home) return;

    const indicator = document.createElement('div');
    indicator.className = 'df-home-indicator';
    this.frameEl.appendChild(indicator);
  }

  renderButtons() {
    const spec = DEVICES[this.device];
    if (!spec || spec.notch === 'none') return;

    const power = document.createElement('div');
    power.className = 'df-btn-power';
    this.frameEl.appendChild(power);

    const volUp = document.createElement('div');
    volUp.className = 'df-btn-volume-up';
    this.frameEl.appendChild(volUp);

    const volDown = document.createElement('div');
    volDown.className = 'df-btn-volume-down';
    this.frameEl.appendChild(volDown);
  }

  buildNavigation() {
    const currentFile = window.location.pathname.split('/').pop() || '';
    const isMobile = window.matchMedia('(max-width: 500px)').matches;

    if (isMobile) {
      this._buildMobileNav(currentFile);
    } else {
      this._buildDesktopNav(currentFile);
      this._buildToggleButton();
    }
  }

  _buildDesktopNav(currentFile) {
    const nav = document.createElement('nav');
    nav.className = 'df-nav';

    if (this.title) {
      const titleEl = document.createElement('div');
      titleEl.className = 'df-nav-title';
      titleEl.textContent = this.title;
      nav.appendChild(titleEl);
    }

    this.screens.forEach(section => {
      const groupLabel = document.createElement('span');
      groupLabel.className = 'df-nav-label';
      groupLabel.textContent = section.group;
      nav.appendChild(groupLabel);

      section.items.forEach(screen => {
        const link = document.createElement('a');
        link.href = screen.file;
        link.textContent = screen.label;
        if (currentFile === screen.file) {
          link.className = 'active';
        }
        nav.appendChild(link);
      });
    });

    document.body.insertBefore(nav, document.body.firstChild);
    document.body.classList.add('df-has-nav');
    this.navEl = nav;
  }

  _buildToggleButton() {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'df-nav-toggle';
    toggleBtn.setAttribute('aria-label', 'Toggle navigation');
    toggleBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    document.body.appendChild(toggleBtn);

    toggleBtn.addEventListener('click', () => {
      this.navOpen = !this.navOpen;
      if (this.navEl) {
        this.navEl.style.transform = this.navOpen ? 'translateX(0)' : 'translateX(-100%)';
      }
      document.body.style.paddingLeft = this.navOpen ? '' : '0';
    });
  }

  _buildMobileNav(currentFile) {
    const fab = document.createElement('button');
    fab.className = 'df-nav-fab';
    fab.setAttribute('aria-label', 'Screen navigation');
    fab.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    document.body.appendChild(fab);

    const overlay = document.createElement('div');
    overlay.className = 'df-nav-overlay';

    const backdrop = document.createElement('div');
    backdrop.className = 'df-nav-overlay-backdrop';
    overlay.appendChild(backdrop);

    const sheet = document.createElement('div');
    sheet.className = 'df-nav-overlay-sheet';

    const handle = document.createElement('div');
    handle.className = 'df-nav-overlay-handle';
    sheet.appendChild(handle);

    const sheetTitle = document.createElement('div');
    sheetTitle.className = 'df-nav-overlay-title';
    sheetTitle.textContent = this.title || 'Screens';
    sheet.appendChild(sheetTitle);

    const sheetList = document.createElement('div');
    sheetList.className = 'df-nav-overlay-list';

    this.screens.forEach(section => {
      const groupLabel = document.createElement('div');
      groupLabel.className = 'df-nav-overlay-group';
      groupLabel.textContent = section.group;
      sheetList.appendChild(groupLabel);

      section.items.forEach(screen => {
        const link = document.createElement('a');
        link.href = screen.file;
        link.className = 'df-nav-overlay-link';
        if (currentFile === screen.file) {
          link.classList.add('active');
        }
        link.textContent = screen.label;
        sheetList.appendChild(link);
      });
    });

    sheet.appendChild(sheetList);
    overlay.appendChild(sheet);
    document.body.appendChild(overlay);

    const openNav = () => overlay.classList.add('open');
    const closeNav = () => overlay.classList.remove('open');

    fab.addEventListener('click', openNav);
    backdrop.addEventListener('click', closeNav);
    handle.addEventListener('click', closeNav);
  }

  setupAnimations() {
    const animateEls = document.querySelectorAll('[data-animate]');
    animateEls.forEach((element, elementIndex) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(12px)';

      const delay = elementIndex * 80;
      setTimeout(() => {
        element.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, delay);
    });
  }

  setupResponsive() {
    const mobileQuery = window.matchMedia('(max-width: 500px)');

    const handleChange = (event) => {
      if (event.matches && this.navEl) {
        this.navEl.style.display = 'none';
      } else if (this.navEl) {
        this.navEl.style.display = '';
      }
    };

    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener('change', handleChange);
    }
  }

  setOrientation(orientation) {
    if (orientation !== 'portrait' && orientation !== 'landscape') return;
    if (!this.frameEl) return;
    this.orientation = orientation;
    if (orientation === 'landscape') {
      this.frameEl.setAttribute('data-orientation', 'landscape');
    } else {
      this.frameEl.removeAttribute('data-orientation');
    }
  }

  toggleOrientation() {
    this.setOrientation(this.orientation === 'portrait' ? 'landscape' : 'portrait');
    return this.orientation;
  }

  switchDevice(deviceId) {
    if (!DEVICES[deviceId] || !this.frameEl) return;
    this.device = deviceId;
    this.frameEl.setAttribute('data-device', deviceId);

    const oldNotch = this.frameEl.querySelector('[class^="df-notch"]');
    if (oldNotch) oldNotch.remove();

    const oldIndicator = this.frameEl.querySelector('.df-home-indicator');
    if (oldIndicator) oldIndicator.remove();

    const oldPower = this.frameEl.querySelector('.df-btn-power');
    if (oldPower) oldPower.remove();
    const oldVolUp = this.frameEl.querySelector('.df-btn-volume-up');
    if (oldVolUp) oldVolUp.remove();
    const oldVolDown = this.frameEl.querySelector('.df-btn-volume-down');
    if (oldVolDown) oldVolDown.remove();

    this.renderNotch();
    this.renderHomeIndicator();
    this.renderButtons();
  }

  static getDevices() {
    return { ...DEVICES };
  }
}

/* --- Auto-init on DOMContentLoaded --- */
document.addEventListener('DOMContentLoaded', () => {
  const target = document.querySelector('[data-device]');
  if (target) {
    const instance = new DeviceFrame();
    instance.init();
    window.deviceFrame = instance;
  }
});
