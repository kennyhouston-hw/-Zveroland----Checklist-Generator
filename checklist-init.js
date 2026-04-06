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

      if (savedState[itemId]) {
        checkbox.checked = true;
      }

      checkbox.addEventListener('change', function () {
        savedState[itemId] = checkbox.checked;
        localStorage.setItem(storageKey, JSON.stringify(savedState));
      });
    });

    // PDF Generation via jsPDF (no html2canvas, no CORS issues)
    const pdfBtn = checklist.querySelector('.zvero-checklist-btn-pdf');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', function () {
        loadJsPDF(function (jsPDF) {
          generatePDF(jsPDF, checklist);
        });
      });
    }
  });

  // Lazy-load jsPDF from CDN
  function loadJsPDF(callback) {
    if (window.jspdf && window.jspdf.jsPDF) {
      callback(window.jspdf.jsPDF);
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = function () {
      callback(window.jspdf.jsPDF);
    };
    script.onerror = function () {
      alert('Не удалось загрузить библиотеку PDF. Проверьте подключение к интернету.');
    };
    document.head.appendChild(script);
  }

  function generatePDF(jsPDF, checklist) {
    var doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    var pageWidth = doc.internal.pageSize.getWidth();
    var pageHeight = doc.internal.pageSize.getHeight();
    var margin = 15;
    var contentWidth = pageWidth - margin * 2;
    var y = margin;

    // Helper: add new page if needed
    function checkPage(needed) {
      if (y + needed > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    }

    // Cover image (if exists)
    var coverImg = checklist.querySelector('.zvero-checklist-cover');
    if (coverImg && coverImg.src && coverImg.complete && coverImg.naturalWidth > 0) {
      try {
        var canvas = document.createElement('canvas');
        var imgW = coverImg.naturalWidth;
        var imgH = coverImg.naturalHeight;
        var ratio = imgH / imgW;
        var pdfImgW = contentWidth;
        var pdfImgH = pdfImgW * ratio;
        canvas.width = imgW;
        canvas.height = imgH;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(coverImg, 0, 0);
        var dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        checkPage(pdfImgH);
        doc.addImage(dataUrl, 'JPEG', margin, y, pdfImgW, pdfImgH);
        y += pdfImgH + 6;
      } catch (e) {
        // Skip image on CORS error
      }
    }

    // Render blocks
    var blocks = checklist.querySelectorAll('.zvero-checklist-block');
    blocks.forEach(function (block) {
      // Block title
      var blockTitle = block.querySelector('.zvero-checklist-block-title');
      if (blockTitle && blockTitle.textContent.trim()) {
        checkPage(8);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(30, 30, 30);
        var titleLines = doc.splitTextToSize(blockTitle.textContent.trim(), contentWidth - 4);
        doc.text(titleLines, margin + 2, y);
        y += titleLines.length * 6 + 2;
      }

      // Block description
      var blockDesc = block.querySelector('.zvero-checklist-block-desc');
      if (blockDesc && blockDesc.textContent.trim()) {
        checkPage(6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        var descLines = doc.splitTextToSize(blockDesc.textContent.trim(), contentWidth - 4);
        doc.text(descLines, margin + 2, y);
        y += descLines.length * 5 + 3;
      }

      // Items
      var items = block.querySelectorAll('.zvero-checklist-item');
      items.forEach(function (item) {
        var checkbox = item.querySelector('.zvero-checklist-checkbox');
        var label = item.querySelector('.zvero-checklist-text');
        if (!label) return;

        var isChecked = checkbox && checkbox.checked;
        var text = label.textContent.trim();
        var lines = doc.splitTextToSize(text, contentWidth - 14);
        var itemHeight = lines.length * 5.5 + 3;

        checkPage(itemHeight);

        // Checkbox box
        var boxX = margin + 2;
        var boxY = y - 3.5;
        var boxSize = 4.5;

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        if (isChecked) {
          doc.setFillColor(74, 222, 128); // green
          doc.roundedRect(boxX, boxY, boxSize, boxSize, 1, 1, 'FD');
          // Checkmark
          doc.setDrawColor(255, 255, 255);
          doc.setLineWidth(0.8);
          doc.line(boxX + 0.9, boxY + 2.3, boxX + 1.9, boxY + 3.3);
          doc.line(boxX + 1.9, boxY + 3.3, boxX + 3.6, boxY + 1.2);
        } else {
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(boxX, boxY, boxSize, boxSize, 1, 1, 'FD');
        }

        // Item text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        if (isChecked) {
          doc.setTextColor(160, 160, 160);
        } else {
          doc.setTextColor(30, 30, 30);
        }
        doc.text(lines, margin + 10, y);
        y += itemHeight;
      });

      y += 4; // gap between blocks
    });

    // Filename from checklist title
    var titleEl = checklist.querySelector('.zvero-checklist-title');
    var filename = 'checklist.pdf';
    if (titleEl && titleEl.textContent.trim()) {
      filename = titleEl.textContent.trim().replace(/[^a-zа-яёa-z0-9\s]/gi, '').replace(/\s+/g, '_').toLowerCase() + '.pdf';
    }

    doc.save(filename);
  }
});
