// ===================================
// SMOOTH SCROLLING & NAVBAR
// ===================================

// Get all navigation links
const navLinks = document.querySelectorAll('.nav-link');
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Smooth scroll to sections
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        // Close mobile menu after clicking
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// ===================================
// HAMBURGER MENU TOGGLE (MOBILE)
// ===================================

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// ===================================
// NAVBAR SCROLL EFFECT
// ===================================

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===================================
// ACTIVE NAV LINK ON SCROLL
// ===================================

const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= (sectionTop - 150)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===================================
// CONTACT FORM HANDLING
// ===================================

const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const name = contactForm.name.value;
    const email = contactForm.email.value;
    const message = contactForm.message.value;
    
    // Simple validation
    if (name && email && message) {
        // Show success message
        alert(`Thank you, ${name}! Your message has been received. I'll get back to you at ${email} soon!`);
        
        // Reset form
        contactForm.reset();
        
        // In a real application, you would send this data to a server
        // Example: 
        // fetch('/api/contact', {
        //     method: 'POST',
        //     body: JSON.stringify({ name, email, message })
        // });
    } else {
        alert('Please fill in all fields!');
    }
});

// ===================================
// SCROLL REVEAL ANIMATIONS
// ===================================

// Function to check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Add fade-in animation to elements
const animatedElements = document.querySelectorAll('.skill-category, .timeline-item, .project-card, .cert-card, .contact-item');

// Initial check
animatedElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

// Scroll event to trigger animations
function handleScrollAnimation() {
    animatedElements.forEach(element => {
        if (isInViewport(element)) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Throttle scroll event for performance
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }
    
    scrollTimeout = window.requestAnimationFrame(() => {
        handleScrollAnimation();
    });
});

// Initial check on page load
window.addEventListener('load', handleScrollAnimation);

// ===================================
// CERTIFICATE MODAL FUNCTIONALITY
// ===================================

const certModal = document.getElementById('certModal');
const certModalImage = document.getElementById('certModalImage');
const certModalTitle = document.getElementById('certModalTitle');
const certModalClose = document.querySelector('.cert-modal-close');
const certModalOverlay = document.querySelector('.cert-modal-overlay');
const clickableCerts = document.querySelectorAll('.clickable-cert');

// Open modal when clicking cert card
clickableCerts.forEach(cert => {
    cert.addEventListener('click', () => {
        const imagePath = cert.getAttribute('data-cert-image');
        const title = cert.getAttribute('data-cert-title');
        
        certModalImage.src = imagePath;
        certModalTitle.textContent = title;
        certModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
});

// Close modal when clicking X
certModalClose.addEventListener('click', closeCertModal);

// Close modal when clicking overlay
certModalOverlay.addEventListener('click', closeCertModal);

// Close modal with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && certModal.classList.contains('active')) {
        closeCertModal();
    }
});

function closeCertModal() {
    certModal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

// ===================================
// TYPING EFFECT FOR HERO SUBTITLE (OPTIONAL)
// ===================================

// Uncomment this section if you want a typing effect
/*
const heroSubtitle = document.querySelector('.hero-subtitle');
const subtitleText = heroSubtitle.textContent;
heroSubtitle.textContent = '';

let charIndex = 0;
function typeWriter() {
    if (charIndex < subtitleText.length) {
        heroSubtitle.textContent += subtitleText.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, 50);
    }
}

window.addEventListener('load', () => {
    setTimeout(typeWriter, 1000);
});
*/

console.log('🚀 Portfolio loaded successfully!');
console.log('💼 Ahrif Hajjie Cruz - QA Engineer & Developer');
console.log('📧 cruzahrifhajjie@gmail.com');
