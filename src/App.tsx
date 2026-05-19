import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Eye, 
  GraduationCap,
  Menu,
  X,
  ChevronRight,
  Info,
  Zap,
  RotateCcw,
  LogOut
} from "lucide-react";
import { IdentityForm, IdentityData } from "./components/IdentityForm";
import { WorkflowSteps } from "./components/WorkflowSteps";
import { Preview } from "./components/Preview";
import { Login } from "./components/Login";
import { UserManagement } from "./components/UserManagement";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "./components/FirebaseProvider";
import { auth, db, handleFirestoreError, OperationType } from "./lib/firebase";
import { signOut } from "firebase/auth";
import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

type TabType = "WORKFLOW" | "PREVIEW";

export type GenerationMode = "PROMPT_STEP" | "PROMPT_MEGA";

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabType>("WORKFLOW");
  const [generationMode, setGenerationMode] = useState<GenerationMode>("PROMPT_STEP");
  const [identity, setIdentity] = useState<IdentityData>({
    teacherName: "",
    schoolName: "",
    level: "SMA",
    subject: "",
    phase: "E",
    class: "10",
    semester: "Semester 1",
    duration: "2 x 45 Menit",
    effectiveWeeks: "",
    topic: "",
    topics: [""],
    model: "",
    studentHobbies: "",
    studentBackground: "",
    learningStyles: "",
    studentEnv: "",
    creationPlace: "",
    creationDate: "",
    creationMonth: "",
    creationYear: "",
    teacherNip: "",
    principalName: "",
    principalNip: "",
  });
  
  const [currentContent, setCurrentContent] = useState("");
  const [cumulativeResults, setCumulativeResults] = useState<Record<number, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showIdentity, setShowIdentity] = useState(true);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  // Sync with Firestore
  useEffect(() => {
    if (!user) {
      setDataLoading(false);
      return;
    }

    const path = `progress/${user.uid}`;
    const unsubscribe = onSnapshot(doc(db, "progress", user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.identity) setIdentity(data.identity);
        if (data.cumulativeResults) setCumulativeResults(data.cumulativeResults);
        if (data.currentStep) setCurrentStep(data.currentStep);
        if (data.currentContent) setCurrentContent(data.currentContent);
      }
      setDataLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      setDataLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Save changes to Firestore
  const saveProgress = async (updates: Partial<{
    identity: IdentityData;
    cumulativeResults: Record<number, string>;
    currentStep: number;
    currentContent: string;
  }>) => {
    if (!user) return;
    
    // Sanitize updates to prevent Firestore payload size limit error (1MB max)
    // Remove base64 strings from identity before saving
    let sanitizedUpdates = { ...updates };
    if (sanitizedUpdates.identity) {
      sanitizedUpdates.identity = sanitizedUpdates.identity as IdentityData;
    }

    const path = `progress/${user.uid}`;
    try {
      await setDoc(doc(db, "progress", user.uid), {
        ...sanitizedUpdates,
        userId: user.uid,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  if (authLoading || (user && dataLoading)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Menyiapkan Perangkat Ajar...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const handleUpdateResults = async (step: number, content: string) => {
    const newResults = { ...cumulativeResults, [step]: content };
    setCumulativeResults(newResults);
    await saveProgress({ cumulativeResults: newResults });
  };

  const handleSetFinalContent = async (content: string) => {
    setCurrentContent(content);
    setActiveTab("PREVIEW");
    await saveProgress({ currentContent: content });
  };

  const handleReset = async () => {
    const initialIdentity: IdentityData = {
      teacherName: "",
      schoolName: "",
      level: "SMA",
      subject: "",
      phase: "E",
      class: "10",
      semester: "Semester 1",
      duration: "2 x 45 Menit",
      effectiveWeeks: "",
      topic: "",
      topics: [""],
      model: "",
      studentHobbies: "",
      studentBackground: "",
      learningStyles: "",
      studentEnv: "",
      creationPlace: "",
      creationDate: "",
      creationMonth: "",
      creationYear: "",
      teacherNip: "",
      principalName: "",
      principalNip: "",
    };
    
    setIdentity(initialIdentity);
    setCumulativeResults({});
    setCurrentStep(1);
    setCurrentContent("");
    setActiveTab("WORKFLOW");
    setIsConfirmingReset(false);

    await saveProgress({
      identity: initialIdentity,
      cumulativeResults: {},
      currentStep: 1,
      currentContent: ""
    });
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <div className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <GraduationCap size={18} />
          </div>
          <span className="font-display font-bold text-slate-800">Guru AI</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut size={14} /> LOGOUT
          </button>
          <button 
            onClick={() => setShowIdentity(!showIdentity)}
            className="p-2 bg-slate-100 rounded-lg text-slate-600"
          >
            {showIdentity ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showIdentity && (
          <motion.aside 
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 h-[calc(100vh-60px)] md:h-screen overflow-y-auto custom-scrollbar md:sticky top-0 z-40 p-4 lg:p-6 flex flex-col no-print"
          >
            <div className="hidden md:flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} className="w-10 h-10 rounded-xl shadow-md" />
                ) : (
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <GraduationCap size={24} />
                  </div>
                )}
                <div className="overflow-hidden">
                  <h1 className="font-display font-bold text-lg text-slate-800 truncate">{user.displayName || "Guru AI"}</h1>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Role: {user.role}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 rounded-lg transition-colors"
                title="Keluar / Logout"
              >
                <LogOut size={14} />
              </button>
            </div>

            <div className="flex-1">
              <IdentityForm 
                data={identity} 
                onChange={(newId) => {
                  setIdentity(newId);
                  saveProgress({ identity: newId });
                }} 
              />

              <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex gap-3">
                <Info className="flex-shrink-0 text-emerald-600" size={18} />
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Lengkapi identitas di atas agar hasil output perangkat ajar Anda lebih akurat dan profesional.
                </p>
              </div>

              {user.role === "admin" && (
                <UserManagement />
              )}

              <div className="mt-4">
                {!isConfirmingReset ? (
                  <button
                    onClick={() => setIsConfirmingReset(true)}
                    className="w-full flex items-center gap-2 justify-center py-2.5 px-4 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-colors font-semibold text-sm"
                  >
                    <RotateCcw size={16} /> Mulai Baru
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-xl">
                    <p className="text-xs text-red-800 font-medium mb-3 text-center">Hapus semua data progres?</p>
                    <div className="flex gap-2">
                       <button
                        onClick={() => setIsConfirmingReset(false)}
                        className="flex-1 py-1.5 px-3 bg-white text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-xs"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleReset}
                        className="flex-1 py-1.5 px-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-xs"
                      >
                        Ya, Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 h-[calc(100vh-60px)] md:h-screen flex flex-col overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between no-print overflow-x-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("WORKFLOW")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "WORKFLOW" 
                  ? "bg-white text-emerald-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Zap size={16} /> Alur Kerja
            </button>
            <button
              onClick={() => setActiveTab("PREVIEW")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "PREVIEW" 
                  ? "bg-white text-emerald-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Eye size={16} /> Hasil Akhir
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setGenerationMode("PROMPT_STEP")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                generationMode === "PROMPT_STEP" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
              title="Manual Langkah demi Langkah (Salin Prompt ke ChatGPT/Gemini)"
            >
              📝 Opsi A: Langkah demi Langkah
            </button>
            <button
              onClick={() => setGenerationMode("PROMPT_MEGA")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                generationMode === "PROMPT_MEGA" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
              title="Satu Prompt Besar untuk semua komponen Modul Ajar"
            >
              🔥 Opsi B: Mega Prompt
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          <AnimatePresence mode="wait">
            {activeTab === "WORKFLOW" ? (
              <motion.div
                key="workflow"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mt-0.5">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">Tips Penggunaan</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      Gunakan <strong>Opsi A (Langkah demi Langkah)</strong> untuk menyalin instruksi AI (prompt) per bagian, atau <strong>Opsi B (Mega Prompt)</strong> untuk seluruh modul sekaligus. Salin instruksi ini dan jalankan melalui akun <a href="https://gemini.google.com" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-blue-900">Google Gemini</a> atau ChatGPT Anda secara gratis!
                    </p>
                  </div>
                </div>
                <WorkflowSteps
                  key={`workflow-steps-${generationMode}`}
                  identity={identity}
                  onUpdateResults={handleUpdateResults}
                  results={cumulativeResults}
                  onSetFinalContent={handleSetFinalContent}
                  currentStep={currentStep}
                  generationMode={generationMode}
                  onSetStep={(step) => {
                    setCurrentStep(step);
                    saveProgress({ currentStep: step });
                  }}
                  onChangeIdentity={(newId) => {
                    setIdentity(newId);
                    saveProgress({ identity: newId });
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-5xl mx-auto"
              >
                <Preview 
                  identity={identity} 
                  content={currentContent} 
                  onEdit={() => setActiveTab("WORKFLOW")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
