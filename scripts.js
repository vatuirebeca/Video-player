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
    
    analyser.ff