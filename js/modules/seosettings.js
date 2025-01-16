import { fetchData } from "../utils/cache.js";
import { urls } from "../config/api.js";

const applySEOSettings = async () => {
    try {
        const response = await fetch(urls.seo_settings); // Panggil API dari Apps Script
        const seoSettings = await response.json(); // Parse hasil JSON

        if (!seoSettings) {
            console.error("Gagal mengambil data SEO dari Web App");
            return;
        }

        // Set Meta Title
        if (seoSettings.meta_title) {
            document.title = seoSettings.meta_title;
        }

        // Set Meta Description
        const metaDescription = document.querySelector("meta[name='description']");
        if (metaDescription && seoSettings.meta_description) {
            metaDescription.setAttribute("content", seoSettings.meta_description);
        }

        // Set Social Media Image (Open Graph)
        const metaOGImage = document.querySelector("meta[property='og:image']");
        if (metaOGImage && seoSettings.social_image) {
            metaOGImage.setAttribute("content", seoSettings.social_image);
        }

        // Set Google Analytics
        if (seoSettings.google_analytics_id) {
            loadGoogleAnalytics(seoSettings.google_analytics_id);
        }

        // Set Live Chat Integrations
        if (seoSettings.crisp_chat_id) {
            loadCrispChat(seoSettings.crisp_chat_id);
        }
        if (seoSettings.drift_chat_id) {
            loadDriftChat(seoSettings.drift_chat_id);
        }

        // Set Favicon
        if (seoSettings.favicon) {
            const link = document.querySelector("link[rel='icon']") || document.createElement("link");
            link.rel = "icon";
            link.href = seoSettings.favicon;
            document.head.appendChild(link);
        }

        // Set External Links Behavior
        if (seoSettings.open_external_links === "TRUE") {
            document.querySelectorAll("a").forEach(anchor => {
                if (anchor.hostname !== window.location.hostname) {
                    anchor.setAttribute("target", "_blank");
                    anchor.setAttribute("rel", "noopener noreferrer");
                }
            });
        }

        console.log("SEO settings berhasil diterapkan:", seoSettings);

    } catch (error) {
        console.error("Error saat mengambil SEO settings:", error);
    }
};


// Fungsi untuk memuat Google Analytics
const loadGoogleAnalytics = (trackingID) => {
    if (!trackingID) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingID}`;
    document.head.appendChild(script);

    script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            window.dataLayer.push(arguments);
        }
        gtag("js", new Date());
        gtag("config", trackingID);
    };
};

// Fungsi untuk memuat Crisp Chat
const loadCrispChat = (crispID) => {
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = crispID;
    const script = document.createElement("script");
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    document.head.appendChild(script);
};

// Fungsi untuk memuat Drift Chat
const loadDriftChat = (driftID) => {
    window.drift = window.drift || function () {
        (window.drift.q = window.drift.q || []).push(arguments);
    };
    const script = document.createElement("script");
    script.src = "https://js.driftt.com/include/" + new Date().getTime() + "/" + driftID + ".js";
    script.async = true;
    document.head.appendChild(script);
};

// Panggil fungsi setelah halaman dimuat
document.addEventListener("DOMContentLoaded", applySEOSettings);
