const SHEET_ID = '1G1UjWN_ru3PdQf-qlKuwIT5CCfQSuA6reOzQZdu6FW8';
const API_KEY = 'AIzaSyAmOoWpQprHyZS97DiIXCdy2LFkAe0POa8';

const urls = {
    navbar: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Navbar?key=${API_KEY}`,
    body: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Body?key=${API_KEY}`,
    header: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Header?key=${API_KEY}`,
    footer: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Footer?key=${API_KEY}`,
};

const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch data');
        return response.json();
    } catch (error) {
        console.error('Error:', error);
        return null; // Return null to handle errors gracefully
    }
};

// Capture hamburger button and navbar links elements
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

// Add event listener to hamburger button
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active'); // Toggle button animation
    navLinks.classList.toggle('active'); // Toggle menu links
});

const renderNavbar = async () => {
    const data = await fetchData(urls.navbar);
    const navLinks = document.getElementById('nav-links');
    const logoImage = document.getElementById('logo-image');

    const rows = data.values.slice(1); // Skip header row

    // Clear Existing Content
    navLinks.innerHTML = '';

    // Set Logo
    const logoRow = rows.find(row => row[0] === 'Logo');
    if (logoRow) {
        logoImage.src = logoRow[1];
        logoImage.alt = logoRow[2] || 'Logo';
    }

    // Add Navigation Links
    rows.filter(row => row[0] === 'Link').forEach(linkRow => {
        const link = document.createElement('a');
        link.href = linkRow[2];
        link.textContent = linkRow[1];
        link.target = '_blank';
        navLinks.appendChild(link);
    });
};

const renderCarousel = async () => {
    const data = await fetchData(urls.header);
    const carousel = document.getElementById('header-carousel');
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
};

const renderCards = async () => {
    const data = await fetchData(urls.body);
    const content = document.getElementById('content');
    const tagFilter = document.getElementById('tag-filter');
    const searchBar = document.getElementById('search-bar');
    const searchButton = document.getElementById('search-button');

    // Get all unique tags
    const allTags = [...new Set(data.values.slice(1).flatMap(row => row[2].split(',').map(tag => tag.trim())))];
    tagFilter.innerHTML += allTags.map(tag => `<option value="${tag}">${tag}</option>`).join('');

    // Function to render filtered data
    const renderFiltered = (searchValue = '', filterValue = '') => {
        const filteredData = data.values.slice(1).filter(row => {
            const titleMatch = row[1].toLowerCase().includes(searchValue); // Title search
            const descriptionMatch = row[3].toLowerCase().includes(searchValue); // Description search
            const tagMatch = row[2].toLowerCase().includes(searchValue); // Tag search
            const filterMatch = filterValue === '' || row[2].split(',').map(tag => tag.trim()).includes(filterValue); // Tag filter
            return (titleMatch || descriptionMatch || tagMatch) && filterMatch;
        });

        content.innerHTML = filteredData.map(row => {
            const tags = row[2]
                .split(',')
                .map(tag => `<span class="card-tag">${tag.trim()}</span>`)
                .join('');
            return `
                <div class="card">
                    <img src="${row[0]}" alt="${row[1]}">
                    <div class="card-body">
                        <div class="card-tags">${tags}</div>
                        <h3 class="card-title">
                            <a href="${row[4]}" target="_blank">${row[1]}</a>
                        </h3>
                        <p class="card-description">${row[3]}</p>
                    </div>
                </div>
            `;
        }).join('');
    };

    // Event for search in navbar
    searchButton.addEventListener('click', () => {
        const searchValue = searchBar.value.toLowerCase();
        const filterValue = tagFilter.value;
        renderFiltered(searchValue, filterValue);
    });

    searchBar.addEventListener('input', () => {
        const searchValue = searchBar.value.toLowerCase();
        const filterValue = tagFilter.value;
        renderFiltered(searchValue, filterValue);
    });

    tagFilter.addEventListener('change', () => {
        const searchValue = searchBar.value.toLowerCase();
        const filterValue = tagFilter.value;
        renderFiltered(searchValue, filterValue);
    });

    renderFiltered(); // Initial render
};

const renderFooter = async () => {
    const data = await fetchData(urls.footer);
    const rows = data.values.slice(1); // Skip header row

    const addressSection = document.getElementById('footer-address');
    const sitelinkSection = document.getElementById('footer-links');
    const contactSection = document.getElementById('footer-contact');

    // Clear existing content
    addressSection.innerHTML = '';
    sitelinkSection.innerHTML = '';
    contactSection.innerHTML = '';

    // Populate Address Section
    const addressTitle = rows.find(row => row[0] === 'Address' && row[1] === 'Title')[2 ];
    const addressContent = rows.find(row => row[0] === 'Address' && row[1] === 'Content')[2];
    addressSection.innerHTML = `
        <h4>${addressTitle}</h4>
        <p>${addressContent}</p>
    `;

    // Populate Sitelink Section
    const sitelinkTitle = rows.find(row => row[0] === 'Sitelink' && row[1] === 'Title')[2];
    const sitelinks = rows.filter(row => row[0] === 'Sitelink' && row[1].includes('Link Text'));
    sitelinkSection.innerHTML = `<h4>${sitelinkTitle}</h4><ul></ul>`;
    const sitelinkList = sitelinkSection.querySelector('ul');
    sitelinks.forEach(linkRow => {
        const text = linkRow[2];
        const urlRow = rows.find(r => r[0] === 'Sitelink' && r[1] === linkRow[1].replace('Text', 'URL'));
        const url = urlRow ? urlRow[2] : '#';
        sitelinkList.innerHTML += `<li><a href="${url}" target="_blank">${text}</a></li>`;
    });

    // Populate Contact Section
    const contactTitle = rows.find(row => row[0] === 'Contact' && row[1] === 'Title')[2];
    const emailLabel = rows.find(row => row[0] === 'Contact' && row[1] === 'Email Label')[2];
    const emailAddress = rows.find(row => row[0] === 'Contact' && row[1] === 'Email Address')[2];
    const phoneLabel = rows.find(row => row[0] === 'Contact' && row[1] === 'Phone Label')[2];
    const phoneNumber = rows.find(row => row[0] === 'Contact' && row[1] === 'Phone Number')[2];
    const socialLabel = rows.find(row => row[0] === 'Contact' && row[1] === 'Social Label')[2];
    const facebookLink = rows.find(row => row[0] === 'Contact' && row[1] === 'Social Facebook')[2];
    const instagramLink = rows.find(row => row[0] === 'Contact' && row[1] === 'Social Instagram')[2];

    contactSection.innerHTML = `
        <h4>${contactTitle}</h4>
        <p>${emailLabel}: <a href="mailto:${emailAddress}">${emailAddress}</a></p>
        <p>${phoneLabel}: <a href="tel:${phoneNumber}">${phoneNumber}</a></p>
        <p>${socialLabel}: 
            <a href="${facebookLink}" target="_blank">Facebook</a> | 
            <a href="${instagramLink}" target="_blank">Instagram</a>
        </p>
    `;
};

const fetchDataWithCache = async (url, key) => {
    const cachedData = localStorage.getItem(key);
    if (cachedData) return JSON.parse(cachedData);

    const data = await fetchData(url);
    if (data) localStorage.setItem(key, JSON.stringify(data));
    return data;
};

const init = async () => {
    await renderNavbar();
    await renderCarousel();
    await renderCards();
    await renderFooter();
};

init();