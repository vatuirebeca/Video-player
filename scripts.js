const video = document.getElementById('myVideo');
const playPauseBtn = document.getElementById('playPauseBtn');
const canvas = document.getElementById('videoCanvas');
const ctx = canvas.getContext('2d');
let currentFilter = 'none';

function togglePlay() {
  if (video.paused) {
    video.play();
    playPauseBtn.textContent = '⏸ Pause';
  } else {
    video.pause();
    playPauseBtn.textContent = '▶ Play';
  }
}

function changeVolume(value) {
  video.volume = value;
}

function changeSpeed(value) {
  video.playbackRate = value;
}

function changeQuality(quality) {
  const currentTime = video.currentTime;
  const wasPlaying = !video.paused;

  video.src = `video_${quality}.mp4`;
  video.load();

  video.addEventListener('loadedmetadata', () => {
    video.currentTime = currentTime;
    if (wasPlaying) video.play();
  }, { once: true });
}

function makeFullscreen() {
  if (video.requestFullscreen) {
    video.requestFullscreen();
  } else if (video.webkitRequestFullscreen) {
    video.webkitRequestFullscreen();
  } else if (video.msRequestFullscreen) {
    video.msRequestFullscreen();
  }
}

function setupCanvas() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
}

function drawVideoFrame() {
  if (video.paused || video.ended) return;
  ctx.filter = currentFilter;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  requestAnimationFrame(drawVideoFrame);
}

function changeFilter(value) {
  currentFilter = value;
  if (!video.paused) drawVideoFrame();
}

video.addEventListener('play', () => {
  setupCanvas();
  drawVideoFrame();
  playPauseBtn.textContent = '⏸ Pause';
});

video.addEventListener('pause', () => {
  playPauseBtn.textContent = '▶ Play';
});
