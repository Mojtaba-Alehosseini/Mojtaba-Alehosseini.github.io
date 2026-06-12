/* ──────────────────────────────────────────────────────────────
   Portrait Interaction — Mojtaba Alehosseini
   ──────────────────────────────────────────────────────────────
   Feature 1 : Spotlight hover — cursor reveals background through
               a radial mask (not full-image opacity)
   Feature 2 : Origami — webcam hand-tracking + canvas frame render
               with continuous (proportional) hand-openness scrubbing
   ────────────────────────────────────────────────────────────── */
(() => {
  'use strict';

  /* ── Elements ─────────────────────────────────────────────── */
  const container       = document.getElementById('portraitContainer');
  if (!container) return;

  const bgLayer         = container.querySelector('.portrait-bg');
  const mainPortrait    = document.getElementById('mainPortrait');
  const transitionVideo = document.getElementById('transitionVideo');
  const crumpleCanvas   = document.getElementById('crumpleCanvas');
  const activateBtn     = document.getElementById('activateBtn');
  const deactivateBtn   = document.getElementById('deactivateBtn');
  const mobileCloseBtn  = document.getElementById('mobileCloseBtn');
  const webcamPanel     = document.getElementById('webcamPanel');
  const mobileGuide     = document.getElementById('mobileGuide');
  const webcamFeed      = document.getElementById('webcamFeed');
  const inputVideo      = document.getElementById('inputVideo');
  const gestureBadge    = document.getElementById('gestureBadge');
  const guideOpen       = document.getElementById('guideOpen');
  const guideFist       = document.getElementById('guideFist');
  const landmarkCanvas  = document.getElementById('landmarkCanvas');
  const motionFlash     = document.getElementById('motionFlash');
  const lCtx            = landmarkCanvas ? landmarkCanvas.getContext('2d') : null;
  const crumpleCtx      = crumpleCanvas  ? crumpleCanvas.getContext('2d')  : null;

  /* ── State ────────────────────────────────────────────────── */
  let handsModel       = null;
  let cameraUtil       = null;
  let stream           = null;
  let animFrameId      = null;
  let handOpenness     = 0;    // 0.0 = fully open, 1.0 = full fist (smoothed)
  let isOrigamiActive  = false;
  let mediaPipePromise = null; // cached loader promise (hover + click share it)
  let handVisible      = false; // is a hand currently detected this frame
  let lastHandSeen     = 0;     // performance.now() of last frame a hand was seen

  const NO_HAND_RESET_MS = 5000;  // no hand for 5s → ease crumple back to 0%

  const SPOTLIGHT_RADIUS = 90;   // px — reveal circle radius around cursor
  // Fully-transparent mask used to hide the bg layer (mask:none = no mask = visible in standard CSS)
  const MASK_HIDDEN = 'radial-gradient(circle 0px at 0px 0px, transparent 0%, transparent 100%)';

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
                   ('ontouchstart' in window && window.innerWidth < 768);


  /* ═════════════════════════════════════════════════════════════
     FEATURE 1 — Cursor Spotlight Background Reveal
     ═════════════════════════════════════════════════════════════ */

  if (bgLayer) {
    // Initially fully hidden — transparent gradient, not 'none' (none = no masking = visible)
    bgLayer.style.webkitMaskImage = MASK_HIDDEN;
    bgLayer.style.maskImage       = MASK_HIDDEN;

    container.addEventListener('mousemove', (e) => {
      if (isOrigamiActive) return;

      const rect = container.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;
      const r    = SPOTLIGHT_RADIUS;

      const mask = `radial-gradient(circle ${r}px at ${x}px ${y}px,
        black 0%,
        black 55%,
        transparent 100%
      )`;

      bgLayer.style.webkitMaskImage = mask;
      bgLayer.style.maskImage       = mask;
    });

    container.addEventListener('mouseleave', () => {
      if (isOrigamiActive) return;
      bgLayer.style.webkitMaskImage = MASK_HIDDEN;
      bgLayer.style.maskImage       = MASK_HIDDEN;
    });
  }


  /* ═════════════════════════════════════════════════════════════
     FEATURE 2 — Frame Preloading
     ═════════════════════════════════════════════════════════════ */

  const TOTAL_FRAMES = 121;           // ← exact count from ffmpeg extraction
  const FRAME_PATH   = 'assets/frames-transparent/frame';
  const FRAME_EXT    = '.png';

  const frames       = new Array(TOTAL_FRAMES);
  let   framesLoaded = 0;
  let   framesReady  = false;

  function preloadFrames() {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const num  = String(i + 1).padStart(4, '0');
      img.src    = `${FRAME_PATH}${num}${FRAME_EXT}`;
      img.onload = img.onerror = () => {
        framesLoaded++;
        if (framesLoaded === TOTAL_FRAMES) framesReady = true;
      };
      frames[i] = img;
    }
  }

  // Start loading immediately — zero impact on page since images are small JPEGs
  preloadFrames();


  /* ═════════════════════════════════════════════════════════════
     FEATURE 2 — Gesture-Controlled Origami Interaction
     ═════════════════════════════════════════════════════════════ */

  /* ── Dynamic MediaPipe loader (≈5 MB, only on demand) ─────────
   * Cached promise so a hover-preload and the click share ONE download.
   * On failure the cache resets so a later attempt can retry.          */
  function loadMediaPipeScripts() {
    if (mediaPipePromise) return mediaPipePromise;
    const urls = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
    ];
    mediaPipePromise = (async () => {
      for (const src of urls) {
        await new Promise((resolve, reject) => {
          const s       = document.createElement('script');
          s.src         = src;
          s.crossOrigin = 'anonymous';
          s.onload      = resolve;
          s.onerror     = () => reject(new Error('Failed to load ' + src));
          document.head.appendChild(s);
        });
      }
    })().catch((e) => { mediaPipePromise = null; throw e; });
    return mediaPipePromise;
  }

  /* ── Activation ───────────────────────────────────────────── */
  if (activateBtn && !isMobile) {
    // Warm up the hand-tracking download the moment the user shows intent,
    // so it's already cached by the time they click (cuts startup lag).
    activateBtn.addEventListener('pointerenter',
      () => { loadMediaPipeScripts().catch(() => {}); },
      { once: true });
  }

  if (activateBtn) {
    activateBtn.addEventListener('click', async () => {
      const originalHTML    = activateBtn.innerHTML;
      activateBtn.innerHTML = '<span class="origami-btn__icon" aria-hidden="true">\u27F3</span> Loading\u2026';
      activateBtn.disabled  = true;

      try {
        await startExperience();
      } catch (e) {
        console.error('Origami experience failed:', e);
        activateBtn.innerHTML = originalHTML;
        activateBtn.disabled  = false;
      }
    });
  }

  if (deactivateBtn)  deactivateBtn.addEventListener('click', stopExperience);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', stopExperience);

  /* ── Start ────────────────────────────────────────────────── */
  async function startExperience() {
    isOrigamiActive = true;
    handOpenness    = 0;
    handVisible     = false;
    lastHandSeen    = 0;
    opennessFilter.reset();

    // Start the ~5 MB hand-tracking download NOW, in parallel with the
    // transition video, so it's ready by the time the video ends (was loading
    // serially AFTER the video — the main cause of the start-up lag).
    const scriptsPromise = isMobile
      ? Promise.resolve()
      : loadMediaPipeScripts().catch((e) => e);   // resolve to the error; handled below

    // Kill spotlight
    if (bgLayer) {
      bgLayer.style.webkitMaskImage = MASK_HIDDEN;
      bgLayer.style.maskImage       = MASK_HIDDEN;
    }

    // ── Play transition video (cutout → origami) ──────────────
    if (transitionVideo) {
      transitionVideo.classList.remove('hidden');
      transitionVideo.currentTime = 0;

      mainPortrait.style.transition = 'opacity 0.4s ease';
      mainPortrait.style.opacity    = '0';

      try {
        await transitionVideo.play();
        await new Promise((resolve) => {
          transitionVideo.addEventListener('ended', resolve, { once: true });
          setTimeout(resolve, 15000);       // safety cap
        });
      } catch (_) { /* skip transition if play fails */ }

      transitionVideo.pause();
      transitionVideo.classList.add('hidden');
    } else {
      mainPortrait.style.transition = 'opacity 0.4s ease';
      mainPortrait.style.opacity    = '0';
    }

    // ── Switch to the crumple canvas ──────────────────────────
    // No static origami image layer — the transparent canvas frames are the
    // sole origami display, so nothing shows behind/through them.
    mainPortrait.classList.add('hidden');

    if (crumpleCanvas) {
      crumpleCanvas.width  = 800;
      crumpleCanvas.height = 800;
      crumpleCanvas.classList.remove('hidden');
      drawCurrentFrame();   // paint frame 0 (intact origami) immediately, no blank flash
    }

    activateBtn.classList.add('hidden');
    if (motionFlash) motionFlash.classList.add('hidden');

    // ── Mobile path ───────────────────────────────────────────
    if (isMobile) {
      if (mobileGuide) mobileGuide.classList.remove('hidden');
      animFrameId = requestAnimationFrame(renderLoop);
      return;
    }

    // ── Desktop path: Camera + MediaPipe ──────────────────────
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Camera not supported in this browser. Try Chrome or Edge.');
      stopExperience();
      return;
    }

    // Scripts were kicked off in parallel above — usually already loaded by now.
    const scriptResult = await scriptsPromise;
    if (scriptResult instanceof Error) {
      alert('Failed to load hand-tracking library. Check your connection.');
      stopExperience();
      return;
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
    } catch (_) {
      alert('Camera access denied. Allow camera to use this feature.');
      stopExperience();
      return;
    }

    webcamFeed.srcObject = stream;
    inputVideo.srcObject = stream;
    webcamPanel.classList.remove('hidden');

    // Init MediaPipe Hands
    try {
      /* global Hands, Camera, drawConnectors, drawLandmarks, HAND_CONNECTIONS */
      handsModel = new Hands({
        locateFile: (file) =>
          'https://cdn.jsdelivr.net/npm/@mediapipe/hands/' + file,
      });

      handsModel.setOptions({
        maxNumHands:            1,
        modelComplexity:        0,    // lite model: smaller download + faster inference → locks on quicker
        minDetectionConfidence: 0.5,  // lower = recognises the hand sooner
        minTrackingConfidence:  0.5,
      });

      handsModel.onResults(onHandResults);

      cameraUtil = new Camera(inputVideo, {
        onFrame: async () => {
          if (handsModel) await handsModel.send({ image: inputVideo });
        },
        width:  640,
        height: 480,
      });
      cameraUtil.start();
    } catch (e) {
      console.warn('MediaPipe init failed:', e);
      if (gestureBadge) gestureBadge.textContent = 'Hand tracking unavailable';
    }

    animFrameId = requestAnimationFrame(renderLoop);
  }

  /* ── Stop ─────────────────────────────────────────────────── */
  function stopExperience() {
    if (cameraUtil)  { cameraUtil.stop();  cameraUtil  = null; }
    if (handsModel)  { handsModel.close(); handsModel  = null; }
    if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
    if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }

    // Reset panels
    webcamPanel.classList.add('hidden');
    if (mobileGuide) mobileGuide.classList.add('hidden');
    if (crumpleCanvas) crumpleCanvas.classList.add('hidden');

    // Restore portrait
    mainPortrait.classList.remove('hidden');
    mainPortrait.style.opacity    = '1';
    mainPortrait.style.transition = 'opacity 0.5s ease';

    // Restore button + flash
    activateBtn.classList.remove('hidden');
    activateBtn.innerHTML =
      '<span class="origami-btn__icon" aria-hidden="true">\u2726</span> Interact with origami';
    activateBtn.disabled = false;
    if (motionFlash) motionFlash.classList.remove('hidden');

    // Reset state
    handOpenness    = 0;
    handVisible     = false;
    lastHandSeen    = 0;
    opennessFilter.reset();
    isOrigamiActive = false;
    if (gestureBadge) gestureBadge.textContent = '\u2014';
    if (guideOpen)    guideOpen.classList.remove('active');
    if (guideFist)    guideFist.classList.remove('active');
  }


  /* ── One Euro Filter ──────────────────────────────────────────
   * Smooths jitter while staying responsive — the standard fix for
   * noisy interactive signals (https://gery.casiez.net/1euro/).
   *   • Holding steady  → heavy smoothing  → kills the 55↔57% wobble
   *   • Moving the hand → light smoothing   → stays accurate, low lag
   * Tune: lower minCutoff = steadier when still; higher beta = snappier
   * when moving fast.                                                 */
  function makeOneEuro({ minCutoff = 1.0, beta = 0.6, dCutoff = 1.0 } = {}) {
    let xPrev = null, dxPrev = 0, tPrev = null;
    const alpha = (cutoff, dt) => {
      const tau = 1 / (2 * Math.PI * cutoff);
      return 1 / (1 + tau / dt);
    };
    return {
      filter(x, t) {
        if (xPrev === null) { xPrev = x; tPrev = t; return x; }
        let dt = (t - tPrev) / 1000;          // seconds
        if (!(dt > 0)) dt = 1 / 30;            // guard 0 / negative dt
        tPrev = t;
        const dx     = (x - xPrev) / dt;
        const aD     = alpha(dCutoff, dt);
        const dxHat  = aD * dx + (1 - aD) * dxPrev;
        const cutoff = minCutoff + beta * Math.abs(dxHat);
        const a      = alpha(cutoff, dt);
        const xHat   = a * x + (1 - a) * xPrev;
        xPrev = xHat; dxPrev = dxHat;
        return xHat;
      },
      reset() { xPrev = null; dxPrev = 0; tPrev = null; },
    };
  }

  // minCutoff low enough to hold a steady %, beta high enough to follow a real crumple
  const opennessFilter = makeOneEuro({ minCutoff: 0.6, beta: 0.7, dCutoff: 1.0 });


  /* ── Continuous Hand Openness Measurement ─────────────────── */
  /**
   * Returns 0.0 (fully open) → 1.0 (full fist).
   * Uses Y-axis distance from fingertip to knuckle (MCP),
   * normalised by wrist-to-middle-MCP ruler (camera-distance invariant).
   */
  function measureHandOpenness(landmarks) {
    const fingers = [
      [8,  6,  5 ],  // index:  tip, pip, mcp
      [12, 10, 9 ],  // middle: tip, pip, mcp
      [16, 14, 13],  // ring:   tip, pip, mcp
      [20, 18, 17],  // pinky:  tip, pip, mcp
    ];

    const wristY  = landmarks[0].y;
    const midMcpY = landmarks[9].y;
    const ruler   = Math.abs(midMcpY - wristY) || 0.01;

    let totalCurl = 0;
    for (const [tipIdx, , mcpIdx] of fingers) {
      const raw = (landmarks[tipIdx].y - landmarks[mcpIdx].y) / ruler;
      totalCurl += Math.max(-1.0, Math.min(1.0, raw));
    }

    const avg = totalCurl / 4;
    // Map: -1.0 (extended) → 0.0,  +1.0 (curled) → 1.0
    return Math.max(0, Math.min(1, (avg + 1.0) / 2.0));
  }


  /* ── Hand Results Handler ─────────────────────────────────── */
  function onHandResults(results) {
    if (!landmarkCanvas || !lCtx) return;

    landmarkCanvas.width  = webcamFeed.videoWidth  || 640;
    landmarkCanvas.height = webcamFeed.videoHeight || 480;
    lCtx.clearRect(0, 0, landmarkCanvas.width, landmarkCanvas.height);

    if (!results.multiHandLandmarks || !results.multiHandLandmarks.length) {
      // No hand — hold the current frame; renderLoop eases to 0% after 5s
      handVisible = false;
      if (gestureBadge) gestureBadge.textContent = 'Show your hand';
      if (guideOpen)    guideOpen.classList.remove('active');
      if (guideFist)    guideFist.classList.remove('active');
      return;
    }

    handVisible  = true;
    lastHandSeen = performance.now();

    const landmarks = results.multiHandLandmarks[0];

    // Draw skeleton for visual feedback
    try {
      drawConnectors(lCtx, landmarks, HAND_CONNECTIONS,
        { color: 'rgba(255,255,255,0.3)', lineWidth: 1 });
      drawLandmarks(lCtx, landmarks, { color: '#ffffff', radius: 2 });
    } catch (_) { /* drawing utils may not be loaded */ }

    // Raw measurement → One Euro smoothing (steady when still, snappy when moving)
    const raw    = measureHandOpenness(landmarks);
    handOpenness = opennessFilter.filter(raw, lastHandSeen);
    const pct    = Math.round(handOpenness * 100);

    if (gestureBadge) gestureBadge.textContent = `${pct}% crumpled`;

    if (handOpenness < 0.25) {
      if (guideOpen) guideOpen.classList.add('active');
      if (guideFist) guideFist.classList.remove('active');
    } else if (handOpenness > 0.75) {
      if (guideFist) guideFist.classList.add('active');
      if (guideOpen) guideOpen.classList.remove('active');
    } else {
      if (guideOpen) guideOpen.classList.remove('active');
      if (guideFist) guideFist.classList.remove('active');
    }
  }


  /* ── Draw the frame for the current openness (drawn on demand + per rAF) ── */
  function drawCurrentFrame() {
    if (!crumpleCtx) return;
    const idx   = Math.round(handOpenness * (frames.length - 1));
    const frame = frames[Math.max(0, Math.min(idx, frames.length - 1))];
    if (frame && frame.complete && frame.naturalWidth > 0) {
      crumpleCtx.clearRect(0, 0, crumpleCanvas.width, crumpleCanvas.height);
      crumpleCtx.drawImage(frame, 0, 0, crumpleCanvas.width, crumpleCanvas.height);
    }
  }

  /* ── Canvas Render Loop ───────────────────────────────────── */
  function renderLoop() {
    // No hand for 5s → smoothly unfold back to 0% (fully open / intact face)
    if (!handVisible && lastHandSeen &&
        (performance.now() - lastHandSeen > NO_HAND_RESET_MS)) {
      if (handOpenness > 0.005) {
        handOpenness += (0 - handOpenness) * 0.08;   // ease toward 0 (~1s)
      } else if (handOpenness !== 0) {
        handOpenness = 0;
        opennessFilter.reset();                      // clean restart on re-detect
        if (gestureBadge) gestureBadge.textContent = 'Show your hand';
      }
    }

    drawCurrentFrame();
    animFrameId = requestAnimationFrame(renderLoop);
  }


  /* ── Mobile Touch Fallback ────────────────────────────────── */
  // Touch-hold = fist (fully crumpled), release = open (fully unfolded)
  if (isMobile) {
    container.addEventListener('touchstart', (e) => {
      if (!isOrigamiActive) return;
      e.preventDefault();
      handOpenness = 1.0;   // full fist
    }, { passive: false });

    container.addEventListener('touchend', () => {
      if (!isOrigamiActive) return;
      handOpenness = 0.0;   // fully open
    });
  }
})();
