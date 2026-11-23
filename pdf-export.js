import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

let currentExport;

window.exportPayslipPDF = async function (html) {
  if (currentExport?.overlay.isConnected) {
    currentExport.overlay.querySelector('button').focus();
    return;
  }

  const state = { cancelled: false, url: null };
  const overlay = document.createElement('div');
  overlay.className = 'pdfExportOverlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'pdfExportTitle');
  overlay.innerHTML =
    '<div class="pdfExportPanel">' +
    '<h2 id="pdfExportTitle">給与明細PDF</h2>' +
    '<p class="pdfExportStatus" role="status">PDFを作成しています…</p>' +
    '<div class="pdfExportActions">' +
    '<a class="pdfExportOpen" target="_blank" rel="noopener" hidden>PDFを開く</a>' +
    '<button class="pdfExportShare" type="button" hidden>共有・印刷</button>' +
    '<button class="pdfExportClose secondary" type="button">閉じる</button>' +
    '</div><p class="pdfExportHelp" hidden>PDFを開いた画面の共有メニューから「プリント」を選べます。</p>' +
    '</div>';
  state.overlay = overlay;
  currentExport = state;
  const status = overlay.querySelector('.pdfExportStatus');
  const open = overlay.querySelector('.pdfExportOpen');
  const share = overlay.querySelector('.pdfExportShare');
  const close = overlay.querySelector('.pdfExportClose');
  const help = overlay.querySelector('.pdfExportHelp');
  const previousFocus = document.activeElement;
  close.onclick = () => {
    state.cancelled = true;
    overlay.remove();
    if (state.url) URL.revokeObjectURL(state.url);
    previousFocus?.focus();
  };
  overlay.addEventListener('keydown', event => {
    if (event.key === 'Escape') close.click();
    if (event.key === 'Tab') {
      const controls = [...overlay.querySelectorAll('button:not([hidden]),a:not([hidden])')];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  document.body.append(overlay);
  close.focus();

  const frame = document.createElement('iframe');
  frame.title = '給与明細PDFの作成';
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;pointer-events:none';
  document.body.append(frame);
  try {
    const loaded = new Promise(resolve => frame.onload = resolve);
    frame.srcdoc = html;
    await loaded;
    const printDocument = frame.contentDocument;
    await printDocument.fonts.ready;
    const fourUp = !!printDocument.querySelector('.sheet');
    const pages = [...printDocument.querySelectorAll(fourUp ? '.sheet' : '.printStatement')];
    const people = fourUp ? printDocument.querySelectorAll('.slip:not(.blank)').length : pages.length;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    pdf.setProperties({ title: '給与明細', creator: 'ZUCCA 給与明細' });
    for (let index = 0; index < pages.length; index++) {
      if (state.cancelled) return;
      status.textContent = 'PDFを作成しています… ' + (index + 1) + ' / ' + pages.length + 'ページ';
      const page = pages[index];
      page.style.minHeight = fourUp ? '297mm' : '283mm';
      page.style.transform = 'none';
      page.style.margin = '0';
      const canvas = await html2canvas(page, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 794,
        windowHeight: 1123
      });
      if (index) pdf.addPage();
      const pageWidth = fourUp ? 210 : 196;
      const margin = fourUp ? 0 : 7;
      const imageHeight = canvas.height * pageWidth / canvas.width;
      const height = Math.min(imageHeight, fourUp ? 297 : 283);
      const width = canvas.width * height / canvas.height;
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', margin, margin, width, height);
      canvas.width = 0;
      canvas.height = 0;
    }
    if (state.cancelled) return;
    const blob = pdf.output('blob');
    state.url = URL.createObjectURL(blob);
    open.href = state.url;
    open.hidden = false;
    help.hidden = false;
    status.textContent = people + '人分のPDFができました。';
    const file = new File([blob], 'ZUCCA-payroll.pdf', { type: 'application/pdf' });
    if (navigator.canShare?.({ files: [file] })) {
      share.hidden = false;
      share.onclick = async () => {
        try {
          await navigator.share({ files: [file] });
        } catch (error) {
          if (error.name !== 'AbortError') status.textContent = '「PDFを開く」から印刷してください。';
        }
      };
    }
    open.focus();
  } catch (error) {
    if (!state.cancelled) status.textContent = 'PDFを作成できませんでした。閉じてから、もう一度お試しください。';
  } finally {
    frame.remove();
  }
};
