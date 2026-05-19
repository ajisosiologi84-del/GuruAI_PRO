import React, { useState, useEffect } from "react";
import { UserPlus, UserMinus, ShieldAlert, Edit2, Check, X, Info, Lock, User } from "lucide-react";
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase";
import { AppUser } from "./FirebaseProvider";
import firebaseConfig from "../../firebase-applet-config.json";

export function UserManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState("");

  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubscribeUsers = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      })) as AppUser[];
      setUsers(userList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "users");
      setLoading(false);
    });

    const logsQ = query(collection(db, "access_logs"), orderBy("loginTime", "desc"));
    const unsubscribeLogs = onSnapshot(logsQ, (snapshot) => {
      const logList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logList);
    }, (error) => {
      console.error("Gagal memuat log akses", error);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeLogs();
    };
  }, [isOpen]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;
    setIsAdding(true);
    setAddError("");

    const normalizedUsername = newUsername.toLowerCase().trim();
    const safeUsername = normalizedUsername.replace(/\s+/g, '').replace(/[^a-z0-9_.-]/g, '');
    
    if (!safeUsername) {
      setAddError("Karakter username tidak valid.");
      setIsAdding(false);
      return;
    }
    
    const userEmail = `${safeUsername}@guruai.user`;
    
    try {
      // Create user using Google Identity Toolkit REST API
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: userEmail,
          password: newPassword,
          returnSecureToken: false
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error && data.error.message === 'EMAIL_EXISTS') {
           throw new Error("auth/email-already-in-use");
        } else if (data.error && data.error.message === 'WEAK_PASSWORD') {
           throw new Error("auth/weak-password");
        }
        throw new Error(data.error?.message || "Gagal membuat user.");
      }

      const newUserUid = data.localId;

      // Create physical user document in firestore
      await setDoc(doc(db, "users", newUserUid), {
        uid: newUserUid,
        email: userEmail,
        displayName: normalizedUsername.toUpperCase(),
        role: "user",
        createdAt: serverTimestamp(),
      });

      setNewUsername("");
      setNewPassword("");
      alert(`User ${normalizedUsername} berhasil ditambahkan!`);
    } catch (err: any) {
      if (err.message === 'auth/email-already-in-use') {
        setAddError("Username ini sudah digunakan.");
      } else if (err.message === 'auth/weak-password') {
        setAddError("Password terlalu lemah (min 6 karakter).");
      } else if (err.code === 'permission-denied') {
        setAddError("Tidak ada izin untuk menambahkan user (Pastikan Anda Admin).");
      } else {
        console.error("Create User Error:", err);
        setAddError("Gagal menambahkan user. " + err.message);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editUsername) return;
    setIsEditing(true);
    setEditError("");

    try {
      if (editPassword) {
         setEditError("Demi keamanan dan limitasi sistem, fitur update password dinonaktifkan. Silakan Hapus akun dan buat ulang jika lupa password.");
         setIsEditing(false);
         return;
      }

      await setDoc(doc(db, "users", editingUser.uid), {
        displayName: editUsername.toUpperCase(),
      }, { merge: true });

      setEditingUser(null);
    } catch (err: any) {
      setEditError(`Gagal menyimpan perubahan: ${err.message || "Unknown error"}`);
    } finally {
      setIsEditing(false);
    }
  };

  const startEditUser = (u: AppUser) => {
    setEditingUser(u);
    setEditUsername(u.displayName || "");
    setEditPassword("");
    setEditError("");
  };

  const handleChangeRole = async (uid: string, currentRole: "admin" | "user") => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    
    // Safety: check if trying to demote the master admin in some way? 
    // In our case 'admin' user is special via email.
    
    const path = `users/${uid}`;
    try {
      await setDoc(doc(db, "users", uid), { role: newRole }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleDeleteUserRecord = async (uid: string) => {
    if (!confirm("Hapus pengguna ini? Profil mereka akan dihapus dan mereka tidak akan bisa login lagi ke sistem.")) return;
    
    try {
      // Just delete from Firestore. The Auth account remains but they have no role/profile.
      await deleteDoc(doc(db, "users", uid));
      alert("Berhasil! Profil pengguna telah dihapus dari sistem. Pengguna ini sudah tidak bisa lagi mengakses konten.\n\nCatatan Admin: Email tetap tercatat di Authentication Firebase Console, namun tidak memiliki hak akses lagi.");
    } catch (error: any) {
      console.error("Delete Error:", error);
      alert(`Gagal menghapus profil user: ${error.message}`);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 text-white border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors font-semibold text-sm shadow-md"
      >
        <ShieldAlert size={16} /> Panel Admin
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="font-bold text-xl tracking-tight text-slate-800">Manajemen Pengguna</h2>
              <p className="text-xs text-slate-500">Kelola akses dan peran pengguna Guru AI</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-200 text-slate-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Tambah Pengguna Baru</h3>
          <form onSubmit={handleCreateUser} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={14} />
              </div>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Username"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:border-emerald-500 outline-none transition-all"
                required
              />
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={14} />
              </div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:border-emerald-500 outline-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isAdding}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <UserPlus size={14} />
              {isAdding ? "Proses..." : "Tambah"}
            </button>
          </form>
          {addError && <p className="mt-2 text-[10px] text-red-500 font-medium">{addError}</p>}
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Memuat daftar pengguna...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daftar Pengguna Aktif</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map(u => (
                  <div key={u.uid} className="flex flex-col p-4 bg-slate-50 border border-slate-100 rounded-2xl transition-all hover:border-emerald-200 hover:shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${u.role === 'admin' ? 'bg-emerald-600' : 'bg-slate-400'}`}>
                          {u.displayName?.substring(0, 1) || "?"}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-slate-800 truncate">{u.displayName || "No Name"}</p>
                          <p className="text-[10px] text-slate-400 truncate">{u.email?.replace('@guruai.user', '').replace('@guruai.internal', '')}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        {u.role}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-auto pt-3 border-t border-slate-200/50">
                      <button 
                        onClick={() => startEditUser(u)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-[11px] font-bold transition-colors"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button 
                        onClick={() => handleChangeRole(u.uid, u.role)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                          u.role === 'admin' 
                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {u.role === 'admin' ? "Jadikan User" : "Jadikan Admin"}
                      </button>
                      <button 
                        onClick={() => handleDeleteUserRecord(u.uid)}
                        disabled={u.email === 'admin@guruai.internal'}
                        className="px-3 py-1.5 text-xs font-bold text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 rounded-lg transition-colors disabled:opacity-20 flex items-center gap-1"
                        title="Hapus Pengguna"
                      >
                        <UserMinus size={14} /> Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {users.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-400 text-sm italic">Belum ada pengguna lain yang terdaftar.</p>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Log Akses Pengguna</h3>
            <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
              {logs.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs italic">
                  Belum ada log akses tersedia.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/50 sticky top-0 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-2 w-1/3">Waktu (Server)</th>
                        <th className="px-4 py-2 w-1/3">Username</th>
                        <th className="px-4 py-2 w-1/3">Agent (Device)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.map((log, i) => (
                        <tr key={log.id || i} className="hover:bg-slate-100/50 transition-colors">
                          <td className="px-4 py-2 text-slate-600 font-mono text-[10px]">
                            {log.loginTime?.toDate ? log.loginTime.toDate().toLocaleString('id-ID') : 'Baru saja'}
                          </td>
                          <td className="px-4 py-2 font-bold text-emerald-700">
                            {log.username}
                          </td>
                          <td className="px-4 py-2 text-slate-400 truncate max-w-[150px]" title={log.userAgent}>
                            {log.userAgent}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-slate-800 text-white">
          <div className="flex items-start gap-4">
             <div className="w-8 h-8 bg-slate-700 text-emerald-400 rounded-full flex items-center justify-center flex-shrink-0">
               <ShieldAlert size={16} />
             </div>
             <div>
               <p className="text-xs font-medium leading-relaxed">
                 Hanya Admin utama yang dapat melihat panel ini. Password akun baru harus dibagikan ke pengguna secara manual. Password minimal 6 karakter.
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Edit Pengguna</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="space-y-1.5 opacity-70">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Username (Tidak dapat diubah)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User size={14} />
                  </div>
                  <input
                    type="text"
                    value={editUsername}
                    disabled
                    className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm outline-none cursor-not-allowed text-slate-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ganti Password (Opsional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={14} />
                  </div>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <p className="text-[9px] text-slate-500 font-bold leading-tight mt-1">
                  Biarkan kosong jika tidak ingin mengubah password.
                </p>
              </div>
              {editError && <p className="text-[10px] text-red-500 font-medium bg-red-50 p-2 rounded">{editError}</p>}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-2.5 bg-slate-100 font-bold text-xs text-slate-700 hover:bg-slate-200 rounded-xl">Batal</button>
                <button type="submit" disabled={isEditing} className="flex-1 py-2.5 bg-emerald-600 font-bold text-xs text-white hover:bg-emerald-700 rounded-xl flex items-center justify-center gap-2">
                  {isEditing ? "Menyimpan..." : "Simpan"} <Check size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
