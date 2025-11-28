const video = document.getElementById('myVideo');
const playPauseBtn = document.getElementById('playPauseBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const volumeSlider = document.getElementById('volumeSlider');
const speedSelect = document.getElementById('speedSelect');
const filterSelect = document.getElementById('filterSelect');
const bassSlider = document.getElementById('bassSlider');
const trebleSlider = document.getElementById('trebleSlider');
const videoContainer = document.getElementById('videoContainer');
const videoCanvas = document.getElementById('videoCanvas');
const videoCtx = videoCanvas.getContext('2d');
const audioCanvas = document.getElementById('audioVisualizer');
const audioCtx = audioCanvas.getContext('2d');

let currentFilter = 'none';
let audioContext = null;
let analyser = null;
let source = null;
let bassFilter = null;
let trebleFilter = null;
let dataArray = null;
let bufferLength = 0;
let useCanvas = false;

function initAudio() {
    if (audioContext) return;
    
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    source = audioContext.createMediaElementSource(video);
    
    bassFilter = audioContext.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.value = 200;
    bassFilter.gain.value = 0;
    
    trebleFilter = audioContext.createBiquadFilter();
    trebleFilter.type = 'highshelf';
    trebleFilter.frequency.value = 3000;
    trebleFilter.gain.value = 0;
    
    source.connect(bassFilter);
    bassFilter.connect(trebleFilter);
    trebleFilter.connect(analyser);
    analyser.connect(audioContext.destination);
    
    analyser.fftSize = 128;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
}

function drawVideo() {
    if (!useCanvas || video.paused || video.ended) return;
    
    videoCtx.filter = currentFilter;
    videoCtx.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);
    requestAnimationFrame(drawVideo);
}

function drawAudio() {
    requestAnimationFrame(drawAudio);
    
    if (!analyser) return;
    
    analyser.getByteFrequencyData(dataArray);
    
    audioCanvas.width = audioCanvas.clientWidth;
    audioCanvas.height = audioCanvas.clientHeight;
    
    audioCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    audioCtx.fillRect(0, 0, audioCanvas.width, audioCanvas.height);
    
    const barWidth = audioCanvas.width / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * audioCanvas.height * 0.9;
        const hue = (i / bufferLength) * 360;
        audioCtx.fillStyle = `hsl(${hue}, 100%, 60%)`;
        audioCtx.fillRect(x, audioCanvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
    }
}

function activateCanvas() {
    if (!useCanvas) {
        useCanvas = true;
        videoCanvas.width = video.videoWidth;
        videoCanvas.height = video.videoHeight;
        videoCanvas.style.display = 'block';
        drawVideo();
    }
}

playPauseBtn.addEventListener('click', function() {
    if (video.paused) {
        initAudio();
        video.play();
        playPauseBtn.textContent = 'Pause';
    } else {
        video.pause();
        playPauseBtn.textContent = 'Play';
    }
});

fullscreenBtn.addEventListener('click', function() {
    if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
    } else if (videoContainer.webkitRequestFullscreen) {
        videoContainer.webkitRequestFullscreen();
    } else if (videoContainer.mozRequestFullScreen) {
        videoContainer.mozRequestFullScreen();
    } else if (videoContainer.msRequestFullscreen) {
        videoContainer.msRequestFullscreen();
    }
});

volumeSlider.addEventListener('input', function() {
    video.volume = this.value / 100;
});

speedSelect.addEventListener('change', function() {
    video.playbackRate = parseFloat(this.value);
});

filterSelect.addEventListener('change', function() {
    currentFilter = this.value;
    if (currentFilter !== 'none') {
        activateCanvas();
    }
});

bassSlider.addEventListener('input', function() {
    if (bassFilter) {
        bassFilter.gain.value = parseFloat(this.value);
    }
});

trebleSlider.addEventListener('input', function() {
    if (trebleFilter) {
        trebleFilter.gain.value = parseFloat(this.value);
    }
});

video.addEventListener('play', function() {
    playPauseBtn.textContent = 'Pause';
    if (useCanvas) {
        drawVideo();
    }
});

video.addEventListener('pause', function() {
    playPauseBtn.textContent = 'Play';
});

video.addEventListener('ended', function() {
    playPauseBtn.textContent = 'Play';
});

drawAudio();