# Low-Vision Calibration Suite (4-Step Suite & 20/70 Routing)

This module implements the **4-Step Low-Vision Calibration Suite** and the **20/70 Visual Acuity Routing Gate** for Lions Services Inc.

---

## 1. How to Test It Right Now

You can open the suite directly in your browser:
```bash
open "Team-26/low-vision-suite/index.html"
```
Or view via local server:
```bash
http://localhost:3000/low-vision-suite/index.html
```

---

## 2. The 4 Calibration Steps Implemented

### Test 1: Contrast Preference (A/B Split-Screen)
* **View**: 50/50 horizontal split (desktop) or stacked (mobile).
* **Options**:
  * Left card (`[ F ]`): White on Black (`#FFFFFF` on `#000000`).
  * Right card (`[ J ]`): Yellow on Black (`#FFD700` on `#000000`) for anti-glare/photophobia mitigation.
* **Audio Prompt**: Replays with `[ Spacebar ]`.
* **Behavior**: Immediately sets global CSS variables (`--bg-primary`, `--text-primary`) and advances to Test 2.

### Test 2: Magnification 20/70 Near-Vision Ladder
* **Instructional Anchor**: *"Sit at arm's length (about 16 inches / 40 cm). Keep prescription reading glasses on."*
* **Sample Text**: *"Assistive technology helps me work independently."*
* **Stepping Ladder**:
  1. **24px / 1.5x (~20/50 acuity)**: `[ J ]` locks and sets `at_or_worse_than_20_70: false`. `[ F ]` steps up.
  2. **32px / 2.0x (20/70 boundary)**: `[ J ]` confirms threshold, sets `at_or_worse_than_20_70: true`. `[ F ]` steps up.
  3. **44px / 2.75x (~20/120 acuity)**: `[ J ]` locks, sets `at_or_worse_than_20_70: true`. `[ F ]` steps up.
  4. **56px / 3.5x (~20/200 legal blindness boundary)**: `[ J ]` locks. `[ F ]` flags `visual_display_limit_exceeded: true` and triggers continuous speech assistance.

### Test 3: Giant Mouse Pointer & Locator Check
* **Visual**: Switches pointer to **Giant Neon Green Cursor** (48px SVG) with an active pulsing radar locator ring.
* **Options**:
  * `[ J ]` (Clearly Visible) $\rightarrow$ Retains 48px Giant Green cursor.
  * `[ F ]` (Hard to Track) $\rightarrow$ Upscales to 64px Giant Amber cursor and flags tracking difficulty (keyboard navigation recommended).

### Test 4: Distortion & Amsler Grid Check
* **Visual**: High-contrast Amsler Grid simulation with a prominent center white fixation dot.
* **Options**:
  * `[ J ]` (Distortion Present / Wavy / Broken) $\rightarrow$ Sets `metamorphopsia_detected: true` and activates **Hover-to-Speech** mode across the application to prevent eye fatigue.
  * `[ F ]` (Normal / Straight lines) $\rightarrow$ Confirms no central distortion.

### Step 5: Assessor Cockpit Telemetry Output
* Compiles all results into a single clean JSON payload.
* Automatically saves to `sessionStorage` and `localStorage` under `lowVisionCalibrationStore` for the staff cockpit dashboard.

---

## 3. Physical Tactile Grounding
* `[ J ]` = Right index finger locator nub $\rightarrow$ Yes / Clear / Confirm
* `[ F ]` = Left index finger locator nub $\rightarrow$ No / Too small / Reject
* `[ Spacebar ]` = Replays voice instruction prompt
* `[ Esc ]` = Opens staff assistance emergency modal
