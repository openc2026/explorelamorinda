// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.main-nav');
  
  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      nav.classList.toggle('active');
    });
  }

  // ============================================
  // CONVERSION TRACKING
  // ============================================

  // Track contact form submissions
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function() {
      if (typeof trackConversion === 'function') {
        trackConversion('generate_lead', {
          event_category: 'Lead',
          event_label: 'Contact Form Submission',
          value: 1
        });
      }
    });
  }

  // Track PDF downloads
  document.querySelectorAll('a[href$=".pdf"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      const fileName = this.href.split('/').pop();
      if (typeof trackConversion === 'function') {
        trackConversion('file_download', {
          event_category: 'Download',
          event_label: fileName,
          file_name: fileName,
          file_extension: 'pdf'
        });
      }
    });
  });

  // Track clicks to OrindaRealty.com (external realtor link)
  document.querySelectorAll('a[href*="orindarealty.com"]').forEach(function(link) {
    link.addEventListener('click', function() {
      if (typeof trackConversion === 'function') {
        trackConversion('click_realtor_site', {
          event_category: 'Outbound',
          event_label: 'OrindaRealty.com',
          link_url: this.href
        });
      }
    });
  });

  // Track floating CTA clicks (high-intent action)
  const floatingCTA = document.querySelector('.floating-cta');
  if (floatingCTA) {
    floatingCTA.addEventListener('click', function() {
      if (typeof trackConversion === 'function') {
        trackConversion('cta_click', {
          event_category: 'Engagement',
          event_label: 'Floating CTA - Find Your Home'
        });
      }
    });
  }

  // Track phone number clicks (tel: links)
  document.querySelectorAll('a[href^="tel:"]').forEach(function(link) {
    link.addEventListener('click', function() {
      const phoneNumber = this.href.replace('tel:', '');
      if (typeof trackConversion === 'function') {
        trackConversion('click_to_call', {
          event_category: 'Lead',
          event_label: phoneNumber
        });
      }
    });
  });

  // Track content CTA banner clicks
  document.querySelectorAll('.content-cta-link').forEach(function(link) {
    link.addEventListener('click', function() {
      if (typeof trackConversion === 'function') {
        trackConversion('cta_click', {
          event_category: 'Engagement',
          event_label: 'Content CTA Banner'
        });
      }
    });
  });
});
