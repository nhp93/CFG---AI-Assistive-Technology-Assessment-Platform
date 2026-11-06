/**
 * Lions Services Inc. - Assistive Technology Evaluation
 * Screen 1 Application Controller & Accessibility State Engine
 * 
 * Simple Code Breakdown:
 *  - CHUNK 1: AudioEarcon (Chime Sound Engine)
 *  - CHUNK 2: SpeechNarrator (Voice Reader / Ear-Brain Training)
 *  - CHUNK 3: ZoomTextEngine (Screen Magnifier 100% to 400%)
 *  - CHUNK 4: StaffModal (Staff Help Pop-up)
 *  - CHUNK 5: TactileNav (Keyboard Handler with Tremor Guard)
 *  - CHUNK 6: VoiceInteract (Voice-In Interactive Microphone Placeholder)
 *  - CHUNK 7: Page Actions & Startup Logic
 */

(function () {
  'use strict';

  /**
   * CHUNK 1: AUDIO CHIME (AudioEarcon)
   * - What is this: A pleasant musical chime that plays before the voice speaks.
   * - What is it for: Alerts candidates that speech is about to happen so they aren't startled.
   * - How it works: Uses browser Web Audio API to play an ascending 2-tone chime.
   */
  const AudioEarcon = {
    audioCtx: null,

    init() {
      if (!this.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }
    },

    playChime(callback) {
      try {
        this.init();
        if (!this.audioCtx) {
          if (callback) callback();
          return;
        }

        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }

        const now = this.audioCtx.currentTime;
        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        // Pleasant melodic chime
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now);
        osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(659.25, now);
        osc2.frequency.exponentialRampToValueAtTime(783.99, now + 0.15);

        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(0.18, now + 0.04);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.36);
        osc2.stop(now + 0.36);

        setTimeout(() => {
          if (callback) callback();
        }, 180);
      } catch (err) {
        console.warn('Web Audio error:', err);
        if (callback) callback();
      }
    }
  };

  /**
   * CHUNK 2: VOICE NARRATOR (SpeechNarrator)
   * - What is this: Voice engine that reads instructions aloud to train ears and brain.
   * - What is it for: Enables blind and low-vision candidates to hear instructions clearly.
   * - How it works: Uses window.speechSynthesis, clearing backlogs so voices never overlap.
   */
  const SpeechNarrator = {
    synth: window.speechSynthesis,
    isSpeaking: false,
    enabled: false, // Voice-over disabled as requested
    preferredVoice: null,

    init() {
      if (!('speechSynthesis' in window)) {
        console.warn('Speech Synthesis not supported in this browser.');
        this.updateStatus('Speech: Not supported');
        return;
      }

      this.updateVoice();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.updateVoice();
      }
    },

    updateVoice() {
      if (!this.synth) return;
      const voices = this.synth.getVoices();
      this.preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Daniel')))
        || voices.find(v => v.lang.startsWith('en'))
        || voices[0];
    },

    speak(text, priority = false) {
      if (!this.enabled || !this.synth) return;

      this.synth.cancel(); // Stop old speech immediately

      const liveRegion = document.getElementById('aria-live-announcer');
      if (liveRegion) {
        liveRegion.textContent = text;
      }

      AudioEarcon.playChime(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        if (this.preferredVoice) {
          utterance.voice = this.preferredVoice;
        }
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          this.isSpeaking = true;
          this.updateSoundIndicator(true);
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          this.updateSoundIndicator(false);
        };

        utterance.onerror = (e) => {
          this.isSpeaking = false;
          this.updateSoundIndicator(false);
          console.warn('Speech error:', e);
        };

        this.synth.speak(utterance);
      });
    },

    stop() {
      if (this.synth) {
        this.synth.cancel();
      }
      this.isSpeaking = false;
      this.updateSoundIndicator(false);
    },

    updateSoundIndicator(speaking) {
      const el = document.getElementById('sound-status');
      if (el) {
        el.innerHTML = speaking
          ? `<span class="pulse-dot" aria-hidden="true"></span> Narrator: Speaking (Spacebar to replay)`
          : `<span>🔊</span> Narrator: Ready (Spacebar to replay)`;
      }
    },

    updateStatus(str) {
      const el = document.getElementById('sound-status');
      if (el) el.textContent = str;
    }
  };

  /**
   * CHUNK 3: ZOOMTEXT MAGNIFIER ENGINE (ZoomTextEngine)
   * - What is this: Dynamic page scaler with 20% steps up to 200%.
   * - What is it for: Scales font sizes between 100% and 200% cleanly without requiring any scrolling.
   */
  const ZoomTextEngine = {
    currentLevel: 1.0,
    levels: [1.0, 1.2, 1.4, 1.6, 1.8, 2.0],

    setZoom(multiplier, announce = true) {
      this.currentLevel = multiplier;
      document.documentElement.style.setProperty('--zoom-multiplier', multiplier.toString());

      document.querySelectorAll('.zoom-btn').forEach(btn => {
        const btnLevel = parseFloat(btn.getAttribute('data-zoom'));
        if (Math.abs(btnLevel - multiplier) < 0.05) {
          btn.classList.add('active');
          btn.setAttribute('aria-pressed', 'true');
        } else {
          btn.classList.remove('active');
          btn.setAttribute('aria-pressed', 'false');
        }
      });

      const zoomStatus = document.getElementById('zoom-status-display');
      if (zoomStatus) {
        zoomStatus.textContent = `Zoom: ${Math.round(multiplier * 100)}%`;
      }

      if (announce) {
        SpeechNarrator.speak(`Magnification set to ${Math.round(multiplier * 100)} percent.`);
      }
    },

    zoomIn() {
      const next = this.levels.find(l => l > this.currentLevel + 0.05);
      if (next) this.setZoom(next);
      else SpeechNarrator.speak('Maximum magnification reached: 200 percent.');
    },

    zoomOut() {
      const prev = [...this.levels].reverse().find(l => l < this.currentLevel - 0.05);
      if (prev) this.setZoom(prev);
      else SpeechNarrator.speak('Minimum magnification reached: 100 percent.');
    }
  };

  /**
   * CHUNK 4: STAFF HELP POP-UP (StaffModal)
   * - What is this: Emergency pop-up alert when candidate presses Escape.
   * - What is it for: Calls for staff assistance and holds keyboard focus safely.
   */
  const StaffModal = {
    overlay: null,
    dialog: null,
    isOpen: false,
    previousFocusedElement: null,

    init() {
      this.overlay = document.getElementById('staff-modal-overlay');
      this.dialog = document.getElementById('staff-modal-dialog');

      const dismissBtn = document.getElementById('staff-modal-dismiss');
      if (dismissBtn) {
        dismissBtn.addEventListener('click', () => this.close());
      }
    },

    open() {
      if (!this.overlay) return;
      this.isOpen = true;
      this.previousFocusedElement = document.activeElement;
      this.overlay.classList.add('open');
      this.overlay.removeAttribute('aria-hidden');

      const dismissBtn = document.getElementById('staff-modal-dismiss');
      if (dismissBtn) dismissBtn.focus();

      SpeechNarrator.speak('Staff assistance requested. An assessor has been alerted to come assist you. Press Escape or Enter to return.');
    },

    close() {
      if (!this.overlay) return;
      this.isOpen = false;
      this.overlay.classList.remove('open');
      this.overlay.setAttribute('aria-hidden', 'true');

      if (this.previousFocusedElement && typeof this.previousFocusedElement.focus === 'function') {
        this.previousFocusedElement.focus();
      }

      SpeechNarrator.speak('Returning to assessment screen.');
    },

    toggle() {
      if (this.isOpen) this.close();
      else this.open();
    }
  };

  /**
   * CHUNK 5: TACTILE KEYBOARD HANDLER (TactileNav)
   * - What is this: Listens to physical keyboard keys (J, Spacebar, Escape, +/-).
   * - What is it for: Enables hands-free navigation with a 300ms tremor guard.
   */
  const TactileNav = {
    lastKeyPressTime: 0,
    debounceMs: 300,

    init() {
      window.addEventListener('keydown', (event) => this.handleKeyDown(event));
    },

    handleKeyDown(event) {
      const now = Date.now();
      if (now - this.lastKeyPressTime < this.debounceMs) {
        return;
      }

      const key = event.key;
      const code = event.code;

      // Escape: Staff Help
      if (key === 'Escape' || code === 'Escape') {
        event.preventDefault();
        this.lastKeyPressTime = now;
        StaffModal.toggle();
        return;
      }

      if (StaffModal.isOpen) {
        if (key === 'Enter') {
          event.preventDefault();
          this.lastKeyPressTime = now;
          StaffModal.close();
        }
        return;
      }

      // Spacebar: Replay Voice
      if (key === ' ' || code === 'Space') {
        const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (tag !== 'input' && tag !== 'textarea') {
          event.preventDefault();
          this.lastKeyPressTime = now;
          reannounceWelcomeInstructions();
          return;
        }
      }

      // [ J ]: Start / Confirm
      if (key === 'j' || key === 'J' || code === 'KeyJ') {
        event.preventDefault();
        this.lastKeyPressTime = now;
        triggerStartAction();
        return;
      }

      // [ + ]: Zoom In
      if (key === '+' || key === '=') {
        event.preventDefault();
        this.lastKeyPressTime = now;
        ZoomTextEngine.zoomIn();
        return;
      }

      // [ - ]: Zoom Out
      if (key === '-' || key === '_') {
        event.preventDefault();
        this.lastKeyPressTime = now;
        ZoomTextEngine.zoomOut();
      }
    }
  };

  /**
   * CHUNK 6: VOICE-IN INTERACTION (VoiceInteract)
   * - What is this: Interactive placeholder button for microphone / voice input.
   * - What is it for: Gives candidates a visual voice-in option without complex backend speech recognition.
   * - How it works: Toggles animated soundwave bars and gives auditory confirmation.
   */
  const VoiceInteract = {
    btn: null,
    isListening: false,

    init() {
      this.btn = document.getElementById('btn-voice-interact');
      if (!this.btn) return;

      this.btn.addEventListener('click', () => this.toggle());
    },

    toggle() {
      this.isListening = !this.isListening;
      const statusEl = document.getElementById('voice-btn-status');

      if (this.isListening) {
        this.btn.classList.add('listening');
        this.btn.setAttribute('aria-pressed', 'true');
        if (statusEl) statusEl.textContent = 'Listening...';
        SpeechNarrator.speak('Voice interaction ready. Microphone active.');
      } else {
        this.btn.classList.remove('listening');
        this.btn.setAttribute('aria-pressed', 'false');
        if (statusEl) statusEl.textContent = 'Ready';
        SpeechNarrator.speak('Voice interaction paused.');
      }
    }
  };

  /**
   * CHUNK 7: PAGE ACTIONS & STARTUP LOGIC
   */
  function reannounceWelcomeInstructions() {
    const speechText =
      'Welcome to Your Assistive Technology Check at Lions Services. ' +
      'This is not an exam. There are no right or wrong answers. ' +
      'We are finding the screen settings and tools that fit you best. ' +
      'Press J, your right hand index finger locator nub, to start the comfort check. ' +
      'Press Spacebar at any time to hear these instructions again. ' +
      'Or press Escape if you need staff assistance.';
    SpeechNarrator.speak(speechText);
  }

  function triggerStartAction() {
    const startBtn = document.getElementById('btn-start-check');
    if (startBtn) {
      startBtn.style.transform = 'scale(0.98)';
    }

    // Seamlessly navigate to Visual Settings Questions (Issue #2 & #3)
    window.location.href = 'visual-settings-prototype/index.html';
  }

  // DOM Loaded
  document.addEventListener('DOMContentLoaded', () => {
    SpeechNarrator.enabled = false; // Voice-over disabled as requested
    StaffModal.init();
    TactileNav.init();

    // Wire up ZoomText buttons
    document.querySelectorAll('.zoom-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const zoom = parseFloat(e.currentTarget.getAttribute('data-zoom'));
        ZoomTextEngine.setZoom(zoom);
      });
    });

    // Wire up Start Button
    const startBtn = document.getElementById('btn-start-check');
    if (startBtn) {
      startBtn.addEventListener('click', () => triggerStartAction());
    }

    // Wire up Staff Help Button
    const staffBtn = document.getElementById('btn-staff-help');
    if (staffBtn) {
      staffBtn.addEventListener('click', () => StaffModal.open());
    }
  });

})();
