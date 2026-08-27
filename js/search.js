/**
 * Apartment Zero Waste Guide - Search Functionality
 * Client-side search for articles
 */

(function() {
  'use strict';

  const SearchPage = {
    resultsContainer: null,
    queryInput: null,
    searchButton: null,
    articlesData: [],

    async init() {
      this.resultsContainer = document.getElementById('search-results');
      this.queryInput = document.getElementById('search-query');
      this.searchButton = document.querySelector('.search-button');

      if (!this.resultsContainer) return;

      await this.loadArticlesData();
      this.bindEvents();
      
      // Check for query parameter in URL
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('q');
      if (query) {
        this.queryInput.value = query;
        this.performSearch(query);
      }
    },

    async loadArticlesData() {
      try {
        const response = await fetch('/articles-data.json');
        if (response.ok) {
          this.articlesData = await response.json();
        }
      } catch (e) {
        console.error('Failed to load search data:', e);
      }
    },

    bindEvents() {
      if (this.searchButton) {
        this.searchButton.addEventListener('click', () => {
          const query = this.queryInput.value.trim();
          if (query) {
            this.performSearch(query);
          }
        });
      }

      this.queryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const query = this.queryInput.value.trim();
          if (query) {
            this.performSearch(query);
          }
        }
      });
    },

    performSearch(query) {
      // Update URL
      const newUrl = `${window.location.pathname}?q=${encodeURIComponent(query)}`;
      window.history.pushState({ path: newUrl }, '', newUrl);

      const results = this.searchArticles(query);
      this.displayResults(results, query);
    },

    searchArticles(query) {
      const searchTerm = query.toLowerCase().trim();
      
      if (searchTerm.length < 2) {
        return [];
      }

      return this.articlesData.filter(article => {
        const titleMatch = article.title.toLowerCase().includes(searchTerm);
        const excerptMatch = article.excerpt.toLowerCase().includes(searchTerm);
        const categoryMatch = article.category.toLowerCase().includes(searchTerm);
        const keywordMatch = article.keywords && article.keywords.some(k => 
          k.toLowerCase().includes(searchTerm)
        );
        
        return titleMatch || excerptMatch || categoryMatch || keywordMatch;
      }).sort((a, b) => {
        // Prioritize title matches
        const aTitleMatch = a.title.toLowerCase().includes(searchTerm) ? 2 : 0;
        const bTitleMatch = b.title.toLowerCase().includes(searchTerm) ? 2 : 0;
        return bTitleMatch - aTitleMatch;
      });
    },

    displayResults(results, query) {
      if (!this.resultsContainer) return;

      if (results.length === 0) {
        this.resultsContainer.innerHTML = `
          <div class="search-no-results">
            <h2>No Results Found</h2>
            <p>We couldn't find any articles matching "${this.escapeHtml(query)}".</p>
            <p>Try different keywords or browse our categories:</p>
            <ul class="category-suggestions">
              <li><a href="/categories/odorless-composting-methods.html">Odorless Composting Methods</a></li>
              <li><a href="/categories/zero-waste-kitchen-hacks.html">Zero-Waste Kitchen Hacks</a></li>
              <li><a href="/categories/small-space-indoor-gardening.html">Small-Space Indoor Gardening</a></li>
              <li><a href="/categories/renter-friendly-sustainability.html">Renter-Friendly Sustainability</a></li>
              <li><a href="/categories/troubleshooting-pest-control.html">Troubleshooting & Pest Control</a></li>
            </ul>
          </div>
        `;
        return;
      }

      let html = `
        <div class="search-results-info">
          <p>Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${this.escapeHtml(query)}"</p>
        </div>
        <div class="search-results-grid card-grid">
      `;

      results.forEach(article => {
        html += `
          <article class="card">
            <a href="${article.url}" class="card-image-link">
              <img src="${article.image}" alt="${this.escapeHtml(article.title)}" 
                   class="card-image" width="1200" height="675" loading="lazy">
            </a>
            <div class="card-content">
              <a href="/categories/${this.slugify(article.category)}.html" 
                 class="card-category">${this.escapeHtml(article.category)}</a>
              <h3 class="card-title">
                <a href="${article.url}">${this.escapeHtml(article.title)}</a>
              </h3>
              <p class="card-excerpt">${this.escapeHtml(article.excerpt)}</p>
              <div class="card-meta">
                <span class="card-date">${article.date}</span>
                <span class="card-reading-time">${article.readingTime}</span>
              </div>
            </div>
          </article>
        `;
      });

      html += '</div>';
      this.resultsContainer.innerHTML = html;
    },

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    slugify(text) {
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SearchPage.init());
  } else {
    SearchPage.init();
  }

})();
