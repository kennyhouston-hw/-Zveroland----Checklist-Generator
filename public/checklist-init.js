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
        const titleEl = checklist.querySelector('.zvero-checklist-title');
        const filename = titleEl ? titleEl.textContent.trim() : 'checklist';
        
        // Grab the styles from the page
        const styles = Array.from(document.styleSheets)
          .map(styleSheet => {
            try {
              return Array.from(styleSheet.cssRules)
                .map(rule => rule.cssText)
                .join('');
            } catch (e) {
              // Return empty for cross-origin stylesheets that we can't read
              if (styleSheet.href && styleSheet.href.includes('checklist-styles.css')) {
                 return `@import url("${styleSheet.href}");`;
              }
              return '';
            }
          })
          .join('');

        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) {
          alert('Пожалуйста, разрешите всплывающие окна для экспорта PDF');
          return;
        }

        // Clone the checklist to keep original in place
        const checklistClone = checklist.cloneNode(true);
        // Remove the footer with the PDF button from the print version
        const footer = checklistClone.querySelector('.zvero-checklist-footer');
        if (footer) footer.remove();

        printWindow.document.write(`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
  <style>
    * { box-sizing: border-box; }
    body { 
      margin: 0; 
      padding: 20px; 
      font-family: system-ui, -apple-system, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @media print {
      @page { margin: 0; }
      body { padding: 15mm; }
    }
    ${styles}
  </style>
</head>
<body>
  ${checklistClone.outerHTML}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.close();
      }, 300);
    };
  <\/script>
</body>
</html>`);
        printWindow.document.close();
      });
    }
  });
});
