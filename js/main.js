import { fetchData } from "./utils/cache.js"; // Utilitas untuk caching data
import { urls } from "./config/api.js"; // URL API dari konfigurasi
import { applySEOSettings } from "./modules/seosettings.js"; // Import modul SEO
import { renderNavbar } from "./modules/navbar.js";
import { renderCarousel } from "./modules/carousel.js";
import { renderBody } from "./modules/body.js";
import { renderServices } from "./modules/services.js";
import { renderFooter } from "./modules/footer.js";
import { renderFAQ } from "./modules/faq.js"; // Tambahkan jika ada modul FAQ
import { renderAbout } from "./modules/about.js";


// Fungsi untuk inisialisasi loading screen
const initializeLoadingScreen = () => {
    const loadingScreen = document.getElementById("loading-screen");

    if (loadingScreen) {
        // Menghapus layar loading setelah durasi tertentu
        setTimeout(() => {
            loadingScreen.classList.add("hidden");
        }, 1500); // Durasi 3 detik
    } else {
        console.warn("Elemen loading screen tidak ditemukan!");
    }
};

// Fungsi utama untuk memuat semua komponen halaman
const init = async () => {
    try {
        await applySEOSettings();
        await renderNavbar();
        await renderCarousel();
        await renderBody();
        await renderServices();
        await renderFAQ(); // Tambahkan jika ada FAQ
        await renderAbout();
        await renderFooter();
    } catch (error) {
        console.error("Error during initialization:", error);
    }
};

// Menjalankan inisialisasi saat DOM siap
document.addEventListener("DOMContentLoaded", () => {
    initializeLoadingScreen();
    init();
});


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
