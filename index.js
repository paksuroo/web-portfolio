// Navbar scroll effect
window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");
    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

// Enhanced smooth scroll with offset for navbar
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("href");
        if (targetId === "#") return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const navbarHeight = document.querySelector(".navbar").offsetHeight;
            const targetPosition =
                targetElement.getBoundingClientRect().top +
                window.pageYOffset -
                navbarHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth",
            });

            // Update URL hash without jumping
            history.pushState(null, null, targetId);
        }
    });
});

// Project modals functionality
document.addEventListener("DOMContentLoaded", function () {
    if (typeof bootstrap !== "undefined") {
        const projectContainers = document.querySelectorAll(
            ".project-carousel-container"
        );

        projectContainers.forEach((container, index) => {
            container.addEventListener("click", function () {
                const modalId = `projectModal${index + 1}`;
                const modal = new bootstrap.Modal(
                    document.getElementById(modalId)
                );
                modal.show();

                const carousel = document.querySelector(
                    `#${modalId} .carousel`
                );
                if (carousel) {
                    const carouselInstance = new bootstrap.Carousel(carousel);
                    carouselInstance.to(0);
                }
            });
        });

        const carousels = document.querySelectorAll(".carousel");
        carousels.forEach((carousel) => {
            carousel.addEventListener("click", function (e) {
                e.stopPropagation();
            });
        });

        const projectLinks = document.querySelectorAll(".project-link");
        projectLinks.forEach((link) => {
            link.addEventListener("click", function (e) {
                e.stopPropagation();
                if (
                    link.classList.contains("disabled") ||
                    link.getAttribute("href") === "#"
                ) {
                    e.preventDefault();
                }
            });
        });

        const modals = document.querySelectorAll(".modal");
        modals.forEach((modal) => {
            modal.addEventListener("click", function (e) {
                if (e.target === modal) {
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    modalInstance.hide();
                }
            });
        });
    }
});

// Scroll progress bar
function createScrollProgress() {
    const progressBar = document.createElement("div");
    progressBar.id = "scroll-progress";
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 4px;
        background: var(--accent);
        width: 0%;
        z-index: 2000;
        transition: width 0.25s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY;
        const docHeight =
            document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = `${progress}%`;
    });
}

// Animated skill counters (optimized with IntersectionObserver)
function animateSkillCounters() {
    const counters = document.querySelectorAll(".skill-card");
    if (!counters.length) return;

    counters.forEach((card) => {
        card.style.transform = "translateY(30px)";
        card.style.opacity = "0";
        card.style.transition = "transform 0.5s ease, opacity 0.5s ease";
    });

    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.transform = "translateY(0)";
                        entry.target.style.opacity = "1";
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.25,
        }
    );

    counters.forEach((card) => observer.observe(card));
}

// Typewriter effect with speed in ms per character
function typewriterEffect() {
    const textElement = document.querySelector(".intro-text");
    if (!textElement) return;

    const originalText = textElement.textContent;
    textElement.textContent = "";
    let i = 0;

    // Typing speed (milliseconds per character)
    const speed = 20; // adjust this value

    function type() {
        if (i < originalText.length) {
            textElement.textContent += originalText.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    // Start typing when element is in view
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            type();
            observer.disconnect();
        }
    });

    observer.observe(textElement);
}

// Enhanced modal transitions
function enhanceModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
        modal.classList.add("fade-scale");
    });

    const style = document.createElement("style");
    style.textContent = `
        .modal.fade-scale .modal-dialog {
            transform: scale(0.7);
            transition: transform 0.3s ease-out;
        }
        .modal.fade-scale.show .modal-dialog {
            transform: scale(1);
        }
        .carousel-item {
            transition: transform 0.6s ease-in-out;
        }
    `;
    document.head.appendChild(style);
}

// Lazy loading for images
function setupLazyLoading() {
    const lazyImages = document.querySelectorAll("img[data-src]");

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove("lazy");
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach((img) => {
        imageObserver.observe(img);
    });
}

// Enhanced navigation active state
function enhanceNavigation() {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

    function updateActiveNav() {
        let current = "";
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const navbarHeight = document.querySelector(".navbar").offsetHeight;
            if (window.scrollY >= sectionTop - navbarHeight - 50) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active");
            }
        });
    }

    window.addEventListener("scroll", updateActiveNav);
    updateActiveNav();
}

// Theme toggle with localStorage
function setupThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    if (!toggleBtn) return;

    // Apply saved preference
    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light-mode");
        toggleBtn.textContent = "🌙";
    } else {
        toggleBtn.textContent = "☀️";
    }

    toggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");

        if (document.body.classList.contains("light-mode")) {
            localStorage.setItem("theme", "light");
            toggleBtn.textContent = "🌙";
        } else {
            localStorage.setItem("theme", "dark");
            toggleBtn.textContent = "☀️";
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    createScrollProgress();
    animateSkillCounters();
    typewriterEffect();
    enhanceModals();
    setupLazyLoading();
    enhanceNavigation();
    setupThemeToggle(); // ✅ enable theme toggle
});
