// logic for text size
(function () {
  "use strict";

  var MIN = 16, MAX = 32, STEP = 2, DEFAULT = 20, KEY = "fontSize";
  var slider = document.getElementById("font-size-slider");
  var label = document.getElementById("font-size-value");

  function setFontSize(px) {
    px = Math.min(MAX, Math.max(MIN, Number(px) || DEFAULT));
    document.documentElement.style.setProperty("--text-size", px + "px");
    if (slider) {
      slider.value = px;
      slider.setAttribute("aria-valuetext", px + " pixels");
    }
    if (label) label.textContent = px + "px";
    return px;
  }

  var size = setFontSize(localStorage.getItem(KEY));
  if (!slider) return;

  slider.addEventListener("input", function () { size = setFontSize(slider.value); });
  document.getElementById("font-smaller").addEventListener("click", function () { size = setFontSize(size - STEP); });
  document.getElementById("font-larger").addEventListener("click", function () { size = setFontSize(size + STEP); });

  // raised letters change text size
  document.addEventListener("keydown", function (e) {
    var key = e.key.toLowerCase();
    if ((key !== "f" && key !== "j") || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
    if (e.target.matches("input:not([type=range]), textarea, select") || e.target.isContentEditable) return;
    e.preventDefault();
    size = setFontSize(size + (key === "j" ? STEP : -STEP));
  });

  document.getElementById("save-font-size").addEventListener("click", function () {
    localStorage.setItem(KEY, size);
    var box = document.getElementById("confirmation-message");
    box.textContent = "Text size saved: " + size + "px.";
    box.hidden = false;
    box.focus();
  });
})();
