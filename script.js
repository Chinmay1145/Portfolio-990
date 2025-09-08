// DOM Elements with Error Handling
const DOM = {
    init() {
        this.navbar = document.querySelector('nav');
        this.dropdown = document.querySelector('.dropdown');
        this.sections = document.querySelectorAll('section');
        this.navLinks = document.querySelectorAll('.nav-container .links a, .dropdown .links a');
        this.menuBtn = document.querySelector('.hamburg');
        this.closeBtn = document.querySelector('.cancel');
        this.dropdownLinks = this.dropdown?.querySelectorAll('a') || [];
        this.typewriterText = document.querySelector('.typewriter-text');
        this.contactForm = document.querySelector('form');
    }
};

// State Management
const State = {
    scroll: {
        last: 0,
        timer: null,
        isNavVisible: true
    },
    menu: {
        isOpen: false
    },
    typewriter: {
        texts: ["React Developer", "Programmer", "Freelancer", "UI Designer"],
        currentIndex: 0,
        charIndex: 0,
        isDeleting: false,
        delay: 100
    }
};

// Mobile Menu Functions
function hamburg() {
    if (!DOM.dropdown || !DOM.menuBtn) return;
    
    State.menu.isOpen = true;
    DOM.dropdown.style.display = 'block';
    DOM.dropdown.offsetHeight; // Force reflow
    DOM.dropdown.classList.add('active');
    DOM.menuBtn.style.display = 'none';
    document.body.style.overflow = 'hidden';
}

function cancel() {
    if (!DOM.dropdown || !DOM.menuBtn) return;
    
    State.menu.isOpen = false;
    DOM.dropdown.classList.remove('active');
    DOM.menuBtn.style.display = 'block';
    document.body.style.overflow = '';
    
    setTimeout(() => {
        if (!DOM.dropdown.classList.contains('active')) {
            DOM.dropdown.style.display = 'none';
        }
    }, 300);
}

// Navigation Controller
const Navigation = {
    init() {
        window.addEventListener('scroll', this.handleScroll.bind(this));
        this.initDropdownLinks();
        this.initClickOutside();
        this.initEscapeKey();
        this.initSmoothScroll();
    },

    handleScroll() {
        const currentScroll = window.pageYOffset;
        
        if (State.scroll.timer) clearTimeout(State.scroll.timer);

        if (currentScroll <= 50) {
            this.showNavbar();
            return;
        }

        if (currentScroll > State.scroll.last && !State.menu.isOpen) {
            this.hideNavbar();
        } else {
            this.showNavbar();
        }

        State.scroll.timer = setTimeout(() => {
            if (State.scroll.isNavVisible) {
                DOM.navbar.style.backgroundColor = 'rgba(13, 13, 13, 0.85)';
            }
        }, 150);

        State.scroll.last = currentScroll;
        this.updateActiveSection();
    },

    showNavbar() {
        DOM.navbar.style.transform = 'translateY(0)';
        DOM.navbar.style.backgroundColor = 'rgba(13, 13, 13, 0.95)';
        State.scroll.isNavVisible = true;
    },

    hideNavbar() {
        DOM.navbar.style.transform = `translateY(-${DOM.navbar.offsetHeight}px)`;
        State.scroll.isNavVisible = false;
    },

    initDropdownLinks() {
        DOM.dropdownLinks.forEach(link => {
            link.addEventListener('click', cancel);
        });
    },

    initClickOutside() {
        document.addEventListener('click', (e) => {
            if (State.menu.isOpen && 
                !DOM.dropdown.contains(e.target) && 
                e.target !== DOM.menuBtn) {
                cancel();
            }
        });
    },

    initEscapeKey() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && State.menu.isOpen) cancel();
        });
    },

    initSmoothScroll() {
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const offset = DOM.navbar.offsetHeight;
                    const targetPosition = targetSection.offsetTop - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    },

    updateActiveSection() {
        const navHeight = DOM.navbar.offsetHeight;
        let currentSection = '';

        DOM.sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                currentSection = section.id;
            }
        });

        DOM.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
};

// Typewriter Effect
const Typewriter = {
    init() {
        this.type();
    },

    type() {
        const { texts, currentIndex, charIndex, isDeleting } = State.typewriter;
        const currentText = texts[currentIndex];

        if (!DOM.typewriterText) return;

        if (isDeleting) {
            DOM.typewriterText.textContent = currentText.substring(0, charIndex - 1);
            State.typewriter.charIndex--;
            State.typewriter.delay = 60;
        } else {
            DOM.typewriterText.textContent = currentText.substring(0, charIndex + 1);
            State.typewriter.charIndex++;
            State.typewriter.delay = 100;
        }

        if (!isDeleting && charIndex === currentText.length) {
            State.typewriter.isDeleting = true;
            State.typewriter.delay = 1500;
        } else if (isDeleting && charIndex === 0) {
            State.typewriter.isDeleting = false;
            State.typewriter.currentIndex = (currentIndex + 1) % texts.length;
            State.typewriter.delay = 500;
        }

        setTimeout(() => this.type(), State.typewriter.delay);
    }
};

// Form Handler
const ContactForm = {
    init() {
        if (DOM.contactForm) {
            DOM.contactForm.addEventListener('submit', this.handleSubmit.bind(this));
        }
    },

    handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(DOM.contactForm);
        const data = Object.fromEntries(formData);

        if (!this.validateForm(data)) return;

        fetch(DOM.contactForm.action, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert('Message sent successfully!');
            DOM.contactForm.reset();
        })
        .catch(error => {
            alert('Error sending message. Please try again.');
        });
    },

    validateForm(data) {
        if (!data.name || data.name.length < 2) {
            alert('Please enter a valid name');
            return false;
        }
        if (!data.email || !data.email.includes('@')) {
            alert('Please enter a valid email');
            return false;
        }
        if (!data.message || data.message.length < 10) {
            alert('Please enter a message (minimum 10 characters)');
            return false;
        }
        return true;
    }
};

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
    DOM.init();
    Navigation.init();
    Typewriter.init();
    ContactForm.init();

    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
            easing: 'ease',
            delay: 100,
            mirror: false,
            anchorPlacement: 'top-bottom'
        });
    }
});

// Handle visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden && State.scroll.timer) {
        clearTimeout(State.scroll.timer);
    }
});