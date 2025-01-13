const SHEET_ID = '1G1UjWN_ru3PdQf-qlKuwIT5CCfQSuA6reOzQZdu6FW8';
const API_KEY = 'AIzaSyAmOoWpQprHyZS97DiIXCdy2LFkAe0POa8';

const urls = {
    navbar: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Navbar?key=${API_KEY}`,
    lastUpdated: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Body!H1?key=${API_KEY}`,
    body: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Body?key=${API_KEY}`,
    header: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Header?key=${API_KEY}`,
    footer: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Footer?key=${API_KEY}`,
    services: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Services?key=${API_KEY}`,
    faq: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/FAQ?key=${API_KEY}`,
    metadata: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/FAQ_Metadata?key=${API_KEY}`,
    comments: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Comments?key=${API_KEY}`, 
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

// Fungsi untuk memparsing waktu dalam format dd/MM/yyyy HH:mm:ss
// Fungsi untuk memparsing waktu dalam format dd/MM/yyyy HH:mm:ss
const parseDate = (dateString) => {
    if (!dateString) {
        console.error("Tanggal tidak valid:", dateString);
        return new Date(); // Mengembalikan waktu sekarang jika format tidak valid
    }

    const [datePart, timePart] = dateString.split(" ");
    if (!datePart || !timePart) {
        console.error("Format tanggal atau waktu tidak valid:", dateString);
        return new Date(); // Mengembalikan waktu sekarang jika format tidak valid
    }

    const [day, month, year] = datePart.split("/").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    // Pastikan nilai tanggal dan waktu valid
    if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        console.error("Nilai tanggal atau waktu tidak valid:", dateString);
        return new Date(); // Mengembalikan waktu sekarang jika format tidak valid
    }

    return new Date(year, month - 1, day, hours, minutes, seconds); // Bulan dikurangi 1 karena dimulai dari 0 (Jan = 0)
};

// Fungsi untuk menghitung waktu dalam format yang diinginkan
const formatTime = (lastUpdated) => {
    const now = new Date();

    // Pastikan lastUpdated valid sebelum diproses
    const updatedTime = parseDate(lastUpdated);
    
    // Jika updatedTime adalah waktu sekarang (berarti format tidak valid), kembalikan string default
    if (updatedTime.getTime() === now.getTime()) {
        return "Waktu tidak valid";
    }

    const diffMs = now - updatedTime; // Selisih waktu dalam milidetik
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
        return `${diffMinutes} menit yang lalu`;
    } else if (diffHours < 24) {
        return `${diffHours} jam yang lalu`;
    } else if (diffDays === 1) {
        return `Kemarin`;
    } else {
        // Format detail waktu
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return updatedTime.toLocaleDateString('id-ID', options);
    }
};


// Fungsi utama untuk merender kartu
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
        const cardsPerPage = isMobileView ? 3 : 6;
    
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
        
            // Hitung format waktu pembaruan
            const formattedTime = formatTime(row[5]); // `row[5]` adalah kolom "Last Updated"
        
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
                        <div class="card-footer">
                            <button class="card-link-btn">
                                <a href="${row[4]}" target="_blank">Visit Link</a>
                            </button>
                            <p class="last-updated">Last Updated: ${formattedTime}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    
        // Tambahkan event listener untuk tombol "See More"
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

const renderServices = async () => {
  const slider = document.querySelector(".services-slider .swiper-wrapper");
  if (!slider) {
    console.error("Element .services-slider tidak ditemukan!");
    return;
  }

  const servicesData = await fetchServicesData(); // Ambil data dari Google Sheets
  slider.innerHTML = servicesData
    .map(
      (service) => `
        <div class="swiper-slide">
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
        </div>
      `
    )
    .join("");

  initServiceSlider(); // Inisialisasi Swiper.js
};

const initServiceSlider = () => {
  new Swiper(".services-slider", {
    slidesPerView: 1.2,
    spaceBetween: 20,
    centeredSlides: true,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      768: {
        slidesPerView: 3,
      },
    },
    // Prevent default focus behavior
    slideToClickedSlide: false, // Nonaktifkan perpindahan slide dengan klik
  });
};

const loadFAQ = async () => {
    try {
        // Fetch FAQ data
        const responseFAQ = await fetch(urls.faq);
        const dataFAQ = await responseFAQ.json();

        // Fetch Metadata
        const responseMetadata = await fetch(urls.metadata);
        const dataMetadata = await responseMetadata.json();

        const faqContainer = document.querySelector("#faq-container");
        const title = dataMetadata.values.find(row => row[0] === "Title")[1];
        const description = dataMetadata.values.find(row => row[0] === "Description")[1];

        // Set title and description
        document.querySelector(".faq-title").textContent = title;
        document.querySelector(".faq-description").textContent = description;

        // Populate FAQ items
        faqContainer.innerHTML = dataFAQ.values
            .map(
                row => `
            <div class="faq-item">
                <div class="faq-question">
                    ${row[0]}
                     <svg
        class="faq-toggle-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        >
        <polyline points="6 9 12 15 18 9"></polyline> <!-- Chevron down -->
    </svg>
                </div>
                <div class="faq-answer">
                    ${row[1]}
                </div>
            </div>
        `
            )
            .join("");

        // Add toggle functionality
        const faqItems = document.querySelectorAll(".faq-item");
        faqItems.forEach(item => {
            const question = item.querySelector(".faq-question");
            question.addEventListener("click", () => {
                item.classList.toggle("open");
            });
        });
    } catch (error) {
        console.error("Error loading FAQ:", error);
    }
};

// Initialize FAQ
document.addEventListener("DOMContentLoaded", loadFAQ);

// /// Fungsi untuk mengambil 10 komentar terbaru
// const fetchComments = async () => {
//     try {
//         const response = await fetch(urls.comments);
//         const data = await response.json();
//         const rows = data.values.slice(1); // Abaikan header row

//         // Ambil 10 komentar terbaru
//         return rows.slice(-10).reverse().map(row => ({
//             timestamp: row[0] || "Unknown time",
//             email: row[1] || "Anonymous",
//             name: row[2] || "Anonymous",
//             comment: row[3] || "",
//         }));
//     } catch (error) {
//         console.error("Error fetching comments:", error);
//         return [];
//     }
// };

// // Fungsi untuk menyimpan komentar ke Google Sheets
// const saveComment = async (commentData) => {
//     const saveURL = "https://script.google.com/macros/s/AKfycbxwcAMZZxC4dzCa8jyh052DZmJagHV45HMrV0UaLGYu0eUMp__c5faBXuX_oOHMk0V-/exec";
//     try {
//         const response = await fetch(saveURL, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(commentData),
//         });

//         const responseData = await response.json();
//         if (responseData.status !== "success") {
//             console.error("Error Response:", responseData);
//             throw new Error(responseData.message || "Failed to save comment.");
//         }

//         console.log("Comment saved successfully!");
//     } catch (error) {
//         console.error("Error saving comment:", error);
//     }
// };

// // Fungsi untuk merender komentar ke dalam HTML
// const renderComments = async () => {
//     const commentsList = document.querySelector("#comments-list");
//     commentsList.innerHTML = "<p>Loading comments...</p>";

//     const comments = await fetchComments();

//     if (comments.length === 0) {
//         commentsList.innerHTML = "<p>No comments yet. Be the first to comment!</p>";
//         return;
//     }

//     commentsList.innerHTML = comments
//         .map(
//             (comment) => `
//         <li>
//           <strong>${comment.name} (${comment.email})</strong> - <em>${comment.timestamp}</em>
//           <p>${comment.comment}</p>
//         </li>
//       `
//         )
//         .join("");
// };

// // Event listener untuk form submit
// document.querySelector("#comment-form").addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const name = document.querySelector("#name").value;
//     const email = document.querySelector("#email").value;
//     const comment = document.querySelector("#comment").value;

//     const commentData = { name, email, comment };

//     // Simpan komentar ke Google Sheets
//     await saveComment(commentData);

//     // Render ulang komentar
//     await renderComments();

//     // Reset form
//     e.target.reset();
// });

// // Render komentar saat dokumen selesai dimuat
// document.addEventListener("DOMContentLoaded", () => {
//     renderComments();
// });


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

document.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.getElementById("loading-screen");

  // Menghapus layar loading setelah durasi tertentu
  setTimeout(() => {
    loadingScreen.classList.add("hidden");
  }, 3000); // Durasi 3 detik (atau sesuaikan dengan kebutuhan)
});



const init = async () => {
    await renderNavbar();
    await renderCarousel();
    await renderCards();
    await renderServices();
    await renderFooter();
};

init();