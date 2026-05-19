import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

/**
 * Exports a markdown table to Excel
 */
export const exportToExcel = (markdown: string, filename: string) => {
  // Simple markdown table parser
  const rows = markdown.split('\n');
  const tableData: string[][] = [];
  
  let inTable = false;
  
  for (const row of rows) {
    if (row.includes('|') && row.trim().startsWith('|')) {
      inTable = true;
      // Skip separator row (---|---|---)
      if (row.includes('---')) continue;
      
      const cells = row.split('|')
        .filter((_, index, array) => index > 0 && index < array.length - 1)
        .map(cell => {
          let text = cell.trim();
          if (text.length > 32000) {
            text = text.substring(0, 32000) + '...';
          }
          return text;
        });
        
      if (cells.length > 0) {
        tableData.push(cells);
      }
    } else if (inTable) {
      // We were in a table but this line doesn't look like one
      // (Simplified approach: check if it's empty or doesn't have pipes)
      if (!row.trim()) inTable = false;
    }
  }

  if (tableData.length === 0) {
    alert("Tidak ditemukan tabel untuk diekspor ke Excel.");
    return;
  }

  const worksheet = XLSX.utils.aoa_to_sheet(tableData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ATP");
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, `${filename}.xlsx`);
};

/**
 * Exports content to a Word-compatible HTML file
 */
export const exportToDoc = (content: string, identity: any, filename: string) => {
  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Export Modul Ajar</title>
    <style>
      @page WordSection1 { size: 8.5in 11.0in; mso-page-orientation: portrait; margin: 1.0in; }
      div.WordSection1 { page: WordSection1; }
      @page WordSection2 { size: 11.0in 8.5in; mso-page-orientation: landscape; margin: 1.0in; }
      div.WordSection2 { page: WordSection2; }
      
      body { font-family: 'Arial', sans-serif; line-height: 1.4; color: #333; }
      .container { border: 2px solid #000; padding: 20px; }
      .identitas-table { width: 100%; border-collapse: collapse; border: 2px solid #000; margin-bottom: 20px; }
      .identitas-table td { border: 1px solid #000; padding: 8px; vertical-align: top; }
      .label-col { background-color: #f3f4f6; font-weight: bold; width: 150px; text-align: center; }
      .data-item { margin-bottom: 5px; }
      .data-label { color: #666; font-size: 10px; font-weight: bold; text-transform: uppercase; }
      .data-value { font-weight: bold; display: block; }
      h1, h2, h3, h4, h5 { color: #065f46; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
      table { border-collapse: collapse; width: 100%; margin: 15px 0; }
      th { background-color: #f9fafb; border: 1px solid #000; padding: 8px; font-weight: bold; text-align: left; }
      td { border: 1px solid #000; padding: 8px; }
    </style>
    </head>
    <body>
      <div class="WordSection1">
        <table style="width: 100%; border: none; margin-bottom: 10px;">
          <tr>
            <td style="width: 15%; text-align: left; border: none; vertical-align: middle;">
              ${identity.schoolLogo ? `<img src="${identity.schoolLogo}" alt="Logo Sekolah" style="max-height: 80px;" />` : ''}
            </td>
            <td style="width: 70%; text-align: center; border: none; vertical-align: middle;">
              <h3 style="margin: 0; padding: 0; border: none; color: #000; font-size: 16px;">PEMERINTAH DAERAH / YAYASAN</h3>
              <h2 style="margin: 5px 0; padding: 0; border: none; color: #000; font-size: 20px; text-transform: uppercase;">${identity.schoolName || "NAMA SEKOLAH"}</h2>
              <h1 style="margin: 5px 0; padding: 0; border: none; color: #000; font-size: 24px; text-transform: uppercase;">MODUL AJAR KURIKULUM 2025</h1>
            </td>
            <td style="width: 15%; text-align: right; border: none; vertical-align: middle;">
              ${identity.agencyLogo ? `<img src="${identity.agencyLogo}" alt="Logo Dinas" style="max-height: 80px;" />` : ''}
            </td>
          </tr>
        </table>
        <hr style="border: 2px solid #000; margin-bottom: 2px;" />
        <hr style="border: 1px solid #000; margin-bottom: 20px; margin-top: 0;" />
        
        <table class="identitas-table">
          <tr>
            <td class="label-col">IDENTITAS</td>
            <td style="padding: 0;">
              <table style="width: 100%; border: none; border-collapse: collapse;">
                <tr>
                  <td style="border: none; border-right: 1px solid #000; border-bottom: 1px solid #000;">
                    <div class="data-label">Nama Penyusun</div>
                    <div class="data-value">${identity.teacherName || "-"}</div>
                  </td>
                  <td style="border: none; border-bottom: 1px solid #000;">
                    <div class="data-label">Satuan Pendidikan</div>
                    <div class="data-value">${identity.schoolName || "-"}</div>
                  </td>
                </tr>
                <tr>
                  <td style="border: none; border-right: 1px solid #000; border-bottom: 1px solid #000;">
                    <div class="data-label">Mata Pelajaran</div>
                    <div class="data-value">${identity.subject || "-"}</div>
                  </td>
                  <td style="border: none; border-bottom: 1px solid #000;">
                    <div class="data-label">Fase / Kelas</div>
                    <div class="data-value">${identity.phase} / ${identity.class}</div>
                  </td>
                </tr>
                 <tr>
                  <td style="border: none; border-right: 1px solid #000;">
                    <div class="data-label">Alokasi Waktu</div>
                    <div class="data-value">${identity.duration}</div>
                  </td>
                  <td style="border: none;">
                    <div class="data-label">Model Pembelajaran</div>
                    <div class="data-value">${identity.model || "-"}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
  `;

  const signatureSection = `
    <table style="width: 100%; border: none; margin-top: 50px;">
      <tr>
        <td style="border: none; width: 50%; text-align: center; vertical-align: top;">
          <p>Mengetahui,<br>Kepala Sekolah</p>
          <br><br><br>
          <p><b>${identity.principalName || "(....................................)"}</b><br>
          NIP. ${identity.principalNip || "...................................."}</p>
        </td>
        <td style="border: none; width: 50%; text-align: center; vertical-align: top;">
          <p>${identity.creationPlace || ".........."}, ${identity.creationDate ? `${identity.creationDate} ${identity.creationMonth} ${identity.creationYear}` : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br>
          Guru Mata Pelajaran</p>
          <br><br><br>
          <p><b>${identity.teacherName || "(....................................)"}</b><br>
          NIP. ${identity.teacherNip || "...................................."}</p>
        </td>
      </tr>
    </table>
  `;

  const footer = `
        <div style="margin-top: 50px; font-size: 10px; color: #999; text-align: center;">
          Generated by Guru AI Assistant Tools • Curriculum 2025
        </div>
      </div>
    </body>
    </html>
  `;

  // Advanced Markdown to HTML converter
  let htmlResult = '';
  const processedContent = content.replace(/\*\*\s*\*\*/g, '');
  const rows = processedContent.split('\n');
  let inTable = false;
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < rows.length; i++) {
    let row = rows[i].trim();

    // Bold & Italic
    row = row.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    row = row.replace(/\*(.*?)\*/g, '<i>$1</i>');

    // Images
    row = row.replace(/!\[(.*?)\]\((.*?)\)/g, '<div style="text-align: center; margin: 20px 0;"><img src="$2" alt="$1" style="max-width: 100%; border-radius: 8px;" /></div>');

    // Headers
    if (row.startsWith('##### ')) { row = `<h5>${row.substring(6)}</h5>`; }
    else if (row.startsWith('#### ')) { row = `<h4>${row.substring(5)}</h4>`; }
    else if (row.startsWith('### ')) { row = `<h3>${row.substring(4)}</h3>`; }
    else if (row.startsWith('## ')) { row = `<h2>${row.substring(3)}</h2>`; }
    else if (row.startsWith('# ')) { row = `<h1>${row.substring(2)}</h1>`; }

    // Table
    if (row.startsWith('|')) {
      if (inUl) { htmlResult += '</ul>'; inUl = false; }
      if (inOl) { htmlResult += '</ol>'; inOl = false; }
      
      if (!inTable) {
        // Switch section to Landscape for tables
        htmlResult += '</div><div class="WordSection2"><table>';
        inTable = true;
      }
      if (row.includes('---')) continue; // Skip separator

      const cells = row.split('|').filter(c => c.trim() !== '');
      htmlResult += '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
      continue;
    } else if (inTable) {
      // Switch back to Portrait
      htmlResult += '</table></div><div class="WordSection1">';
      inTable = false;
    }

    // Unordered List
    if (row.startsWith('- ') || row.startsWith('* ')) {
      if (inOl) { htmlResult += '</ol>'; inOl = false; }
      if (!inUl) { htmlResult += '<ul>'; inUl = false; inUl = true; }
      htmlResult += `<li>${row.substring(2)}</li>`;
      continue;
    } else if (inUl) {
      htmlResult += '</ul>';
      inUl = false;
    }

    // Ordered List
    const olMatch = row.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      if (inUl) { htmlResult += '</ul>'; inUl = false; }
      if (!inOl) { htmlResult += '<ol>'; inOl = false; inOl = true; }
      htmlResult += `<li>${olMatch[2]}</li>`;
      continue;
    } else if (inOl) {
      htmlResult += '</ol>';
      inOl = false;
    }

    // Normal paragraph (if it isn't empty, and doesn't already start with <h)
    if (row !== '' && !row.startsWith('<h')) {
      htmlResult += `<p>${row}</p>`;
    } else if (row.startsWith('<h')) {
      htmlResult += row;
    }
  }

  if (inTable) htmlResult += '</table>';
  if (inUl) htmlResult += '</ul>';
  if (inOl) htmlResult += '</ol>';

  const blob = new Blob([header + htmlResult + signatureSection + footer], { type: 'application/msword' });
  saveAs(blob, `${filename}.doc`);
};
