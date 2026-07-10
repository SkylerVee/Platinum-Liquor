// AUTOMATIC INTERSECTION OBSERVER FOR SCROLL ANIMATIONS
document.addEventListener("DOMContentLoaded", () => {
    // Select all sections with the animation class tag
    const animatedSections = document.querySelectorAll(".scroll-animate");

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // As soon as the user scrolls to a section, slide it smoothly into view
            if (entry.isIntersecting) {
                entry.target.classList.add("show-now");
                scrollObserver.unobserve(entry.target); // Animates once for a clean look
            }
        });
    }, {
        threshold: 0.15 // Triggers when 15% of the card crosses onto the screen
    });

    // Mount the observer to every designated layout box
    animatedSections.forEach(section => {
        scrollObserver.observe(section);
    });
});