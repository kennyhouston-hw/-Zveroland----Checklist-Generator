/**
 * checklist-init.js
 * Script to initialize Zveroland Checklists on any website.
 */
document.addEventListener("DOMContentLoaded", function () {
  const checklists = document.querySelectorAll('.zvero-checklist');

  checklists.forEach(function (checklist) {
    const checklistId = checklist.getAttribute('data-checklist-id');
    if (!checklistId) return;

    // Load state from local storage
    const storageKey = `zvero_checklist_${checklistId}`;
    let savedState = {};
    try {
      savedState = JSON.parse(localStorage.getItem(storageKey)) || {};
    } catch (e) {
      console.error("Error reading checklist state from localStorage", e);
    }

    const checkboxes = checklist.querySelectorAll('.zvero-checklist-checkbox');

    checkboxes.forEach(function (checkbox) {
      const itemId = checkbox.getAttribute('data-item-id');

      // Restore state
      if (savedState[itemId]) {
        checkbox.checked = true;
      }

      // Listen for changes to save state
      checkbox.addEventListener('change', function () {
        savedState[itemId] = checkbox.checked;
        localStorage.setItem(storageKey, JSON.stringify(savedState));
      });
    });

    // PDF Generation via window.print() — works on any site, no CORS issues
    const pdfBtn = checklist.querySelector('.zvero-checklist-btn-pdf');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', function () {
        // Clone the checklist HTML with current checkbox states
        const clone = checklist.cloneNode(true);

        // Sync checkbox checked states into the clone (cloneNode doesn't copy .checked)
        const origCheckboxes = checklist.querySelectorAll('.zvero-checklist-checkbox');
        const cloneCheckboxes = clone.querySelectorAll('.zvero-checklist-checkbox');
        origCheckboxes.forEach(function (orig, i) {
          if (orig.checked) {
            cloneCheckboxes[i].setAttribute('checked', 'checked');
            cloneCheckboxes[i].style.backgroundColor = 'oklch(62.7% 0.194 149.214)';
            cloneCheckboxes[i].style.borderColor = 'oklch(62.7% 0.194 149.214)';
          }
        });

        // Hide PDF button in clone
        const cloneBtn = clone.querySelector('.zvero-checklist-btn-pdf');
        if (cloneBtn) cloneBtn.remove();

        // Build print window HTML
        const printHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Checklist</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400..900&display=swap">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Golos Text', system-ui, sans-serif;
      background: #fff;
      padding: 20px;
    }
    .zvero-checklist {
      font-family: 'Golos Text', system-ui, -apple-system, sans-serif;
      color: #000;
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 1.25rem;
      overflow: hidden;
      width: 100%;
      max-width: 760px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
    }
    .zvero-checklist-cover { width: 100%; height: auto; display: block; margin-bottom: 0.5rem; }
    .zvero-checklist-title { font-size: 1.25rem; font-weight: 500; line-height: 1.2; }
    .zvero-checklist-desc { font-size: 1rem; line-height: 1.5; color: #000; opacity: 0.6; margin: 0; }
    .zvero-checklist-items { list-style: none; padding: 0; margin: 0.5rem 0 0 0; }
    .zvero-checklist-block { padding: 1.25rem 1rem 0 1rem; }
    .zvero-checklist-block-title { font-size: 1.125rem; font-weight: 500; margin: 0 0 0.25rem 0.5rem; line-height: 1.3; }
    .zvero-checklist-block-desc { font-size: 0.875rem; line-height: 1.5; color: #000; opacity: 0.6; margin: 0 0 0.5rem 0.5rem; }
    .zvero-checklist-item { margin-bottom: 0; }
    .zvero-checklist-label { display: flex; align-items: center; padding: 0.5rem; border-radius: 0.375rem; font-size: 1rem; line-height: 1.5; }
    .zvero-checklist-checkbox {
      -webkit-appearance: none; appearance: none;
      margin: 0 0.5rem 0 0;
      min-width: 1.5rem; width: 1.5rem; height: 1.5rem;
      border-radius: 0.5rem;
      border: 1px solid #d1d5db;
      display: grid; place-content: center;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .zvero-checklist-checkbox[checked] {
      background-color: oklch(62.7% 0.194 149.214);
      border-color: oklch(62.7% 0.194 149.214);
    }
    .zvero-checklist-checkbox::before {
      content: "";
      width: 0.65rem; height: 0.65rem;
      box-shadow: inset 1rem 1rem #fff;
      clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
      transform: scale(0);
    }
    .zvero-checklist-checkbox[checked]::before { transform: scale(1); }
    .zvero-checklist-text { font-size: 1rem; line-height: 1.5; color: #000; }
    .zvero-checklist-checkbox[checked] + .zvero-checklist-text { text-decoration: line-through; color: #9ca3af; }
    .zvero-checklist-footer { display: none; }
    @media print {
      body { padding: 0; }
      .zvero-checklist { border: 1px solid #e5e7eb; border-radius: 1.25rem; }
    }
  </style>
</head>
<body>
  ${clone.outerHTML}
</body>
</html>`;

        const printWin = window.open('', '_blank', 'width=900,height=700');
        if (!printWin) {
          alert('Пожалуйста, разрешите всплывающие окна для этого сайта, чтобы скачать PDF.');
          return;
        }
        printWin.document.write(printHTML);
        printWin.document.close();

        // Wait for fonts to load, then print
        printWin.onload = function () {
          setTimeout(function () {
            printWin.focus();
            printWin.print();
            printWin.close();
          }, 500);
        };
      });
    }
  });
});
