// Adaptive Vision Assessment: a comfort preference check, not a clinical test.
(function () {
  "use strict";

  var TEXT = "Reading should feel easy, not tiring. This sample helps find a setting that works well for you.";
  var SPEECH = "Welcome to the assessment. Please listen carefully and choose the speaking speed that feels most comfortable.";

  // Ordered modules list options from least to most assistive: No moves forward, Yes moves back.
  // Unordered modules (Contrast) step through every option for comparison.
  var MODULES = [
    { name: "Magnification", q: "Can you read this text comfortably?", ordered: true, start: 1,
      options: [["16px", "font-size:16px"], ["20px", "font-size:20px"], ["24px", "font-size:24px"], ["28px", "font-size:28px"], ["32px", "font-size:32px"]] },
    { name: "Contrast", q: "Can you clearly distinguish this text from its background?", start: 0,
      options: [["Black text on white", "color:#000;background:#fff"], ["White text on black", "color:#fff;background:#000"],
        ["Yellow text on black", "color:#ff0;background:#000"], ["Black text on yellow", "color:#000;background:#ff0"],
        ["Soft dimmed theme", "color:#ccc;background:#333"]] },
    { name: "Speech", q: "Was that speech easy to understand?", ordered: true, start: 2,
      options: [["1.5×", 1.5], ["1.25×", 1.25], ["1.0×", 1], ["0.75×", 0.75]] },
    { name: "Cursor", q: "Can you easily locate and follow the pointer?", ordered: true, start: 0,
      options: [["Normal", "normal"], ["Large", "large"], ["Extra-large", "xl"], ["High-visibility", "high"]] }
  ];

  var KEY = "visionAssessment", cur = null, pos = { x: 40, y: 40 };
  var $ = document.getElementById.bind(document), main = $("main");

  function fresh() {
    return { m: 0, recs: MODULES.map(function () { return { tested: [], confirm: false, choice: null, skipped: false }; }) };
  }
  var state = JSON.parse(localStorage.getItem(KEY)) || fresh();

  // Next option to test, or -1 when testing should stop. Never repeats a tested option.
  function nextIndex(mod, rec) {
    var seen = rec.tested.map(function (t) { return t[0]; }), last = rec.tested[rec.tested.length - 1];
    var n = !last ? mod.start : mod.ordered ? last[0] + (last[1] ? -1 : 1) : seen.length;
    return n >= 0 && n < mod.options.length && seen.indexOf(n) < 0 ? n : -1;
  }

  function sample() {
    var o = MODULES[state.m].options[cur];
    if (!o) return "<p>Select an option above to preview it.</p>";
    if (state.m === 2) {
      return '<p class="sample">“' + SPEECH + '”</p><p>If you use a screen reader, pause it before playing the sample.</p>' +
        (window.speechSynthesis
          ? '<div class="actions"><button type="button" id="play" class="button button-secondary">Play sample at ' + o[0] +
            '</button><button type="button" id="stop" class="button button-secondary">Stop</button></div>'
          : "<p>Speech is not available in this browser. Please select Skip.</p>");
    }
    if (state.m === 3) {
      return '<div class="cursor-area" tabindex="0" aria-label="Pointer practice area" aria-describedby="cursor-help">' +
        '<svg class="pointer pointer-' + o[1] + '" style="left:' + pos.x + "px;top:" + pos.y + 'px" viewBox="-1 -1 19 26" aria-hidden="true">' +
        '<path d="M1 1v19l5-5 3 8 3-1-3-8h7z"/></svg></div>' +
        '<p id="cursor-help">Move your mouse inside the box, or select the box and press the arrow keys, to move the pointer.</p>';
    }
    return '<p class="sample" style="' + o[1] + '">' + TEXT + "</p>";
  }

  function render(focus) {
    localStorage.setItem(KEY, JSON.stringify(state));
    if (window.speechSynthesis) speechSynthesis.cancel();
    $("error-message").hidden = $("confirmation-message").hidden = true;

    var mod = MODULES[state.m], rec = state.recs[state.m], view = "summary", body;
    if (!mod) {
      cur = null;
      $("progress").textContent = "Summary";
      $("step-title").textContent = "Your preferred settings";
      body = "<ul>" + MODULES.map(function (m, k) {
        var r = state.recs[k];
        return "<li>" + m.name + ": <strong>" + (r.choice === null ? (r.skipped ? "Skipped" : "No preference") : m.options[r.choice][0]) + "</strong></li>";
      }).join("") + "</ul><p>These are your comfort preferences, not a medical result.</p><div class=\"actions\">" +
        (state.recs[0].choice !== null ? '<button type="button" id="use-size" class="button button-secondary">Use ' + MODULES[0].options[state.recs[0].choice][0] + " text in Visual Settings</button>" : "") +
        '<button type="button" id="restart" class="button button-secondary">Start over</button></div>';
    } else {
      var i = nextIndex(mod, rec);
      view = rec.confirm || i < 0 ? "confirm" : "question";
      $("progress").textContent = "Module " + (state.m + 1) + " of " + MODULES.length + ": " + mod.name;
      if (view === "question") {
        cur = i;
        $("step-title").textContent = mod.q;
        body = "<p>Now showing: <strong>" + mod.options[i][0] + "</strong></p>";
      } else {
        var firstYes = rec.tested.filter(function (t) { return t[1]; })[0];
        cur = rec.choice !== null ? rec.choice : firstYes ? firstYes[0] : null;
        $("step-title").textContent = "Choose your preferred " + mod.name.toLowerCase() + " setting";
        body = "<p>" + (firstYes
          ? "Pick the option you prefer. It does not have to be the smallest or fastest one that worked."
          : "None of the options you tried felt comfortable. Choose the closest one, or select Skip.") +
          '</p><div class="options" role="radiogroup" aria-labelledby="step-title">' + mod.options.map(function (o, k) {
            var t = rec.tested.filter(function (t) { return t[0] === k; })[0];
            return '<label class="option"><input type="radio" name="choice" value="' + k + '"' + (k === cur ? " checked" : "") +
              '><span class="option-text">' + o[0] + " (" + (t ? (t[1] ? "comfortable" : "not comfortable") : "not tried") + ")</span></label>";
          }).join("") + "</div>";
      }
    }

    $("step-body").innerHTML = body;
    $("sample").innerHTML = mod ? sample() : "";
    $("yes").hidden = $("no").hidden = view !== "question";
    $("skip").hidden = $("next").hidden = view === "summary";
    $("next").textContent = view === "question" ? "Choose preference" : state.m === MODULES.length - 1 ? "See summary" : "Next module";
    $("back").disabled = !!rec && state.m === 0 && !rec.tested.length && !rec.confirm;
    if (focus) $("step-title").focus();
  }

  function movePointer(x, y) {
    var area = main.querySelector(".cursor-area"), p = area.querySelector(".pointer");
    pos.x = Math.max(0, Math.min(x, area.clientWidth - 20));
    pos.y = Math.max(0, Math.min(y, area.clientHeight - 20));
    p.style.left = pos.x + "px";
    p.style.top = pos.y + "px";
  }

  function answer(yes) {
    state.recs[state.m].tested.push([cur, yes]);
    render(true);
  }

  $("yes").addEventListener("click", function () { answer(true); });
  $("no").addEventListener("click", function () { answer(false); });

  $("skip").addEventListener("click", function () {
    var rec = state.recs[state.m];
    rec.skipped = true;
    rec.choice = null;
    state.m++;
    render(true);
  });

  $("next").addEventListener("click", function () {
    var rec = state.recs[state.m], err = $("error-message");
    if ($("yes").hidden) {
      if (cur === null) {
        err.textContent = "Please choose an option, or select Skip.";
        err.hidden = false;
        err.focus();
        return;
      }
      rec.choice = cur;
      rec.skipped = false;
      state.m++;
    } else {
      rec.confirm = true;
    }
    render(true);
  });

  // Back undoes the last step: leave the choice list, then undo answers, then return to the previous module.
  $("back").addEventListener("click", function () {
    var mod = MODULES[state.m], rec = state.recs[state.m];
    if (mod && rec.confirm && nextIndex(mod, rec) >= 0) rec.confirm = false;
    else if (mod && rec.tested.length) { rec.tested.pop(); rec.confirm = false; }
    else if (state.m > 0) { state.m--; state.recs[state.m].skipped = false; }
    render(true);
  });

  main.addEventListener("change", function (e) {
    if (e.target.name !== "choice") return;
    cur = +e.target.value;
    $("sample").innerHTML = sample();
  });

  main.addEventListener("click", function (e) {
    var id = e.target.id, box = $("confirmation-message");
    if (id === "play") {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(SPEECH);
      u.rate = MODULES[2].options[cur][1];
      speechSynthesis.speak(u);
    }
    if (id === "stop") speechSynthesis.cancel();
    if (id === "use-size") {
      localStorage.setItem("fontSize", parseInt(MODULES[0].options[state.recs[0].choice][0], 10));
      box.textContent = "Text size saved to your Visual Settings.";
      box.hidden = false;
      box.focus();
    }
    if (id === "restart") {
      state = fresh();
      render(true);
    }
  });

  main.addEventListener("mousemove", function (e) {
    var area = e.target.closest(".cursor-area");
    if (!area) return;
    var r = area.getBoundingClientRect();
    movePointer(e.clientX - r.left, e.clientY - r.top);
  });

  main.addEventListener("keydown", function (e) {
    var d = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }[e.key];
    if (!d || !e.target.classList.contains("cursor-area")) return;
    e.preventDefault();
    movePointer(pos.x + d[0], pos.y + d[1]);
  });

  render(false);
})();
