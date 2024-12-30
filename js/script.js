const SHEET_ID = '1G1UjWN_ru3PdQf-qlKuwIT5CCfQSuA6reOzQZdu6FW8';
const API_KEY = 'AIzaSyAmOoWpQprHyZS97DiIXCdy2LFkAe0POa8';

const urls = {
    navbar: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Navbar?key=${API_KEY}`,
    body: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Body?key=${API_KEY}`,
    header: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Header?key=${API_KEY}`,
    footer: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Footer?key=${API_KEY}`,
    services: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Services?key=${API_KEY}`, 

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
    const content = document.getElementById("content");
    const tagFilter = document.getElementById("tag-filter");
    const searchBar = document.getElementById("search-bar");
    const searchButton = document.getElementById("search-button");
    const paginationContainer = document.getElementById("pagination");

    const maxCardsPerPageMobile = 3; // Batas kartu per halaman pada perangkat mobile
    let currentPage = 1; // Menyimpan halaman saat ini

    // Dapatkan semua tag unik
    const allTags = [...new Set(data.values.slice(1).flatMap(row => row[2].split(",").map(tag => tag.trim())))];
    tagFilter.innerHTML += allTags.map(tag => `<option value="${tag}">${tag}</option>`).join("");

    const isMobile = () => window.innerWidth <= 768;

    // Fungsi untuk merender data yang difilter
    const renderFiltered = (searchValue = "", filterValue = "", page = 1) => {
        const isMobileView = isMobile();
        const cardsPerPage = isMobileView ? 3 : 6; // 3 kartu di mobile, 6 kartu di desktop

        const filteredData = data.values.slice(1).filter(row => {
            const titleMatch = row[1].toLowerCase().includes(searchValue);
            const descriptionMatch = row[3].toLowerCase().includes(searchValue);
            const tagMatch = row[2].toLowerCase().includes(searchValue);
            const filterMatch = filterValue === "" || row[2].split(",").map(tag => tag.trim()).includes(filterValue);
            return (titleMatch || descriptionMatch || tagMatch) && filterMatch;
        });

        const totalPages = Math.ceil(filteredData.length / cardsPerPage);
        const startIndex = (page - 1) * cardsPerPage;
        const paginatedData = filteredData.slice(startIndex, startIndex + cardsPerPage);

        content.innerHTML = paginatedData.map(row => {
            const tags = row[2]
                .split(",")
                .map(tag => `<span class="card-tag">${tag.trim()}</span>`)
                .join("");

            const maxDescriptionLength = 100;
            const isLongDescription = row[3].length > maxDescriptionLength;
            const shortDescription = row[3].slice(0, maxDescriptionLength);

            return `
                <div class="card">
                    <img src="${row[0]}" alt="${row[1]}">
                    <div class="card-body">
                        <div class="card-tags">${tags}</div>
                        <h3 class="card-title">
                            <a href="${row[4]}" target="_blank">${row[1]}</a>
                        </h3>
                        <p class="card-description" data-full="${row[3]}" data-short="${shortDescription}">
                            ${isLongDescription ? shortDescription + "..." : row[3]}
                        </p>
                        ${isLongDescription ? `<button class="toggle-description">See More</button>` : ""}
                    </div>
                </div>
            `;
        }).join("");

        document.querySelectorAll(".toggle-description").forEach(button => {
            button.addEventListener("click", () => {
                const descriptionElement = button.previousElementSibling;
                const isExpanded = button.textContent === "Hide";
                if (isExpanded) {
                    descriptionElement.textContent = descriptionElement.getAttribute("data-short") + "...";
                    button.textContent = "See More";
                } else {
                    descriptionElement.textContent = descriptionElement.getAttribute("data-full");
                    button.textContent = "Hide";
                }
            });
        });

        renderPagination(page, totalPages);
    };

    // Fungsi untuk memperbarui halaman
    const updatePage = (newPage) => {
        const searchValue = searchBar.value.toLowerCase();
        const filterValue = tagFilter.value;
        currentPage = newPage; // Update currentPage
        renderFiltered(searchValue, filterValue, currentPage);
    };

    // Fungsi untuk merender tombol pagination
    const renderPagination = (currentPage, totalPages) => {
        paginationContainer.innerHTML = "";

        if (totalPages <= 1) {
            paginationContainer.style.display = "none";
            return;
        }
        paginationContainer.style.display = "flex";

        const prevButton = document.createElement("button");
        prevButton.textContent = "Previous";
        prevButton.className = "pagination-btn";
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener("click", () => updatePage(currentPage - 1));
        paginationContainer.appendChild(prevButton);

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement("button");
            pageButton.textContent = i;
            pageButton.className = "pagination-btn";
            if (i === currentPage) {
                pageButton.classList.add("active");
            }
            pageButton.addEventListener("click", () => updatePage(i));
            paginationContainer.appendChild(pageButton);
        }

        const nextButton = document.createElement("button");
        nextButton.textContent = "Next";
        nextButton.className = "pagination-btn";
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener("click", () => updatePage(currentPage + 1));
        paginationContainer.appendChild(nextButton);
    };

    // Event listener untuk pencarian dan filter
    searchButton.addEventListener("click", () => {
        const searchValue = searchBar.value.toLowerCase();
        const filterValue = tagFilter.value;
        currentPage = 1;
        renderFiltered(searchValue, filterValue, currentPage);
    });

    searchBar.addEventListener("input", () => {
        const searchValue = searchBar.value.toLowerCase();
        const filterValue = tagFilter.value;
        currentPage = 1;
        renderFiltered(searchValue, filterValue, currentPage);
    });

    tagFilter.addEventListener("change", () => {
        const searchValue = searchBar.value.toLowerCase();
        const filterValue = tagFilter.value;
        currentPage = 1;
        renderFiltered(searchValue, filterValue, currentPage);
    });

    // Event listener untuk resize
    window.addEventListener("resize", () => {
        const searchValue = searchBar.value.toLowerCase();
        const filterValue = tagFilter.value;
        renderFiltered(searchValue, filterValue, currentPage); // Tetap di halaman saat ini
    });

    renderFiltered();
};

// Fungsi fetch data dari Google Sheets
const fetchServicesData = async () => {
    try {
        const response = await fetch(urls.services);
        const data = await response.json();
        const rows = data.values.slice(1); // Abaikan header
        
        return rows.map(row => ({
            image: row[0] || "", // Pastikan kolom image ada
            title: row[1] || "Untitled", // Default title jika kosong
            price: row[2] || "Price not available", // Default price jika kosong
            description: row[3] || "No description available.", // Default description jika kosong
            features: (row[4] || "").split(',').map(feature => feature.trim()), // Default empty array jika tidak ada fitur
            tags: (row[5] || "").split(',').map(tag => tag.trim()), // Default empty array jika tidak ada tags
        }));
    } catch (error) {
        console.error("Error fetching services data:", error);
        return [];
    }
};

let autoSlideInterval; // Untuk auto-slide interval

const renderServices = async () => {
  const slider = document.querySelector(".services-slider");
  if (!slider) {
    console.error("Element .services-slider tidak ditemukan!");
    return;
  }

  const servicesData = await fetchServicesData(); // Ambil data dari Google Sheets (sesuaikan fungsi fetchServicesData)
  slider.innerHTML = servicesData
    .map(
      (service) => `
        <div class="card">
          <img src="${service.image}" alt="${service.title}">
          <h3>${service.title}</h3>
          <p>${service.price}</p>
          <p>${service.description}</p>
          <ul>
            ${service.features.map((feature) => `<li>${feature}</li>`).join("")}
          </ul>
          <div class="card-tags">
            ${service.tags.map((tag) => `<span>${tag}</span>`).join("")}
          </div>
        </div>
      `
    )
    .join("");

  initSlider();
};


const initSlider = () => {
    const slider = document.querySelector(".services-slider");
    const cards = [...slider.querySelectorAll(".card")];
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    let currentIndex = 0; // Indeks slide aktif
    let autoSlideInterval;
  
    if (!slider || !cards.length || !prevBtn || !nextBtn) {
      console.error("Elemen slider atau tombol navigasi tidak ditemukan!");
      return;
    }
  
    // Fungsi untuk mendapatkan jumlah kartu yang terlihat berdasarkan ukuran layar
    const getVisibleCards = () => (window.innerWidth <= 768 ? 1 : 3); // 1 kartu di mobile, 3 kartu di desktop
  
    // Clone pertama dan terakhir untuk looping seamless
    const createClones = () => {
      const visibleCards = getVisibleCards();
      const cloneBefore = cards.slice(-visibleCards).map((card) => card.cloneNode(true));
      const cloneAfter = cards.slice(0, visibleCards).map((card) => card.cloneNode(true));
      cloneBefore.forEach((clone) => slider.prepend(clone)); // Tambahkan ke awal
      cloneAfter.forEach((clone) => slider.append(clone)); // Tambahkan ke akhir
    };
  
    // Fungsi untuk memperbarui posisi slider
    const updateSliderPosition = (index) => {
      const cardWidth = cards[0].offsetWidth + 20; // Lebar kartu + margin
      slider.style.transition = "transform 1s cubic-bezier(0.25, 0.1, 0.25, 1)"; // Animasi lebih smooth
      slider.style.transform = `translateX(-${index * cardWidth}px)`;
    };
  
    // Fungsi untuk mengatur posisi slider tanpa animasi
    const setSliderPositionWithoutTransition = (index) => {
      const cardWidth = cards[0].offsetWidth + 20; // Lebar kartu + margin
      slider.style.transition = "none";
      slider.style.transform = `translateX(-${index * cardWidth}px)`;
    };
  
    // Fungsi untuk slide ke depan
    const slideNext = () => {
      const visibleCards = getVisibleCards();
      currentIndex += visibleCards;
  
      // Jika sudah sampai clone terakhir, lompat ke awal asli
      if (currentIndex >= cards.length + visibleCards) {
        setTimeout(() => {
          currentIndex = visibleCards;
          setSliderPositionWithoutTransition(currentIndex);
        }, 1000); // Tunggu hingga transisi selesai (1s)
      }
  
      updateSliderPosition(currentIndex);
    };
  
    // Fungsi untuk slide ke belakang
    const slidePrev = () => {
      const visibleCards = getVisibleCards();
      currentIndex -= visibleCards;
  
      // Jika sudah sampai clone pertama, lompat ke akhir asli
      if (currentIndex < 0) {
        setTimeout(() => {
          currentIndex = cards.length;
          setSliderPositionWithoutTransition(currentIndex);
        }, 1000); // Tunggu hingga transisi selesai (1s)
      }
  
      updateSliderPosition(currentIndex);
    };
  
    // Tombol navigasi
    nextBtn.addEventListener("click", () => {
      slideNext();
      restartAutoSlide(); // Restart auto-slide ketika tombol diklik
    });
  
    prevBtn.addEventListener("click", () => {
      slidePrev();
      restartAutoSlide(); // Restart auto-slide ketika tombol diklik
    });
  
    // Auto-slide
    const startAutoSlide = () => {
      autoSlideInterval = setInterval(() => {
        slideNext();
      }, 5000); // Auto-slide setiap 5 detik
    };
  
    const restartAutoSlide = () => {
      clearInterval(autoSlideInterval);
      startAutoSlide();
    };
  
    // Perbarui posisi slider saat window diresize
    window.addEventListener("resize", () => {
      setSliderPositionWithoutTransition(currentIndex);
    });
  
    // Inisialisasi slider
    createClones(); // Tambahkan clones
    const visibleCards = getVisibleCards();
    currentIndex = visibleCards; // Mulai dari indeks pertama setelah clones
    setSliderPositionWithoutTransition(currentIndex);
    startAutoSlide();
  };
  
  // Jalankan fungsi saat dokumen selesai dimuat
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      await renderServices();
      initSlider();
    } catch (error) {
      console.error("Error saat render layanan:", error);
    }
  });
  




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
    await renderServices();
    await renderFooter();
};

init();