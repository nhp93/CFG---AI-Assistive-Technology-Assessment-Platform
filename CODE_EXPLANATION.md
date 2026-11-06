# Code Chunk Cheat Sheet: What Each Part Really Is

A simple, plain-English guide to the updated, aesthetic application layout.

---

## 1. `index.html` (The Structure)

| Chunk | Name | What is it for? | How it works |
| :--- | :--- | :--- | :--- |
| **Chunk 1** | **Screen Zoom Setting** | Lets low-vision users pinch-to-zoom on phones/browsers up to 5x. | `maximum-scale=5.0` allows zooming instead of locking the screen. |
| **Chunk 2** | **Screen Reader Speaker** | Invisible announcement box for tools like JAWS, NVDA, or VoiceOver. | Whenever status changes (like zoom level), screen readers speak it. |
| **Chunk 3** | **Top Header & Zoom Controls** | Sleek top bar with brand badge and ZoomText buttons. | Quick buttons for 100%, 120%, 140%, 160%, 180%, and 200% zoom (no scrolling needed). |
| **Chunk 4** | **Main Question Card** | Centered aesthetic box with the welcome message. | Keeps user attention on one clear task at a time without tutorial clutter. |
| **Chunk 5** | **Action Buttons & Voice-In** | Primary **Start** button, **Hear Instructions**, and **Voice-In Mic**. | Combines keyboard, click, and voice-in interaction options. |
| **Chunk 6** | **Status Bar (Footer)** | Bottom strip showing current voice activity and zoom level. | Updates live so staff and candidates can see active settings at a glance. |
| **Chunk 7** | **Staff Help Pop-up** | Emergency alert box triggered by pressing Escape. | Alerts human staff to come assist the candidate immediately. |

---

## 2. `styles.css` (The Look & Feel)

| Chunk | Name | What is it for? | How it works |
| :--- | :--- | :--- | :--- |
| **Chunk 1** | **Black & Yellow Theme** | Extreme contrast with refined, aesthetic proportions. | Pure black background (`#000000`) with bright golden yellow text (`#FFD700`). |
| **Chunk 2** | **Gigantic Green Cursor** | 56px glowing neon green arrow pointer. | Extra-large with a thick black outline so users never lose their mouse arrow. |
| **Chunk 3** | **Smooth Font Antialiasing** | Makes letters look smooth, crisp, and aesthetic. | Adds `-webkit-font-smoothing: antialiased` and subpixel font smoothing. |
| **Chunk 4** | **Top Header Styling** | Modern frosted-glass dark banner with zoom buttons. | Clean, compact header that stays out of the way. |
| **Chunk 5** | **Main Card Design** | Sleek 2px gold border with gentle ambient glow. | Beautiful modern card geometry without excessive bulk. |
| **Chunk 6** | **Buttons & Voice-In Mic** | Buttons with neon glowing microphone and soundwave bars. | Soundwave bars animate smoothly when Voice-In mode is active. |
| **Chunk 7–8** | **Footer & Help Pop-up** | Dark blurred backdrop with neon green alert borders. | Focuses attention solely on the staff help dialog when opened. |

---

## 3. `app.js` (The Brains & Logic)

| Chunk | Name | What is it for? | How it works |
| :--- | :--- | :--- | :--- |
| **Chunk 1** | **Audio Chime (`AudioEarcon`)** | A pleasant 2-tone musical chime before the voice speaks. | Primes the ear and brain so candidates aren't startled by sudden speech. |
| **Chunk 2** | **Voice Narrator (`SpeechNarrator`)** | Reads screen instructions aloud to train ears and brain. | Automatically stops any old voice before starting new speech so words never overlap. |
| **Chunk 3** | **ZoomText Engine (`ZoomTextEngine`)** | Controls the 100% to 400% zoom levels. | Changes the font size multiplier and speaks the new zoom level aloud. |
| **Chunk 4** | **Staff Help Modal (`StaffModal`)** | Handles the pop-up when the candidate presses Escape. | Traps keyboard focus inside the help box and restores focus when closed. |
| **Chunk 5** | **Keyboard Handler (`TactileNav`)** | Listens for `J`, `Space`, `Esc`, `+`, and `-`. | Maps physical home-row locator nubs. Includes a 300ms delay to block tremors. |
| **Chunk 6** | **Voice-In Interaction (`VoiceInteract`)** | Interactive microphone button placeholder. | Toggles active "Listening..." state and soundwave bars with speech confirmation. |
| **Chunk 7** | **Startup Engine** | Automatically starts the page and plays welcome speech. | Moves keyboard focus to the title immediately when opened. |
