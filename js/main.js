/**
 * Apartment Zero Waste Guide - Main JavaScript
 * Core functionality for the sustainability blog
 */

(function() {
  'use strict';

  // ==========================================================================
  // Configuration
  // ==========================================================================
  
  const CONFIG = {
    cookieConsentKey: 'azwg_cookie_consent',
    cookieVersion: '1.0',
    scrollThreshold: 300,
    debounceDelay: 300
  };

  // ==========================================================================
  // Utility Functions
  // ==========================================================================
  
  /**
   * Debounce function to limit execution rate
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Get cookie by name
   */
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  /**
   * Set cookie with expiration
   */
  function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Lax`;
  }

  // ==========================================================================
  // Mobile Menu
  // ==========================================================================
  
  const MobileMenu = {
    toggle: null,
    nav: null,
    isOpen: false,

    init() {
      this.toggle = document.querySelector('.mobile-menu-toggle');
      this.nav = document.querySelector('.main-nav');
      
      if (!this.toggle || !this.nav) return;

      this.toggle.addEventListener('click', () => this.toggleMenu());
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (this.isOpen && !this.toggle.contains(e.target) && !this.nav.contains(e.target)) {
          this.closeMenu();
        }
      });

      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeMenu();
          this.toggle.focus();
        }
      });
    },

    toggleMenu() {
      this.isOpen ? this.closeMenu() : this.openMenu();
    },

    openMenu() {
      this.nav.classList.add('show');
      this.toggle.setAttribute('aria-expanded', 'true');
      this.isOpen = true;
      document.body.style.overflow = 'hidden';
    },

    closeMenu() {
      this.nav.classList.remove('show');
      this.toggle.setAttribute('aria-expanded', 'false');
      this.isOpen = false;
      document.body.style.overflow = '';
    }
  };

  // ==========================================================================
  // Back to Top Button
  // ==========================================================================
  
  const BackToTop = {
    button: null,

    init() {
      this.button = document.querySelector('.back-to-top');
      if (!this.button) return;

      // Show/hide based on scroll
      window.addEventListener('scroll', debounce(() => {
        this.handleScroll();
      }, 100));

      // Click handler
      this.button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      // Keyboard support
      this.button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    },

    handleScroll() {
      if (window.scrollY > CONFIG.scrollThreshold) {
        this.button.classList.add('show');
      } else {
        this.button.classList.remove('show');
      }
    }
  };

  // ==========================================================================
  // Cookie Consent Banner
  // ==========================================================================
  
  const CookieConsent = {
    banner: null,
    modal: null,
    preferences: null,

    init() {
      this.banner = document.querySelector('.cookie-banner');
      this.modal = document.querySelector('.cookie-modal');
      
      if (!this.banner) return;

      this.loadPreferences();
      this.checkConsent();
      this.bindEvents();
    },

    loadPreferences() {
      const stored = getCookie(CONFIG.cookieConsentKey);
      if (stored) {
        try {
          this.preferences = JSON.parse(stored);
        } catch (e) {
          this.preferences = null;
        }
      }
    },

    checkConsent() {
      if (!this.preferences) {
        // No consent recorded yet, show banner
        setTimeout(() => {
          this.banner.classList.add('show');
        }, 1000);
      } else if (this.preferences.version !== CONFIG.cookieVersion) {
        // Preferences from old version, re-show banner
        setTimeout(() => {
          this.banner.classList.add('show');
        }, 1000);
      }
    },

    bindEvents() {
      // Accept all
      const acceptBtn = this.banner.querySelector('.cookie-btn-accept');
      if (acceptBtn) {
        acceptBtn.addEventListener('click', () => this.acceptAll());
      }

      // Reject non-essential
      const rejectBtn = this.banner.querySelector('.cookie-btn-reject');
      if (rejectBtn) {
        rejectBtn.addEventListener('click', () => this.rejectAll());
      }

      // Settings button
      const settingsBtn = this.banner.querySelector('.cookie-btn-settings');
      if (settingsBtn) {
        settingsBtn.addEventListener('click', () => this.openModal());
      }

      // Modal close
      if (this.modal) {
        const closeBtn = this.modal.querySelector('.cookie-modal-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Save preferences in modal
        const saveBtn = this.modal.querySelector('.cookie-btn-save');
        if (saveBtn) {
          saveBtn.addEventListener('click', () => this.saveModalPreferences());
        }

        // Close on outside click
        this.modal.addEventListener('click', (e) => {
          if (e.target === this.modal) {
            this.closeModal();
          }
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this.modal.classList.contains('show')) {
            this.closeModal();
          }
        });
      }
    },

    acceptAll() {
      this.preferences = {
        necessary: true,
        analytics: true,
        advertising: true,
        timestamp: new Date().toISOString(),
        version: CONFIG.cookieVersion
      };
      this.savePreferences();
      this.hideBanner();
      this.enableCookies();
    },

    rejectAll() {
      this.preferences = {
        necessary: true,
        analytics: false,
        advertising: false,
        timestamp: new Date().toISOString(),
        version: CONFIG.cookieVersion
      };
      this.savePreferences();
      this.hideBanner();
    },

    openModal() {
      if (!this.modal) return;
      
      // Populate toggles with current preferences
      if (this.preferences) {
        const analyticsToggle = this.modal.querySelector('#cookie-analytics');
        const advertisingToggle = this.modal.querySelector('#cookie-advertising');
        
        if (analyticsToggle) analyticsToggle.checked = this.preferences.analytics;
        if (advertisingToggle) advertisingToggle.checked = this.preferences.advertising;
      }
      
      this.modal.classList.add('show');
      this.modal.querySelector('.cookie-modal-content').focus();
    },

    closeModal() {
      if (!this.modal) return;
      this.modal.classList.remove('show');
    },

    saveModalPreferences() {
      const analyticsToggle = this.modal.querySelector('#cookie-analytics');
      const advertisingToggle = this.modal.querySelector('#cookie-advertising');

      this.preferences = {
        necessary: true,
        analytics: analyticsToggle ? analyticsToggle.checked : false,
        advertising: advertisingToggle ? advertisingToggle.checked : false,
        timestamp: new Date().toISOString(),
        version: CONFIG.cookieVersion
      };
      
      this.savePreferences();
      this.hideBanner();
      this.closeModal();
      this.enableCookies();
    },

    savePreferences() {
      setCookie(CONFIG.cookieConsentKey, JSON.stringify(this.preferences), 365);
    },

    hideBanner() {
      this.banner.classList.remove('show');
    },

    enableCookies() {
      if (!this.preferences) return;

      // Enable Google Analytics if consented
      if (this.preferences.analytics) {
        // Analytics code would be loaded here when implemented
        console.log('Analytics cookies enabled');
      }

      // Enable Google AdSense if consented
      if (this.preferences.advertising) {
        // AdSense code would be loaded here when implemented
        console.log('Advertising cookies enabled');
      }
    },

    hasConsent(type) {
      if (!this.preferences) return false;
      if (type === 'necessary') return true;
      return this.preferences[type] === true;
    }
  };

  // ==========================================================================
  // Table of Contents (for articles)
  // ==========================================================================
  
  const TableOfContents = {
    toc: null,
    headings: [],

    init() {
      this.toc = document.querySelector('.table-of-contents');
      if (!this.toc) return;

      this.generateTOC();
      this.highlightActiveSection();
    },

    generateTOC() {
      const content = document.querySelector('.article-content');
      if (!content) return;

      const headings = content.querySelectorAll('h2, h3');
      if (headings.length === 0) {
        this.toc.style.display = 'none';
        return;
      }

      const list = this.toc.querySelector('.toc-list');
      if (!list) return;

      list.innerHTML = '';

      headings.forEach((heading, index) => {
        // Add ID if not present
        if (!heading.id) {
          heading.id = `section-${index}`;
        }

        this.headings.push(heading);

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;
        a.className = heading.tagName.toLowerCase() === 'h3' ? 'toc-h3' : '';
        
        a.addEventListener('click', (e) => {
          e.preventDefault();
          const offset = 80; // Account for sticky header
          const targetPosition = heading.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });
          
          // Update URL without scrolling again
          history.pushState(null, null, `#${heading.id}`);
        });

        li.appendChild(a);
        list.appendChild(li);
      });
    },

    highlightActiveSection() {
      const links = this.toc.querySelectorAll('.toc-list a');
      
      window.addEventListener('scroll', debounce(() => {
        const scrollPosition = window.scrollY + 100;
        
        this.headings.forEach((heading, index) => {
          const headingTop = heading.offsetTop;
          const headingBottom = headingTop + heading.offsetHeight;
          
          if (scrollPosition >= headingTop && scrollPosition < headingBottom) {
            links.forEach(link => link.classList.remove('current'));
            links[index].classList.add('current');
          }
        });
      }, 100));
    }
  };

  // ==========================================================================
  // Search Functionality
  // ==========================================================================
  
  const Search = {
    form: null,
    input: null,
    articlesData: [],

    init() {
      this.form = document.querySelector('.search-form');
      this.input = document.querySelector('.search-input');
      
      if (!this.form) return;

      this.loadArticlesData();
      this.bindEvents();
    },

    async loadArticlesData() {
      try {
        const response = await fetch('/articles-data.json');
        if (response.ok) {
          this.articlesData = await response.json();
        }
      } catch (e) {
        console.log('Search data not available yet');
      }
    },

    bindEvents() {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = this.input.value.trim();
        if (query) {
          this.performSearch(query);
        }
      });
    },

    performSearch(query) {
      if (this.articlesData.length === 0) {
        // Redirect to search page if data not loaded
        window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
        return;
      }

      const results = this.searchArticles(query);
      this.showResults(results, query);
    },

    searchArticles(query) {
      const searchTerm = query.toLowerCase();
      
      return this.articlesData.filter(article => {
        return (
          article.title.toLowerCase().includes(searchTerm) ||
          article.excerpt.toLowerCase().includes(searchTerm) ||
          article.category.toLowerCase().includes(searchTerm) ||
          (article.keywords && article.keywords.some(k => k.toLowerCase().includes(searchTerm)))
        );
      }).slice(0, 10); // Limit to 10 results
    },

    showResults(results, query) {
      // This would display results in a dropdown or redirect to search page
      window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
    }
  };

  // ==========================================================================
  // Smooth Scroll for Anchor Links
  // ==========================================================================
  
  const SmoothScroll = {
    init() {
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        
        const offset = 80; // Account for sticky header
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Update URL
        history.pushState(null, null, href);
      });
    }
  };

  // ==========================================================================
  // Reading Progress Bar (for articles)
  // ==========================================================================
  
  const ReadingProgress = {
    bar: null,

    init() {
      this.bar = document.querySelector('.reading-progress-bar');
      if (!this.bar) return;

      window.addEventListener('scroll', debounce(() => {
        this.updateProgress();
      }, 10));
    },

    updateProgress() {
      const article = document.querySelector('.article-content');
      if (!article) return;

      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;

      const start = articleTop;
      const end = articleTop + articleHeight;
      
      let progress = 0;
      
      if (scrollTop < start) {
        progress = 0;
      } else if (scrollTop > end) {
        progress = 100;
      } else {
        progress = ((scrollTop - start) / (end - start)) * 100;
      }

      this.bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
  };

  // ==========================================================================
  // Social Share Buttons
  // ==========================================================================
  
  const SocialShare = {
    init() {
      const shareButtons = document.querySelectorAll('.share-button');
      
      shareButtons.forEach(button => {
        button.addEventListener('click', () => {
          const platform = button.dataset.platform;
          const url = encodeURIComponent(window.location.href);
          const title = encodeURIComponent(document.title);
          
          let shareUrl = '';
          
          switch(platform) {
            case 'facebook':
              shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
              break;
            case 'twitter':
              shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
              break;
            case 'pinterest':
              shareUrl = `https://pinterest.com/pin/create/button/?url=${url}&description=${title}`;
              break;
            case 'linkedin':
              shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`;
              break;
          }
          
          if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
          }
        });
      });
    }
  };

  // ==========================================================================
  // Lazy Loading Images
  // ==========================================================================
  
  const LazyLoad = {
    init() {
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }
              observer.unobserve(img);
            }
          });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
          imageObserver.observe(img);
        });
      }
    }
  };

  // ==========================================================================
  // Form Validation (Contact Form)
  // ==========================================================================
  
  const FormValidation = {
    init() {
      const forms = document.querySelectorAll('form[data-validate]');
      
      forms.forEach(form => {
        form.addEventListener('submit', (e) => {
          if (!this.validateForm(form)) {
            e.preventDefault();
          }
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
          input.addEventListener('blur', () => {
            this.validateField(input);
          });
        });
      });
    },

    validateForm(form) {
      let isValid = true;
      const inputs = form.querySelectorAll('input, textarea');
      
      inputs.forEach(input => {
        if (!this.validateField(input)) {
          isValid = false;
        }
      });
      
      return isValid;
    },

    validateField(field) {
      const value = field.value.trim();
      const type = field.type;
      const required = field.hasAttribute('required');
      let isValid = true;
      let errorMessage = '';

      // Required check
      if (required && !value) {
        isValid = false;
        errorMessage = 'This field is required';
      }

      // Email validation
      if (isValid && type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address';
        }
      }

      // Min length
      if (isValid && field.minLength > 0 && value.length < field.minLength) {
        isValid = false;
        errorMessage = `Minimum ${field.minLength} characters required`;
      }

      // Update UI
      this.updateFieldUI(field, isValid, errorMessage);
      
      return isValid;
    },

    updateFieldUI(field, isValid, errorMessage) {
      const formGroup = field.closest('.form-group');
      if (!formGroup) return;

      // Remove existing messages
      const existingMessage = formGroup.querySelector('.error-message');
      if (existingMessage) existingMessage.remove();

      if (!isValid) {
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        
        const messageEl = document.createElement('div');
        messageEl.className = 'error-message';
        messageEl.textContent = errorMessage;
        messageEl.style.color = 'var(--color-error)';
        messageEl.style.fontSize = 'var(--font-size-sm)';
        messageEl.style.marginTop = 'var(--spacing-xs)';
        
        formGroup.appendChild(messageEl);
      } else {
        field.classList.remove('error');
        field.setAttribute('aria-invalid', 'false');
      }
    }
  };

  // ==========================================================================
  // Initialize All Modules
  // ==========================================================================
  
  function init() {
    MobileMenu.init();
    BackToTop.init();
    CookieConsent.init();
    TableOfContents.init();
    Search.init();
    SmoothScroll.init();
    ReadingProgress.init();
    SocialShare.init();
    LazyLoad.init();
    FormValidation.init();
    
    console.log('Apartment Zero Waste Guide initialized');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
