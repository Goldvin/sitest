import { fetchData } from "../utils/cache.js";
import { urls } from "../config/api.js";

const parseDate = (dateString) => {
  if (!dateString) {
    console.error("Tanggal tidak valid:", dateString);
    return new Date();
  }

  const [datePart, timePart] = dateString.split(" ");
  if (!datePart || !timePart) {
    console.error("Format tanggal atau waktu tidak valid:", dateString);
    return new Date();
  }

  const [day, month, year] = datePart.split("/").map(Number);
  const [hours, minutes, seconds] = timePart.split(":").map(Number);

  if (
    isNaN(day) ||
    isNaN(month) ||
    isNaN(year) ||
    isNaN(hours) ||
    isNaN(minutes) ||
    isNaN(seconds)
  ) {
    console.error("Nilai tanggal atau waktu tidak valid:", dateString);
    return new Date();
  }

  return new Date(year, month - 1, day, hours, minutes, seconds);
};

const formatTime = (lastUpdated) => {
  const now = new Date();
  const updatedTime = parseDate(lastUpdated);

  if (updatedTime.getTime() === now.getTime()) {
    return "Waktu tidak valid";
  }

  const diffMs = now - updatedTime;
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
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return updatedTime.toLocaleDateString("id-ID", options);
  }
};

export const renderBody = async () => {
  const data = await fetchData(urls.body);
  const content = document.getElementById("content");
  const tagFilter = document.getElementById("tag-filter");
  const searchBar = document.getElementById("search-bar");
  const searchButton = document.getElementById("search-button");
  const paginationContainer = document.getElementById("pagination");

  let currentPage = 1;

  const allTags = [
    ...new Set(
      data.values.slice(1).flatMap((row) =>
        row[2].split(",").map((tag) => tag.trim())
      )
    ),
  ];
  tagFilter.innerHTML += allTags
    .map((tag) => `<option value="${tag}">${tag}</option>`)
    .join("");

  const isMobile = () => window.innerWidth <= 768;

  const renderFiltered = (searchValue = "", filterValue = "", page = 1) => {
    const isMobileView = isMobile();
    const cardsPerPage = isMobileView ? 3 : 6;

    const filteredData = data.values.slice(1).filter((row) => {
      const titleMatch = row[1].toLowerCase().includes(searchValue);
      const descriptionMatch = row[3].toLowerCase().includes(searchValue);
      const tagMatch = row[2].toLowerCase().includes(searchValue);
      const filterMatch =
        filterValue === "" ||
        row[2].split(",").map((tag) => tag.trim()).includes(filterValue);
      return (titleMatch || descriptionMatch || tagMatch) && filterMatch;
    });

    const totalPages = Math.ceil(filteredData.length / cardsPerPage);
    const startIndex = (page - 1) * cardsPerPage;
    const paginatedData = filteredData.slice(
      startIndex,
      startIndex + cardsPerPage
    );

    content.innerHTML = paginatedData
      .map((row) => {
        const tags = row[2]
          .split(",")
          .map((tag) => `<span class="card-tag">${tag.trim()}</span>`)
          .join("");

        const maxDescriptionLength = 100;
        const isLongDescription = row[3].length > maxDescriptionLength;
        const shortDescription = row[3].slice(0, maxDescriptionLength);

        const formattedTime = formatTime(row[5]);

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
                  ${
                    isLongDescription
                      ? `<button class="toggle-description">See More</button>`
                      : ""
                  }
                  <div class="card-footer">
                      <button class="card-link-btn">
                          <a href="${row[4]}" target="_blank">Visit Link</a>
                      </button>
                      <p class="last-updated">Last Updated: ${formattedTime}</p>
                  </div>
              </div>
          </div>
      `;
      })
      .join("");

    document.querySelectorAll(".toggle-description").forEach((button) => {
      button.addEventListener("click", () => {
        const descriptionElement = button.previousElementSibling;
        const isExpanded = button.textContent === "Hide";
        if (isExpanded) {
          descriptionElement.textContent =
            descriptionElement.getAttribute("data-short") + "...";
          button.textContent = "See More";
        } else {
          descriptionElement.textContent =
            descriptionElement.getAttribute("data-full");
          button.textContent = "Hide";
        }
      });
    });

    renderPagination(page, totalPages);
  };

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

  const updatePage = (newPage) => {
    const searchValue = searchBar.value.toLowerCase();
    const filterValue = tagFilter.value;
    currentPage = newPage;
    renderFiltered(searchValue, filterValue, currentPage);
  };

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

  window.addEventListener("resize", () => {
    const searchValue = searchBar.value.toLowerCase();
    const filterValue = tagFilter.value;
    renderFiltered(searchValue, filterValue, currentPage);
  });

  renderFiltered();
};