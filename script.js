// ===== NASA Space Explorer Script =====

// Replace with your own NASA API key from https://api.nasa.gov
const API_KEY = "DEMO_KEY"; // Change to your key

// DOM elements
const startDateEl = document.querySelector("#start-date");
const endDateEl = document.querySelector("#end-date");
const getImagesBtn = document.querySelector("#get-images");
const gallery = document.querySelector("#gallery");
const loadingEl = document.querySelector("#loading");
const factEl = document.querySelector("#space-fact");
const modal = document.querySelector("#modal");
const modalContent = document.querySelector("#modal-content");
const modalClose = document.querySelector("#modal-close");

// Space facts for the "Did You Know?" section
const spaceFacts = [
  "A day on Venus is longer than a year on Venus.",
  "Neutron stars can spin 600 times per second.",
  "Saturn could float in water because it's less dense.",
  "One million Earths could fit inside the Sun.",
  "The footprints on the Moon will last millions of years."
];

// ===== Utility Functions =====

// Set default dates (9 days total)
function setDefaultDates() {
  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - 8);

  startDateEl.value = past.toISOString().split("T")[0];
  endDateEl.value = today.toISOString().split("T")[0];
}

// Show a random space fact
function displayRandomFact() {
  const fact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
  factEl.textContent = fact;
}

// Fetch APOD images from NASA API
async function fetchAPOD(startDate, endDate) {
  const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("NASA API request failed");
  return res.json();
}

// Render gallery items
function renderGallery(data) {
  gallery.innerHTML = "";

  data.forEach(item => {
    const card = document.createElement("div");
    card.classList.add("gallery-item");

    if (item.media_type === "image") {
      card.innerHTML = `
        <img src="${item.url}" alt="${item.title}" class="hover-zoom" />
        <h3>${item.title}</h3>
        <p>${item.date}</p>
      `;
    } else if (item.media_type === "video") {
      card.innerHTML = `
        <iframe src="${item.url}" frameborder="0" allowfullscreen></iframe>
        <h3>${item.title}</h3>
        <p>${item.date}</p>
      `;
    }

    card.addEventListener("click", () => openModal(item));
    gallery.appendChild(card);
  });
}

// Open modal with full details
function openModal(item) {
  modalContent.innerHTML = `
    <h2>${item.title}</h2>
    <p><em>${item.date}</em></p>
    ${item.media_type === "image" 
      ? `<img src="${item.hdurl || item.url}" alt="${item.title}" />`
      : `<iframe src="${item.url}" frameborder="0" allowfullscreen></iframe>`}
    <p>${item.explanation}</p>
  `;
  modal.style.display = "block";
}

// Close modal
modalClose.addEventListener("click", () => {
  modal.style.display = "none";
});

// ===== Event Listeners =====

// Get images button click
getImagesBtn.addEventListener("click", async () => {
  const startDate = startDateEl.value;
  const endDate = endDateEl.value;

  loadingEl.style.display = "block";
  gallery.innerHTML = "";

  try {
    const data = await fetchAPOD(startDate, endDate);
    renderGallery(data);
  } catch (error) {
    gallery.innerHTML = `<p>Error fetching images. Please try again.</p>`;
    console.error(error);
  } finally {
    loadingEl.style.display = "none";
  }
});

// ===== Init =====
setDefaultDates();
displayRandomFact();
