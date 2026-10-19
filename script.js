const enterStory = sessionStorage.getItem('anniversary-enter-story') === 'true';
sessionStorage.removeItem('anniversary-enter-story');

if (!enterStory) {
  window.location.replace('timer.html');
}

const screens = [...document.querySelectorAll('.screen')];
const heartRain = document.querySelector('.heart-rain');
const wishForm = document.querySelector('#wish-form');
const wishInput = document.querySelector('#wish-input');
const envelopeButton = document.querySelector('#envelope-button');
const letterPaper = document.querySelector('#letter-paper');
const letterNext = document.querySelector('#letter-next');
const flowerOptions = document.querySelectorAll('.flower-option');
const bouquetFlowers = document.querySelector('#bouquet-flowers');
const bouquetList = document.querySelector('#bouquet-list');
const bouquetEmpty = document.querySelector('#bouquet-empty');
const paymentCount = document.querySelector('#payment-count');
const finishButton = document.querySelector('#finish-button');
const returnButton = document.querySelector('#return-button');
const song = document.querySelector('#love-song');
const playerToggle = document.querySelector('#player-toggle');
const albumImage = document.querySelector('#album-image');

const flowerDetails = {
  mawar: { name: 'Mawar', petal: '#e94f7b', center: '#f2c34c' },
  tulip: { name: 'Tulip', petal: '#d83c68', center: '#f6cb63' },
  matahari: { name: 'Matahari', petal: '#f3a623', center: '#754336' },
  edelweis: { name: 'Edelweis', petal: '#fff7e9', center: '#e8c45d' },
  lily: { name: 'Lily', petal: '#ed83aa', center: '#cf4773' },
};
const bouquet = Object.fromEntries(Object.keys(flowerDetails).map((kind) => [kind, 0]));

function createHearts() {
  const colors = ['#d68b94', '#c97782', '#e2a79c', '#bc7180'];
  for (let index = 0; index < 32; index += 1) {
    const heart = document.createElement('span');
    heart.className = 'falling-heart';
    heart.textContent = '\u2665';
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.setProperty('--heart-color', colors[index % colors.length]);
    heart.style.setProperty('--fall-duration', `${7 + Math.random() * 9}s`);
    heart.style.setProperty('--fall-delay', `${-Math.random() * 16}s`);
    heart.style.setProperty('--heart-drift', `${Math.round(Math.random() * 90 - 45)}px`);
    heart.style.setProperty('--heart-opacity', `${0.12 + Math.random() * 0.2}`);
    heart.style.fontSize = `${10 + Math.random() * 15}px`;
    heartRain.append(heart);
  }
}

function showScreen(screenId) {
  screens.forEach((screen) => {
    const isActive = screen.id === screenId;
    screen.classList.toggle('is-active', isActive);
    screen.setAttribute('aria-hidden', String(!isActive));
    screen.inert = !isActive;
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

wishInput.addEventListener('input', () => wishInput.setCustomValidity(''));

wishForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!wishInput.value.trim()) {
    wishInput.setCustomValidity('Tulis harapanmu dulu, ya.');
    wishInput.reportValidity();
    return;
  }
  showScreen('letter-screen');
});

envelopeButton.addEventListener('click', () => {
  const isOpen = envelopeButton.classList.toggle('is-open');
  envelopeButton.setAttribute('aria-label', isOpen ? 'Tutup surat' : 'Buka surat');
  letterPaper.classList.toggle('is-visible', isOpen);
  letterPaper.setAttribute('aria-hidden', String(!isOpen));
  letterNext.disabled = !isOpen;
});

letterNext.addEventListener('click', () => showScreen('bouquet-screen'));

flowerOptions.forEach((option) => {
  option.addEventListener('click', () => {
    bouquet[option.dataset.flower] += 1;
    renderBouquet();
  });
});

function renderBouquet() {
  const selected = Object.entries(bouquet).filter(([, count]) => count > 0);
  const total = selected.reduce((sum, [, count]) => sum + count, 0);
  const flowers = selected.flatMap(([kind, count]) => Array.from({ length: count }, () => kind));
  const visibleFlowers = flowers.slice(0, 12);
  const flowerCenter = (visibleFlowers.length - 1) / 2;

  bouquetFlowers.replaceChildren(...visibleFlowers.map((kind, index) => {
    const flower = flowerDetails[kind];
    const stem = document.createElement('span');
    const bloom = document.createElement('span');
    stem.className = 'bouquet-stem';
    bloom.className = `bouquet-bloom bouquet-bloom--${kind}`;
    bloom.style.setProperty('--petal-color', flower.petal);
    bloom.style.setProperty('--center-color', flower.center);
    stem.style.setProperty('--stem-rise', `${Math.max(0, 26 - Math.abs(flowerCenter - index) * 7)}px`);
    stem.style.setProperty('--tilt', `${(index - flowerCenter) * 15}deg`);
    stem.append(bloom);
    return stem;
  }));

  if (flowers.length > visibleFlowers.length) {
    const extra = document.createElement('span');
    extra.className = 'bouquet-extra';
    extra.textContent = `+${flowers.length - visibleFlowers.length}`;
    bouquetFlowers.append(extra);
  }

  bouquetList.replaceChildren(...selected.map(([kind, count]) => {
    const item = document.createElement('li');
    const text = document.createElement('span');
    const remove = document.createElement('button');
    text.textContent = `${flowerDetails[kind].name} x${count}`;
    remove.type = 'button';
    remove.textContent = '\u2212';
    remove.setAttribute('aria-label', `Kurangi ${flowerDetails[kind].name}`);
    remove.addEventListener('click', () => {
      bouquet[kind] -= 1;
      renderBouquet();
    });
    item.append(text, remove);
    return item;
  }));

  bouquetEmpty.hidden = total > 0;
  paymentCount.textContent = total ? `(BAYAR DENGAN ${total} PAP)` : 'PILIH BUNGA DULU';
  finishButton.disabled = total === 0;
}

finishButton.addEventListener('click', () => showScreen('final-screen'));
returnButton.addEventListener('click', () => {
  song.pause();
  window.location.href = 'timer.html';
});

function updatePlayerState() {
  const isPlaying = !song.paused && song.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA;
  playerToggle.classList.toggle('is-playing', isPlaying);
  playerToggle.setAttribute('aria-label', isPlaying ? 'Jeda Terbuang Dalam Waktu' : 'Putar Terbuang Dalam Waktu');
}

playerToggle.addEventListener('click', () => {
  if (song.paused) {
    song.play().then(updatePlayerState).catch(() => {
      song.pause();
      updatePlayerState();
    });
  } else {
    song.pause();
  }
});

song.addEventListener('playing', updatePlayerState);
song.addEventListener('pause', updatePlayerState);
song.addEventListener('waiting', updatePlayerState);
song.addEventListener('error', () => {
  song.pause();
  updatePlayerState();
});
fetch('https://itunes.apple.com/search?term=Barasuara%20Terbuang%20Dalam%20Waktu&entity=song&limit=10')
  .then((response) => response.ok ? response.json() : Promise.reject(new Error('Album artwork unavailable')))
  .then((data) => {
    const track = data.results.find((result) => result.trackName.toLowerCase().includes('terbuang dalam waktu') && result.artistName.toLowerCase().includes('barasuara'));
    if (!track?.artworkUrl100) return;
    albumImage.src = track.artworkUrl100.replace('100x100bb', '600x600bb');
    albumImage.hidden = false;
  })
  .catch(() => {});

createHearts();
