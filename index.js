// Add 'scrolled' class to navbar on scroll
window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");
    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

// Optional: Smooth scroll when clicking nav links
document.querySelectorAll('.nav-link[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 70, // adjust offset for navbar height
                behavior: "smooth",
            });
        }
    });
});

// Project modals functionality
document.addEventListener("DOMContentLoaded", function () {
    // Add click event to project containers
    const projectContainers = document.querySelectorAll(
        ".project-carousel-container"
    );

    projectContainers.forEach((container, index) => {
        container.addEventListener("click", function () {
            const modalId = `projectModal${index + 1}`;
            const modal = new bootstrap.Modal(document.getElementById(modalId));
            modal.show();

            // Reset carousel to first slide when modal opens
            const carousel = document.querySelector(`#${modalId} .carousel`);
            if (carousel) {
                const carouselInstance = new bootstrap.Carousel(carousel);
                carouselInstance.to(0);
            }
        });
    });

    // Prevent carousel navigation from triggering modal
    const carousels = document.querySelectorAll(".carousel");
    carousels.forEach((carousel) => {
        carousel.addEventListener("click", function (e) {
            e.stopPropagation();
        });
    });

    // Prevent project links from triggering modal
    const projectLinks = document.querySelectorAll(".project-link");
    projectLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            e.stopPropagation();

            // For disabled links, prevent default behavior
            if (
                link.classList.contains("disabled") ||
                link.getAttribute("href") === "#"
            ) {
                e.preventDefault();
            }
        });
    });

    // Close modal when clicking outside content
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
        modal.addEventListener("click", function (e) {
            if (e.target === modal) {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                modalInstance.hide();
            }
        });
    });
});
