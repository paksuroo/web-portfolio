// Navbar scroll effect
window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");
    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

function computeNavbarHeight() {
    const navbar = document.querySelector(".navbar");
    const navbarCollapse = document.querySelector(".navbar-collapse");
    if (!navbar) return 0;

    let height = navbar.getBoundingClientRect().height;

    // If collapse is visible and taller (mobile expanded), use the expanded height
    if (navbarCollapse && navbarCollapse.classList.contains("show")) {
        const collapseH = navbarCollapse.getBoundingClientRect().height;
        if (collapseH > height) height = collapseH;
    }

    return Math.ceil(height); // integer px is fine
}

// ---------- helper: wait until collapse is hidden (works with/without Bootstrap) ----------
function waitForCollapseHidden(navbarCollapse) {
    return new Promise((resolve) => {
        if (!navbarCollapse || !navbarCollapse.classList.contains("show")) {
            return resolve();
        }

        // If Bootstrap's JS is present, listen for its event
        if (typeof bootstrap !== "undefined") {
            const handler = () => {
                navbarCollapse.removeEventListener(
                    "hidden.bs.collapse",
                    handler
                );
                resolve();
            };
            navbarCollapse.addEventListener("hidden.bs.collapse", handler, {
                once: true,
            });
            return;
        }

        // Fallback: observe class changes (detect removal of "show")
        const mo = new MutationObserver((mutations) => {
            for (const m of mutations) {
                if (m.attributeName === "class") {
                    if (!navbarCollapse.classList.contains("show")) {
                        mo.disconnect();
                        return resolve();
                    }
                }
            }
        });
        mo.observe(navbarCollapse, { attributes: true });

        // Safety timeout (use computed transition duration if available)
        const cs = window.getComputedStyle(navbarCollapse);
        const dur = parseFloat(cs.transitionDuration) || 0.35; // seconds
        setTimeout(() => {
            if (mo) mo.disconnect();
            resolve();
        }, dur * 1000 + 120);
    });
}

// ---------- Enhanced smooth scroll that waits for mobile collapse to close ----------
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", async function (e) {
        const targetId = this.getAttribute("href");
        if (!targetId || targetId === "#") return; // ignore top anchors / empty

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        e.preventDefault();

        const navbarCollapse = document.querySelector(".navbar-collapse");
        const navbarToggler = document.querySelector(".navbar-toggler");

        // If mobile menu is open, hide it first (use Bootstrap if available)
        if (navbarCollapse && navbarCollapse.classList.contains("show")) {
            if (typeof bootstrap !== "undefined") {
                const bsCollapse =
                    bootstrap.Collapse.getInstance(navbarCollapse) ||
                    new bootstrap.Collapse(navbarCollapse, { toggle: false });
                bsCollapse.hide();
            } else {
                // fallback: manually hide classes/attributes
                navbarCollapse.classList.remove("show");
                if (navbarToggler) {
                    navbarToggler.setAttribute("aria-expanded", "false");
                    navbarToggler.classList.add("collapsed");
                }
            }

            // wait until it's hidden (handles both bootstrap & manual)
            await waitForCollapseHidden(navbarCollapse);
        }

        // compute navbar height after collapse hidden
        const navbarHeight = computeNavbarHeight();

        // small extra spacing to avoid exact top flush
        const extraOffset = 8;

        const targetPosition =
            targetElement.getBoundingClientRect().top +
            window.pageYOffset -
            navbarHeight -
            extraOffset;

        window.scrollTo({
            top: Math.max(0, Math.floor(targetPosition)),
            behavior: "smooth",
        });

        // update URL hash without immediate jump
        history.pushState(null, null, targetId);
    });
});

// ---------- Enhanced navigation active state (uses same dynamic height) ----------
function enhanceNavigation() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    function updateActiveNav() {
        const navbarHeight = computeNavbarHeight();
        let current = "";

        // pick the last section that has its top <= navbarHeight + small offset
        sections.forEach((section) => {
            const rectTop = section.getBoundingClientRect().top;
            if (rectTop - navbarHeight <= 5) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            const href = link.getAttribute("href") || "";
            const targetHash = href.split("#")[1]
                ? `#${href.split("#")[1]}`
                : href;
            link.classList.remove("active");
            if (targetHash === `#${current}`) {
                link.classList.add("active");
            }
        });
    }

    window.addEventListener("scroll", updateActiveNav, { passive: true });
    window.addEventListener("resize", updateActiveNav);
    // Also update when collapse shows/hides (Bootstrap events), or mutation fallback
    const navbarCollapse = document.querySelector(".navbar-collapse");
    if (navbarCollapse) {
        if (typeof bootstrap !== "undefined") {
            navbarCollapse.addEventListener(
                "shown.bs.collapse",
                updateActiveNav
            );
            navbarCollapse.addEventListener(
                "hidden.bs.collapse",
                updateActiveNav
            );
        } else {
            const mo = new MutationObserver(() => updateActiveNav());
            mo.observe(navbarCollapse, { attributes: true });
        }
    }

    // initial highlight
    updateActiveNav();
}

// ---------- Navbar auto-close: only auto-close for non-hash links (prevent race) ----------
function setupNavbarAutoClose() {
    const navbarToggler = document.querySelector(".navbar-toggler");
    const navbarCollapse = document.querySelector(".navbar-collapse");

    if (!navbarToggler || !navbarCollapse) return;

    document.querySelectorAll(".navbar-nav .nav-link").forEach((navLink) => {
        navLink.addEventListener("click", function () {
            const href = (this.getAttribute("href") || "").trim();

            // Only auto-close immediately for links that are not internal anchors
            if (!href.startsWith("#") && window.innerWidth < 992) {
                if (typeof bootstrap !== "undefined") {
                    const bsCollapse =
                        bootstrap.Collapse.getInstance(navbarCollapse) ||
                        new bootstrap.Collapse(navbarCollapse, {
                            toggle: false,
                        });
                    bsCollapse.hide();
                } else {
                    navbarCollapse.classList.remove("show");
                    navbarToggler.setAttribute("aria-expanded", "false");
                    navbarToggler.classList.add("collapsed");
                }
            }
        });
    });
}

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
    enhanceModals();
    setupLazyLoading();
    enhanceNavigation();
    setupThemeToggle();
    setupNavbarAutoClose();
});
