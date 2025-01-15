import { fetchData } from "../utils/cache.js"; // Menggunakan fungsi fetchData dari utilitas cache
import { urls } from "../config/api.js"; // Mengambil URL dari konfigurasi API
import { initServiceSlider } from "../config/slider.js"; // Pastikan jalur file benar


export const renderServices = async () => {
  try {
    const data = await fetchData(urls.services); // Menggunakan caching saat mengambil data
    const [headers, ...rows] = data.values; // Header dan data baris berikutnya

    const servicesData = rows.map((row) =>
      headers.reduce((acc, header, index) => {
        acc[header] = row[index] || ""; // Menggunakan header sebagai key
        return acc;
      }, {})
    );

    const slider = document.querySelector(".services-slider .swiper-wrapper");
    if (!slider) {
      console.error("Element .services-slider tidak ditemukan!");
      return;
    }

    // Populate slider content
    slider.innerHTML = servicesData
      .map(
        (service) => `
        <div class="swiper-slide">
          <div class="card">
            <img src="${service.Image || "https://via.placeholder.com/400"}" alt="${service.Title || "Untitled"}">
            <h3>${service.Title || "Untitled"}</h3>
            <p>${service.Price || "Price not available"}</p>
            <p>${service.Description || "No description available."}</p>
            <ul>
              ${(service.Features || "")
                .split(",")
                .map((feature) => `<li>${feature.trim()}</li>`)
                .join("")}
            </ul>
            <div class="card-tags">
              ${(service.Tags || "")
                .split(",")
                .map((tag) => `<span>${tag.trim()}</span>`)
                .join("")}
            </div>
          </div>
        </div>
      `
      )
      .join("");

    // Initialize the slider after populating content
    initServiceSlider(".services-slider"); // Pastikan selector sesuai
  } catch (error) {
    console.error("Error rendering services:", error);
  }
};

