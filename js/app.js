(function () {
    'use strict';

    const video = document.getElementById('video');
    const fileInput = document.getElementById('fileInput');
    const emptyState = document.getElementById('emptyState');
    const btnPlay = document.getElementById('btnPlay');
    const btnRewind = document.getElementById('btnRewind');
    const btnForward = document.getElementById('btnForward');
    const btnFullscreen = document.getElementById('btnFullscreen');
    const btnSnapshot = document.getElementById('btnSnapshot');
    const iconPlay = document.getElementById('iconPlay');
    const labelPlay = document.getElementById('labelPlay');
    const timeCurrent = document.getElementById('timeCurrent');
    const timeTotal = document.getElementById('timeTotal');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');

    const ICON_PLAY = '<polygon points="6 3 20 12 6 21 6 3"/>';
    const ICON_PAUSE = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
    let currentURL = null;
    let lastTapTime = 0;
    let tapTimer = null;

    function fmt(sec) {
        if (!isFinite(sec) || sec < 0) return '00:00';
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        const mm = String(m).padStart(2, '0');
        const ss = String(s).padStart(2, '0');
        return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
    }

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (currentURL) URL.revokeObjectURL(currentURL);
        currentURL = URL.createObjectURL(file);
        video.src = currentURL;
        video.load();
        emptyState.classList.add('hidden');
        const p = video.play();
        if (p) p.catch(() => {});
    });

    function togglePlay() {
        if (!video.src) return;
        if (video.paused) video.play().catch(() => {});
        else video.pause();
    }
    btnPlay.addEventListener('click', togglePlay);

    video.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTapTime < 300) {
            const rect = video.getBoundingClientRect();
            const x = e.changedTouches[0].clientX - rect.left;
            if (x < rect.width / 2) video.currentTime = Math.max(0, video.currentTime - 10);
            else video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
            lastTapTime = 0;
        } else {
            lastTapTime = now;
            clearTimeout(tapTimer);
            tapTimer = setTimeout(togglePlay, 300);
        }
    });

    video.addEventListener('play', () => {
        iconPlay.innerHTML = ICON_PAUSE;
        labelPlay.textContent = 'Dừng';
    });
    video.addEventListener('pause', () => {
        iconPlay.innerHTML = ICON_PLAY;
        labelPlay.textContent = 'Phát';
    });

    btnRewind.addEventListener('click', () => {
        video.currentTime = Math.max(0, video.currentTime - 10);
    });
    btnForward.addEventListener('click', () => {
        video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
    });

    btnFullscreen.addEventListener('click', () => {
        const el = video;
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.webkitEnterFullscreen) el.webkitEnterFullscreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
    });

    video.addEventListener('timeupdate', () => {
        const cur = video.currentTime;
        const dur = video.duration || 0;
        timeCurrent.textContent = fmt(cur);
        timeTotal.textContent = fmt(dur);
        progressFill.style.width = dur ? (cur / dur) * 100 + '%' : '0%';
    });
    video.addEventListener('loadedmetadata', () => {
        timeTotal.textContent = fmt(video.duration);
    });

    let seeking = false;
    function seekFromEvent(clientX) {
        if (!video.duration) return;
        const rect = progressBar.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        video.currentTime = ratio * video.duration;
        progressFill.style.width = ratio * 100 + '%';
        timeCurrent.textContent = fmt(ratio * video.duration);
    }
    progressBar.addEventListener('touchstart', (e) => {
        seeking = true;
        progressBar.classList.add('seeking');
        seekFromEvent(e.touches[0].clientX);
    }, { passive: true });
    progressBar.addEventListener('touchmove', (e) => {
        if (seeking) seekFromEvent(e.touches[0].clientX);
    }, { passive: true });
    progressBar.addEventListener('touchend', () => {
        seeking = false;
        progressBar.classList.remove('seeking');
    });
    progressBar.addEventListener('mousedown', (e) => {
        seeking = true;
        progressBar.classList.add('seeking');
        seekFromEvent(e.clientX);
    });
    document.addEventListener('mousemove', (e) => {
        if (seeking) seekFromEvent(e.clientX);
    });
    document.addEventListener('mouseup', () => {
        seeking = false;
        progressBar.classList.remove('seeking');
    });

    btnSnapshot.addEventListener('click', () => {
        if (!video.src || !video.videoWidth) return;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const a = document.createElement('a');
        a.download = `anh_${Date.now()}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
    });

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
        if (e.code === 'ArrowLeft') video.currentTime = Math.max(0, video.currentTime - 5);
        if (e.code === 'ArrowRight') video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
        if (e.code === 'KeyF') btnFullscreen.click();
    });

    document.addEventListener('gesturestart', (e) => e.preventDefault());

    video.addEventListener('error', () => {
        emptyState.classList.remove('hidden');
    });
})();
