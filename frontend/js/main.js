/**
 * Main JavaScript - Theme, Navigation, Animations, Shared Components
 */

// Theme Management
const Theme = {
  init() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    this.updateToggleIcon(saved);
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    this.updateToggleIcon(next);
  },

  updateToggleIcon(theme) {
    document.querySelectorAll('.theme-toggle i').forEach((icon) => {
      icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    });
  },
};

// Inject Navbar
function renderNavbar() {
  const user = API.getUser();
  const isLoggedIn = API.isLoggedIn();
  const isAdmin = API.isAdmin();

  const authLinks = isLoggedIn
    ? isAdmin
      ? `<li class="nav-item"><a class="nav-link" href="admin/dashboard.html">Admin Panel</a></li>
         <li class="nav-item"><a class="nav-link" href="#" onclick="API.logout(); return false;">Logout</a></li>`
      : `<li class="nav-item"><a class="nav-link" href="user/dashboard.html">Dashboard</a></li>
         <li class="nav-item"><a class="nav-link" href="#" onclick="API.logout(); return false;">Logout</a></li>`
    : `<li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
       <li class="nav-item"><a class="nav-link btn-nav-cta" href="register.html">Register</a></li>`;

  const navbar = `
    <nav class="navbar navbar-expand-lg fixed-top" id="mainNavbar">
      <div class="container">
        <a class="navbar-brand" href="index.html">
          <span class="brand-glow">Glow</span> & <span class="brand-grace">Grace</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto align-items-center">
            <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
            <li class="nav-item"><a class="nav-link" href="about.html">About</a></li>
            <li class="nav-item"><a class="nav-link" href="services.html">Services</a></li>
            <li class="nav-item"><a class="nav-link" href="gallery.html">Gallery</a></li>
            <li class="nav-item"><a class="nav-link" href="contact.html">Contact</a></li>
            ${authLinks}
            <li class="nav-item ms-2">
              <button class="btn theme-toggle" onclick="Theme.toggle()" aria-label="Toggle theme">
                <i class="bi bi-moon-fill"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>`;

  const el = document.getElementById('navbar-container');
  if (el) el.innerHTML = navbar;
}

// Inject Footer
function renderFooter() {
  const footer = `
    <footer class="site-footer">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-4">
            <h4 class="footer-brand"><span class="brand-glow">Glow</span> & <span class="brand-grace">Grace</span></h4>
            <p class="footer-desc">Where beauty meets elegance. Experience luxury treatments in a serene, sophisticated atmosphere.</p>
            <div class="social-links">
              <a href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
              <a href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
              <a href="#" aria-label="Twitter"><i class="bi bi-twitter-x"></i></a>
              <a href="#" aria-label="Pinterest"><i class="bi bi-pinterest"></i></a>
            </div>
          </div>
          <div class="col-lg-2 col-md-4">
            <h5>Quick Links</h5>
            <ul class="footer-links">
              <li><a href="index.html">Home</a></li>
              <li><a href="about.html">About Us</a></li>
              <li><a href="services.html">Services</a></li>
              <li><a href="gallery.html">Gallery</a></li>
            </ul>
          </div>
          <div class="col-lg-2 col-md-4">
            <h5>Services</h5>
            <ul class="footer-links">
              <li><a href="services.html">Hair Cut</a></li>
              <li><a href="services.html">Hair Spa</a></li>
              <li><a href="services.html">Facial</a></li>
              <li><a href="services.html">Bridal Makeup</a></li>
            </ul>
          </div>
          <div class="col-lg-4 col-md-4">
            <h5>Contact Us</h5>
            <ul class="footer-contact">
              <li><i class="bi bi-geo-alt"></i> 123 Beauty Boulevard, NY 10001</li>
              <li><i class="bi bi-telephone"></i> +1 (555) 123-4567</li>
              <li><i class="bi bi-envelope"></i> hello@glowgrace.com</li>
            </ul>
          </div>
        </div>
        <hr class="footer-divider">
        <div class="footer-bottom text-center">
          <p>&copy; ${new Date().getFullYear()} Glow & Grace Salon. All rights reserved.</p>
        </div>
      </div>
    </footer>`;

  const el = document.getElementById('footer-container');
  if (el) el.innerHTML = footer;
}

// Scroll animations
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.fade-up, .fade-in, .slide-left, .slide-right').forEach((el) => {
    observer.observe(el);
  });
}

// Navbar scroll effect
function initNavbarScroll() {
  const navbar = document.getElementById('mainNavbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('navbar-scrolled', window.scrollY > 50);
  });
}

// Toast notifications
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.innerHTML = `<i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Form validation helper
function validateForm(form) {
  const inputs = form.querySelectorAll('[required]');
  let valid = true;

  inputs.forEach((input) => {
    const errorEl = input.parentElement.querySelector('.invalid-feedback');
    if (!input.value.trim()) {
      input.classList.add('is-invalid');
      if (errorEl) errorEl.style.display = 'block';
      valid = false;
    } else {
      input.classList.remove('is-invalid');
      if (errorEl) errorEl.style.display = 'none';
    }
  });

  return valid;
}

// Format currency
function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

// Format date
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Status badge HTML
function statusBadge(status) {
  const colors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    cancelled: 'secondary',
    completed: 'info',
    rescheduled: 'primary',
  };
  return `<span class="badge bg-${colors[status] || 'secondary'}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  renderNavbar();
  renderFooter();
  initScrollAnimations();
  setTimeout(initNavbarScroll, 100);
});
