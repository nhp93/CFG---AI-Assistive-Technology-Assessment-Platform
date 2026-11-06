// Visual Settings prototype: vanilla JavaScript, no dependencies.

(function () {
  "use strict";

  var QUESTIONS = [
    { name: "lowVision", label: "Are you low vision?", fieldsetId: "q-low-vision" },
    { name: "colorblind", label: "Are you colorblind?", fieldsetId: "q-colorblind" }
  ];

  var form = document.getElementById("visual-settings-form");
  var skipButton = document.getElementById("skip-button");
  var errorBox = document.getElementById("error-message");
  var confirmBox = document.getElementById("confirmation-message");

  // Current answers. null means "not answered".
  var answers = { lowVision: null, colorblind: null };

  // Mark the selected option label visually and keep `answers` in sync.
  function updateSelection(name) {
    var radios = form.querySelectorAll('input[name="' + name + '"]');
    answers[name] = null;
    radios.forEach(function (radio) {
      var label = radio.closest(".option");
      if (radio.checked) {
        answers[name] = radio.value;
        label.classList.add("is-selected");
      } else {
        label.classList.remove("is-selected");
      }
    });
  }

  function hide(el) {
    el.hidden = true;
    el.innerHTML = "";
  }

  function show(el, html) {
    el.innerHTML = html;
    el.hidden = false;
    el.focus();
  }

  function clearErrors() {
    hide(errorBox);
    QUESTIONS.forEach(function (q) {
      var fieldset = document.getElementById(q.fieldsetId);
      fieldset.classList.remove("has-error");
      fieldset.querySelectorAll("input").forEach(function (input) {
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
      });
    });
  }

  // Restore answers saved before leaving this page (e.g. after Back).
  var saved = JSON.parse(sessionStorage.getItem("visualSettings") || "{}");
  QUESTIONS.forEach(function (q) {
    var radio = form.querySelector('input[name="' + q.name + '"][value="' + saved[q.name] + '"]');
    if (radio) {
      radio.checked = true;
      updateSelection(q.name);
    }
  });

  function formatAnswer(value) {
    return value === "yes" ? "Yes" : "No";
  }

  // Radio change: update highlight and clear stale messages.
  form.addEventListener("change", function (event) {
    if (event.target.type !== "radio") return;
    updateSelection(event.target.name);
    hide(confirmBox);

    // If this question was flagged as missing, clear its error state.
    if (!errorBox.hidden) {
      var stillMissing = QUESTIONS.some(function (q) { return answers[q.name] === null; });
      if (!stillMissing) clearErrors();
    }
  });

  // Next: validate and confirm.
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearErrors();
    hide(confirmBox);

    var missing = QUESTIONS.filter(function (q) { return answers[q.name] === null; });

    if (missing.length > 0) {
      var items = missing.map(function (q) {
        var fieldset = document.getElementById(q.fieldsetId);
        fieldset.classList.add("has-error");
        fieldset.querySelectorAll("input").forEach(function (input) {
          input.setAttribute("aria-invalid", "true");
          input.setAttribute("aria-describedby", "error-message");
        });
        return "<li>Please answer: " + q.label + "</li>";
      }).join("");

      show(errorBox,
        "<p><strong>Error:</strong> Please answer both questions before continuing.</p>" +
        "<ul>" + items + "</ul>");
      return;
    }

    var submitted = {
      skipped: false,
      lowVision: answers.lowVision,
      colorblind: answers.colorblind
    };
    console.log("Visual settings submitted:", submitted);
    sessionStorage.setItem("visualSettings", JSON.stringify(answers));

    if (answers.lowVision === "no" && answers.colorblind === "yes") {
      window.location.href = "color-vision.html";
      return;
    }

    show(confirmBox,
      "<p><strong>Your answers were submitted.</strong></p>" +
      "<ul>" +
      "<li>Low vision: " + formatAnswer(submitted.lowVision) + "</li>" +
      "<li>Colorblind: " + formatAnswer(submitted.colorblind) + "</li>" +
      "</ul>");
  });

  // Skip if Blind: bypass questions without recording any answer.
  skipButton.addEventListener("click", function () {
    clearErrors();
    sessionStorage.removeItem("visualSettings");

    var submitted = { skipped: true, lowVision: null, colorblind: null };
    console.log("Visual settings skipped:", submitted);

    show(confirmBox,
      "<p><strong>Visual questions skipped.</strong> " +
      "No answers were recorded for these questions.</p>");
  });
})();
