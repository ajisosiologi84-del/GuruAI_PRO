import fs from "fs";

async function run() {
  const prompt = "Berikan teks asli Capaian Pembelajaran (CP) terbaru BSKAP No. 046/H/KR/2025 untuk: Mapel: Sosiologi Fase: F Jenjang: SMA";
  const res = await fetch("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  console.log(await res.text());
}
run();
