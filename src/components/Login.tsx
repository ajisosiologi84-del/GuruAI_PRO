import React, { useState } from "react";
import { LogIn, Lock, User, GraduationCap } from "lucide-react";
import { auth, db } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export function Login() {
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoggingIn(true);
    setError("");
    
    // Internal mapping for Firebase Auth
    let userEmail = "";
    let userPassword = password;

    if (username === "admin") {
      if (password !== "adminpaijo") {
        setError("Password Admin salah!");
        setIsLoggingIn(false);
        return;
      }
      userEmail = "admin@guruai.internal";
    } else {
      // Normal users use username@guruai.user
      const safeUsername = username.toLowerCase().trim().replace(/\s+/g, '').replace(/[^a-z0-9_.-]/g, '');
      if (!safeUsername) {
         setError("Format username tidak valid.");
         setIsLoggingIn(false);
         return;
      }
      userEmail = `${safeUsername}@guruai.user`;
    }
    
    try {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
        
        // Log access
        try {
          await addDoc(collection(db, "access_logs"), {
            userId: userCredential.user.uid,
            username: username.toLowerCase().trim(),
            loginTime: serverTimestamp(),
            userAgent: navigator.userAgent
          });
        } catch (logErr) {
          console.error("Gagal mencatat log login", logErr);
        }
        
      } catch (signInErr: any) {
        // If it's the very first time the master admin logs in, create the account
        if (username === "admin" && (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential')) {
           await createUserWithEmailAndPassword(auth, userEmail, userPassword);
        } else if (signInErr.code === 'auth/operation-not-allowed') {
          setError("Metode Login Username/Password belum diaktifkan di Firebase Console. Silakan hubungi Admin untuk mengaktifkan provider 'Email/Password' di Authentication settings.");
        } else if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          setError("Username atau password salah!");
        } else {
          throw signInErr;
        }
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError("Metode Login belum diaktifkan (Email/Password Provider). Silakan aktifkan di Firebase Console.");
      } else {
        setError("Gagal masuk. Periksa kembali koneksi internet atau hubungi Admin.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 text-center bg-emerald-50 border-b border-emerald-100">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-4">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Guru AI</h1>
          <p className="text-emerald-700 font-medium text-sm mt-1">Sistem Perancangan Modul Ajar</p>
        </div>

        <div className="p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-center space-y-1 mb-6">
              <h2 className="text-lg font-bold text-slate-800">Silakan Masuk</h2>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                <a href="https://lynk.id/ajisosiologi" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors">
                  Gunakan Akun dari Admin
                </a>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-medium border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg shadow-emerald-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoggingIn ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <LogIn size={18} />}
              {isLoggingIn ? "Memproses..." : "Masuk Aplikasi"}
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-400 font-mono uppercase tracking-[0.2em] pt-4 border-t border-slate-100">
            <a href="https://lynk.id/ajisosiologi" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors">
              Created: @ajisosiologi 2026
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
