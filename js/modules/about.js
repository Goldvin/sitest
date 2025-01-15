import { fetchData } from "../utils/cache.js"; // Menggunakan fungsi fetchData dari utilitas cache
import { urls } from "../config/api.js"; // Mengambil URL dari konfigurasi API

export const renderAbout = async () => {
  try {
    const data = await fetchData(urls.about); // Menggunakan caching saat mengambil data
    const [headers, values] = [data.values[0], data.values[1]]; // Header row dan data pertama

    const aboutData = headers.reduce((acc, header, index) => {
      acc[header] = values[index];
      return acc;
    }, {});

    // Update konten ke HTML
    document.getElementById("about-title").innerText =
      aboutData.Title || "About Us";
    document.getElementById("about-description").innerText =
      aboutData.Description || "Description not available.";
    document.getElementById("about-image").src =
      aboutData.ImageURL || "https://via.placeholder.com/400";
      
  } catch (error) {
    console.error("Error rendering About section:", error);
  }
};
