// modules/carousel.js - Carousel Rendering Module

import { urls } from "../config/api.js"; // Import URLs from configuration
import { fetchData } from "../utils/cache.js"; // Import fetch utility

// Render the carousel
export const renderCarousel = async () => {
    try {
        const data = await fetchData(urls.header, 'carousel-cache'); // Use caching
        const carousel = document.getElementById('header-carousel');

        if (!carousel) {
            console.error("Carousel element not found in DOM.");
            return;
        }

        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'carousel-dots';

        let currentIndex = 0;
        let touchStartX = 0;
        let touchEndX = 0;

        const slides = data.values.slice(1).map((row, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.style.backgroundImage = `url('${row[0]}')`;

            const slideContent = document.createElement('div');
            slideContent.className = 'carousel-content';
            slideContent.innerHTML = `
                <h2>
                    <a href="${row[3]}" target="_blank">${row[1]}</a>
                </h2>
                <p>${row[2]}</p>
            `;

            slide.appendChild(slideContent);
            if (index === 0) slide.classList.add('active');
            return slide;
        });

        const updateActiveSlide = (newIndex) => {
            slides.forEach((slide, index) => {
                if (index === newIndex) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });

            dotsContainer.children[currentIndex].classList.remove('active');
            currentIndex = newIndex;
            dotsContainer.children[currentIndex].classList.add('active');
        };

        // Create dots
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'carousel-dot';
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                updateActiveSlide(index);
            });
            dotsContainer.appendChild(dot);
        });

        // Append slides and dots to the carousel
        carousel.append(...slides, dotsContainer);

        // Touch events for swipe functionality
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        carousel.addEventListener('touchmove', (e) => {
            touchEndX = e.touches[0].clientX;
        });

        carousel.addEventListener('touchend', () => {
            if (touchStartX - touchEndX > 50) {
                // Swipe left
                const nextIndex = (currentIndex + 1) % slides.length;
                updateActiveSlide(nextIndex);
            } else if (touchStartX - touchEndX < -50) {
                // Swipe right
                const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
                updateActiveSlide(prevIndex);
            }
        });

        // Auto-slide functionality
        setInterval(() => {
            const nextIndex = (currentIndex + 1) % slides.length;
            updateActiveSlide(nextIndex);
        }, 5000); // 5 seconds
    } catch (error) {
        console.error("Error rendering carousel:", error);
    }
};
