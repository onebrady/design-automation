/**
 * CTA Section Enhancements
 * Adds scroll animations and interactive behaviors
 */

document.addEventListener('DOMContentLoaded', function() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const ctaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Unobserve after animation to prevent re-triggering
                ctaObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe CTA section
    const ctaSection = document.querySelector('.cta-section');
    if (ctaSection) {
        ctaObserver.observe(ctaSection);
    }

    // Button click handlers with loading states
    const ctaButtons = document.querySelectorAll('.cta-buttons .btn');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Only prevent default for demo purposes
            if (this.getAttribute('href') === '#inventory' || this.getAttribute('href') === '#contact') {
                e.preventDefault();
                
                // Add loading state
                this.setAttribute('aria-busy', 'true');
                this.classList.add('loading');
                
                // Simulate API call or navigation
                setTimeout(() => {
                    this.setAttribute('aria-busy', 'false');
                    this.classList.remove('loading');
                    this.classList.add('success');
                    
                    // Reset after showing success
                    setTimeout(() => {
                        this.classList.remove('success');
                    }, 2000);
                }, 1500);
                
                // Track analytics event
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'cta_click', {
                        'event_category': 'engagement',
                        'event_label': this.dataset.analytics
                    });
                }
            }
        });
        
        // Add hover effect - removed transform that was affecting layout
        button.addEventListener('mouseenter', function() {
            // Subtle hover effect without transform
            // Transform removed as it was causing layout issues
        });
        
        button.addEventListener('mouseleave', function() {
            // Reset on mouse leave
        });
    });

    // Parallax effect REMOVED - was causing section overlap issues
    // The transform was moving the entire section on top of content above
    /* Parallax disabled to fix layout issues
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Parallax effect removed
    }
    */

    // Helper function to check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= window.innerHeight &&
            rect.bottom >= 0
        );
    }

    // Keyboard navigation enhancements
    document.addEventListener('keydown', function(e) {
        // Quick access to CTA with Alt+C
        if (e.altKey && e.key === 'c') {
            e.preventDefault();
            const ctaSection = document.getElementById('call-to-action');
            if (ctaSection) {
                ctaSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Focus first button
                const firstButton = ctaSection.querySelector('.btn');
                if (firstButton) {
                    firstButton.focus();
                }
            }
        }
    });

    // Add skip link dynamically
    const skipLink = document.createElement('a');
    skipLink.href = '#call-to-action';
    skipLink.className = 'skip-to-cta';
    skipLink.textContent = 'Skip to Call to Action';
    skipLink.setAttribute('aria-label', 'Skip to call to action section');
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Performance monitoring
    if ('IntersectionObserver' in window && 'PerformanceObserver' in window) {
        // Log CTA visibility for analytics
        const visibilityObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    console.log('CTA Section visible at:', new Date().toISOString());
                    // Track time to CTA visibility
                    if (performance.timing) {
                        const timeToCtaView = Date.now() - performance.timing.navigationStart;
                        console.log('Time to CTA view:', timeToCtaView, 'ms');
                    }
                }
            });
        }, { threshold: 0.5 });

        const ctaForTracking = document.querySelector('.cta-section');
        if (ctaForTracking) {
            visibilityObserver.observe(ctaForTracking);
        }
    }

    // Preload next page resources when hovering CTA buttons
    const inventoryBtn = document.querySelector('[data-action="browse-inventory"]');
    const contactBtn = document.querySelector('[data-action="contact-us"]');

    if (inventoryBtn) {
        inventoryBtn.addEventListener('mouseenter', function() {
            // Preload inventory page
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = '/inventory.html';
            document.head.appendChild(link);
        }, { once: true });
    }

    if (contactBtn) {
        contactBtn.addEventListener('mouseenter', function() {
            // Preload contact page
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = '/contact.html';
            document.head.appendChild(link);
        }, { once: true });
    }
});