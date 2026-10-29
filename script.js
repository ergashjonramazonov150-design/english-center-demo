/* =====================================================
   Lumora English Center — script.js
   Plain ("vanilla") JavaScript, no libraries.
   Sections:
     1. Setup
     2. Mobile menu
     3. Header shadow on scroll
     4. Highlight the current section in the menu
     5. Reveal-on-scroll animation
     6. Registration form validation (DEMO ONLY)
     7. Small extras (footer year, placeholder links)
   ===================================================== */

/* ---------- 1. SETUP ---------- */

// Tell the CSS that JavaScript is running (used by the .reveal animation).
document.documentElement.classList.add('js');

// Did the visitor ask their device to reduce motion?
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Shortcuts to elements we need many times.
const header = document.getElementById('site-header');
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');


/* ---------- 2. MOBILE MENU ---------- */

function openMenu() {
  navMenu.classList.add('is-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Close menu');
}

function closeMenu() {
  navMenu.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
}

// Clicking the hamburger button toggles the menu.
menuToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.contains('is-open');
  if (isOpen) {
    closeMenu();
  } else {
    openMenu();
  }
});

// Clicking any link inside the menu closes it (so you can see the section).
navMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

// Pressing Escape closes the menu and returns focus to the button.
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navMenu.classList.contains('is-open')) {
    closeMenu();
    menuToggle.focus();
  }
});

// If the window becomes wide (desktop), make sure the mobile menu state is reset.
window.addEventListener('resize', () => {
  if (window.innerWidth >= 960) {
    closeMenu();
  }
});


/* ---------- 3. HEADER SHADOW ON SCROLL ---------- */

function updateHeaderShadow() {
  // Add the class when the page is scrolled more than 10px.
  header.classList.toggle('is-scrolled', window.scrollY > 10);
}

window.addEventListener('scroll', updateHeaderShadow, { passive: true });
updateHeaderShadow(); // run once at load


/* ---------- 4. HIGHLIGHT CURRENT SECTION IN MENU ---------- */

const sections = document.querySelectorAll('main section[id]');

// IntersectionObserver tells us when elements enter or leave the screen.
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          const isCurrent = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('is-active', isCurrent);
          if (isCurrent) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      }
    });
  },
  // Only count a section as "current" when it crosses the middle of the screen.
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach((section) => sectionObserver.observe(section));


/* ---------- 5. REVEAL-ON-SCROLL ANIMATION ---------- */

const revealElements = document.querySelectorAll('.reveal');

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  // No animation wanted (or not supported): just show everything.
  revealElements.forEach((el) => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // animate only once
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
}


/* ---------- 6. REGISTRATION FORM VALIDATION (DEMO ONLY) ----------
   IMPORTANT: this form never sends data anywhere.
   There is no server. We only check the fields and show a message. */

const form = document.getElementById('registration-form');
const successMessage = document.getElementById('success-message');

// Each rule gets a field's value and returns an error message,
// or an empty string "" if the value is fine.
const rules = {
  name(value) {
    return value.trim().length >= 2
      ? ''
      : 'Please enter your full name (at least 2 characters).';
  },

  phone(value) {
    const digitsOnly = value.replace(/\D/g, ''); // remove everything except 0-9
    const onlyAllowedCharacters = /^[+\d\s()-]+$/.test(value);
    const goodLength = digitsOnly.length >= 9 && digitsOnly.length <= 15;
    return onlyAllowedCharacters && goodLength
      ? ''
      : 'Please enter a valid phone number (9 to 15 digits).';
  },

  email(value) {
    // A simple check: something@something.something
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    return looksLikeEmail ? '' : 'Please enter a valid email address.';
  },

  course(value) {
    return value !== '' ? '' : 'Please choose a course.';
  },

  consent(isChecked) {
    return isChecked ? '' : 'Please tick the box to confirm you understand this is a demo.';
  },
};

// Read a field's value (checkboxes use .checked instead of .value).
function getFieldValue(field) {
  return field.type === 'checkbox' ? field.checked : field.value;
}

// Check ONE field, show or clear its error, and return true if it is valid.
function validateField(field) {
  const rule = rules[field.id];
  if (!rule) return true; // optional fields (like "message") have no rule

  const errorMessage = rule(getFieldValue(field));
  const errorElement = document.getElementById(field.id + '-error');

  errorElement.textContent = errorMessage;
  if (errorMessage) {
    field.setAttribute('aria-invalid', 'true');
  } else {
    field.removeAttribute('aria-invalid');
  }
  return errorMessage === '';
}

// Give feedback as soon as someone leaves a field (blur),
// and update it live while typing once it has been flagged as invalid.
form.querySelectorAll('input, select, textarea').forEach((field) => {
  field.addEventListener('blur', () => validateField(field));

  const liveEvent = field.type === 'checkbox' || field.tagName === 'SELECT' ? 'change' : 'input';
  field.addEventListener(liveEvent, () => {
    if (field.getAttribute('aria-invalid') === 'true') {
      validateField(field);
    }
  });
});

// When the form is submitted:
form.addEventListener('submit', (event) => {
  event.preventDefault(); // stop the browser from reloading the page

  successMessage.hidden = true; // hide any old success message

  // Validate every field. We loop through all of them (no early exit)
  // so that every error message appears at once.
  let firstInvalidField = null;
  form.querySelectorAll('input, select, textarea').forEach((field) => {
    const isValid = validateField(field);
    if (!isValid && firstInvalidField === null) {
      firstInvalidField = field;
    }
  });

  if (firstInvalidField) {
    firstInvalidField.focus(); // move keyboard focus to the first problem
    return;
  }

  // Everything is valid. In a real project you would send the data to a server here.
  // In this demo we only show a message and clear the form.
  form.reset();
  successMessage.hidden = false;
  successMessage.focus(); // helps screen readers announce the message
  successMessage.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'center',
  });
});


/* ---------- 7. SMALL EXTRAS ---------- */

// Footer year updates itself.
document.getElementById('year').textContent = new Date().getFullYear();

// Social links are placeholders, so stop them from jumping to the top of the page.
document.querySelectorAll('[data-placeholder]').forEach((link) => {
  link.addEventListener('click', (event) => event.preventDefault());
});