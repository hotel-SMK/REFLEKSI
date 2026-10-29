import { ReflectionEntry, TrendMetricSummary, TeachingMethod } from '../types/journal';

export interface MethodStat {
  metode: TeachingMethod;
  jumlahSesi: number;
  rataPemahaman: number;
  rataKeaktifan: number;
  rataKetercapaian: number;
  skorKomposit: number;
}

export function analyzeStudentTrends(entries: ReflectionEntry[]): {
  summary: TrendMetricSummary;
  methodStats: MethodStat[];
  chronologicalEntries: ReflectionEntry[];
  anecdoteHighlights: Array<{
    tanggal: string;
    kelas: string;
    materi: string;
    catatan: string;
    antusiasme: string;
    metode: string;
  }>;
} {
  if (entries.length === 0) {
    return {
      summary: {
        rataRataPemahaman: 0,
        rataRataKeaktifan: 0,
        rataRataKetercapaian: 0,
        trenPemahamanArah: 'stabil',
        deltaPemahaman: 0,
        metodeTerbaik: { metode: 'Belum ada data', skorRataRata: 0, jumlahSesi: 0 },
        totalPertemuan: 0,
        tingkatKemandirianSiswa: 'Belum Terdata',
        rekomendasiOtomatis: ['Mulai tambahkan refleksi mengajar pertama untuk mengaktifkan analisis tren otomatis.'],
        anomaliCatatan: [],
      },
      methodStats: [],
      chronologicalEntries: [],
      anecdoteHighlights: [],
    };
  }

  // Urutkan berdasarkan tanggal & pertemuan
  const sorted = [...entries].sort((a, b) => {
    const dateComp = new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
    if (dateComp !== 0) return dateComp;
    return a.pertemuanKe - b.pertemuanKe;
  });

  const total = sorted.length;
  const sumPemahaman = sorted.reduce((acc, curr) => acc + curr.pemahamanKonsep, 0);
  const sumKeaktifan = sorted.reduce((acc, curr) => acc + curr.keaktifanSiswa, 0);
  const sumKetercapaian = sorted.reduce((acc, curr) => acc + curr.ketercapaianTP, 0);

  const avgPemahaman = Math.round((sumPemahaman / total) * 10) / 10;
  const avgKeaktifan = Math.round((sumKeaktifan / total) * 10) / 10;
  const avgKetercapaian = Math.round((sumKetercapaian / total) * 10) / 10;

  // Analisis Tren (Bandingkan 40% sesi awal vs 40% sesi akhir jika total >= 2)
  let deltaPemahaman = 0;
  let trenArah: 'naik' | 'turun' | 'stabil' = 'stabil';

  if (total >= 2) {
    const splitCount = Math.max(1, Math.floor(total * 0.4));
    const earlySlice = sorted.slice(0, splitCount);
    const lateSlice = sorted.slice(total - splitCount);

    const earlyAvg = earlySlice.reduce((acc, c) => acc + c.pemahamanKonsep, 0) / earlySlice.length;
    const lateAvg = lateSlice.reduce((acc, c) => acc + c.pemahamanKonsep, 0) / lateSlice.length;

    deltaPemahaman = Math.round((lateAvg - earlyAvg) * 10) / 10;
    if (deltaPemahaman > 2) {
      trenArah = 'naik';
    } else if (deltaPemahaman < -2) {
      trenArah = 'turun';
    } else {
      trenArah = 'stabil';
    }
  }

  // Analisis Efektivitas per Metode
  const methodMap = new Map<TeachingMethod, {
    count: number;
    totalPemahaman: number;
    totalKeaktifan: number;
    totalKetercapaian: number;
  }>();

  for (const entry of sorted) {
    const cur = methodMap.get(entry.metodePembelajaran) || {
      count: 0,
      totalPemahaman: 0,
      totalKeaktifan: 0,
      totalKetercapaian: 0,
    };
    cur.count += 1;
    cur.totalPemahaman += entry.pemahamanKonsep;
    cur.totalKeaktifan += entry.keaktifanSiswa;
    cur.totalKetercapaian += entry.ketercapaianTP;
    methodMap.set(entry.metodePembelajaran, cur);
  }

  const methodStats: MethodStat[] = Array.from(methodMap.entries()).map(([metode, data]) => {
    const rataPem = Math.round((data.totalPemahaman / data.count) * 10) / 10;
    const rataKeak = Math.round((data.totalKeaktifan / data.count) * 10) / 10;
    const rataKet = Math.round((data.totalKetercapaian / data.count) * 10) / 10;
    const skorKomposit = Math.round(((rataPem * 0.4) + (rataKeak * 0.3) + (rataKet * 0.3)) * 10) / 10;
    return {
      metode,
      jumlahSesi: data.count,
      rataPemahaman: rataPem,
      rataKeaktifan: rataKeak,
      rataKetercapaian: rataKet,
      skorKomposit,
    };
  }).sort((a, b) => b.skorKomposit - a.skorKomposit);

  const bestMethod = methodStats[0] || {
    metode: 'Belum ada',
    skorKomposit: 0,
    jumlahSesi: 0,
  };

  // Rekomendasi Otomatis & Insight Pedagogis Cerdas
  const rekomendasiOtomatis: string[] = [];
  const anomaliCatatan: string[] = [];

  // Insight tren perkembangan
  if (trenArah === 'naik') {
    rekomendasiOtomatis.push(
      `Tren kemajuan positif terlihat nyata: Terjadi peningkatan pemahaman konsep sebesar +${deltaPemahaman}% dari pertemuan awal. Pendekatan student-centered terbukti membuahkan hasil.`
    );
  } else if (trenArah === 'turun') {
    rekomendasiOtomatis.push(
      `Perhatian: Terjadi penurunan rerata pemahaman sebesar ${Math.abs(deltaPemahaman)}%. Disarankan melakukan review konsep prasyarat (scaffolding) dan evaluasi tingkat kesulitan materi.`
    );
  } else {
    rekomendasiOtomatis.push(
      `Tren pemahaman konsep berada pada rentang stabil (rerata ${avgPemahaman}%). Pertahankan konsistensi sembari mengujicobakan diferensiasi proses.`
    );
  }

  // Insight efektivitas metode
  if (methodStats.length > 0) {
    const top = methodStats[0];
    rekomendasiOtomatis.push(
      `Metode paling efektif: "${top.metode}" mencatatkan skor komposit tertinggi (${top.skorKomposit}%) dengan tingkat keterlibatan siswa ${top.rataKeaktifan}%. Sangat direkomendasikan untuk materi berkategori abstrak tinggi.`
    );

    const lowest = methodStats[methodStats.length - 1];
    if (methodStats.length > 1 && lowest.skorKomposit < top.skorKomposit - 10) {
      rekomendasiOtomatis.push(
        `Optimasi metode: "${lowest.metode}" memiliki performa efektivitas terendah (${lowest.skorKomposit}%). Sebaiknya kombinasikan dengan media visual atau interaksi tutor sebaya.`
      );
    }
  }

  // Cek Keaktifan vs Pemahaman
  if (avgKeaktifan > avgPemahaman + 8) {
    rekomendasiOtomatis.push(
      `Antusiasme siswa sangat tinggi (${avgKeaktifan}%), namun pemahaman konsep (${avgPemahaman}%) masih perlu diperdalam melalui penguatan asesmen formatif dan refleksi di akhir jam pelajaran.`
    );
  }

  // Deteksi anomali / sesi yang butuh perhatian khusus
  const lowEntries = sorted.filter(e => e.pemahamanKonsep < 70 || e.ketercapaianTP < 70);
  if (lowEntries.length > 0) {
    lowEntries.forEach(e => {
      anomaliCatatan.push(
        `Pertemuan ${e.pertemuanKe} (${e.tanggal} - ${e.materiPokok}): Ketercapaian ${e.ketercapaianTP}%, catatan kendala: "${e.kendalaMetode || 'Perlu remedial'}".`
      );
    });
  }

  // Menentukan tingkat kemandirian belajar siswa
  let tingkatKemandirian = 'Tinggi';
  if (avgKeaktifan < 70 || avgPemahaman < 70) {
    tingkatKemandirian = 'Butuh Pendampingan Intensif';
  } else if (avgKeaktifan < 80) {
    tingkatKemandirian = 'Berkembang Baik';
  } else {
    tingkatKemandirian = 'Sangat Aktif & Mandiri';
  }

  // Ekstrak catatan anekdot belajar siswa
  const anecdoteHighlights = sorted.map(e => ({
    tanggal: e.tanggal,
    kelas: e.kelas,
    materi: e.materiPokok,
    catatan: e.pengalamanSiswa.catatanAnekdot || e.pengalamanSiswa.responsPositif,
    antusiasme: e.pengalamanSiswa.antusiasme,
    metode: e.metodePembelajaran,
  }));

  return {
    summary: {
      rataRataPemahaman: avgPemahaman,
      rataRataKeaktifan: avgKeaktifan,
      rataRataKetercapaian: avgKetercapaian,
      trenPemahamanArah: trenArah,
      deltaPemahaman,
      metodeTerbaik: {
        metode: bestMethod.metode,
        skorRataRata: bestMethod.skorKomposit,
        jumlahSesi: bestMethod.jumlahSesi,
      },
      totalPertemuan: total,
      tingkatKemandirianSiswa: tingkatKemandirian,
      rekomendasiOtomatis,
      anomaliCatatan,
    },
    methodStats,
    chronologicalEntries: sorted,
    anecdoteHighlights,
  };
}
