import { fetchData } from "../utils/cache.js"; // Menggunakan caching untuk fetch data
import { urls } from "../config/api.js"; // Mengimpor URL API dari konfigurasi

export const renderFAQ = async () => {
    try {
        // Fetch data FAQ dan metadata
        const faqData = await fetchData(urls.faq); // Data FAQ
        const metadata = await fetchData(urls.metadata); // Metadata untuk judul dan deskripsi

        // Ambil elemen kontainer
        const faqContainer = document.querySelector("#faq-container");
        if (!faqContainer) {
            console.error("#faq-container tidak ditemukan!");
            return;
        }

        // Set judul dan deskripsi FAQ
        const title = metadata.values.find(row => row[0] === "Title")[1] || "FAQ";
        const description = metadata.values.find(row => row[0] === "Description")[1] || "Frequently Asked Questions";
        document.querySelector(".faq-title").textContent = title;
        document.querySelector(".faq-description").textContent = description;

        // Render item FAQ
        faqContainer.innerHTML = faqData.values
            .map(
                ([question, answer]) => `
                <div class="faq-item">
                    <div class="faq-question">
                        ${question}
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
                        ${answer}
                    </div>
                </div>
            `
            )
            .join("");

        // Tambahkan toggle functionality
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
