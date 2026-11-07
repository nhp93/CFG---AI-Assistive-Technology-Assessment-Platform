// color palette preference function
(function () {
  "use strict";

  var KEY = "palette";
  var saved = localStorage.getItem(KEY) || "standard";
  document.documentElement.dataset.palette = saved;

  document.querySelectorAll('input[name="palette"]').forEach(function (radio) {
    radio.checked = radio.value === saved;
    radio.addEventListener("change", function () {
      document.documentElement.dataset.palette = radio.value;
      localStorage.setItem(KEY, radio.value);
    });
  });
})();
