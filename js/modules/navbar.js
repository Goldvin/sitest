// modules/navbar.js - Navbar Rendering Module

import { urls } from "../config/api.js"; // Import URLs from configuration
import { fetchData } from "../utils/cache.js"; // Import fetch utility

// Function to handle hamburger menu toggle
const setupHamburgerMenu = () => {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active'); // Toggle button animation
            navLinks.classList.toggle('active'); // Toggle menu links
        });
    }
};

// Function to render the Navbar
export const renderNavbar = async () => {
    try {
        const data = await fetchData(urls.navbar, 'navbar-cache'); // Use caching

        const navLinks = document.getElementById('nav-links');
        const logoImage = document.getElementById('logo-image');

        if (!navLinks || !logoImage) {
            console.error("Navbar elements not found in DOM.");
            return;
        }

        const rows = data.values.slice(1); // Skip header row

        // Clear existing content
        navLinks.innerHTML = '';

        // Set Logo
        const logoRow = rows.find(row => row[0] === 'Logo');
        if (logoRow) {
            logoImage.src = logoRow[1];
            logoImage.alt = logoRow[2] || 'Logo';
        }

        // Add Navigation Links
        rows
            .filter(row => row[0] === 'Link')
            .forEach(linkRow => {
                const link = document.createElement('a');
                link.href = linkRow[2];
                link.textContent = linkRow[1];
                link.target = '_blank';
                navLinks.appendChild(link);
            });

        // Setup hamburger menu toggle
        setupHamburgerMenu();
    } catch (error) {
        console.error("Error rendering navbar:", error);
    }
};
