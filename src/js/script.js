

const loader = document.getElementById('page-loader')
const conn = navigator.connection||navigator.mozConnection||navigator.webkitConnection
const slow = conn&&['slow-2g','2g','3g'].includes(conn.effectiveType)
if(slow){
  const min=800, start=Date.now()
  loader.classList.remove('hidden')
  window.addEventListener('load',()=>{
    const wait=Math.max(min-(Date.now()-start),0)
    setTimeout(()=>loader.classList.add('hidden'),wait)
  })
}else{
  loader.classList.add('hidden')
}

// Navigation menu animation
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
let isMenuOpen = false;

function closeMenuOnResize() {
    if (window.innerWidth > 1050) {
        if (isMenuOpen) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            isMenuOpen = false;
        }
    }
}

navToggle.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen;
    navMenu.classList.toggle('active', isMenuOpen);
    navToggle.classList.toggle('active');
});

const navLinks = document.querySelectorAll('.nav-links');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        isMenuOpen = false;
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

window.addEventListener('resize', closeMenuOnResize);
closeMenuOnResize();

// Mobile menu toggle for pushing content
const hamburger = document.getElementById('mobile-menu');
const bodyEl = document.body;

hamburger.addEventListener('click', () => {
    bodyEl.classList.toggle('menu-active');
});

// Scroll in: make cards visible using IntersectionObserver
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.cards-index .text-card-index, .sterling-content-section' );
    const observerOptions = { threshold: 0.3 };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    cards.forEach(card => {
        observer.observe(card);
    });
});





//-------------------------------------------------------------------------------------

/* ==============================================================
 Guides – FLIP accordion with polished micro-animations
 ============================================================== */
(() => {
  const DURATION_MOVE = 300;
  const DURATION_CLOSE = 600;
  const BREAKPOINT_PX = 430;

  const cards = [...document.querySelectorAll('.guide-card')];
  if (!cards.length) return;

  const closeCard = c => {
    c.classList.remove('open');
    c.querySelector('.guide-content').style.maxHeight = 0;
  };

  const openCard = c => {
    c.classList.add('open');
    const pane = c.querySelector('.guide-content');
    pane.style.maxHeight = pane.scrollHeight + 'px';
  };

  function flipAll(mutate, { skip = new Set() } = {}) {
    if (!Element.prototype.animate) {
      mutate();
      return Promise.resolve();
    }

    const first = new Map(cards.map(c => [c, {
      rect: c.getBoundingClientRect(),
      wasOpen: c.classList.contains('open')
    }]));

    mutate();

    let animationPromises = [];

    cards.forEach(c => {
      if (skip.has(c)) return;
      const last = c.getBoundingClientRect();
      const f = first.get(c);
      const dx = f.rect.left - last.left;
      const dy = f.rect.top - last.top;
      const dw = f.rect.width / last.width;
      const dh = f.rect.height / last.height;
      if (!dx && !dy && dw === 1 && dh === 1) return;

      const isClosing = f.wasOpen && !c.classList.contains('open');
      const dur = isClosing ? DURATION_CLOSE : DURATION_MOVE;

      const animation = c.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(${dw}, ${dh})` },
        { transform: 'none' }
      ], {
        duration: dur,
        easing: 'cubic-bezier(.25, .8, .25, 1)',
        fill: 'both'
      });

      animationPromises.push(animation.finished);
    });

    return Promise.all(animationPromises);
  }

  cards.forEach(card => {
    const header = card.querySelector('.guide-toggle');
    const burger = card.querySelector('.burger');
    const content = card.querySelector('.guide-content');
    const steps = card.querySelectorAll('.step');
    const dots = card.querySelectorAll('.dot');
    const prev = card.querySelector('.step-prev');
    const next = card.querySelector('.step-next');

    if (steps.length) {
      let idx = 0;
      const show = i => {
        steps[idx].classList.remove('active');
        dots[idx].classList.remove('active');
        idx = (i + steps.length) % steps.length;
        steps[idx].classList.add('active');
        dots[idx].classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';

        // Scroll to the top of the expanded content when switching pages
        content.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };

      dots.forEach((d, i) =>
        d.addEventListener('click', () =>
          flipAll(() => show(i), { skip: new Set([card]) })
        )
      );
      if (prev) prev.addEventListener('click', () =>
        flipAll(() => show(idx - 1), { skip: new Set([card]) })
      );
      if (next) next.addEventListener('click', () =>
        flipAll(() => show(idx + 1), { skip: new Set([card]) })
      );
    }

    const openExclusive = () => {
      flipAll(() =>
        cards.forEach(c =>
          c === card ? openCard(c) : closeCard(c)
        ), {
          skip: new Set([card])
        }
      ).then(() => {
        const rect = card.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
          if (window.innerWidth <= BREAKPOINT_PX) {
            const contentRect = content.getBoundingClientRect();
            window.scrollTo({
              top: window.scrollY + contentRect.top,
              behavior: 'smooth'
            });
          } else {
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    }

    const closeSelf = () => {
      flipAll(() => closeCard(card)).then(() => {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    header.addEventListener('click', () => {
      if (card.classList.contains('open')) {
        closeSelf();
      } else {
        openExclusive();
      }
    });

    burger.addEventListener('click', e => {
      e.stopPropagation();
      closeSelf();
    });

    window.addEventListener('resize', () => {
      if (card.classList.contains('open')) {
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });

    closeCard(card);
  });
})();


//-------------------------------------------------------------------------------------
/* minimal JS “protection” (stops right-click & drag) */
document.addEventListener("DOMContentLoaded", () => {
  const imgs = document.querySelectorAll(".exec-img, .protected-img, .about-photo, .mc-logo, .lnrlogo");
  imgs.forEach(img => {
    img.addEventListener("contextmenu", e => e.preventDefault());
    img.addEventListener("dragstart", e => e.preventDefault());
  });
});


//-------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
  const downloadItems = document.querySelectorAll(".download-item");
  downloadItems.forEach(function(item) {
    item.addEventListener("mouseenter", function() {
      if (item.querySelector(".js-preview-box")) return;
      const mainLink = item.querySelector("a.download-text");
      if (!mainLink) return;
      const fileUrl = mainLink.getAttribute("href");
      let previewContent;
      if (fileUrl && fileUrl.toLowerCase().endsWith(".pdf")) {
        previewContent = document.createElement("embed");
        previewContent.src = fileUrl + "#page=1&view=FitH&toolbar=0";
        previewContent.type = "application/pdf";
        previewContent.style.width = "100%";
        previewContent.style.height = "100%";
        previewContent.style.border = "none";
        previewContent.style.overflow = "hidden";
      } else {
        previewContent = document.createElement("div");
        previewContent.textContent = "Preview not available.";
      }
      const previewBox = document.createElement("div");
      previewBox.className = "js-preview-box";
      previewBox.style.pointerEvents = "none";
      previewBox.style.position = "absolute";
      previewBox.style.top = "-110px";
      previewBox.style.left = "0";
      previewBox.style.width = "200px";
      previewBox.style.height = "100px";
      previewBox.style.background = "rgba(255, 255, 255, 0.95)";
      previewBox.style.border = "1px solid #ccc";
      previewBox.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.3)";
      previewBox.style.zIndex = "1000";
      previewBox.style.padding = "0.25rem";
      previewBox.style.boxSizing = "border-box";
      previewBox.style.overflow = "hidden";
      previewBox.appendChild(previewContent);
      item.appendChild(previewBox);
    });
    item.addEventListener("mouseleave", function() {
      const previewBox = item.querySelector(".js-preview-box");
      if (previewBox) previewBox.remove();
    });
  });
});


//-------------------------------------------------------------------------------------
/* ==============================================================
   SMOOTH PAGE TRANSITIONS
   ============================================================== */
(() => {
  const TRANSITION_DURATION = 300;
  
  // Add transition class to main content wrapper
  const pageContent = document.querySelector('.ubg');
  if (pageContent) {
    pageContent.classList.add('page-transition');
  }

  // Handle internal link clicks for smooth transitions
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    
    // Skip if not a link or if it's a special link
    if (!link) return;
    
    const href = link.getAttribute('href');
    
    // Skip external links, anchors, downloads, and special protocols
    if (!href ||
        href.startsWith('#') ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.hasAttribute('download') ||
        link.target === '_blank' ||
        e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }
    
    // Check if it's an internal HTML page link
    if (href.endsWith('.html') || href === 'index.html' || 
        ['index.html', 'about-us.html', 'courses.html', 'resources.html'].includes(href)) {
      
      e.preventDefault();
      
      // Trigger fade-out
      if (pageContent) {
        pageContent.classList.add('fade-out');
      }
      
      // Navigate after transition
      setTimeout(() => {
        window.location.href = href;
      }, TRANSITION_DURATION);
    }
  });

  // Handle browser back/forward with transition
  window.addEventListener('pageshow', (e) => {
    if (e.persisted && pageContent) {
      // Page was restored from cache (back/forward)
      pageContent.classList.remove('fade-out');
    }
  });
})();



