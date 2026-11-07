/**
 * Lions Services Inc. - 4-Step Low-Vision Calibration Suite & 20/70 Routing Engine
 * 
 * Tests:
 *  1. Contrast Preference (A/B Split-Screen)
 *  2. Magnification 20/70 Near-Vision Ladder (24px, 32px, 44px, 56px)
 *  3. Giant Mouse Pointer & Radar Locator Check (48px Green vs 64px Yellow)
 *  4. Distortion & Amsler Grid Check (Central Metamorphopsia / Hover-to-Speech)
 */

(function () {
  'use strict';

  // --- 1. CENTRALIZED ACCESSIBILITY & TELEMETRY STORE ---
  const store = {
    // Test 1
    contrast_theme: "yellow-on-black", // "white-on-black" | "yellow-on-black"
    
    // Test 2
    confirmed_font_px: 24,
    zoom_scale: 1.5,
    at_or_worse_than_20_70: false,
    visual_display_limit_exceeded: false,
    
    // Test 3
    cursor_profile: "giant-green-48px", // "giant-green-48px" | "giant-yellow-64px"
    mouse_tracking_difficulty: false,

    // Test 4
    metamorphopsia_detected: false,
    hover_speech_enabled: false
  };

  // State Management
  let currentTest = 1; // 1, 2, 3, 4, 5 (5 is summary)
  let ladderStep = 1;  // 1: 24px, 2: 32px, 3: 44px, 4: 56px
  const LADDER_CONFIG = [
    { step: 1, px: 24, scale: 1.5, acuityLabel: "~20/50 acuity", is20_70: false },
    { step: 2, px: 32, scale: 2.0, acuityLabel: "20/70 Low-Vision Boundary", is20_70: true },
    { step: 3, px: 44, scale: 2.75, acuityLabel: "~20/120 acuity", is20_70: true },
    { step: 4, px: 56, scale: 3.5, acuityLabel: "~20/200 Legal Blindness Boundary", is20_70: true }
  ];

  // --- 2. AUDIO SYNTHESIZER & EARCON ---
  const AudioEngine = {
    synth: window.speechSynthesis,
    audioCtx: null,

    initAudioCtx() {
      if (!this.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }
    },

    playChime(callback) {
      try {
        this.initAudioCtx();
        if (!this.audioCtx) {
          if (callback) callback();
          return;
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }

        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.32);

        setTimeout(() => { if (callback) callback(); }, 160);
      } catch (e) {
        if (callback) callback();
      }
    },

    speak(text) {
      if (!this.synth) return;
      this.synth.cancel();

      this.playChime(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        this.synth.speak(utterance);
      });
    }
  };

  // --- 3. TEST RUNNER & STEPPING LOGIC ---
  const SuiteController = {
    init() {
      this.bindDOM();
      this.bindKeyboard();
      this.goToTest(1);
    },

    bindDOM() {
      // Test 1 Cards
      document.getElementById('card-contrast-white').addEventListener('click', () => this.handleTest1Choice('white-on-black'));
      document.getElementById('card-contrast-yellow').addEventListener('click', () => this.handleTest1Choice('yellow-on-black'));

      // Test 2 Buttons
      document.getElementById('ladder-btn-j').addEventListener('click', () => this.handleTest2Choice(true));
      document.getElementById('ladder-btn-f').addEventListener('click', () => this.handleTest2Choice(false));

      // Test 3 Buttons
      document.getElementById('cursor-btn-j').addEventListener('click', () => this.handleTest3Choice(true));
      document.getElementById('cursor-btn-f').addEventListener('click', () => this.handleTest3Choice(false));

      // Test 4 Buttons
      document.getElementById('amsler-btn-j').addEventListener('click', () => this.handleTest4Choice(true));
      document.getElementById('amsler-btn-f').addEventListener('click', () => this.handleTest4Choice(false));

      // Staff Assistance Trigger
      document.getElementById('btn-staff-help').addEventListener('click', () => StaffModal.open());
      document.getElementById('btn-staff-dismiss').addEventListener('click', () => StaffModal.close());

      // Routing Gate Simulator Buttons
      document.getElementById('route-force-suite').addEventListener('click', () => {
        this.goToTest(1);
      });
      document.getElementById('route-force-bypass').addEventListener('click', () => {
        this.bypassSuite();
      });
    },

    goToTest(testNumber) {
      currentTest = testNumber;

      // Update Pips
      document.querySelectorAll('.step-pip').forEach(pip => {
        const stepNum = parseInt(pip.getAttribute('data-step'));
        pip.classList.remove('active', 'completed');
        if (stepNum === currentTest) {
          pip.classList.add('active');
        } else if (stepNum < currentTest) {
          pip.classList.add('completed');
        }
      });

      // Show active card
      document.querySelectorAll('.test-card').forEach(card => card.classList.remove('active'));
      const activeCard = document.getElementById(`card-test-${testNumber}`);
      if (activeCard) activeCard.classList.add('active');

      // Execute Test Specific Initialization & Audio Prompt
      if (testNumber === 1) {
        this.playPrompt(
          "Test 1: Contrast Preference. Which side is more comfortable and causes less eye strain? " +
          "Press F for the Left side, White on Black. Or press J for the Right side, Yellow on Black. " +
          "Press Spacebar to replay this prompt."
        );
      } else if (testNumber === 2) {
        this.renderLadderStep(1);
      } else if (testNumber === 3) {
        document.body.classList.remove('cursor-giant-yellow');
        document.body.classList.add('cursor-giant-green');
        store.cursor_profile = "giant-green-48px";
        this.playPrompt(
          "Test 3: Mouse Cursor Locator. Can you clearly see the large neon-green mouse cursor on the screen? " +
          "Press J for Yes, or press F for No."
        );
      } else if (testNumber === 4) {
        this.playPrompt(
          "Test 4: Amsler Grid Check. Look directly at the center white dot. " +
          "Do any of the straight grid lines around it look wavy, bent, broken, or missing? " +
          "Press J for Yes, or press F for No."
        );
      } else if (testNumber === 5) {
        this.renderSummary();
      }
    },

    playPrompt(promptText) {
      AudioEngine.speak(promptText);
    },

    replayCurrentPrompt() {
      if (currentTest === 1) {
        this.playPrompt(
          "Which side is more comfortable and causes less eye strain? " +
          "Press F for Left (White on Black), or press J for Right (Yellow on Black)."
        );
      } else if (currentTest === 2) {
        this.playPrompt(
          "Can you comfortably read the full sentence on screen without leaning forward? " +
          "Press J for Yes, or press F for No."
        );
      } else if (currentTest === 3) {
        this.playPrompt(
          "Can you clearly see the large neon-green mouse cursor on the screen? " +
          "Press J for Yes, or press F for No."
        );
      } else if (currentTest === 4) {
        this.playPrompt(
          "Look directly at the center white dot. Do any of the straight grid lines around it look wavy, bent, broken, or missing? " +
          "Press J for Yes, or press F for No."
        );
      }
    },

    // --- TEST 1 LOGIC ---
    handleTest1Choice(choice) {
      store.contrast_theme = choice;

      if (choice === 'white-on-black') {
        document.body.classList.remove('theme-yellow-on-black');
        document.body.classList.add('theme-white-on-black');
        document.documentElement.style.setProperty('--bg-primary', '#000000');
        document.documentElement.style.setProperty('--text-primary', '#FFFFFF');
        document.documentElement.style.setProperty('--border-primary', '#FFFFFF');
      } else {
        document.body.classList.remove('theme-white-on-black');
        document.body.classList.add('theme-yellow-on-black');
        document.documentElement.style.setProperty('--bg-primary', '#000000');
        document.documentElement.style.setProperty('--text-primary', '#FFD700');
        document.documentElement.style.setProperty('--border-primary', '#FFD700');
      }

      this.goToTest(2);
    },

    // --- TEST 2 LOGIC ---
    renderLadderStep(stepNum) {
      ladderStep = stepNum;
      const config = LADDER_CONFIG[stepNum - 1];

      document.documentElement.style.setProperty('--font-ladder-size', `${config.px}px`);
      document.getElementById('ladder-step-label').textContent = `Step ${config.step} of 4: ${config.px}px (${config.scale}x Zoom)`;
      document.getElementById('ladder-acuity-badge').textContent = config.acuityLabel;

      this.playPrompt(
        `Step ${stepNum}. At ${config.px} pixels: Can you comfortably read the full sentence on screen without leaning forward? ` +
        "Press J for Yes, or press F for No, too small."
      );
    },

    handleTest2Choice(isReadable) {
      const config = LADDER_CONFIG[ladderStep - 1];

      if (isReadable) {
        // [ J ]: Candidate can read comfortably
        store.confirmed_font_px = config.px;
        store.zoom_scale = config.scale;
        store.at_or_worse_than_20_70 = config.is20_70;
        store.visual_display_limit_exceeded = false;
        this.goToTest(3);
      } else {
        // [ F ]: Too small / cannot read comfortably
        if (ladderStep < 4) {
          this.renderLadderStep(ladderStep + 1);
        } else {
          // Exceeded Step 4 (56px)
          store.confirmed_font_px = 56;
          store.zoom_scale = 3.5;
          store.at_or_worse_than_20_70 = true;
          store.visual_display_limit_exceeded = true;
          AudioEngine.speak("Visual display limit exceeded. Continuous synthetic speech guidance has been enabled.");
          this.goToTest(3);
        }
      }
    },

    // --- TEST 3 LOGIC ---
    handleTest3Choice(canSee) {
      if (canSee) {
        // [ J ]: Clearly visible
        store.cursor_profile = "giant-green-48px";
        store.mouse_tracking_difficulty = false;
        document.body.classList.remove('cursor-giant-yellow');
        document.body.classList.add('cursor-giant-green');
        this.goToTest(4);
      } else {
        // [ F ]: Cannot see easily -> Upscale to 64px Giant Amber
        store.cursor_profile = "giant-yellow-64px";
        store.mouse_tracking_difficulty = true;
        document.body.classList.remove('cursor-giant-green');
        document.body.classList.add('cursor-giant-yellow');

        const flagBanner = document.getElementById('tracking-difficulty-banner');
        flagBanner.classList.add('show');

        AudioEngine.speak("Pointer tracking difficulty detected. Switched to 64px Giant Yellow Cursor. Keyboard shortcut training recommended.");
        setTimeout(() => {
          this.goToTest(4);
        }, 1800);
      }
    },

    // --- TEST 4 LOGIC ---
    handleTest4Choice(hasDistortion) {
      if (hasDistortion) {
        // [ J ]: Distortion present (AMD pattern)
        store.metamorphopsia_detected = true;
        store.hover_speech_enabled = true;
        this.enableHoverToSpeech();
        AudioEngine.speak("Central distortion detected. Hover-to-speech mode enabled to prevent eye fatigue.");
      } else {
        // [ F ]: Normal / Straight
        store.metamorphopsia_detected = false;
        store.hover_speech_enabled = false;
      }

      this.goToTest(5);
    },

    // Hover-to-speech engine
    enableHoverToSpeech() {
      document.body.addEventListener('mouseover', (e) => {
        if (!store.hover_speech_enabled) return;
        const target = e.target.closest('p, h1, h2, h3, button, span, legend');
        if (target && target.innerText && target.innerText.trim().length > 0) {
          AudioEngine.speak(target.innerText.trim());
        }
      });
    },

    // --- SUMMARY & TELEMETRY ---
    renderSummary() {
      // Save to Session Storage for Assessor Cockpit
      sessionStorage.setItem('lowVisionCalibrationStore', JSON.stringify(store));
      localStorage.setItem('lowVisionCalibrationStore', JSON.stringify(store));

      document.getElementById('sum-contrast').textContent = store.contrast_theme;
      document.getElementById('sum-font').textContent = `${store.confirmed_font_px}px (${store.zoom_scale}x)`;
      document.getElementById('sum-threshold').textContent = store.at_or_worse_than_20_70 ? "YES (>= 20/70)" : "NO (< 20/70)";
      document.getElementById('sum-cursor').textContent = store.cursor_profile;
      document.getElementById('sum-tracking').textContent = store.mouse_tracking_difficulty ? "FLAGGED (Difficulty)" : "Normal";
      document.getElementById('sum-amsler').textContent = store.metamorphopsia_detected ? "DISTORTION PRESENT" : "Normal";
      document.getElementById('sum-hoverspeech').textContent = store.hover_speech_enabled ? "ACTIVE" : "Disabled";

      document.getElementById('telemetry-json-display').textContent = JSON.stringify(store, null, 2);

      AudioEngine.speak(
        "Low vision calibration complete. All telemetry data has been compiled for the staff assessor cockpit."
      );
    },

    bypassSuite() {
      alert(
        "Bypass Route Activated:\n\n" +
        "Candidate acuity is better than 20/70 (isAtOrWorseThan20_70 === false).\n" +
        "Bypassing the in-depth 4-Step Low-Vision Suite and proceeding directly along the standard assessment path."
      );
    },

    // --- 4. TACTILE KEYBOARD GROUNDING ---
    bindKeyboard() {
      let lastKeyPress = 0;
      window.addEventListener('keydown', (e) => {
        const now = Date.now();
        if (now - lastKeyPress < 300) return; // 300ms debounce

        const key = e.key;

        // Escape: Staff Help
        if (key === 'Escape') {
          e.preventDefault();
          lastKeyPress = now;
          StaffModal.toggle();
          return;
        }

        // Spacebar: Replay Audio Prompt
        if (key === ' ' || e.code === 'Space') {
          e.preventDefault();
          lastKeyPress = now;
          this.replayCurrentPrompt();
          return;
        }

        // [ J ]: Affirmative
        if (key === 'j' || key === 'J') {
          e.preventDefault();
          lastKeyPress = now;
          this.handleKeyJ();
          return;
        }

        // [ F ]: Negative
        if (key === 'f' || key === 'F') {
          e.preventDefault();
          lastKeyPress = now;
          this.handleKeyF();
          return;
        }
      });
    },

    handleKeyJ() {
      if (currentTest === 1) this.handleTest1Choice('yellow-on-black');
      else if (currentTest === 2) this.handleTest2Choice(true);
      else if (currentTest === 3) this.handleTest3Choice(true);
      else if (currentTest === 4) this.handleTest4Choice(true);
    },

    handleKeyF() {
      if (currentTest === 1) this.handleTest1Choice('white-on-black');
      else if (currentTest === 2) this.handleTest2Choice(false);
      else if (currentTest === 3) this.handleTest3Choice(false);
      else if (currentTest === 4) this.handleTest4Choice(false);
    }
  };

  // Staff Modal Controller
  const StaffModal = {
    overlay: null,
    isOpen: false,

    init() {
      this.overlay = document.getElementById('staff-modal-overlay');
    },

    open() {
      if (!this.overlay) return;
      this.isOpen = true;
      this.overlay.classList.add('open');
      AudioEngine.speak("Staff assistance requested. An assessor has been alerted to come assist you.");
    },

    close() {
      if (!this.overlay) return;
      this.isOpen = false;
      this.overlay.classList.remove('open');
      AudioEngine.speak("Returning to calibration check.");
    },

    toggle() {
      if (this.isOpen) this.close();
      else this.open();
    }
  };

  // On DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    StaffModal.init();
    SuiteController.init();
  });

})();
