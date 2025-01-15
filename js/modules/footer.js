import { fetchData } from "../utils/cache.js"; // Menggunakan caching untuk fetch data
import { urls } from "../config/api.js"; // URL API dari konfigurasi

export const renderFooter = async () => {
    try {
        const data = await fetchData(urls.footer); // Ambil data dari Google Sheets
        const rows = data.values.slice(1); // Skip header row

        const addressSection = document.getElementById("footer-address");
        const sitelinkSection = document.getElementById("footer-links");
        const contactSection = document.getElementById("footer-contact");

        if (!addressSection || !sitelinkSection || !contactSection) {
            console.error("Salah satu elemen footer tidak ditemukan!");
            return;
        }

        // Clear existing content
        addressSection.innerHTML = "";
        sitelinkSection.innerHTML = "";
        contactSection.innerHTML = "";

        // Populate Address Section
        const addressTitle = rows.find(row => row[0] === "Address" && row[1] === "Title")?.[2] || "Address";
        const addressContent = rows.find(row => row[0] === "Address" && row[1] === "Content")?.[2] || "No address provided.";
        addressSection.innerHTML = `
            <h4>${addressTitle}</h4>
            <p>${addressContent}</p>
        `;

        // Populate Sitelink Section
        const sitelinkTitle = rows.find(row => row[0] === "Sitelink" && row[1] === "Title")?.[2] || "Sitelinks";
        const sitelinks = rows.filter(row => row[0] === "Sitelink" && row[1].includes("Link Text"));
        sitelinkSection.innerHTML = `<h4>${sitelinkTitle}</h4><ul></ul>`;
        const sitelinkList = sitelinkSection.querySelector("ul");
        sitelinks.forEach(linkRow => {
            const text = linkRow[2];
            const urlRow = rows.find(r => r[0] === "Sitelink" && r[1] === linkRow[1].replace("Text", "URL"));
            const url = urlRow?.[2] || "#";
            sitelinkList.innerHTML += `<li><a href="${url}" target="_blank">${text}</a></li>`;
        });

        // Populate Contact Section
        const contactTitle = rows.find(row => row[0] === "Contact" && row[1] === "Title")?.[2] || "Contact";
        const emailLabel = rows.find(row => row[0] === "Contact" && row[1] === "Email Label")?.[2] || "Email";
        const emailAddress = rows.find(row => row[0] === "Contact" && row[1] === "Email Address")?.[2] || "Not provided";
        const phoneLabel = rows.find(row => row[0] === "Contact" && row[1] === "Phone Label")?.[2] || "Phone";
        const phoneNumber = rows.find(row => row[0] === "Contact" && row[1] === "Phone Number")?.[2] || "Not provided";
        const socialLabel = rows.find(row => row[0] === "Contact" && row[1] === "Social Label")?.[2] || "Follow us";
        const facebookLink = rows.find(row => row[0] === "Contact" && row[1] === "Social Facebook")?.[2] || "#";
        const instagramLink = rows.find(row => row[0] === "Contact" && row[1] === "Social Instagram")?.[2] || "#";

        contactSection.innerHTML = `
            <h4>${contactTitle}</h4>
            <p>${emailLabel}: <a href="mailto:${emailAddress}">${emailAddress}</a></p>
            <p>${phoneLabel}: <a href="tel:${phoneNumber}">${phoneNumber}</a></p>
            <p>${socialLabel}: 
                <a href="${facebookLink}" target="_blank">Facebook</a> | 
                <a href="${instagramLink}" target="_blank">Instagram</a>
            </p>
        `;
    } catch (error) {
        console.error("Error rendering footer:", error);
    }
};
