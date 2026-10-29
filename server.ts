import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API route for AI reflection generation via Gemini
app.post('/api/generate-reflection', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
        useFallback: true,
      });
    }

    const {
      materiPokok,
      tujuanPembelajaran,
      metodePembelajaran,
      kelas,
      durasiMenit,
      pemahamanKonsep,
      keaktifanSiswa,
      ketercapaianTP,
      antusiasme,
    } = req.body;

    if (!materiPokok) {
      return res.status(400).json({ error: 'Materi pokok wajib diisi.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Anda adalah pakar kurikulum merdeka dan supervisi pedagogis guru di Indonesia.
Buatkan narasi jurnal refleksi mengajar yang mendalam, realistis, dan berbobot berdasarkan data sesi berikut:
- Materi Pokok / Topik: ${materiPokok}
- Tujuan Pembelajaran (TP): ${tujuanPembelajaran || 'Penguasaan konsep materi'}
- Metode Pembelajaran: ${metodePembelajaran}
- Kelas: ${kelas || 'Fase'}
- Durasi: ${durasiMenit || 90} menit
- Pemahaman Konsep Siswa: ${pemahamanKonsep}%
- Keaktifan Siswa: ${keaktifanSiswa}%
- Ketercapaian TP: ${ketercapaianTP}%
- Antusiasme Siswa: ${antusiasme || 'Tinggi'}

Instruksi:
1. Sesuaikan narasi dengan persentase pemahaman (${pemahamanKonsep}%) dan keaktifan (${keaktifanSiswa}%).
2. Jika ada istilah teknis atau istilah industri yang relevan dengan topik "${materiPokok}", sertakan secara kontekstual.
3. Rencana tindak lanjut harus operasional dan terukur untuk pertemuan berikutnya.

Berikan respon HANYA berupa JSON valid (tanpa bungkus markdown \`\`\`json) dengan format:
{
  "catatanAnekdot": "Deskripsi peristiwa nyata di kelas saat siswa mempelajari ${materiPokok}...",
  "titikKesulitan": "Miskonsepsi atau bagian materi yang belum sepenuhnya dipahami siswa...",
  "responsPositif": "Respons antusias atau pemahaman siswa yang menonjol...",
  "keberhasilanMetode": "Mengapa ${metodePembelajaran} efektif untuk materi ini...",
  "kendalaMetode": "Kendala teknis atau manajemen waktu dalam pelaksanaan metode...",
  "tindakLanjut": "Aksi konkrit untuk sesi berikutnya..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text?.trim() || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error('Gagal mengurai respons AI');
      }
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Gemini generation error:', error);
    return res.status(500).json({
      error: error.message || 'Gagal menghasilkan narasi refleksi AI',
      useFallback: true,
    });
  }
});

// Setup Vite dev server or serve production build
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`RefleksiGuru server running at http://localhost:${port}`);
  });
}

startServer();
