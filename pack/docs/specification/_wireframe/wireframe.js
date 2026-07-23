/**
 * Optional helpers for spec wireframes only — not for apps/.
 * Load after base.css. All handlers are presentational (no fetch, no persistence).
 */
(function () {
  document.querySelectorAll("[data-wf-dialog-open]").forEach(function (trigger) {
    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      var id = trigger.getAttribute("data-wf-dialog-open");
      var dialog = id ? document.getElementById(id) : null;
      if (dialog && typeof dialog.showModal === "function") {
        dialog.showModal();
      }
    });
  });

  document.querySelectorAll("dialog[data-wf-dialog]").forEach(function (dialog) {
    dialog.querySelectorAll("[data-wf-dialog-close]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        dialog.close();
      });
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        dialog.close();
      }
    });
  });

  document.querySelectorAll("[data-wf-tab]").forEach(function (tab) {
    tab.addEventListener("click", function (event) {
      event.preventDefault();
      var name = tab.getAttribute("data-wf-tab");
      if (!name) return;
      document.querySelectorAll("[data-wf-tab-panel]").forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-wf-tab-panel") !== name;
      });
      document.querySelectorAll("[data-wf-tab]").forEach(function (t) {
        t.setAttribute("aria-selected", t.getAttribute("data-wf-tab") === name ? "true" : "false");
      });
    });
  });
})();
