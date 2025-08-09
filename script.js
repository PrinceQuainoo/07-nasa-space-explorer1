// NASA Space Explorer — APOD 9-day viewer
const API_KEY = 'DEMO_KEY'; // Replace with your key from https://api.nasa.gov for higher rate limits

const els = {
  start: document.getElementById('startDate'),
  end: document.getElementById('endDate'),
  btn: document.getElementById('fetchBtn'),
  gallery: document.getElementById('gallery'),
  status: document.getElementById('status'),
  factText: document.getElementById('factText'),
  year: document.getElementById('year'),
  modal: document.getElementById('modal'),
  modalClose: document.getElementById('modalClose'),
  modalMedia: document.getElementById('modalMedia'),
  modalTitle: document.getElementById('modalTitle'),
  modalDate: document.getElementById('modalDate'),
  modalExplanation: document.getElementById('modalExplanation'),
};

document.getElementById('year').textContent = new Date().getFullYear();

// Random fact LevelUp
const FACTS = [
  'A day on Venus is longer than a year on Venus.',
  'Neutron stars can spin 600+ times per second.',
  'Mars has the largest volcano in the solar system, Olympus Mons.',
  'Jupiter’s Great Red Spot is a storm that’s raged for at least 350 years.',
  'Light from the Sun takes about 8 minutes to reach Earth.',
  'Saturn could float in water because it’s less dense than water.',
  'There are more trees on Earth than stars in the Milky Way—by some estimates!',
];
function showRandomFact() {
  els.factText.textContent = FACTS[Math.floor(Math.random()*FACTS.length)];
}

// Date helpers
const fmt = (d)=> d.toISOString().slice(0,10);
function setDefaultDates() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 8); // inclusive range: 9 days
  els.start.value = fmt(start);
  els.end.value = fmt(end);
}
function ensureNineDays() {
  if (!els.start.value) return;
  const s = new Date(els.start.value);
  const e = new Date(s);
  e.setDate(e.getDate()+8);
  els.end.value = fmt(e);
}

// API fetch
async function fetchAPOD(startDate, endDate) {
  const url = new URL('https://api.nasa.gov/planetary/apod');
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('start_date', startDate);
  url.searchParams.set('end_date', endDate);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Fetch failed: ' + res.status + ' ' + res.statusText);
  const data = await res.json();
  return data.sort((a,b)=> new Date(a.date) - new Date(b.date));
}

// UI
function showLoading() {
  els.status.textContent = '🔄 Loading space photos…';
  els.gallery.innerHTML = '';
}
function clearStatus() { els.status.textContent = ''; }

function renderGallery(items) {
  const frag = document.createDocumentFragment();
  items.forEach(item => {
    const tile = document.createElement('article');
    tile.className = 'tile';
    tile.tabIndex = 0;

    const fig = document.createElement('figure');
    if (item.media_type === 'image') {
      const img = document.createElement('img');
      img.src = item.url;
      img.alt = item.title || '';
      fig.appendChild(img);
    } else {
      const dv = document.createElement('div');
      dv.className = 'video-thumb';
      dv.style.background = 'linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02))';
      dv.style.display = 'grid';
      dv.style.placeItems = 'center';
      dv.style.aspectRatio = '16/10';
      dv.innerHTML = '<span>▶ Video</span>';
      fig.appendChild(dv);
    }
    tile.appendChild(fig);

    const meta = document.createElement('div');
    meta.className = 'meta';
    const h3 = document.createElement('h3');
    h3.textContent = item.title || '(untitled)';
    const small = document.createElement('div');
    small.className = 'muted';
    small.textContent = item.date;
    meta.appendChild(h3);
    meta.appendChild(small);
    tile.appendChild(meta);

    tile.addEventListener('click', ()=> openModal(item));
    tile.addEventListener('keypress', (e)=> { if (e.key === 'Enter') openModal(item); });

    frag.appendChild(tile);
  });
  els.gallery.innerHTML = '';
  els.gallery.appendChild(frag);
}

function openModal(item) {
  els.modalMedia.innerHTML = '';
  if (item.media_type === 'image') {
    const img = document.createElement('img');
    img.src = item.hdurl || item.url;
    img.alt = item.title || '';
    els.modalMedia.appendChild(img);
  } else {
    const iframe = document.createElement('iframe');
    iframe.src = item.url;
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    iframe.style.width = '100%';
    iframe.style.minHeight = '420px';
    els.modalMedia.appendChild(iframe);
  }
  els.modalTitle.textContent = item.title || '(untitled)';
  els.modalDate.textContent = item.date;
  els.modalExplanation.textContent = item.explanation || '';
  els.modal.hidden = false;
}

function closeModal() { els.modal.hidden = true; }

async function getImages() {
  try {
    ensureNineDays();
    const start = els.start.value;
    const end = els.end.value;
    showLoading();
    const data = await fetchAPOD(start, end);
    clearStatus();
    renderGallery(data);
  } catch (err) {
    els.status.textContent = '⚠️ ' + err.message + ' — Try again with a different date range or your own API key.';
  }
}

// Events
els.btn.addEventListener('click', getImages);
els.start.addEventListener('change', ensureNineDays);
els.modalClose.addEventListener('click', closeModal);
els.modal.addEventListener('click', (e)=> { if (e.target === els.modal) closeModal(); });
document.addEventListener('keydown', (e)=> { if (e.key === 'Escape') closeModal(); });

// Init
setDefaultDates();
ensureNineDays();
showRandomFact();
