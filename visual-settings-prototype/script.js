// Color-vision routing gate before the adaptive vision assessment.
(function () {
  "use strict";

  var form = document.getElementById("color-vision-form");
  var error = document.getElementById("error-message");
  var answer = null;

  function clearError() {
    error.hidden = true;
    error.textContent = "";
  }

  form.addEventListener("change", function (event) {
    if (event.target.name !== "colorblind") return;
    answer = event.target.value;
    clearError();
  });

  // F selects Yes, J selects No, and Space advances when focus is outside a control.
  document.addEventListener("keydown", function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.code === "Space" && event.target.closest("button, input, select, textarea, a")) return;

    if (event.code === "Space") {
      event.preventDefault();
      form.requestSubmit();
      return;
    }

    var key = event.key.toLowerCase();
    var value = key === "f" ? "yes" : key === "j" ? "no" : null;
    if (!value) return;
    event.preventDefault();
    var radio = form.querySelector('input[name="colorblind"][value="' + value + '"]');
    radio.checked = true;
    radio.dispatchEvent(new Event("change", { bubbles: true }));
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!answer) {
      error.hidden = false;
      error.focus();
      return;
    }

    sessionStorage.setItem("visualFlow", JSON.stringify({ colorblind: answer }));
    // Start each person's color palette questions from the neutral palette.
    localStorage.setItem("palette", "standard");
    if (answer === "yes") {
      window.location.href = "color-vision.html";
    } else {
      window.location.href = "vision-assessment.html";
    }
  });
})();
