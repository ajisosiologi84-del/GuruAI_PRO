const formatRule = "\n\n**PENTING**: Format hasil ini agar sangat rapi, tertata dengan baik, menggunakan Markdown yang benar tanpa dimasukkan ke dalam blok kode (code block), agar siap digunakan, langsung disalin ke Google Docs, atau diekspor ke PDF.";

export const PROMPTS = {
  // STEP 1: CP -> TP
  STEP_1_CP_TO_TP: (identity: any, cpText: string) => `
Sebagai Pakar Kurikulum Merdeka (Update BSKAP Kementerian Pendidikan Dasar dan Menengah Nomor 046/H/KR/2025), analisis Capaian Pembelajaran (CP) berikut dan turunkan menjadi TUJUAN PEMBELAJARAN (TP) yang sangat detail dan sistematis.

IDENTITAS PERANGKAT:
Mata Pelajaran: ${identity.subject}
Fase/Kelas: ${identity.phase}/${identity.class}
Jenjang: ${identity.level}
Alokasi Waktu per Pertemuan: ${identity.duration}
Jumlah Minggu Efektif (1 Tahun / 2 Semester): ${identity.effectiveWeeks || "Silakan tentukan sendiri jika tidak disebutkan"}

SUMBER CP ASLI: 
${cpText}

TUGAS ANDA:
1. BEDAH KOMPETENSI: Identifikasi kata kerja operasional (KKO) yang mencerminkan keterampilan/kemampuan yang harus didemonstrasikan.
2. BEDAH MATERI: Identifikasi konten, konsep utama, dan lingkup materi yang perlu dipahami.
3. RUMUSKAN TP SMART:
   - Specific: Jelas bagi murid dan guru.
   - Measurable: Dapat diukur melalui asesmen nyata.
   - Achievable: Sesuai dengan perkembangan fase ${identity.phase}.
   - Relevant: Mendukung pencapaian kompetensi dalam CP.
   - Time-bound: Dapat dicapai dalam alokasi waktu fase tersebut.
4. ANALISIS ALOKASI WAKTU: Hitung dengan mempertimbangkan "Jumlah Minggu Efektif" dan "Alokasi Waktu per Pertemuan" untuk membagi keseluruhan TP menjadi JP (Jam Pelajaran) yang masuk akal selama 1 tahun atau 2 semester.
5. STRUKTUR TP: Setiap TP wajib diawali dengan Kata Kerja Kompetensi (Contoh: "Menganalisis...", "Mempraktikkan...", "Mengevaluasi...").

FORMAT OUTPUT (WAJIB TABEL):
### 📋 Analisis Pemetaan Tujuan Pembelajaran (TP) - Kurikulum 2025
Sajikan hasil analisis dalam format tabel berikut:

| Elemen CP | Kompetensi (KKO) | Lingkup Materi | Rumusan Tujuan Pembelajaran (TP) | Alokasi Waktu (JP/Minggu) |
| :--- | :--- | :--- | :--- | :--- |
| [Sebutkan Elemen] | [Daftar Kompetensi] | [Konten Inti] | [Satu kalimat TP yang utuh & SMART] | [Jam Pelajaran] |

### 💡 Catatan Alokasi Waktu & Kedalaman Materi
Berikan penjelasan singkat mengenai tingkat kedalaman kognitif (sesuai Bloom/Marzano) yang disasar agar selaras dengan prinsip Pembelajaran Mendalam (Deep Learning), serta jelaskan bagaimana Anda mendistribusikan waktu berdasarkan ${identity.effectiveWeeks || "jumlah minggu efektif"} tersebut ke dalam setiap TP.

### 🎯 Daftar Tujuan Pembelajaran (TP) Siap Salin
Tuliskan HANYA daftar Rumusan Tujuan Pembelajaran (TP) secara berurutan dan terpisah tanpa tabel agar mudah disalin untuk Langkah 2 (ATP). Tambahkan keterangan Alokasi Waktu di akhir kalimat.
Contoh Format:
1. [Teks TP 1] - [Alokasi Waktu]
2. [Teks TP 2] - [Alokasi Waktu]
3. [Teks TP 3] - [Alokasi Waktu]${formatRule}`,

  // STEP 2: TP -> ATP
  STEP_2_ATP: (identity: any) => `
Buatlah Alur Tujuan Pembelajaran (ATP) / Indikator Ketercapaian Tujuan Pembelajaran yang terpadu dan kontinu berdasarkan sekumpulan Tujuan Pembelajaran (TP) berikut:
${(identity.topics || [identity.topic]).map((t: string, i: number) => `TP ${i+1}:\n${t}`).join("\n\n")}

Ketentuan:
1. Alokasi waktu disesuaikan dengan Fase ${identity.phase}, Kelas ${identity.class} (sebagai acuan rentang waktu).
2. Urutkan seluruh kumpulan TP tersebut menjadi satu Alur Tujuan Pembelajaran (ATP) yang logis, kemudian jabarkan setiap ATP menjadi indikator ketercapaian secara runut dalam SATU format TABEL yang sama.
3. Gunakan metode pengurutan Konkret ke Abstrak atau Prosedural yang logis untuk mencapai rangkaian TP tersebut sebagai satu kesatuan.
4. Sesuaikan rancangan alur ini dengan karakteristik dan tingkat pemahaman murid di kelas tersebut.
Catatan Karakteristik Murid: ${identity.studentBackground}.${formatRule}`,

  // STEP 3: Analisis Profil Murid
  STEP_3_PROFIL_MURID: (identity: any) => `
Analisis profil murid berikut untuk mendukung framework Pembelajaran Mendalam (Deep Learning):
Hobi/Minat: ${identity.studentHobbies}
Latar Belakang: ${identity.studentBackground}
Cara Belajar: ${identity.learningStyles}
Lingkungan: ${identity.studentEnv}

Berikan rekomendasi spesifik bagaimana latar belakang ini dapat diintegrasikan ke dalam Tujuan Pembelajaran (TP) berikut: "${identity.topic}" agar pembelajaran menjadi lebih Meaningful dan Joyful.${formatRule}`,

  // STEP 4: Kerangka Pembelajaran Mendalam
  STEP_4_KERANGKA: (identity: any, tp: string) => `
Tentukan 4 pilar Kerangka Pembelajaran Mendalam untuk TP: ${tp}.
1. Praktik Pedagogis: Model/Metode (PjBL, Inkuiri, dll).
2. Kemitraan Pembelajaran: Kolaborasi (Orang tua, ahli, komunitas).
3. Lingkungan Pembelajaran: Integrasi Fisik & Virtual.
4. Pemanfaatan Digital: Tools inovatif.

Definisikan secara rinci sesuai kondisi murid: ${identity.studentHobbies}.${formatRule}`,

  // STEP 5: Pengalaman Belajar (Mindful, Meaningful, Joyful)
  STEP_5_PENGALAMAN: (identity: any, tp: string) => `
Rancang tahapan Pengalaman Belajar (3 Tahap) untuk TP: ${tp}.
1. Memahami (Mindful): Strategi awal dan stimulus.
2. Mengaplikasikan (Meaningful, Joyful): Inti kegiatan dan proyek.
3. Merefleksikan (Mindful, Meaningful): Penutup dan refleksi.

Wajib meningkatkan DPL: Kreativitas, Kolaborasi, Penalaran Kritis, Komunikasi. Sertakan durasi waktu.${formatRule}`,

  // STEP 6: Asesmen Awal (PG)
  STEP_6_ASESMEN_AWAL: (identity: any, tp: string) => `
Buatlah soal-soal Pilihan Ganda (PG) untuk Asesmen Awal TP: ${tp}.
- 5 Soal Non-Kognitif (Minat, Latar Belakang, Sarana).
- 5 Soal Kognitif (Penguasaan materi awal).
Sesuaikan bahasa dengan usia murid Kelas ${identity.class}.${formatRule}`,

  // STEP 7: Pembelajaran Diferensiasi
  STEP_7_DIFERENSIASI: (identity: any, tp: string) => `
Rancang rencana Pembelajaran Diferensiasi untuk TP: ${tp}.
Berikan instruksi berbeda untuk 3 kelompok:
- RENDAH: Dukungan tambahan/Scaffolding.
- SEDANG: Tugas standar.
- TINGGI: Pengayaan/Tantangan lebih.
Sesuaikan dengan isu nyata di kelas (Misal: bullying atau latar belakang ekonomi).${formatRule}`,

  // STEP 8: Asesmen Formatif & Sumatif
  STEP_8_ASESMEN_PROSES: (identity: any, tp: string) => `
Tuliskan teknik dan instrumen penilaian untuk:
1. Asesmen Formatif (Proses - Assessment as/for Learning).
2. Asesmen Sumatif (Akhir - Assessment of Learning).
Berikan 10 ide kegiatan asesmen yang inovatif dan terpadu untuk TP: ${tp}.${formatRule}`,

  // STEP 9: Rubrik Penilaian Terukur
  STEP_9_RUBRIK: (identity: any, tp: string) => `
Tentukan Rubrik Penilaian (format TABEL) untuk TP: ${tp}.
Gunakan 4 tingkat: Baru Memulai, Berkembang, Cakap, Sangat Berkembang.
Rubrik harus Menilai pembelajaran mendasar dan mendalam, menggunakan bahasa deskriptif positif (Bukan menghakimi).${formatRule}`,

  // STEP 10: Finalisasi Modul Ajar (Lengkap) - PROMPT_STEP mode
  STEP_10_COMBINED_PROMPTS: (identity: any, tp: string) => `
Sebagai Pakar Kurikulum Merdeka, tolong buatkan Modul Ajar (RPP) yang sangat lengkap, rapi, dan detail ke dalam SATU DOKUMEN MARKDOWN yang utuh, yang menggabungkan seluruh komponen berikut ini secara berurutan untuk Tujuan Pembelajaran (TP) berikut: "${tp}"

Tolong ikuti seluruh instruksi secara berurutan:

**1. Analisis Profil Murid**
Analisis profil murid berikut untuk mendukung framework Pembelajaran Mendalam (Deep Learning):
Hobi/Minat: ${identity.studentHobbies}
Latar Belakang: ${identity.studentBackground}
Cara Belajar: ${identity.learningStyles}
Lingkungan: ${identity.studentEnv}
Berikan rekomendasi spesifik bagaimana latar belakang ini dapat diintegrasikan ke dalam Tujuan Pembelajaran (TP) di atas agar pembelajaran menjadi lebih Meaningful dan Joyful.

**2. Kerangka Pembelajaran Mendalam**
Tentukan 4 pilar Kerangka Pembelajaran Mendalam untuk TP di atas:
1. Praktik Pedagogis: Model/Metode (PjBL, Inkuiri, dll).
2. Kemitraan Pembelajaran: Kolaborasi (Orang tua, ahli, komunitas).
3. Lingkungan Pembelajaran: Integrasi Fisik & Virtual.
4. Pemanfaatan Digital: Tools inovatif.
Definisikan secara rinci sesuai kondisi murid: ${identity.studentHobbies}.

**3. Pengalaman Belajar**
Rancang tahapan Pengalaman Belajar (3 Tahap) untuk TP di atas:
1. Memahami (Mindful): Strategi awal dan stimulus.
2. Mengaplikasikan (Meaningful, Joyful): Inti kegiatan dan proyek.
3. Merefleksikan (Mindful, Meaningful): Penutup dan refleksi.
Wajib meningkatkan DPL: Kreativitas, Kolaborasi, Penalaran Kritis, Komunikasi. Sertakan durasi waktu.

**4. Asesmen Awal**
Buatlah soal-soal Pilihan Ganda (PG) untuk Asesmen Awal TP di atas:
- 5 Soal Non-Kognitif (Minat, Latar Belakang, Sarana).
- 5 Soal Kognitif (Penguasaan materi awal).
Sesuaikan bahasa dengan usia murid Kelas ${identity.class}.

**5. Pembelajaran Diferensiasi**
Rancang rencana Pembelajaran Diferensiasi untuk TP di atas:
Berikan instruksi berbeda untuk 3 kelompok:
- RENDAH: Dukungan tambahan/Scaffolding.
- SEDANG: Tugas standar.
- TINGGI: Pengayaan/Tantangan lebih.
Sesuaikan dengan isu nyata di kelas (Misal: bullying atau latar belakang ekonomi).

**6. Asesmen Formatif & Sumatif**
Tuliskan teknik dan instrumen penilaian untuk:
1. Asesmen Formatif (Proses - Assessment as/for Learning).
2. Asesmen Sumatif (Akhir - Assessment of Learning).
Berikan 10 ide kegiatan asesmen yang inovatif dan terpadu untuk TP di atas.

**7. Rubrik Penilaian**
Tentukan Rubrik Penilaian (format TABEL) untuk TP di atas.
Gunakan 4 tingkat: Baru Memulai, Berkembang, Cakap, Sangat Berkembang.
Rubrik harus Menilai pembelajaran mendasar dan mendalam, menggunakan bahasa deskriptif positif (Bukan menghakimi).

Susunlah dokumen Modul Ajar ini ke dalam format Markdown yang terstruktur sempurna, elegan, rapi, dan siap cetak/ekspor sebagai Modul Ajar Final.${formatRule}
`,

  STEP_10_FINAL: (identity: any, cumulativeResults: string) => `
Tugas Anda adalah merangkai dan menyusun secara utuh semua hasil pekerjaan dari Langkah 3 hingga Langkah 9 menjadi satu dokumen MODUL AJAR (RPP) yang SANGAT LENGKAP dan DETAIL.

PENTING:
- JANGAN meringkas atau memotong poin-poin penting dari setiap langkah.
- SELURUH konten dari Langkah 3, 4, 5, 6, 7, 8, dan 9 HARUS DIMASUKKAN ke dalam modul ajar ini secara komprehensif.
- Gunakan struktur Modul Ajar Kurikulum Merdeka yang rapi.
- Tambahkan sub-bab atau heading yang jelas untuk setiap bagian agar mudah dibaca saat didownload.

KONTEKS TERKUMPUL (LANGKAH 3-9):
${cumulativeResults}

Sajikan dalam format Markdown yang terstruktur sempurna, elegan, dan siap cetak/ekspor sebagai Modul Ajar Final.${formatRule}`,

  GET_CP_CONTENT: (identity: any) => `
Berikan teks asli Capaian Pembelajaran (CP) terbaru BSKAP No. 046/H/KR/2025 untuk:
Mapel: ${identity.subject}
Fase: ${identity.phase}
Jenjang: ${identity.level}
Anda Wajib Mencari informasi dari "Capaian Pembelajaran (CP) pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah berdasarkan Keputusan Kepala Badan Standar, Kurikulum, dan Asesmen Pendidikan Kementerian Pendidikan Dasar dan Menengah Nomor 046/H/KR/2025" (Anda juga bisa merujuk: https://drive.google.com/drive/folders/1-gAJjnLDKdEsMCOyZ6ZtPlqLwHqKU5T9?hl=ID).
Hanya berikan teks CP secara lengkap tanpa tambahan penjelasan apa pun.${formatRule}`,
  MEGA_PROMPT: (identity: any, cpText: string) => `
Sebagai Pakar Kurikulum Merdeka (Update BSKAP Kementerian Pendidikan Dasar dan Menengah Nomor 046/H/KR/2025), bantu saya merancang SATU MODUL AJAR (Pembelajaran Mendalam / Deep Learning) secara LENGKAP untuk satu rangkaian pembelajaran. Saya akan memberikan data konteks dan Anda harus menghasilkan seluruh komponen Modul Ajar mulai dari Tujuan Pembelajaran hingga Rubrik Penilaian.

IDENTITAS PERANGKAT:
Mata Pelajaran: ${identity.subject || "-"}
Fase/Kelas: ${identity.phase || "-"} / ${identity.class || "-"}
Jenjang: ${identity.level || "-"}
Nama Guru: ${identity.teacherName || "-"}
Sekolah: ${identity.schoolName || "-"}
Alokasi Waktu: ${identity.duration || "-"}
Jumlah Minggu Efektif: ${identity.effectiveWeeks || "Sesuai Standar"}
Model Pembelajaran: ${identity.model || "Tentukan model paling mendalam"}

PROFIL MURID:
Hobi/Minat Dominan: ${identity.studentHobbies || "-"}
Latar Belakang: ${identity.studentBackground || "-"}
Gaya Belajar Dominan: ${identity.learningStyles || "-"}
Lingkungan/Fasilitas: ${identity.studentEnv || "-"}

SUMBER CAPAIAN PEMBELAJARAN (CP): 
${cpText}

TUGAS ANDA ADALAH MEMBUAT MODUL AJAR LENGKAP DENGAN STRUKTUR BERIKUT:

## A. INFORMASI UMUM (Gunakan Identitas Perangkat di atas)
## B. TUJUAN PEMBELAJARAN (Analisis CP)
Tuliskan turunan Tujuan Pembelajaran (TP) yang SMART dari CP di atas.

## C. KOMPONEN INTI
1. **Analisis Profil Murid**: Jelaskan implikasi profil murid di atas terhadap rancangan pembelajaran.
2. **Alur & Kerangka Pembelajaran**: Jelaskan alur aktivitas (Pembukaan, Inti, Penutup) berdasarkan Model Pembelajaran yang dipilih. Lengkapi dengan detail alokasi waktu.
3. **Pengalaman Belajar (Deep Learning)**: Jabarkan aktivitas yang terpusat pada siswa, membangun inkuiri, pemecahan masalah, atau proyek kolaboratif bermakna yang relevan dengan minat mereka.
4. **Asesmen Awal (Diagnostic)**: Buat 3 pertanyaan reflektif/kognitif singkat sebelum materi dimulai.
5. **Pembelajaran Diferensiasi**: Jelaskan diferensiasi Konten, Proses, dan Produk berdasarkan Gaya Belajar / Minat dominan kelas ini.
6. **Asesmen Formatif & Sumatif**: Jelaskan cara melakukan penilaian observasi/proses dan penilaian akhir pencapaian TP.
7. **Rubrik Penilaian Terperinci**: Buat satu rubrik format tabel (Mulai Berkembang, Layak, Cakap, Mahir) untuk menilai produk/kinerja akhir.

Tuliskan output dalam format Markdown yang rapi, terstruktur, profesional, dan langsung bisa digunakan sebagai Modul Ajar utuh.${formatRule}
  `,
};
