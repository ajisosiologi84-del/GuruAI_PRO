import React, { useState, useEffect } from "react";
import { 
  Wand2, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Loader2, 
  Target, 
  Users, 
  Layout, 
  Zap, 
  Search, 
  Dna, 
  ClipboardList, 
  Table, 
  Sparkles,
  BookOpen,
  Download,
  FileText,
  FileSpreadsheet,
  Copy,
  Edit3,
  Save,
  XCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { PROMPTS } from "../lib/prompts";
import { exportToExcel, exportToDoc } from "../lib/exportUtils";

interface WorkflowStepsProps {
  identity: any;
  currentStep: number;
  results: Record<number, string>;
  generationMode?: string;
  onUpdateResults: (step: number, content: string) => void;
  onSetStep: (step: number) => void;
  onSetFinalContent: (content: string) => void;
  onChangeIdentity: (data: any) => void;
}

const STEPS = [
  { id: 1, title: "CP ke Tujuan Pembelajaran", icon: Target, category: "Analisis" },
  { id: 2, title: "Alur Tujuan Pembelajaran", icon: ChevronRight, category: "Perancangan" },
  { id: 3, title: "Analisis Profil Murid", icon: Users, category: "Diferensiasi" },
  { id: 4, title: "Kerangka Pembelajaran", icon: Layout, category: "Framework" },
  { id: 5, title: "Pengalaman Belajar", icon: Zap, category: "Aktivitas" },
  { id: 6, title: "Asesmen Awal (Diagnostic)", icon: Search, category: "Evaluasi" },
  { id: 7, title: "Pembelajaran Diferensiasi", icon: Dna, category: "Inklusi" },
  { id: 8, title: "Asesmen Formatif & Sumatif", icon: ClipboardList, category: "Evaluasi" },
  { id: 9, title: "Rubrik Penilaian Terperinci", icon: Table, category: "Dokumen" },
  { id: 10, title: "Finalisasi Modul Ajar", icon: Sparkles, category: "Output" },
];

export const WorkflowSteps: React.FC<WorkflowStepsProps> = ({ 
  identity, 
  currentStep, 
  results, 
  generationMode = "PROMPT_STEP",
  onUpdateResults, 
  onSetStep,
  onSetFinalContent,
  onChangeIdentity
}) => {
  const [loading, setLoading] = useState(false);
  const [cpInput, setCpInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEditContent(results[currentStep] || "");
    setIsEditing(false);
    setErrorMsg("");
  }, [currentStep, results]);

  const activeTopic = identity.topics && identity.topics.some(t => t.trim().length > 0)
    ? identity.topics.filter(Boolean).join("\n\n")
    : identity.topic;

  const validateIdentity = (step: number) => {
    if (step >= 3) {
      if (!identity.subject || !identity.phase || !identity.class || !identity.teacherName || !identity.schoolName) {
        setErrorMsg("Harap lengkapi Identitas (Nama Guru, Sekolah, Mapel, Fase, Kelas) di panel sebelah kiri!");
        return false;
      }
    } else {
      if (!identity.subject || !identity.phase) {
        setErrorMsg("Harap isi setidaknya Mata Pelajaran dan Fase di panel Identitas terlebih dahulu!");
        return false;
      }
    }

    if (step >= 2) {
      const hasTopics = identity.topics && identity.topics.some(t => t.trim().length > 0);
      if (!hasTopics && !identity.topic) {
        setErrorMsg("Harap paste atau isi setidaknya satu Tujuan Pembelajaran (TP) pada kotak isian di bawah ini!");
        return false;
      }
    }
    setErrorMsg("");
    return true;
  };

  const getPromptForStep = (step: number) => {
    switch (step) {
      case 1: return PROMPTS.STEP_1_CP_TO_TP(identity, cpInput || results[1] || "");
      case 2: return PROMPTS.STEP_2_ATP(identity);
      case 3: return PROMPTS.STEP_3_PROFIL_MURID(identity);
      case 4: return PROMPTS.STEP_4_KERANGKA(identity, activeTopic);
      case 5: return PROMPTS.STEP_5_PENGALAMAN(identity, activeTopic);
      case 6: return PROMPTS.STEP_6_ASESMEN_AWAL(identity, activeTopic);
      case 7: return PROMPTS.STEP_7_DIFERENSIASI(identity, activeTopic);
      case 8: return PROMPTS.STEP_8_ASESMEN_PROSES(identity, activeTopic);
      case 9: return PROMPTS.STEP_9_RUBRIK(identity, activeTopic);
      default: return "";
    }
  };

  const generateStep = async () => {
    if (!validateIdentity(currentStep)) return;

    setLoading(true);
    setErrorMsg("");
    try {
      if (currentStep === 10 && generationMode === "PROMPT_STEP") {
        const promptText = PROMPTS.STEP_10_COMBINED_PROMPTS(identity, activeTopic);
        setGeneratedPromptText(promptText);
        setLoading(false);
        return;
      }

      if (currentStep === 10) {
        // Gabungkan hasil langkah 3 s/d 9 secara langsung agar 100% lengkap
        const finalMarkdown = `
# MODUL AJAR KURIKULUM MERDEKA (PEMBELAJARAN MENDALAM)

## A. IDENTITAS UMUM
- **Nama Penyusun:** ${identity.teacherName || "-"}
- **Institusi/Sekolah:** ${identity.schoolName || "-"}
- **Mata Pelajaran:** ${identity.subject || "-"}
- **Fase / Kelas:** ${identity.phase || "-"} / ${identity.class || "-"}
- **Alokasi Waktu:** ${identity.duration || "-"}
- **Model Pembelajaran:** ${identity.model || "-"}

## B. TUJUAN PEMBELAJARAN
**Topik / Tujuan Pembelajaran:**
${activeTopic || "Belum ditentukan"}

---

## C. KOMPONEN INTI

### I. Analisis Profil Murid
${results[3] || "*Data belum dibuat. Silakan selesaikan Langkah 3.*"}

---

### II. Kerangka Pembelajaran
${results[4] || "*Data belum dibuat. Silakan selesaikan Langkah 4.*"}

---

### III. Pengalaman Belajar
${results[5] || "*Data belum dibuat. Silakan selesaikan Langkah 5.*"}

---

### IV. Asesmen Awal (Diagnostic)
${results[6] || "*Data belum dibuat. Silakan selesaikan Langkah 6.*"}

---

### V. Pembelajaran Diferensiasi
${results[7] || "*Data belum dibuat. Silakan selesaikan Langkah 7.*"}

---

### VI. Asesmen Formatif & Sumatif
${results[8] || "*Data belum dibuat. Silakan selesaikan Langkah 8.*"}

---

### VII. Rubrik Penilaian Terperinci
${results[9] || "*Data belum dibuat. Silakan selesaikan Langkah 9.*"}
`;
        onUpdateResults(10, finalMarkdown);
        onSetFinalContent(finalMarkdown);
        setLoading(false);
        return;
      }

      const promptText = getPromptForStep(currentStep);

      if (generationMode === "PROMPT_STEP") {
        setGeneratedPromptText(promptText);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`API Endpoint Error (${response.status}): The server did not return JSON.`);
      }

      if (!response.ok) throw new Error(data.error || "Failed to generate content");

      const content = data.text;
      onUpdateResults(currentStep, content);
      
      if (currentStep === 10) {
        onSetFinalContent(content);
      }
    } catch (error: any) {
      console.error("Generation failed:", error);
      setErrorMsg(error.message || "Terjadi kesalahan saat memproses jawaban AI. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const [generatedPromptText, setGeneratedPromptText] = useState("");
  const [pastedResult, setPastedResult] = useState("");

  const handleSavePastedResult = () => {
    onUpdateResults(currentStep, pastedResult);
    setGeneratedPromptText("");
    setPastedResult("");
    if (currentStep === 10) {
      onSetFinalContent(pastedResult);
    }
  };

  if (generationMode === "PROMPT_MEGA") {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Mode Mega Prompt</h3>
              <p className="text-sm text-slate-500">Hasilkan satu instruksi besar untuk merangkum semua langkah pembuatan Modul Ajar.</p>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-700">1. Paste CP / Tujuan Anda</h4>
            </div>
            <textarea 
              className="w-full h-40 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Tempel Capaian Pembelajaran (CP) manual di sini..."
              value={cpInput}
              onChange={(e) => setCpInput(e.target.value)}
            />
            <button
              onClick={() => {
                if (!cpInput) {
                  setErrorMsg("Harap isi CP terlebih dahulu!");
                  return;
                }
                const prompt = PROMPTS.MEGA_PROMPT(identity, cpInput);
                setGeneratedPromptText(prompt);
              }}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
            >
              Generate Mega Prompt
            </button>
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-medium flex gap-2">
                <XCircle size={16} /> <p>{errorMsg}</p>
              </div>
            )}
          </div>

          {generatedPromptText && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-700">2. Copy Prompt & Paste ke AI (Gemini/ChatGPT)</h4>
              <div className="relative">
                <textarea 
                  className="w-full h-80 p-4 bg-slate-800 text-emerald-400 font-mono text-xs rounded-xl focus:outline-none"
                  readOnly
                  value={generatedPromptText}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPromptText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="absolute top-4 right-4 px-3 py-1.5 bg-slate-700 text-white rounded-lg text-xs font-bold hover:bg-slate-600 transition"
                >
                  {copied ? "Tersalin!" : "Copy Prompt"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const fetchCPContent = async () => {
    if (!identity.subject || !identity.phase) {
      setErrorMsg("Harap isi Mata Pelajaran dan Fase di Identitas terlebih dahulu!");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const prompt = PROMPTS.GET_CP_CONTENT(identity);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`API Endpoint Error (${response.status}): The server did not return JSON. If this is deployed on Vercel, please check your deployment configuration for Express/Vite fullstack applications.`);
      }

      if (!response.ok) throw new Error(data.error || "Failed to fetch CP");

      setCpInput(data.text);
    } catch (error: any) {
      console.error("Fetch CP failed:", error);
      setErrorMsg(error.message || "Gagal mengambil CP otomatis. Pastikan koneksi internet stabil.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (results[currentStep]) {
      navigator.clipboard.writeText(results[currentStep]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveEdit = () => {
    onUpdateResults(currentStep, editContent);
    setIsEditing(false);
    if (currentStep === 10) {
      onSetFinalContent(editContent);
    }
  };

  return (
    <div className="space-y-6">
      {/* ProgressBar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="space-y-6 min-w-[800px]">
          {/* Fase A: CP ke TP & ATP */}
          <div>
            <div className="flex items-center gap-2 px-4 mb-4">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">Langkah A</span>
              <span className="text-xs font-semibold text-slate-500">Fokus Membuat CP ke Tujuan Pembelajaran & ATP (Langkah 1-2)</span>
            </div>
            <div className="flex items-center justify-between max-w-[400px] px-4">
              {STEPS.filter(s => s.id <= 2).map((step) => (
                <div 
                  key={step.id} 
                  className="flex flex-col items-center relative group cursor-pointer flex-1"
                  onClick={() => onSetStep(step.id)}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 mx-auto
                    ${currentStep === step.id ? "bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110" : 
                      results[step.id] ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}
                  `}>
                    {results[step.id] ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
                  </div>
                  <span className={`text-[10px] mt-2 font-bold uppercase tracking-tighter text-center max-w-[100px] ${currentStep === step.id ? "text-emerald-700" : "text-slate-400"}`}>
                    <span className="block opacity-70 mb-0.5">Langkah {step.id}</span>
                  </span>
                  {step.id < 2 && (
                    <div className={`absolute left-[50%] top-5 w-[100%] h-[2px] -z-10 bg-slate-100 ${results[step.id] ? "bg-emerald-200" : ""}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="px-4"><div className="w-full h-px bg-slate-100"></div></div>

          {/* Fase B: Modul Ajar Tiap TP */}
          <div>
            <div className="flex items-center gap-2 px-4 mb-4">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">Langkah B</span>
              <span className="text-xs font-semibold text-slate-500">Fokus Pembuatan Modul Ajar Setiap TP (Langkah 3-10)</span>
            </div>
            <div className="flex items-center justify-between px-4">
              {STEPS.filter(s => s.id > 2).map((step) => (
                <div 
                  key={step.id} 
                  className="flex flex-col items-center relative group cursor-pointer flex-1"
                  onClick={() => onSetStep(step.id)}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 mx-auto
                    ${currentStep === step.id ? "bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110" : 
                      results[step.id] ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}
                  `}>
                    {results[step.id] ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
                  </div>
                  <span className={`text-[10px] mt-2 font-bold uppercase tracking-tighter text-center ${currentStep === step.id ? "text-emerald-700" : "text-slate-400"}`}>
                    <span className="block opacity-70 mb-0.5">Langkah {step.id}</span>
                  </span>
                  {step.id < 10 && (
                    <div className={`absolute left-[50%] top-5 w-[100%] h-[2px] -z-10 bg-slate-100 ${results[step.id] ? "bg-emerald-200" : ""}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step Info */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-full">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              {React.createElement(STEPS[currentStep-1].icon, { size: 24 })}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{STEPS[currentStep-1].title}</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              {currentStep === 1 ? "Tempelkan Capaian Pembelajaran (CP) Anda di sini untuk dianalisis menjadi Tujuan Pembelajaran. Pastikan Anda sudah menentukan 'Minggu Efektif' di panel Identitas agar otomatis menghitung alokasi waktu tahunan." : 
               `Proses ini menggunakan data dari langkah sebelumnya untuk membangun ${STEPS[currentStep-1].title.toLowerCase()} yang berkualitas.`}
            </p>

            {currentStep === 1 && (
              <div className="space-y-4 mb-4">
                <button
                  onClick={fetchCPContent}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition-all"
                >
                  <Sparkles size={14} /> Ambil CP Otomatis (BSKAP 2025)
                </button>
                <textarea 
                  className="w-full h-40 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Atau tempel Capaian Pembelajaran (CP) manual di sini..."
                  value={cpInput}
                  onChange={(e) => setCpInput(e.target.value)}
                />
              </div>
            )}

            {(currentStep === 2 || currentStep === 3) && (
              <div className="p-4 border border-emerald-200 bg-emerald-50 rounded-xl space-y-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-emerald-800">
                    Tujuan Pembelajaran (TP) untuk {currentStep === 2 ? 'ATP & Modul Ini' : 'Modul Ini'}
                  </label>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    {currentStep === 2 
                      ? "Paste TP hasil Langkah 1 yang akan diurutkan menjadi Alur Tujuan Pembelajaran (ATP). TP ini juga akan menjadi fokus untuk langkah-langkah ke depannya (Modul Ajar)." 
                      : "Paste TP yang akan menjadi fokus untuk langkah-langkah ke depannya atau selanjutnya (Modul Ajar)."}
                  </p>
                </div>

                <div className="space-y-4">
                  {(identity.topics || [identity.topic || ""]).map((t, index) => (
                    <div key={index} className="space-y-2 bg-white p-3 rounded-xl border border-emerald-100">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-emerald-700">Tujuan Pembelajaran (TP) {index + 1}</label>
                        {(identity.topics?.length || 1) > 1 && (
                          <button
                            onClick={() => {
                              const newTopics = [...(identity.topics || [identity.topic || ""])];
                              newTopics.splice(index, 1);
                              onChangeIdentity({ ...identity, topics: newTopics, topic: newTopics.join("\n\n") });
                            }}
                            className="text-red-500 hover:text-red-700 text-xs font-bold"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <textarea 
                        className="w-full h-24 p-3 bg-slate-50 border border-emerald-100 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-y"
                        placeholder={`Paste TP ${index + 1} di sini...`}
                        value={identity.topics?.[index] !== undefined ? identity.topics[index] : (identity.topic || "")}
                        onChange={(e) => {
                          const newTopics = [...(identity.topics || [identity.topic || ""])];
                          newTopics[index] = e.target.value;
                          onChangeIdentity({ ...identity, topics: newTopics, topic: newTopics.join("\n\n") });
                        }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newTopics = [...(identity.topics || [identity.topic || ""]), ""];
                      onChangeIdentity({ ...identity, topics: newTopics, topic: newTopics.join("\n\n") });
                    }}
                    className="w-full py-2 border border-dashed border-emerald-300 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-all flex justify-center items-center gap-2"
                  >
                    + Tambah TP Lainnya
                  </button>
                  {currentStep === 2 && (
                    <button
                      onClick={() => generateStep()}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200 mt-2"
                    >
                      {generationMode === "PROMPT_STEP" ? <Copy size={16}/> : <Wand2 size={16} />} 
                      {generationMode === "PROMPT_STEP" ? "Tampilkan Prompt ATP" : "Buat Alur Tujuan Pembelajaran (ATP)"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-medium flex items-start gap-2">
                <XCircle size={16} className="mt-0.5 flex-shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            {currentStep !== 2 && (
              <button
                onClick={() => generateStep()}
                disabled={loading}
                className="w-full h-12 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-100 mb-4"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (generationMode === "PROMPT_STEP" ? <Copy size={20} /> : <Wand2 size={20} />)}
                {generationMode === "PROMPT_STEP" ? `Tampilkan Prompt ${STEPS[currentStep-1].category}` : `Generate ${STEPS[currentStep-1].category}`}
              </button>
            )}

            {(currentStep === 1 || currentStep === 2) && (
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <p className="text-[10px] text-slate-500 text-center">Sudah memiliki Capaian Pembelajaran (CP) dan Alur Tujuan Pembelajaran (ATP)?</p>
                <button
                  onClick={() => onSetStep(3)}
                  className="w-full h-10 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                >
                  Langsung ke Langkah 3 (Buat Modul Ajar) <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Output Area */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Preview Hasil</span>
              {results[currentStep] && !loading && (
                <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                  {currentStep > 1 && (
                    <button onClick={() => onSetStep(currentStep - 1)} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button 
                      onClick={isEditing ? handleSaveEdit : () => setIsEditing(true)}
                      className={`flex items-center gap-1 font-bold text-xs px-2 py-1 rounded transition-colors ${isEditing ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"}`}
                      title={isEditing ? "Simpan Perubahan" : "Edit Hasil"}
                    >
                      {isEditing ? <Save size={14} /> : <Edit3 size={14} />} {isEditing ? "Simpan" : "Edit"}
                    </button>
                    {isEditing && (
                      <button 
                        onClick={() => { setIsEditing(false); setEditContent(results[currentStep]); }}
                        className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs px-2 py-1 rounded transition-colors"
                        title="Batal Edit"
                      >
                         <XCircle size={14} /> Batal
                      </button>
                    )}
                    {!isEditing && (
                      <>
                        <button 
                          onClick={handleCopy}
                          className="flex items-center gap-1 text-slate-600 hover:text-emerald-600 font-bold text-xs bg-slate-100 hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
                          title="Copy ke Clipboard"
                        >
                          {copied ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />} Copy
                        </button>
                        <button 
                          onClick={() => exportToDoc(results[currentStep], identity, `Langkah_${currentStep}_${identity.subject}`)}
                          className="flex items-center gap-1 text-slate-600 hover:text-emerald-600 font-bold text-xs bg-slate-100 hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
                          title="Download DOC"
                        >
                          <FileText size={14} /> DOC
                        </button>
                        <button 
                          onClick={() => exportToExcel(results[currentStep], `Langkah_${currentStep}_${identity.subject}`)}
                          className="flex items-center gap-1 text-slate-600 hover:text-emerald-600 font-bold text-xs bg-slate-100 hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
                          title="Download Excel/Tabel"
                        >
                          <FileSpreadsheet size={14} /> XLS
                        </button>
                      </>
                    )}
                  </div>
                  {currentStep < 10 && (
                    <button onClick={() => onSetStep(currentStep + 1)} className="flex items-center gap-1 text-emerald-600 font-bold text-sm bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full transition-colors">
                      Lanjut <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 p-6 overflow-y-auto w-full">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-emerald-600 min-h-[400px]">
                  <Loader2 size={48} className="animate-spin mb-4" />
                  <p className="text-sm font-medium animate-pulse">Menghasilkan Output, mohon tunggu...</p>
                </div>
              ) : generatedPromptText && generationMode === "PROMPT_STEP" ? (
                <div className="flex flex-col h-full space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-700">1. Copy Prompt Ini:</label>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(generatedPromptText);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-bold transition"
                      >
                        {copied ? "Tersalin!" : "Copy Prompt"}
                      </button>
                    </div>
                    <textarea 
                      className="w-full h-40 p-3 bg-slate-800 text-emerald-400 font-mono text-xs rounded-xl focus:outline-none"
                      readOnly
                      value={generatedPromptText}
                    />
                  </div>
                  <div className="space-y-2 flex-1 flex flex-col">
                    <label className="text-sm font-bold text-slate-700">2. Paste Hasil dari AI di sini:</label>
                    <textarea 
                      className="w-full flex-1 min-h-[200px] p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none resize-y"
                      value={pastedResult}
                      placeholder="Paste hasil (kode markdown atau teks) dari Gemini/ChatGPT di sini..."
                      onChange={e => setPastedResult(e.target.value)}
                    />
                    <button
                      onClick={handleSavePastedResult}
                      disabled={!pastedResult}
                      className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition"
                    >
                      Simpan Hasil & Lanjut
                    </button>
                  </div>
                </div>
              ) : isEditing ? (
                <textarea 
                  className="w-full h-full min-h-[400px] p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none resize-y"
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                />
              ) : results[currentStep] ? (
                <div className="markdown-body prose prose-slate prose-sm max-w-none">
                  <ReactMarkdown>{results[currentStep].replace(/\*\*\s*\*\*/g, "")}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 min-h-[400px]">
                  <BookOpen size={48} className="mb-4 opacity-20" />
                  <p className="text-sm font-medium">Belum ada hasil yang di-generate</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
