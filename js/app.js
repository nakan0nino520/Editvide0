(function () {
    'use strict';

    // ===== DOM ELEMENTS =====
    const video = document.getElementById('video');
    const player = document.getElementById('player');
    const fileInput = document.getElementById('fileInput');
    const imgInput = document.getElementById('imgInput');
    const emptyState = document.getElementById('emptyState');
    const dragOverlay = document.getElementById('dragOverlay');
    const hud = document.getElementById('hud');
    const toast = document.getElementById('toast');
    const countdownEl = document.getElementById('countdown');

    const btnPlay = document.getElementById('btnPlay');
    const btnRewind = document.getElementById('btnRewind');
    const btnForward = document.getElementById('btnForward');
    const btnFullscreen = document.getElementById('btnFullscreen');
    const btnSpeed = document.getElementById('btnSpeed');
    const btnMute = document.getElementById('btnMute');
    const btnLoop = document.getElementById('btnLoop');
    const btnAB = document.getElementById('btnAB');
    const btnPiP = document.getElementById('btnPiP');
    const btnRotate = document.getElementById('btnRotate');
    const btnFlipH = document.getElementById('btnFlipH');
    const btnFlipV = document.getElementById('btnFlipV');
    const btnSleep = document.getElementById('btnSleep');
    const btnReset = document.getElementById('btnReset');
    const btnFilterNone = document.getElementById('btnFilterNone');
    const btnFilterCinema = document.getElementById('btnFilterCinema');
    const btnFilterVivid = document.getElementById('btnFilterVivid');
    const btnFilterWarm = document.getElementById('btnFilterWarm');
    const btnFilterCool = document.getElementById('btnFilterCool');
    const btnSubLoad = document.getElementById('btnSubLoad');
    const btnSubToggle = document.getElementById('btnSubToggle');
    const btnSubSizeUp = document.getElementById('btnSubSizeUp');
    const btnSubSizeDown = document.getElementById('btnSubSizeDown');
    const btnSubColor = document.getElementById('btnSubColor');
    const btnSnapshot = document.getElementById('btnSnapshot');
    const btnRecordAudio = document.getElementById('btnRecordAudio');
    const btnRecordScreen = document.getElementById('btnRecordScreen');
    const btnShare = document.getElementById('btnShare');
    const btnDownload = document.getElementById('btnDownload');
    const btnBookmark = document.getElementById('btnBookmark');
    const btnNote = document.getElementById('btnNote');
    const btnInfo = document.getElementById('btnInfo');
    const btnFrameGrab = document.getElementById('btnFrameGrab');
    const btnResetAll = document.getElementById('btnResetAll');
    const btnClearList = document.getElementById('btnClearList');
    const btnClearHistory = document.getElementById('btnClearHistory');

    const iconPlay = document.getElementById('iconPlay');
    const labelPlay = document.getElementById('labelPlay');
    const labelRewind = document.getElementById('labelRewind');
    const labelForward = document.getElementById('labelForward');
    const timeCurrent = document.getElementById('timeCurrent');
    const timeTotal = document.getElementById('timeTotal');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const abStart = document.getElementById('abStart');
    const abEnd = document.getElementById('abEnd');
    const playlist = document.getElementById('playlist');
    const historyEl = document.getElementById('history');

    const volumeSlider = document.getElementById('volumeSlider');
    const volValue = document.getElementById('volValue');
    const brightnessSlider = document.getElementById('brightnessSlider');
    const brightnessValue = document.getElementById('brightnessValue');
    const contrastSlider = document.getElementById('contrastSlider');
    const contrastValue = document.getElementById('contrastValue');
    const saturationSlider = document.getElementById('saturationSlider');
    const saturationValue = document.getElementById('saturationValue');
    const blurSlider = document.getElementById('blurSlider');
    const blurValue = document.getElementById('blurValue');
    const sepiaSlider = document.getElementById('sepiaSlider');
    const sepiaValue = document.getElementById('sepiaValue');
    const graySlider = document.getElementById('graySlider');
    const grayValue = document.getElementById('grayValue');
    const subSizeSlider = document.getElementById('subSizeSlider');
    const subSizeValue = document.getElementById('subSizeValue');
    const subPosSlider = document.getElementById('subPosSlider');
    const subPosValue = document.getElementById('subPosValue');

    // ===== STATE =====
    const ICON_PLAY = '<polygon points="6 3 20 12 6 21 6 3"/>';
    const ICON_PAUSE = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
    const SPEEDS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 4.0];
    const SKIP_TIMES = [5, 10, 15, 30, 60];
    const SLEEP_TIMES = [5, 10, 15, 30, 60, 90, 120];

    let currentURL = null;
    let speedIdx = 3;
    let skipIdx = 1;
    let sleepIdx = -1;
    let sleepTimer = null;
    let rotation = 0;
    let flipH = false;
    let flipV = false;
    let brightness = 100, contrast = 100, saturation = 100, blurVal = 0, sepiaVal = 0, grayVal = 0;
    let lastTapTime = 0, tapTimer = null;
    let seeking = false;
    let abStartTime = null, abEndTime = null, abActive = false;
    let playlist_items = [];
    let currentPlaylistIdx = -1;
    let historyItems = [];
    let subSize = 20, subPos = 90;
    let subTrack = null;
    let audioRecorder = null, audioChunks = [];
    let screenRecorder = null, screenChunks = [];
    let isRecordingAudio = false, isRecordingScreen = false;
    let lastTapX = 0;
    let sleepRemaining = 0;

    // ===== UTILS =====
    function fmt(sec) {
        if (!isFinite(sec) || sec < 0) return '00:00';
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
    function showHud(text, dur = 800) {
        hud.textContent = text;
        hud.classList.add('show');
        clearTimeout(hud._t);
        hud._t = setTimeout(() => hud.classList.remove('show'), dur);
    }
    function showToast(text, dur = 2000) {
        toast.textContent = text;
        toast.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(() => toast.classList.remove('show'), dur);
    }
    function vibrate(ms = 10) { if (navigator.vibrate) navigator.vibrate(ms); }
    function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e){} }
    function load(key, def) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch(e){ return def; } }

    // ===== FILTER =====
    function applyFilters() {
        video.style.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blurVal}px) sepia(${sepiaVal}%) grayscale(${grayVal}%)`;
    }
    brightnessSlider.addEventListener('input', e => { brightness = +e.target.value; brightnessValue.textContent = brightness + '%'; applyFilters(); });
    contrastSlider.addEventListener('input', e => { contrast = +e.target.value; contrastValue.textContent = contrast + '%'; applyFilters(); });
    saturationSlider.addEventListener('input', e => { saturation = +e.target.value; saturationValue.textContent = saturation + '%'; applyFilters(); });
    blurSlider.addEventListener('input', e => { blurVal = +e.target.value; blurValue.textContent = blurVal + 'px'; applyFilters(); });
    sepiaSlider.addEventListener('input', e => { sepiaVal = +e.target.value; sepiaValue.textContent = sepiaVal + '%'; applyFilters(); });
    graySlider.addEventListener('input', e => { grayVal = +e.target.value; grayValue.textContent = grayVal + '%'; applyFilters(); });

    // BỘ LỌC PRESET
    function applyPreset(b, c, s, sp, g) {
        brightness = b; contrast = c; saturation = s; sepiaVal = sp || 0; grayVal = g || 0; blurVal = 0;
        brightnessSlider.value = b; contrastSlider.value = c; saturationSlider.value = s;
        sepiaSlider.value = sepiaVal; graySlider.value = grayVal; blurSlider.value = 0;
        brightnessValue.textContent = b + '%'; contrastValue.textContent = c + '%';
        saturationValue.textContent = s + '%'; sepiaValue.textContent = sepiaVal + '%';
        grayValue.textContent = grayVal + '%'; blurValue.textContent = '0px';
        applyFilters();
    }
    btnFilterNone.addEventListener('click', () => { applyPreset(100,100,100,0,0); showToast('Bộ lọc gốc'); });
    btnFilterCinema.addEventListener('click', () => { applyPreset(95,120,90,15,0); showToast('Điện ảnh'); });
    btnFilterVivid.addEventListener('click', () => { applyPreset(105,115,160,0,0); showToast('Rực rỡ'); });
    btnFilterWarm.addEventListener('click', () => { applyPreset(105,105,110,25,0); showToast('Ấm'); });
    btnFilterCool.addEventListener('click', () => { applyPreset(95,110,110,0,0); showToast('Lạnh'); });

    // ===== LOAD VIDEO =====
    function loadVideoFile(file, addToPlaylist = true) {
        if (!file) return;
        if (currentURL) URL.revokeObjectURL(currentURL);
        currentURL = URL.createObjectURL(file);
        video.src = currentURL;
        video.load();
        emptyState.classList.add('hidden');
        const p = video.play(); if (p) p.catch(() => {});
        if (addToPlaylist) {
            const existing = playlist_items.findIndex(i => i.name === file.name && i.size === file.size);
            if (existing === -1) {
                playlist_items.push({ file, name: file.name, size: file.size });
                currentPlaylistIdx = playlist_items.length - 1;
            } else {
                currentPlaylistIdx = existing;
            }
            renderPlaylist();
            savePlaylistMeta();
        }
        addHistory(file.name);
        showToast(`▶ ${file.name.slice(0, 40)}`);
    }

    fileInput.addEventListener('change', e => {
        const files = e.target.files;
        if (!files.length) return;
        Array.from(files).forEach((f, i) => {
            if (i === 0) loadVideoFile(f, true);
            else {
                const exists = playlist_items.findIndex(x => x.name === f.name && x.size === f.size);
                if (exists === -1) playlist_items.push({ file: f, name: f.name, size: f.size });
            }
        });
        renderPlaylist();
        savePlaylistMeta();
    });

    // ẢNH INPUT - CHUYỂN THÀNH SLIDESHOW
    imgInput.addEventListener('change', e => {
        const files = e.target.files;
        if (!files.length) return;
        showToast(`Đã tải ${files.length} ảnh`);
    });

    // ===== PLAY/PAUSE =====
    function togglePlay() {
        if (!video.src) return;
        vibrate(15);
        if (video.paused) video.play().catch(() => {});
        else video.pause();
    }
    btnPlay.addEventListener('click', togglePlay);

    // ===== DOUBLE TAP =====
    video.addEventListener('touchend', e => {
        const now = Date.now();
        const rect = video.getBoundingClientRect();
        const x = e.changedTouches[0].clientX - rect.left;
        if (now - lastTapTime < 300) {
            const skip = SKIP_TIMES[skipIdx];
            if (x < rect.width / 3) {
                video.currentTime = Math.max(0, video.currentTime - skip);
                showHud(`« ${skip}s`);
            } else if (x > rect.width * 2/3) {
                video.currentTime = Math.min(video.duration || 0, video.currentTime + skip);
                showHud(`${skip}s »`);
            } else {
                togglePlay();
            }
            vibrate(20);
            lastTapTime = 0;
            clearTimeout(tapTimer);
        } else {
            lastTapTime = now;
            clearTimeout(tapTimer);
            tapTimer = setTimeout(() => {
                if (Date.now() - lastTapTime >= 300) togglePlay();
            }, 300);
        }
    });

    // ===== EVENTS =====
    video.addEventListener('play', () => { iconPlay.innerHTML = ICON_PAUSE; labelPlay.textContent = 'Dừng'; });
    video.addEventListener('pause', () => { iconPlay.innerHTML = ICON_PLAY; labelPlay.textContent = 'Phát'; });
    video.addEventListener('timeupdate', () => {
        const cur = video.currentTime, dur = video.duration || 0;
        timeCurrent.textContent = fmt(cur);
        timeTotal.textContent = fmt(dur);
        progressFill.style.width = dur ? (cur / dur) * 100 + '%' : '0%';
        // A-B LOOP
        if (abActive && abEndTime && cur >= abEndTime) {
            video.currentTime = abStartTime;
        }
    });
    video.addEventListener('loadedmetadata', () => {
        timeTotal.textContent = fmt(video.duration);
        const key = 'resume_' + (playlist_items[currentPlaylistIdx]?.name || '');
        const t = load(key, 0);
        if (t > 5 && t < video.duration - 5) { video.currentTime = t; showToast('Đã khôi phục vị trí'); }
    });
    video.addEventListener('ended', () => {
        iconPlay.innerHTML = ICON_PLAY;
        labelPlay.textContent = 'Phát';
        if (currentPlaylistIdx < playlist_items.length - 1) {
            currentPlaylistIdx++;
            loadVideoFile(playlist_items[currentPlaylistIdx].file, false);
            renderPlaylist();
        }
    });
    video.addEventListener('error', () => {
        emptyState.classList.remove('hidden');
        showToast('Lỗi: Không thể phát');
    });

    // ===== SEEK =====
    function seekFromEvent(x) {
        if (!video.duration) return;
        const rect = progressBar.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
        video.currentTime = ratio * video.duration;
        progressFill.style.width = ratio * 100 + '%';
        timeCurrent.textContent = fmt(ratio * video.duration);
    }
    progressBar.addEventListener('touchstart', e => { seeking = true; progressBar.classList.add('seeking'); seekFromEvent(e.touches[0].clientX); vibrate(10); }, { passive: true });
    progressBar.addEventListener('touchmove', e => { if (seeking) seekFromEvent(e.touches[0].clientX); }, { passive: true });
    progressBar.addEventListener('touchend', () => { seeking = false; progressBar.classList.remove('seeking'); });
    progressBar.addEventListener('mousedown', e => { seeking = true; progressBar.classList.add('seeking'); seekFromEvent(e.clientX); });
    document.addEventListener('mousemove', e => { if (seeking) seekFromEvent(e.clientX); });
    document.addEventListener('mouseup', () => { seeking = false; progressBar.classList.remove('seeking'); });

    // ===== SKIP =====
    btnRewind.addEventListener('click', () => {
        const s = SKIP_TIMES[skipIdx];
        video.currentTime = Math.max(0, video.currentTime - s);
        showHud(`« ${s}s`); vibrate(15);
    });
    btnForward.addEventListener('click', () => {
        const s = SKIP_TIMES[skipIdx];
        video.currentTime = Math.min(video.duration || 0, video.currentTime + s);
        showHud(`${s}s »`); vibrate(15);
    });
    // NHẤN GIỮ ĐỔI THỜI GIAN TUA
    let holdTimer;
    function startHold(btn) {
        holdTimer = setTimeout(() => {
            skipIdx = (skipIdx + 1) % SKIP_TIMES.length;
            labelRewind.textContent = `Lùi ${SKIP_TIMES[skipIdx]}s`;
            labelForward.textContent = `Tới ${SKIP_TIMES[skipIdx]}s`;
            showToast(`Tua: ${SKIP_TIMES[skipIdx]}s`);
            vibrate(20);
        }, 600);
    }
    function endHold() { clearTimeout(holdTimer); }
    [btnRewind, btnForward].forEach(b => {
        b.addEventListener('touchstart', () => startHold(b));
        b.addEventListener('touchend', endHold);
        b.addEventListener('mousedown', () => startHold(b));
        b.addEventListener('mouseup', endHold);
        b.addEventListener('mouseleave', endHold);
    });

    // ===== FULLSCREEN =====
    btnFullscreen.addEventListener('click', () => {
        const el = player;
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
        vibrate(15);
    });

    // ===== SPEED =====
    btnSpeed.addEventListener('click', () => {
        speedIdx = (speedIdx + 1) % SPEEDS.length;
        const s = SPEEDS[speedIdx];
        video.playbackRate = s;
        btnSpeed.textContent = s.toFixed(2).replace(/\.?0+$/, '') + 'x';
        btnSpeed.classList.toggle('active', s !== 1.0);
        showHud(`${s}x`); vibrate(15);
    });

    // ===== MUTE =====
    btnMute.addEventListener('click', () => {
        video.muted = !video.muted;
        btnMute.textContent = video.muted ? '🔇' : '🔊';
        btnMute.classList.toggle('active', video.muted);
        showHud(video.muted ? 'Tắt tiếng' : 'Bật tiếng'); vibrate(15);
    });
    volumeSlider.addEventListener('input', e => {
        const v = parseFloat(e.target.value);
        video.volume = Math.min(1, v);
        volValue.textContent = Math.round(v * 100) + '%';
        if (v === 0) { video.muted = true; btnMute.textContent = '🔇'; }
        else { video.muted = false; btnMute.textContent = '🔊'; }
    });

    // ===== LOOP =====
    btnLoop.addEventListener('click', () => {
        video.loop = !video.loop;
        btnLoop.classList.toggle('active', video.loop);
        btnLoop.textContent = video.loop ? '↻ Lặp' : '↻ Lặp';
        showToast(video.loop ? 'Bật lặp' : 'Tắt lặp'); vibrate(15);
    });

    // ===== A-B LOOP =====
    btnAB.addEventListener('click', () => {
        if (!video.src) return;
        if (abStartTime === null) {
            abStartTime = video.currentTime;
            abStart.style.left = (abStartTime / video.duration * 100) + '%';
            abStart.classList.add('show');
            showToast('Điểm A: ' + fmt(abStartTime));
        } else if (abEndTime === null) {
            abEndTime = video.currentTime;
            if (abEndTime <= abStartTime) { showToast('Điểm B phải sau A'); return; }
            abEnd.style.left = (abEndTime / video.duration * 100) + '%';
            abEnd.classList.add('show');
            abActive = true;
            btnAB.classList.add('active');
            showToast('Lặp A-B: ' + fmt(abStartTime) + ' - ' + fmt(abEndTime));
            video.currentTime = abStartTime;
        } else {
            abStartTime = null; abEndTime = null; abActive = false;
            abStart.classList.remove('show'); abEnd.classList.remove('show');
            btnAB.classList.remove('active');
            showToast('Đã tắt A-B');
        }
        vibrate(15);
    });

    // ===== PIP =====
    btnPiP.addEventListener('click', async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
                btnPiP.classList.remove('active');
            } else if (video.requestPictureInPicture) {
                await video.requestPictureInPicture();
                btnPiP.classList.add('active');
            } else showToast('Không hỗ trợ PiP');
        } catch (err) { showToast('Lỗi PiP'); }
    });
    video.addEventListener('leavepictureinpicture', () => btnPiP.classList.remove('active'));

    // ===== ROTATE / FLIP =====
    function applyTransform() {
        video.style.transform = `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`;
    }
    btnRotate.addEventListener('click', () => { rotation = (rotation + 90) % 360; applyTransform(); showHud(`Xoay: ${rotation}°`); vibrate(15); });
    btnFlipH.addEventListener('click', () => { flipH = !flipH; applyTransform(); btnFlipH.classList.toggle('active', flipH); showToast(flipH ? 'Lật ngang' : 'Bỏ lật'); vibrate(15); });
    btnFlipV.addEventListener('click', () => { flipV = !flipV; applyTransform(); btnFlipV.classList.toggle('active', flipV); showToast(flipV ? 'Lật dọc' : 'Bỏ lật'); vibrate(15); });

    // ===== SLEEP TIMER =====
    btnSleep.addEventListener('click', () => {
        sleepIdx = (sleepIdx + 1) % (SLEEP_TIMES.length + 1);
        if (sleepTimer) { clearInterval(sleepTimer); sleepTimer = null; }
        countdownEl.classList.remove('show');
        if (sleepIdx === SLEEP_TIMES.length) {
            btnSleep.classList.remove('active');
            showToast('Đã hủy hẹn giờ');
        } else {
            const mins = SLEEP_TIMES[sleepIdx];
            btnSleep.classList.add('active');
            showToast(`Tắt sau ${mins} phút`);
            sleepRemaining = mins * 60;
            countdownEl.classList.add('show');
            countdownEl.textContent = fmt(sleepRemaining);
            sleepTimer = setInterval(() => {
                sleepRemaining--;
                countdownEl.textContent = fmt(sleepRemaining);
                if (sleepRemaining <= 0) {
                    clearInterval(sleepTimer);
                    video.pause();
                    countdownEl.classList.remove('show');
                    btnSleep.classList.remove('active');
                    showToast('Đã tắt theo hẹn');
                    sleepIdx = -1;
                }
            }, 1000);
        }
        vibrate(15);
    });

    // ===== RESET =====
    btnReset.addEventListener('click', () => {
        video.playbackRate = 1.0; speedIdx = 3;
        video.muted = false; video.volume = 1.0;
        video.loop = false;
        rotation = 0; flipH = false; flipV = false;
        applyTransform();
        applyPreset(100,100,100,0,0);
        btnSpeed.textContent = '1.0x'; btnSpeed.classList.remove('active');
        btnMute.textContent = '🔊'; btnMute.classList.remove('active');
        btnLoop.classList.remove('active');
        btnFlipH.classList.remove('active'); btnFlipV.classList.remove('active');
        volumeSlider.value = 1; volValue.textContent = '100%';
        showToast('Đã đặt lại'); vibrate(20);
    });

    // ===== SUBTITLE =====
    btnSubLoad.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file'; input.accept = '.vtt,.srt';
        input.onchange = e => {
            const file = e.target.files[0]; if (!file) return;
            const url = URL.createObjectURL(file);
            const old = video.querySelector('track'); if (old) old.remove();
            const track = document.createElement('track');
            track.kind = 'subtitles'; track.label = 'Phụ đề'; track.srclang = 'vi';
            track.src = url; track.default = true;
            video.appendChild(track);
            subTrack = track;
            setTimeout(() => {
                if (video.textTracks[0]) {
                    video.textTracks[0].mode = 'showing';
                    applySubStyle();
                }
                showToast('Đã tải phụ đề');
            }, 100);
        };
        input.click();
    });

    btnSubToggle.addEventListener('click', () => {
        if (!video.textTracks.length) { showToast('Chưa có phụ đề'); return; }
        const t = video.textTracks[0];
        t.mode = t.mode === 'showing' ? 'hidden' : 'showing';
        btnSubToggle.classList.toggle('active', t.mode === 'showing');
        showToast(t.mode === 'showing' ? 'Bật phụ đề' : 'Tắt phụ đề');
    });

    subSizeSlider.addEventListener('input', e => {
        subSize = +e.target.value; subSizeValue.textContent = subSize + 'px';
        applySubStyle();
    });
    subPosSlider.addEventListener('input', e => {
        subPos = +e.target.value; subPosValue.textContent = subPos + '%';
        applySubStyle();
    });
    function applySubStyle() {
        let style = document.getElementById('sub-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'sub-style';
            document.head.appendChild(style);
        }
        style.textContent = `
            video::cue {
                font-size: ${subSize}px;
                background: rgba(0,0,0,0.75);
                color: #fff;
                font-family: -apple-system, sans-serif;
                line-height: 1.4;
            }
        `;
        // VỊ TRÍ
        const tracks = video.textTracks;
        for (let i = 0; i < tracks.length; i++) {
            const cues = tracks[i].cues;
            if (cues) for (let j = 0; j < cues.length; j++) {
                // Không hỗ trợ thay đổi vị trí trực tiếp - chỉ có thể qua CSS ::cue
            }
        }
    }
    btnSubSizeUp.addEventListener('click', () => {
        subSize = Math.min(48, subSize + 2); subSizeSlider.value = subSize;
        subSizeValue.textContent = subSize + 'px'; applySubStyle(); showHud(`CC: ${subSize}px`);
    });
    btnSubSizeDown.addEventListener('click', () => {
        subSize = Math.max(12, subSize - 2); subSizeSlider.value = subSize;
        subSizeValue.textContent = subSize + 'px'; applySubStyle(); showHud(`CC: ${subSize}px`);
    });
    btnSubColor.addEventListener('click', () => {
        const colors = ['#ffffff', '#ffcc00', '#00ff88', '#ff6699', '#00ccff'];
        const cur = video.style.getPropertyValue('--sub-color') || '#ffffff';
        const idx = colors.indexOf(cur);
        const next = colors[(idx + 1) % colors.length];
        video.style.setProperty('--sub-color', next);
        let style = document.getElementById('sub-style') || document.createElement('style');
        style.id = 'sub-style';
        if (!document.head.contains(style)) document.head.appendChild(style);
        style.textContent = `video::cue { font-size: ${subSize}px; background: rgba(0,0,0,0.75); color: ${next}; font-family: -apple-system, sans-serif; line-height: 1.4; }`;
        showToast('Màu CC: ' + next);
    });

    // ===== SNAPSHOT =====
    btnSnapshot.addEventListener('click', () => {
        if (!video.src || !video.videoWidth) return;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blurVal}px) sepia(${sepiaVal}%) grayscale(${grayVal}%)`;
        ctx.drawImage(video, 0, 0);
        const a = document.createElement('a');
        a.download = `anh_${Date.now()}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
        showToast('Đã chụp ảnh'); vibrate(20);
    });

    // ===== RECORD AUDIO =====
    btnRecordAudio.addEventListener('click', async () => {
        if (isRecordingAudio) {
            audioRecorder.stop();
            isRecordingAudio = false;
            btnRecordAudio.classList.remove('active');
            return;
        }
        try {
            const stream = video.captureStream ? video.captureStream() : video.mozCaptureStream();
            const audioTracks = stream.getAudioTracks();
            if (!audioTracks.length) { showToast('Video không có âm thanh'); return; }
            const audioStream = new MediaStream(audioTracks);
            audioRecorder = new MediaRecorder(audioStream);
            audioChunks = [];
            audioRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
            audioRecorder.onstop = () => {
                const blob = new Blob(audioChunks, { type: 'audio/webm' });
                const a = document.createElement('a');
                a.download = `audio_${Date.now()}.webm`;
                a.href = URL.createObjectURL(blob);
                a.click();
                showToast('Đã lưu âm thanh');
            };
            audioRecorder.start();
            isRecordingAudio = true;
            btnRecordAudio.classList.add('active');
            showToast('🔴 Đang ghi âm...');
        } catch (err) { showToast('Không hỗ trợ ghi âm'); }
    });

    // ===== RECORD SCREEN =====
    btnRecordScreen.addEventListener('click', async () => {
        if (isRecordingScreen) {
            screenRecorder.stop();
            isRecordingScreen = false;
            btnRecordScreen.classList.remove('active');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            screenRecorder = new MediaRecorder(stream);
            screenChunks = [];
            screenRecorder.ondataavailable = e => { if (e.data.size > 0) screenChunks.push(e.data); };
            screenRecorder.onstop = () => {
                const blob = new Blob(screenChunks, { type: 'video/webm' });
                const a = document.createElement('a');
                a.download = `manhinh_${Date.now()}.webm`;
                a.href = URL.createObjectURL(blob);
                a.click();
                stream.getTracks().forEach(t => t.stop());
                showToast('Đã lưu màn hình');
            };
            screenRecorder.start();
            isRecordingScreen = true;
            btnRecordScreen.classList.add('active');
            showToast('🔴 Đang ghi màn hình...');
        } catch (err) { showToast('Đã hủy ghi màn hình'); }
    });

    // ===== SHARE =====
    btnShare.addEventListener('click', async () => {
        if (!currentURL) { showToast('Chưa có video'); return; }
        try {
            const file = playlist_items[currentPlaylistIdx]?.file;
            if (navigator.share && file) {
                await navigator.share({ title: file.name, files: [file] });
            } else if (navigator.share) {
                await navigator.share({ title: 'Video', url: location.href });
            } else {
                await navigator.clipboard.writeText(location.href);
                showToast('Đã copy link');
            }
        } catch (err) {}
    });

    // ===== DOWNLOAD =====
    btnDownload.addEventListener('click', () => {
        if (!currentURL) return;
        const a = document.createElement('a');
        a.href = currentURL;
        a.download = playlist_items[currentPlaylistIdx]?.name || 'video.mp4';
        a.click();
        showToast('Đang tải...');
    });

    // ===== BOOKMARK =====
    btnBookmark.addEventListener('click', () => {
        if (!video.src) return;
        const name = playlist_items[currentPlaylistIdx]?.name || 'video';
        const key = 'bookmarks_' + name;
        const marks = load(key, []);
        marks.push({ time: video.currentTime, label: fmt(video.currentTime), date: Date.now() });
        save(key, marks);
        showToast(`🔖 Đã đánh dấu ${fmt(video.currentTime)}`);
        vibrate(20);
    });

    // ===== NOTE =====
    btnNote.addEventListener('click', () => {
        if (!video.src) return;
        const note = prompt('Ghi chú tại ' + fmt(video.currentTime) + ':');
        if (!note) return;
        const name = playlist_items[currentPlaylistIdx]?.name || 'video';
        const key = 'notes_' + name;
        const notes = load(key, []);
        notes.push({ time: video.currentTime, note, date: Date.now() });
        save(key, notes);
        showToast('📝 Đã lưu ghi chú');
    });

    // ===== INFO =====
    btnInfo.addEventListener('click', () => {
        if (!video.src) { showToast('Chưa có video'); return; }
        const info = [
            `Tên: ${playlist_items[currentPlaylistIdx]?.name || 'N/A'}`,
            `Thời lượng: ${fmt(video.duration)}`,
            `Kích thước: ${video.videoWidth}x${video.videoHeight}`,
            `Tốc độ: ${video.playbackRate}x`,
            `Âm lượng: ${Math.round(video.volume * 100)}%`,
        ].join('\n');
        alert(info);
    });

    // ===== FRAME GRAB (nhiều khung hình) =====
    btnFrameGrab.addEventListener('click', () => {
        if (!video.src) return;
        const count = parseInt(prompt('Số khung hình cần chụp:', '5')) || 5;
        const interval = video.duration / (count + 1);
        const original = video.currentTime;
        let i = 1;
        const grab = () => {
            if (i > count) { video.currentTime = original; showToast(`Đã chụp ${count} khung`); return; }
            video.currentTime = interval * i;
            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth; canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                const a = document.createElement('a');
                a.download = `khung_${i}_${Date.now()}.png`;
                a.href = canvas.toDataURL('image/png');
                a.click();
                i++;
                setTimeout(grab, 100);
            };
        };
        grab();
    });

    // ===== RESET ALL =====
    btnResetAll.addEventListener('click', () => {
        if (!confirm('Xóa toàn bộ dữ liệu? (playlist, lịch sử, bookmark, ghi chú)')) return;
        localStorage.clear();
        playlist_items = []; currentPlaylistIdx = -1; historyItems = [];
        renderPlaylist(); renderHistory();
        showToast('Đã xóa toàn bộ dữ liệu');
    });

    // ===== PLAYLIST =====
    function renderPlaylist() {
        if (!playlist_items.length) {
            playlist.innerHTML = '<div class="playlist-empty">Chưa có video nào</div>';
            return;
        }
        playlist.innerHTML = playlist_items.map((item, i) => `
            <div class="playlist-item ${i === currentPlaylistIdx ? 'active' : ''}" data-idx="${i}">
                <span class="playlist-index">${i + 1}</span>
                <span class="playlist-name">${item.name}</span>
                <button class="playlist-remove" data-remove="${i}">×</button>
            </div>
        `).join('');
        playlist.querySelectorAll('.playlist-item').forEach(el => {
            el.addEventListener('click', e => {
                if (e.target.dataset.remove !== undefined) return;
                const idx = parseInt(el.dataset.idx);
                currentPlaylistIdx = idx;
                loadVideoFile(playlist_items[idx].file, false);
                renderPlaylist();
            });
        });
        playlist.querySelectorAll('.playlist-remove').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.remove);
                playlist_items.splice(idx, 1);
                if (idx === currentPlaylistIdx) currentPlaylistIdx = -1;
                else if (idx < currentPlaylistIdx) currentPlaylistIdx--;
                renderPlaylist();
                savePlaylistMeta();
            });
        });
    }
    function savePlaylistMeta() {
        try {
            const meta = playlist_items.map(i => ({ name: i.name, size: i.size }));
            localStorage.setItem('playlist_meta', JSON.stringify(meta));
        } catch (e) {}
    }
    btnClearList.addEventListener('click', () => {
        playlist_items = []; currentPlaylistIdx = -1;
        renderPlaylist(); savePlaylistMeta();
        showToast('Đã xóa danh sách');
    });

    // ===== HISTORY =====
    function addHistory(name) {
        historyItems = historyItems.filter(h => h.name !== name);
        historyItems.unshift({ name, date: Date.now() });
        if (historyItems.length > 20) historyItems = historyItems.slice(0, 20);
        save('history', historyItems);
        renderHistory();
    }
    function renderHistory() {
        if (!historyItems.length) {
            historyEl.innerHTML = '<div class="playlist-empty">Chưa có lịch sử</div>';
            return;
        }
        historyEl.innerHTML = historyItems.map((h, i) => `
            <div class="playlist-item">
                <span class="playlist-index">${i + 1}</span>
                <span class="playlist-name">${h.name}</span>
            </div>
        `).join('');
    }
    btnClearHistory.addEventListener('click', () => {
        historyItems = []; save('history', []); renderHistory();
        showToast('Đã xóa lịch sử');
    });

    // ===== TABS =====
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
            vibrate(10);
        });
    });

    // ===== DRAG & DROP =====
    ['dragenter', 'dragover'].forEach(evt => {
        document.addEventListener(evt, e => {
            e.preventDefault();
            dragOverlay.classList.add('active');
        });
    });
    ['dragleave', 'drop'].forEach(evt => {
        document.addEventListener(evt, e => {
            e.preventDefault();
            if (evt === 'dragleave' && e.relatedTarget) return;
            dragOverlay.classList.remove('active');
        });
    });
    document.addEventListener('drop', e => {
        const files = e.dataTransfer.files;
        if (!files.length) return;
        const videos = Array.from(files).filter(f => f.type.startsWith('video/'));
        videos.forEach((f, i) => {
            if (i === 0) loadVideoFile(f, true);
            else {
                const exists = playlist_items.findIndex(x => x.name === f.name);
                if (exists === -1) playlist_items.push({ file: f, name: f.name, size: f.size });
            }
        });
        renderPlaylist(); savePlaylistMeta();
    });

    // ===== SAVE RESUME =====
    window.addEventListener('beforeunload', () => {
        if (video.src && playlist_items[currentPlaylistIdx]) {
            save('resume_' + playlist_items[currentPlaylistIdx].name, video.currentTime);
        }
    });

    // ===== KEYBOARD SHORTCUTS =====
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT') return;
        switch (e.code) {
            case 'Space': e.preventDefault(); togglePlay(); break;
            case 'ArrowLeft': video.currentTime = Math.max(0, video.currentTime - 5); showHud('« 5s'); break;
            case 'ArrowRight': video.currentTime = Math.min(video.duration || 0, video.currentTime + 5); showHud('5s »'); break;
            case 'ArrowUp': e.preventDefault(); volumeSlider.value = Math.min(2, +volumeSlider.value + 0.1); volumeSlider.dispatchEvent(new Event('input')); break;
            case 'ArrowDown': e.preventDefault(); volumeSlider.value = Math.max(0, +volumeSlider.value - 0.1); volumeSlider.dispatchEvent(new Event('input')); break;
            case 'KeyM': btnMute.click(); break;
            case 'KeyF': btnFullscreen.click(); break;
            case 'KeyL': btnLoop.click(); break;
            case 'KeyR': btnRotate.click(); break;
            case 'KeyS': btnSnapshot.click(); break;
            case 'KeyP': btnPiP.click(); break;
            case 'KeyA': btnAB.click(); break;
            case 'KeyB': btnBookmark.click(); break;
            case 'KeyI': btnInfo.click(); break;
            case 'Equal': btnSpeed.click(); break;
            case 'Minus': speedIdx = (speedIdx - 1 + SPEEDS.length) % SPEEDS.length; video.playbackRate = SPEEDS[speedIdx]; btnSpeed.textContent = SPEEDS[speedIdx] + 'x'; break;
            case 'Digit0': video.currentTime = 0; showHud('00:00'); break;
            case 'Digit1': video.currentTime = video.duration * 0.1; break;
            case 'Digit2': video.currentTime = video.duration * 0.2; break;
            case 'Digit3': video.currentTime = video.duration * 0.3; break;
            case 'Digit4': video.currentTime = video.duration * 0.4; break;
            case 'Digit5': video.currentTime = video.duration * 0.5; break;
            case 'Digit6': video.currentTime = video.duration * 0.6; break;
            case 'Digit7': video.currentTime = video.duration * 0.7; break;
            case 'Digit8': video.currentTime = video.duration * 0.8; break;
            case 'Digit9': video.currentTime = video.duration * 0.9; break;
        }
    });

    // ===== CHẶN ZOOM =====
    document.addEventListener('gesturestart', e => e.preventDefault());

    // ===== INIT =====
    historyItems = load('history', []);
    renderPlaylist();
    renderHistory();
    labelRewind.textContent = `Lùi ${SKIP_TIMES[skipIdx]}s`;
    labelForward.textContent = `Tới ${SKIP_TIMES[skipIdx]}s`;
    applyFilters();
    applyTransform();

})();
