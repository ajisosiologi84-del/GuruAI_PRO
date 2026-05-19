import React, { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Download, Share2, Printer, Palette, FileSpreadsheet, FileText, Copy, CheckCircle2, Sparkles, FileDown } from "lucide-react";
import { IdentityData } from "./IdentityForm";
import { motion } from "motion/react";
import { exportToExcel, exportToDoc } from "../lib/exportUtils";

interface PreviewProps {
  content: string;
  identity: IdentityData;
  type?: "ATP" | "MODUL";
  results?: Record<number, string>;
  onEdit?: () => void;
}

const THEMES = [
  { id: "clean", name: "Clean White", accent: "emerald", bg: "bg-white", pattern: "" },
  { id: "soft", name: "Soft Pastel", accent: "blue", bg: "bg-blue-50/30", pattern: "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" },
  { id: "nature", name: "Modern Nature", accent: "emerald", bg: "bg-emerald-50/50", pattern: "bg-[linear-gradient(45deg,#ecfdf5_25%,transparent_25%,transparent_50%,#ecfdf5_50%,#ecfdf5_75%,transparent_75%,transparent)] bg-[length:24px_24px]" },
  { id: "minimal", name: "Minimalist", accent: "slate", bg: "bg-slate-50", pattern: "" }
];

export const Preview: React.FC<PreviewProps> = ({ content, identity, type = "MODUL", results, onEdit }) => {
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [masterCopiedType, setMasterCopiedType] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMasterPrompt = (format: "MODUL" | "WEB" | "INFOGRAFIS" | "SLIDE") => {
    let prompt = "";
    
    const acTop = identity.topics && identity.topics.some(t => t.trim().length > 0)
      ? identity.topics.filter(Boolean).join("\n\n")
      : identity.topic;

    const baseData = `IDENTITAS UMUM:\n` +
      `- Nama Penyusun: ${identity.teacherName || "-"}\n` +
      `- Institusi/Sekolah: ${identity.schoolName || "-"}\n` +
      `- Mata Pelajaran: ${identity.subject || "-"}\n` +
      `- Fase / Kelas: ${identity.phase || "-"} / ${identity.class || "-"}\n` +
      `- Alokasi Waktu: ${identity.duration || "-"}\n` +
      `- Model Pembelajaran: ${identity.model || "-"}\n` +
      `- Profil Murid (Hobi): ${identity.studentHobbies || "-"}\n` +
      `- Profil Murid (Gaya Belajar): ${identity.learningStyles || "-"}\n` +
      `- Profil Murid (Latar Belakang): ${identity.studentBackground || "-"}\n` +
      `- Profil Murid (Lingkungan): ${identity.studentEnv || "-"}\n\n` +
      `TUJUAN PEMBELAJARAN:\n${acTop || "Belum ditentukan"}\n\n` +
      `HASIL ANALISIS KOMPONEN INTI:\n\n` +
      (results?.['3'] ? `### Analisis Profil Murid:\n${results['3']}\n\n` : '') +
      (results?.['4'] ? `### Kerangka Pembelajaran:\n${results['4']}\n\n` : '') +
      (results?.['5'] ? `### Pengalaman Belajar:\n${results['5']}\n\n` : '') +
      (results?.['6'] ? `### Asesmen Awal (Diagnostic):\n${results['6']}\n\n` : '') +
      (results?.['7'] ? `### Pembelajaran Diferensiasi:\n${results['7']}\n\n` : '') +
      (results?.['8'] ? `### Asesmen Formatif & Sumatif:\n${results['8']}\n\n` : '') +
      (results?.['9'] ? `### Rubrik Penilaian Terperinci:\n${results['9']}\n\n` : '');

    if (format === "MODUL") {
      prompt = `Bertindaklah sebagai Guru Ahli dan Pengembang Kurikulum Merdeka berdedikasi tinggi.\n\nTolong buatkan Modul Ajar (RPP) Kurikulum Merdeka yang EKSTRA KOMPREHENSIF, PRAKTIS, dan MENDALAM berdasarkan data-data berikut:\n\n${baseData}TUGAS ANDA:\n1. Gabungkan seluruh data di atas ke dalam SATU dokumen Modul Ajar utuh berformat Markdown yang rapi dan terstruktur sempurna.\n2. Pastikan alurnya logis dari awal hingga akhir (Identitas -> Tujuan -> Profil Murid -> Langkah Pembelajaran -> Asesmen -> Lampiran).\n3. Tambahkan rubrik penilaian yang relevan jika belum lengkap, serta LKPD (Lembar Kerja Peserta Didik) singkat yang aplikatif.\n4. Gunakan bahasa Indonesia yang baku, profesional, dan mudah dipahami oleh pendidik. Dokumen ini harus 100% SIAP DIGUNAKAN untuk mengajar.`;
    } else if (format === "WEB") {
      prompt = `Bertindaklah sebagai Content Writer Pendidikan yang kreatif dan SEO Specialist.\n\nBerdasarkan data Modul Ajar berikut, tolong buatkan Artikel Web atau Postingan Blog yang INSPIRATIF, EDUKATIF, dan MENGGUGAH untuk dibaca oleh guru, orang tua, atau praktisi pendidikan:\n\n${baseData}TUGAS ANDA:\n1. Ubah konten materi di atas menjadi format artikel web/blog (Markdown).\n2. Gunakan gaya bahasa yang engaging, persuasif, dan komunikatif.\n3. Berikan Judul Artikel yang Sangat Menarik dan SEO-friendly (Click-worthy).\n4. Gunakan sub-heading yang jelas, poin-poin/listicle untuk keterbacaan, dan call-to-action (CTA) di akhir artikel.\n5. Susun dengan format yang sangat cocok untuk dipublikasikan langsung ke platform web, Canvas Gemini, atau dijadikan referensi di NotebookLM.`;
    } else if (format === "INFOGRAFIS") {
      prompt = `Bertindaklah sebagai Desainer Instruksional dan Ahli Visualisasi Data Pendidikan.\n\nBerdasarkan data Modul Ajar berikut, tolong buatkan rancangan konten INFOGRAFIS yang HIGH-IMPACT, SANGAT VISUAL, RINGKAS, dan TO-THE-POINT:\n\n${baseData}TUGAS ANDA:\n1. Buat struktur teks mentah yang diformat khusus untuk desain infografis.\n2. Bagi menjadi "Panel-Panel" atau "Section" berurutan (misal: Panel 1: Judul Utama & Konteks, Panel 2: Fakta Menarik/Target Murid, Panel 3: Proses Pembelajaran Inti, Panel 4: Kesimpulan/Hasil).\n3. Tuliskan teks seringkas mungkin (maksimal 2-3 kalimat per poin pokok).\n4. Wajib sertakan "Instruksi Visual" di setiap bagian (seperti rekomendasi ikon, ilustrasi, atau skema warna) agar mudah dieksekusi di platform seperti Canva atau Canvas Gemini.`;
    } else if (format === "SLIDE") {
      prompt = `Bertindaklah sebagai Presentation Specialist dan Trainer Profesional.\n\nBerdasarkan data Modul Ajar berikut, tolong buatkan struktur SLIDE PRESENTASI (lengkap untuk pembuatan di PowerPoint / Canva / Google Slides) yang MEMUKAU, INTERAKTIF, dan SANGAT TERSTRUKTUR:\n\n${baseData}TUGAS ANDA:\n1. Susun konten presentasi per halaman slide (mulai dari Slide 1: Judul/Cover, Slide 2: Agenda, dst. hingga Penutup).\n2. Pastikan teks pada setiap slide SANGAT RINGKAS, "point-based" (bullet points besar), JANGAN menyalin paragraf panjang.\n3. Untuk setiap slide, wajib cantumkan 2 hal:\n   - [TEKS SLIDE]: Teks inti yang akan tampil di layar.\n   - [CATATAN PRESENTER / SPEAKER NOTES]: Penjelasan mendalam yang akan diucapkan oleh presenter.\n   - [SARAN VISUAL]: Ide bagan, gambar, diagram, atau animasi untuk slide tersebut.`;
    }

    navigator.clipboard.writeText(prompt);
    setMasterCopiedType(format);
    setShowPromptMenu(false);
    setTimeout(() => setMasterCopiedType(null), 2000);
  };

  const handleExportDoc = () => {
    const filename = `${type}_${identity.subject}_${identity.class}`.replace(/\s+/g, '_');
    exportToDoc(content, identity, filename);
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    // Karena ekstensi html2pdf.js (via html2canvas) tidak mendukung warna oklch dari Tailwind CSS v4,
    // maka kita menggunakan window.print() yang memicu dialog cetak bawaan browser.
    // Di dialog ini pengguna dapat memilih "Save as PDF" dengan kualitas teks lebih tinggi dan dapat disalin.
    setTimeout(() => {
      window.print();
    }, 300);
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    const filename = `${type}_${identity.subject}_${identity.class}`.replace(/\s+/g, '_');
    exportToExcel(content, filename);
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 sticky top-4 z-10 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-sm no-print">
        <div className="flex items-center gap-3">
          <Palette size={20} className="text-gray-400" />
          <div className="flex gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setCurrentTheme(theme)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  currentTheme.id === theme.id
                    ? "bg-emerald-600 text-white shadow-sm scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <button 
              onClick={() => setShowPromptMenu(!showPromptMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all shadow-md active:scale-95"
              title="Salin Prompt ke Gemini / Padlet"
            >
              {masterCopiedType ? <CheckCircle2 size={18} /> : <Sparkles size={18} />}
              <span className="hidden sm:inline">Salin Master Prompt</span>
            </button>

            {showPromptMenu && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Format Output
                </div>
                <button 
                  onClick={() => handleCopyMasterPrompt("MODUL")}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors text-left"
                >
                  Modul Ajar Lengkap
                  {masterCopiedType === "MODUL" && <CheckCircle2 size={14} className="text-purple-600" />}
                </button>
                <button 
                  onClick={() => handleCopyMasterPrompt("WEB")}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors text-left"
                >
                  Artikel Web / Blog
                  {masterCopiedType === "WEB" && <CheckCircle2 size={14} className="text-purple-600" />}
                </button>
                <button 
                  onClick={() => handleCopyMasterPrompt("INFOGRAFIS")}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors text-left"
                >
                  Konten Infografis
                  {masterCopiedType === "INFOGRAFIS" && <CheckCircle2 size={14} className="text-purple-600" />}
                </button>
                <button 
                  onClick={() => handleCopyMasterPrompt("SLIDE")}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors text-left"
                >
                  Slide Presentasi
                  {masterCopiedType === "SLIDE" && <CheckCircle2 size={14} className="text-purple-600" />}
                </button>
              </div>
            )}
          </div>
          
          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          <button 
            onClick={handleCopy}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors tooltip flex items-center gap-2"
            title="Copy Text to Clipboard"
          >
            {copied ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Copy size={16} />} 
          </button>
          
          <button 
            onClick={handlePrint}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors tooltip flex items-center gap-2"
            title="Print / Export to PDF"
          >
            <Printer size={16} /> 
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all shadow-md active:scale-95"
            >
              <Download size={18} />
              Simpan Dokumen
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                <button 
                  onClick={handleExportDoc}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 transition-colors text-left"
                >
                  <FileText className="text-blue-500" size={18} />
                  <span>Ekspor ke Word (DOC)</span>
                </button>
                <button 
                  onClick={handleExportPDF}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 transition-colors text-left"
                >
                  <FileDown className="text-red-500" size={18} />
                  <span>Simpan Dokumen (PDF)</span>
                </button>
                  <button 
                    onClick={handleExportExcel}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 transition-colors text-left"
                  >
                    <FileSpreadsheet className="text-emerald-500" size={18} />
                    <span>Ekspor ke Excel (XLS)</span>
                  </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <motion.div
        layout
        className={`min-h-[1000px] w-full max-w-4xl mx-auto shadow-2xl rounded-sm border border-gray-200 overflow-hidden relative print-page ${currentTheme.bg}`}
      >
        <div className={`absolute inset-0 opacity-20 pointer-events-none ${currentTheme.pattern} no-print`} />
        
        <div className="relative p-12 md:p-16 print:p-0" ref={printRef}>
          {/* Cover Header for Preview - Hidden in Print if needed, but let's make it neat */}
          <div className="mb-10 text-center no-print">
            <h1 className="text-3xl font-display font-bold text-slate-800 uppercase tracking-widest border-b-4 border-emerald-600 inline-block pb-2 mb-4">
              PERANGKAT AJAR KURIKULUM 2025
            </h1>
            <p className="text-slate-500 font-medium italic">Pembelajaran Mendalam (Deep Learning) & Berbasis 6C</p>
          </div>

          <div className="bg-white border-2 border-slate-800 text-slate-900 mt-8">
            {/* KOP MODUL AJAR */}
            <div className="flex items-center justify-center p-6 border-b-2 border-slate-800 text-center">
              <div>
                <h2 className="text-xl font-black uppercase mt-1">{identity.schoolName || "NAMA SEKOLAH"}</h2>
                <hr className="border-t border-slate-800 w-3/4 mx-auto my-2" />
                <h1 className="text-xl font-black uppercase">MODUL AJAR KURIKULUM 2025</h1>
              </div>
            </div>

            {/* IDENTITAS TABLE SECTION */}
            <div className="grid grid-cols-[150px_1fr] border-b-2 border-slate-800">
              <div className="bg-slate-100 p-4 font-bold border-r-2 border-slate-800 flex items-center justify-center text-center">
                IDENTITAS
              </div>
              <div className="grid grid-cols-2">
                <div className="p-3 border-r border-slate-200 border-b">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Nama Penyusun</span>
                  <span className="font-semibold">{identity.teacherName || "-"}</span>
                </div>
                <div className="p-3 border-b">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Satuan Pendidikan</span>
                  <span className="font-semibold">{identity.schoolName || "-"}</span>
                </div>
                <div className="p-3 border-r border-slate-200 border-b">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Mata Pelajaran</span>
                  <span className="font-semibold">{identity.subject || "-"}</span>
                </div>
                <div className="p-3 border-b">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Fase / Kelas</span>
                  <span className="font-semibold">{identity.phase} / {identity.class}</span>
                </div>
                <div className="p-3 border-r border-slate-200">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Alokasi Waktu</span>
                  <span className="font-semibold">{identity.duration}</span>
                </div>
                <div className="p-3">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Model Pembelajaran</span>
                  <span className="font-semibold">{identity.model || "-"}</span>
                </div>
              </div>
            </div>

            {/* CONTENT START */}
            <div className="p-8 print:p-10 markdown-body prose-slate max-w-none min-h-[500px]">
              <ReactMarkdown>{content.replace(/\*\*\s*\*\*/g, "")}</ReactMarkdown>
            </div>

            {/* SIGNATURE SECTION */}
            <div className="p-10 mt-10 grid grid-cols-2 gap-20">
              <div className="text-center">
                <p className="mb-20">Mengetahui,<br/>Kepala Sekolah</p>
                <div className="border-b border-slate-800 w-40 mx-auto"></div>
                <p className="font-bold mt-2">{identity.principalName || "(....................................)"}</p>
                <p className="text-xs">NIP. {identity.principalNip || "...................................."}</p>
              </div>
              <div className="text-center">
                <p className="mb-2">
                  {identity.creationPlace || ".........."}, {identity.creationDate ? `${identity.creationDate} ${identity.creationMonth} ${identity.creationYear}` : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="mb-14">Guru Mata Pelajaran</p>
                <div className="border-b border-slate-800 w-40 mx-auto"></div>
                <p className="font-bold mt-2">{identity.teacherName || "(....................................)"}</p>
                <p className="text-xs">NIP. {identity.teacherNip || "...................................."}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-4 border-t flex justify-between items-center text-[10px] text-slate-400 font-mono no-print">
            <p>Generated by Guru AI Assistant • Standard 2025</p>
            <p>Verified for Deep Learning Framework</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
