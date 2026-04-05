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

    // PDF Generation
    const pdfBtn = checklist.querySelector('.zvero-checklist-btn-pdf');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', function () {
        if (typeof html2pdf === 'undefined') {
          alert('Библиотека для генерации PDF не загружена. Пожалуйста, убедитесь, что скрипт html2pdf.js подключен.');
          return;
        }

        const titleEl = checklist.querySelector('.zvero-checklist-title');
        const filename = titleEl ? titleEl.textContent.trim().replace(/[^a-z0-9а-я]/gi, '_').toLowerCase() + '_checklist.pdf' : 'checklist.pdf';

        const opt = {
          margin: 10,
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // We temporarily hide the button during render
        pdfBtn.style.display = 'none';

        html2pdf().set(opt).from(checklist).save().then(() => {
          // Restore button
          pdfBtn.style.display = 'inline-flex';
        });
      });
    }
  });
});
