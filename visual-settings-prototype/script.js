// Small branching prototype for the visual settings flow.
(function () {
  "use strict";

  var acuityForm = document.getElementById("acuity-form");
  var acuityError = document.getElementById("acuity-error");
  var visualForm = document.getElementById("visual-settings-form");
  var visualError = document.getElementById("error-message");
  var acuityScreen = document.getElementById("acuity-screen");
  var testScreen = document.getElementById("visual-test-screen");
  var questionnaireScreen = document.getElementById("questionnaire-screen");
  var routeSummary = document.getElementById("route-summary");
  var questionnaireBack = document.getElementById("questionnaire-back");
  var answers = { lowVision: null, colorblind: null };
  var acuityAnswer = null;
  var cameFromTest = false;

  function goTo(screen, heading) {
    [acuityScreen, testScreen, questionnaireScreen].forEach(function (item) {
      item.hidden = item !== screen;
    });
    document.getElementById(heading).focus();
  }

  function clearMessage(message) {
    message.hidden = true;
    message.textContent = "";
  }

  function readVisualAnswers() {
    ["lowVision", "colorblind"].forEach(function (name) {
      var selected = visualForm.querySelector('input[name="' + name + '"]:checked');
      answers[name] = selected ? selected.value : null;
    });
  }

  acuityForm.addEventListener("change", function (event) {
    if (event.target.name !== "acuity") return;
    acuityAnswer = event.target.value;
    clearMessage(acuityError);
  });

  document.addEventListener("keydown", function (event) {
    if (acuityScreen.hidden || event.altKey || event.ctrlKey || event.metaKey) return;
    // Preserve standard Space behavior on controls; otherwise Space advances.
    if (event.code === "Space" && event.target.closest("button, input, select, textarea, a")) return;

    var key = event.key.toLowerCase();
    if (event.code === "Space") {
      event.preventDefault();
      acuityForm.requestSubmit();
      return;
    }
    var value = key === "f" ? "yes" : key === "j" ? "no" : null;
    if (!value) return;

    event.preventDefault();
    var radio = acuityForm.querySelector('input[name="acuity"][value="' + value + '"]');
    radio.checked = true;
    radio.dispatchEvent(new Event("change", { bubbles: true }));
  });

  acuityForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!acuityAnswer) {
      acuityError.hidden = false;
      acuityError.focus();
      return;
    }

    if (acuityAnswer === "yes") {
      // At or below the stated acuity threshold: bypass visual settings and check.
      cameFromTest = false;
      sessionStorage.setItem("visualFlow", JSON.stringify({ acuity: acuityAnswer, visualCheckSkipped: true }));
      sessionStorage.removeItem("visualSettings");
      routeSummary.textContent = "You answered yes, so this flow skips visual settings and the vision check.";
      goTo(questionnaireScreen, "questionnaire-title");
      return;
    }

    // No or not sure: take the full visual settings and vision check path.
    goTo(testScreen, "visual-test-title");
  });

  visualForm.addEventListener("change", function (event) {
    if (event.target.type !== "radio") return;
    readVisualAnswers();
    event.target.closest(".question").querySelectorAll(".option").forEach(function (label) {
      label.classList.toggle("is-selected", label.querySelector("input").checked);
    });
    clearMessage(visualError);
  });

  visualForm.addEventListener("submit", function (event) {
    event.preventDefault();
    readVisualAnswers();
    var missing = ["lowVision", "colorblind"].filter(function (name) { return answers[name] === null; });
    if (missing.length) {
      visualError.textContent = "Please answer both questions before continuing.";
      visualError.hidden = false;
      visualError.focus();
      return;
    }

    console.log("Visual check answers:", answers);
    sessionStorage.setItem("visualFlow", JSON.stringify({ acuity: acuityAnswer, visualCheckSkipped: false }));
    sessionStorage.setItem("visualSettings", JSON.stringify(answers));
    if (answers.lowVision === "no" && answers.colorblind === "yes") {
      window.location.href = "color-vision.html";
      return;
    }
    cameFromTest = true;
    routeSummary.textContent = "Your visual check answers have been saved for this prototype.";
    goTo(questionnaireScreen, "questionnaire-title");
  });

  document.getElementById("skip-test").addEventListener("click", function () {
    cameFromTest = true;
    sessionStorage.setItem("visualFlow", JSON.stringify({ acuity: acuityAnswer, visualCheckSkipped: true }));
    sessionStorage.removeItem("visualSettings");
    routeSummary.textContent = "You skipped the visual settings and vision check.";
    goTo(questionnaireScreen, "questionnaire-title");
  });

  document.getElementById("back-to-acuity").addEventListener("click", function () {
    goTo(acuityScreen, "acuity-title");
  });
  questionnaireBack.addEventListener("click", function () {
    if (cameFromTest) goTo(testScreen, "visual-test-title");
    else goTo(acuityScreen, "acuity-title");
  });
})();
