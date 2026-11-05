// Grab the page elements from the starter files
const dateInputs = document.querySelectorAll('input[type="date"]');
const startInput = dateInputs[0];
const endInput = dateInputs[1];
const button = document.querySelector('button');
const gallery = document.getElementById('gallery');

// Use the starter's date limits from dateRange.js
if (typeof setupDateInputs === 'function') setupDateInputs(startInput, endInput);

const API_KEY = 'Rrq967zc7nhtzzjBPNLPBp6FQcQ9wFDdGcWhk8b8'

// LevelUp: random "Did You Know?" fact
const facts = [
  'One day on Venus is longer than one year on Venus.',
  'Neutron stars can spin up to 600 times per second.',
  'There are more stars in the universe than grains of sand on Earth.',
  'Footprints on the Moon could last millions of years since there is no wind.',
  'Saturn is light enough that it would float in a giant bathtub.',
  'Light from the Sun takes about 8 minutes to reach Earth.'
];
const factBox = document.createElement('div');
factBox.className = 'fact-box';
factBox.innerHTML = `<strong>🚀 Did You Know?</strong> ${facts[Math.floor(Math.random() * facts.length)]}`;
gallery.parentNode.insertBefore(factBox, gallery);

// Modal, built once and reused
const modal = document.createElement('div');
modal.className = 'modal hidden';
modal.innerHTML = `
  <div class="modal-content">
    <button class="modal-close" aria-label="Close">&times;</button>
    <div class="modal-media"></div>
    <h2 class="modal-title"></h2>
    <p class="modal-date"></p>
    <p class="modal-explanation"></p>
  </div>`;
document.body.appendChild(modal);

function closeModal() {
  modal.classList.add('hidden');
  modal.querySelector('.modal-media').innerHTML = ''; // stops videos from playing
}
modal.querySelector('.modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

function openModal(item) {
  const media = modal.querySelector('.modal-media');
  if (item.media_type === 'video' && item.url.includes('youtube')) {
    media.innerHTML = `<iframe src="${item.url}" allowfullscreen></iframe>`;
  } else if (item.media_type === 'video') {
    media.innerHTML = `<a class="video-link" href="${item.url}" target="_blank">▶ Watch this video</a>`;
  } else {
    media.innerHTML = `<img src="${item.hdurl || item.url}" alt="${item.title}">`;
  }
  modal.querySelector('.modal-title').textContent = item.title;
  modal.querySelector('.modal-date').textContent = item.date;
  modal.querySelector('.modal-explanation').textContent = item.explanation;
  modal.classList.remove('hidden');
}

// Always get 9 consecutive days starting at the start date (capped at today)
function getEndDate(start) {
  const d = new Date(start + 'T00:00:00');
  d.setDate(d.getDate() + 8);
  const today = new Date();
  return (d > today ? today : d).toISOString().split('T')[0];
}

async function getSpaceImages() {
  const start = startInput.value;
  if (!start) return alert('Please pick a start date.');
  const end = getEndDate(start);
  endInput.value = end;

  gallery.innerHTML = '<p class="loading">🔄 Loading space photos…</p>';

  try {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${start}&end_date=${end}&thumbs=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const data = await res.json();

    gallery.innerHTML = ''; // removes the loading message
    data.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'gallery-item';
      const isVideo = item.media_type === 'video';
      const thumb = isVideo ? item.thumbnail_url : item.url;
      card.innerHTML = `
        <div class="thumb">
          ${thumb ? `<img src="${thumb}" alt="${item.title}">` : '<div class="video-placeholder">▶</div>'}
          ${isVideo ? '<span class="video-badge">▶ Video</span>' : ''}
        </div>
        <h3>${item.title}</h3>
        <p>${item.date}</p>`;
      card.addEventListener('click', () => openModal(item));
      gallery.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    gallery.innerHTML = '<p class="loading">⚠️ Could not load images. Try again in a moment.</p>';
  }
}

button.addEventListener('click', getSpaceImages);