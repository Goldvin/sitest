import { fetchData } from "../utils/cache.js";
import { urls } from "../config/api.js";

export const applySEOSettings = async () => {
    try {
        const seoData = await fetchData(urls.seo_settings);
        
        if (!seoData || !seoData.values) {
            console.error("Gagal mengambil data SEO dari Google Sheets");
            return;
        }

        // Konversi array ke objek key-value
        let seoSettings = {};
        seoData.values.slice(1).forEach(row => {
            if (row.length >= 2) seoSettings[row[0]] = row[1];
        });

        // Set Meta Title
        if (seoSettings.meta_title) {
            document.title = seoSettings.meta_title;
        }

        updateMetaTag("og:image:width", "1200");
        updateMetaTag("og:image:height", "630");


        // Set Meta Description
        updateMetaTag("description", seoSettings.meta_description);
        updateMetaTag("keywords", seoSettings.meta_keywords);

        // Set Open Graph Metadata
        updateMetaTag("og:title", seoSettings.og_title);
        updateMetaTag("og:description", seoSettings.og_description);
        updateMetaTag("og:image", seoSettings.social_image);

        // Set Canonical URL
        updateLinkTag("canonical", seoSettings.canonical);

        // Set Robots Meta Tag
        updateMetaTag("robots", seoSettings.robots);

        // Set Favicon
        if (seoSettings.favicon) {
            updateFavicon(seoSettings.favicon);
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

// Fungsi untuk memperbarui Meta Tag
const updateMetaTag = (property, content) => {
    if (!content) return;
    let meta = document.querySelector(`meta[property="${property}"]`) || document.createElement("meta");
    meta.setAttribute("property", property);
    meta.setAttribute("content", content);
    document.head.appendChild(meta);
};


// Fungsi untuk memperbarui Link Tag
const updateLinkTag = (rel, href) => {
    if (!href) return;
    let link = document.querySelector(`link[rel="${rel}"]`) || document.createElement("link");
    link.rel = rel;
    link.href = href;
    document.head.appendChild(link);
};

// Fungsi untuk memperbarui Favicon
const updateFavicon = (href) => {
    let link = document.querySelector("link[rel='icon']") || document.createElement("link");
    link.rel = "icon";
    link.href = href;
    document.head.appendChild(link);
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
        function gtag() { window.dataLayer.push(arguments); }
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

    script.onload = () => {
        // Mengatur agar chatbox tidak fullscreen
        window.$crisp.push(["config", "layout:wide", false]); // Matikan mode fullscreen
        window.$crisp.push(["set", "user:nickname", ["Asisten AI"]]); 

    };
};


// Fungsi untuk memuat Drift Chat
const loadDriftChat = (driftID) => {
    window.drift = window.drift || function () {
        (window.drift.q = window.drift.q || []).push(arguments);
    };
    const script = document.createElement("script");
    script.src = `https://js.driftt.com/include/${new Date().getTime()}/${driftID}.js`;
    script.async = true;
    document.head.appendChild(script);
};

// Panggil fungsi setelah halaman dimuat
document.addEventListener("DOMContentLoaded", applySEOSettings);
