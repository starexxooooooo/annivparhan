const targetDate = new Date(2026, 9, 18, 0, 0, 0);
const countdown = {
  days: document.querySelector('#days'),
  hours: document.querySelector('#hours'),
  minutes: document.querySelector('#minutes'),
  seconds: document.querySelector('#seconds'),
};
const continueButton = document.querySelector('#continue-button');
const song = document.querySelector('#intro-song');
const playButton = document.querySelector('#play-button');
const stopButton = document.querySelector('#stop-button');
const albumImage = document.querySelector('#album-image');

function updateCountdown() {
  const remaining = Math.max(0, targetDate.getTime() - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const values = {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };

  Object.entries(values).forEach(([unit, value]) => {
    countdown[unit].textContent = String(value).padStart(unit === 'days' ? 3 : 2, '0');
  });
  continueButton.disabled = Date.now() < targetDate.getTime();
}

continueButton.addEventListener('click', () => {
  if (Date.now() < targetDate.getTime()) return;
  sessionStorage.setItem('anniversary-enter-story', 'true');
  window.location.href = 'index.html';
});

playButton.addEventListener('click', () => {
  song.play().then(updatePlayerControls).catch(() => {
    song.pause();
    updatePlayerControls();
  });
});

stopButton.addEventListener('click', () => {
  song.pause();
  song.currentTime = 0;
  updatePlayerControls();
});

function updatePlayerControls() {
  const isPlaying = !song.paused && song.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA;
  playButton.disabled = isPlaying;
  stopButton.disabled = song.paused && song.currentTime === 0;
  playButton.setAttribute('aria-label', isPlaying ? 'Intro Depan sedang diputar' : 'Putar Intro Depan');
}

song.addEventListener('playing', updatePlayerControls);
song.addEventListener('pause', updatePlayerControls);
song.addEventListener('ended', updatePlayerControls);
song.addEventListener('waiting', updatePlayerControls);
song.addEventListener('error', () => {
  song.pause();
  updatePlayerControls();
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

const heartField = document.querySelector('.timer-hearts');
const heartColors = ['#c77983', '#df9c94', '#ad6877', '#e2b1a2'];
for (let index = 0; index < 24; index += 1) {
  const heart = document.createElement('span');
  heart.className = 'timer-heart';
  heart.textContent = '\u2665';
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.setProperty('--heart-color', heartColors[index % heartColors.length]);
  heart.style.setProperty('--heart-duration', `${9 + Math.random() * 10}s`);
  heart.style.setProperty('--heart-delay', `${-Math.random() * 18}s`);
  heart.style.setProperty('--heart-drift', `${Math.round(Math.random() * 72 - 36)}px`);
  heart.style.setProperty('--heart-size', `${10 + Math.random() * 14}px`);
  heartField.append(heart);
}

updateCountdown();
window.setInterval(updateCountdown, 1000);
