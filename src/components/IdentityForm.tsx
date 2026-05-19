import React from "react";
import { User, School, BookOpen, GraduationCap, Calendar, Clock, Wand2 } from "lucide-react";

export interface IdentityData {
  teacherName: string;
  schoolName: string;
  level: string;
  subject: string;
  phase: string;
  class: string;
  semester: string;
  duration: string;
  effectiveWeeks: string;
  topic: string;
  topics?: string[];
  model: string;
  studentHobbies: string;
  studentBackground: string;
  learningStyles: string;
  studentEnv: string;
  creationPlace: string;
  creationDate: string;
  creationMonth: string;
  creationYear: string;
  teacherNip: string;
  principalName: string;
  principalNip: string;
}

interface IdentityFormProps {
  data: IdentityData;
  onChange: (data: IdentityData) => void;
}

const CheckboxInput = ({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (e: any) => void;
}) => {
  const items = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

  const handleCheckboxChange = (opt: string, checked: boolean) => {
    let newItems = [...items];
    if (checked) {
      if (!newItems.includes(opt)) newItems.push(opt);
    } else {
      newItems = newItems.filter(item => item !== opt);
    }
    onChange({ target: { name, value: newItems.join(', ') } });
  };

  const [customValue, setCustomValue] = React.useState('');
  
  const handleAddCustom = () => {
    if (customValue.trim() && !items.includes(customValue.trim())) {
      onChange({ target: { name, value: [...items, customValue.trim()].join(', ') } });
      setCustomValue('');
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="space-y-1.5 border border-gray-200 rounded-lg p-3 bg-gray-50">
        <div className="flex flex-col gap-2">
          {options.map((opt, i) => (
            <label key={i} className="flex items-start gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={items.includes(opt)}
                onChange={(e) => handleCheckboxChange(opt, e.target.checked)}
                className="mt-1 flex-shrink-0 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs text-gray-700 group-hover:text-gray-900 leading-tight">{opt}</span>
            </label>
          ))}
        </div>
        
        {/* Render custom items that are not in the predefined options */}
        {items.filter(item => !options.includes(item)).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-200">
            {items.filter(item => !options.includes(item)).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md text-xs font-medium">
                <span>{item}</span>
                <button 
                  type="button" 
                  onClick={() => handleCheckboxChange(item, false)} 
                  className="text-emerald-600 hover:text-emerald-900 ml-1 rounded-full p-0.5 hover:bg-emerald-200 font-bold"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200">
          <input 
            type="text" 
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustom();
              }
            }}
            placeholder={`Tambah ${label.toLowerCase()} lainnya...`}
            className="flex-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs"
          />
          <button 
            type="button" 
            onClick={handleAddCustom}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
          >
            Tambah
          </button>
        </div>
      </div>
    </div>
  );
};

export const IdentityForm: React.FC<IdentityFormProps> = ({ data, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
          <GraduationCap size={20} />
        </div>
        <h3 className="text-lg font-semibold">Identitas & Profil Murid</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Identitas Dasar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User size={14} className="text-gray-400" /> Nama Guru
            </label>
            <input type="text" name="teacherName" value={data.teacherName} onChange={handleChange} placeholder="Nama Guru" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <School size={14} className="text-gray-400" /> Nama Sekolah
            </label>
            <input type="text" name="schoolName" value={data.schoolName} onChange={handleChange} placeholder="Nama Sekolah" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Jenjang</label>
            <select name="level" value={data.level} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
              <option value="SMK">SMK</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Mapel</label>
            <input type="text" name="subject" value={data.subject} onChange={handleChange} placeholder="Sosiologi" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Fase / Kelas</label>
            <div className="flex gap-2">
              <select name="phase" value={data.phase} onChange={handleChange} className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="E">E</option><option value="F">F</option>
              </select>
              <select name="class" value={data.class} onChange={handleChange} className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <option value="" disabled>Kelas</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                  <option key={num} value={num.toString()}>{num}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock size={14} className="text-gray-400" /> Alokasi Waktu
            </label>
            <input type="text" name="duration" value={data.duration} onChange={handleChange} placeholder="Misal: 2 JP" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" /> Minggu Efektif
            </label>
            <input type="text" name="effectiveWeeks" value={data.effectiveWeeks || ''} onChange={handleChange} placeholder="Misal: 36 Minggu/Tahun" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-sm font-medium text-gray-700">Model Pembelajaran</label>
            <input type="text" name="model" list="model-options" value={data.model} onChange={handleChange} placeholder="Misal: PjBL" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            <datalist id="model-options">
              <option value="Problem Based Learning (PBL)" />
              <option value="Project Based Learning (PjBL)" />
              <option value="Inquiry Learning" />
              <option value="Discovery Learning" />
              <option value="Cooperative Learning" />
              <option value="Teaching at the Right Level (TaRL)" />
              <option value="Berdiferensiasi" />
              <option value="Flipped Classroom" />
              <option value="Blended Learning" />
            </datalist>
          </div>
        </div>

        <div className="space-y-4 border-t pt-4 mt-4">
          <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
            <User size={16} /> Data Profil Murid
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CheckboxInput 
              label="Hobi/Minat"
              name="studentHobbies"
              value={data.studentHobbies}
              onChange={handleChange}
              options={[
                "Olahraga (Sepak Bola, Basket, dll)",
                "Seni (Musik, Tari, Melukis)",
                "Teknologi & Game",
                "Membaca & Menulis",
                "Sains & Eksperimen"
              ]}
            />
            <CheckboxInput 
              label="Gaya Belajar"
              name="learningStyles"
              value={data.learningStyles}
              onChange={handleChange}
              options={[
                "Visual (Melihat gambar, grafik, video)",
                "Auditori (Mendengar penjelasan, diskusi)",
                "Kinestetik (Praktik langsung, bergerak)",
                "Membaca/Menulis (Mencatat, membaca teks)"
              ]}
            />
            <CheckboxInput 
              label="Latar Belakang"
              name="studentBackground"
              value={data.studentBackground}
              onChange={handleChange}
              options={[
                "Keluarga Petani/Pekebun",
                "Keluarga Nelayan/Pesisir",
                "Keluarga Pekerja Kantoran/Pabrik",
                "Keluarga Pedagang/Wiraswasta",
                "Latar Belakang Campuran"
              ]}
            />
            <CheckboxInput 
              label="Lingkungan"
              name="studentEnv"
              value={data.studentEnv}
              onChange={handleChange}
              options={[
                "Perkotaan (Urban)",
                "Pedesaan (Rural)",
                "Pesisir Pantai",
                "Pegunungan/Dataran Tinggi",
                "Kawasan Industri"
              ]}
            />
          </div>
        </div>

        {/* Administrasi & Tanda Tangan */}
        <div className="space-y-4 border-t pt-4">
          <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Administrasi & Tanda Tangan</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                 Tempat Pembuatan
              </label>
              <input type="text" name="creationPlace" value={data.creationPlace} onChange={handleChange} placeholder="Contoh: Jakarta" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-sm font-medium text-gray-700">Tanggal</label>
              <input type="text" name="creationDate" value={data.creationDate || ""} onChange={handleChange} placeholder="17" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-sm font-medium text-gray-700">Bulan</label>
              <input type="text" name="creationMonth" value={data.creationMonth || ""} onChange={handleChange} placeholder="Juli" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-sm font-medium text-gray-700">Tahun</label>
              <input type="text" name="creationYear" value={data.creationYear || ""} onChange={handleChange} placeholder="2025" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">NIP Guru</label>
              <input type="text" name="teacherNip" value={data.teacherNip} onChange={handleChange} placeholder="NIP Guru" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Nama Kepala Sekolah</label>
              <input type="text" name="principalName" value={data.principalName} onChange={handleChange} placeholder="Nama Kepala Sekolah" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">NIP Kepala Sekolah</label>
              <input type="text" name="principalNip" value={data.principalNip} onChange={handleChange} placeholder="NIP Kepala Sekolah" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
