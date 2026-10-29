import { TeachingMethod, StudentExperienceNote } from '../types/journal';

export interface GenerateInput {
  materiPokok: string;
  tujuanPembelajaran?: string;
  metodePembelajaran: TeachingMethod;
  pemahamanKonsep: number;
  keaktifanSiswa: number;
  ketercapaianTP: number;
  antusiasme: 'Tinggi' | 'Sedang' | 'Perlu Motivasi';
  kelas: string;
  mataPelajaran?: string;
  durasiMenit?: number;
}

export interface GeneratedReflectionResult {
  pengalamanSiswa: StudentExperienceNote;
  keberhasilanMetode: string;
  kendalaMetode: string;
  tindakLanjut: string;
  source?: 'ai' | 'heuristic';
}

// Helper to generate reflection with AI (Gemini backend proxy) with fallback to smart pedagogical heuristic
export async function generateReflection(input: GenerateInput): Promise<GeneratedReflectionResult> {
  try {
    const res = await fetch('/api/generate-reflection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.catatanAnekdot && data.keberhasilanMetode) {
        return {
          pengalamanSiswa: {
            antusiasme: input.antusiasme,
            catatanAnekdot: data.catatanAnekdot,
            titikKesulitan: data.titikKesulitan || '',
            responsPositif: data.responsPositif || '',
          },
          keberhasilanMetode: data.keberhasilanMetode,
          kendalaMetode: data.kendalaMetode || '',
          tindakLanjut: data.tindakLanjut || '',
          source: 'ai',
        };
      }
    }
  } catch (err) {
    // If backend is unavailable or network error, silently fall back to heuristic
    console.info('Using smart heuristic reflection generator:', err);
  }

  // Fallback to high-quality smart heuristic
  return generateReflectionFromData(input);
}

// Generate single field (for field-level regenerate button)
export function generateSingleField(
  field: 'catatanAnekdot' | 'titikKesulitan' | 'responsPositif' | 'keberhasilanMetode' | 'kendalaMetode' | 'tindakLanjut',
  input: GenerateInput
): string {
  const all = generateReflectionFromData(input);
  if (field === 'catatanAnekdot') return all.pengalamanSiswa.catatanAnekdot;
  if (field === 'titikKesulitan') return all.pengalamanSiswa.titikKesulitan;
  if (field === 'responsPositif') return all.pengalamanSiswa.responsPositif;
  if (field === 'keberhasilanMetode') return all.keberhasilanMetode;
  if (field === 'kendalaMetode') return all.kendalaMetode;
  if (field === 'tindakLanjut') return all.tindakLanjut;
  return '';
}

export function generateReflectionFromData(input: GenerateInput): GeneratedReflectionResult {
  const rawMateri = input.materiPokok.trim() || 'Topik Pembelajaran';
  const materiLower = rawMateri.toLowerCase();
  const rawTP = input.tujuanPembelajaran ? input.tujuanPembelajaran.trim() : '';
  const tpLower = rawTP.toLowerCase();
  const metode = input.metodePembelajaran;
  const pem = Math.round(input.pemahamanKonsep);
  const keak = Math.round(input.keaktifanSiswa);
  const cap = Math.round(input.ketercapaianTP);
  const antusias = input.antusiasme;
  const kls = input.kelas || 'Fase';

  // 1. Deteksi Domain Khusus
  const isHotelDomain =
    materiLower.includes('hotel') ||
    materiLower.includes('departemen') ||
    materiLower.includes('perhotelan') ||
    materiLower.includes('hospitality') ||
    materiLower.includes('front office') ||
    materiLower.includes('housekeeping') ||
    tpLower.includes('hotel') ||
    tpLower.includes('departemen');

  const isMathDomain =
    materiLower.includes('matematika') ||
    materiLower.includes('aljabar') ||
    materiLower.includes('eksponen') ||
    materiLower.includes('persamaan') ||
    materiLower.includes('geometri') ||
    materiLower.includes('trigonometri') ||
    materiLower.includes('fungsi') ||
    materiLower.includes('statistik') ||
    materiLower.includes('kalkulus') ||
    materiLower.includes('pecahan');

  const isScienceDomain =
    materiLower.includes('ipa') ||
    materiLower.includes('fisika') ||
    materiLower.includes('biologi') ||
    materiLower.includes('kimia') ||
    materiLower.includes('ekosistem') ||
    materiLower.includes('sel') ||
    materiLower.includes('fotosintesis') ||
    materiLower.includes('energi') ||
    materiLower.includes('gerak');

  const isLanguageDomain =
    materiLower.includes('bahasa') ||
    materiLower.includes('teks') ||
    materiLower.includes('paragraf') ||
    materiLower.includes('puisi') ||
    materiLower.includes('cerpen') ||
    materiLower.includes('english') ||
    materiLower.includes('narrative') ||
    materiLower.includes('grammar');

  let anekdot = '';
  let kesulitan = '';
  let responPositif = '';
  let keberhasilan = '';
  let kendala = '';
  let tindakLanjut = '';

  // === GENERASI KHUSUS DOMAIN PERHOTELAN / HOSPITALITY ===
  if (isHotelDomain) {
    if (metode.includes('Problem Based') || metode.includes('Discovery')) {
      anekdot = `Siswa di kelas ${kls} terlihat sangat antusias mendiskusikan alur operasional perhotelan pada topik "${rawMateri}". Dalam dinamika kelompok, siswa secara kolaboratif memetakan fungsi masing-masing departemen (Front Office, Housekeeping, F&B Service/Product, Sales, Engineering, dan HRD) serta menyimulasikan koordinasi antar-departemen saat menangani kedatangan tamu rombongan.`;
    } else if (metode.includes('Praktikum') || metode.includes('Project')) {
      anekdot = `Siswa kelas ${kls} sangat aktif melakukan simulasi langsung terkait "${rawMateri}". Setiap siswa menjalankan peran operasional hotel secara bergantian, menunjukkan rasa tanggung jawab tinggi dalam menerapkan standar operasional prosedur (SOP) pelayanan industri.`;
    } else {
      anekdot = `Siswa di kelas ${kls} aktif berdiskusi mengenai keterkaitan departemen perhotelan pada materi "${rawMateri}". Interaksi kelas hidup dengan banyak siswa mengaitkan konsep materi dengan pengalaman berkunjung ke hotel atau tempat wisata.`;
    }

    if (pem < 75) {
      kesulitan = `Sebagian siswa masih tertukar antara departemen Front of the House (Front Office, Restaurant, Bell Desk) dan Back of the House (Housekeeping, Laundry, Accounting, Engineering), serta belum lancar melafalkan istilah perhotelan berbahasa Inggris (guest folio, room status, courtesy call).`;
    } else if (pem < 85) {
      kesulitan = `Siswa sudah mengenali nama-nama departemen hotel dengan baik, namun masih butuh pendalaman alur koordinasi cepat lintas departemen ketika terjadi komplain atau situasi darurat di hotel.`;
    } else {
      kesulitan = `Secara umum pemahaman konsep sangat kuat (${pem}%). Tantangan kecil hanya terletak pada pemahaman struktur hierarki manajerial dan pembedaan bagan organisasi antara hotel skala resort dengan city hotel.`;
    }

    responPositif = `Siswa merasa senang dan bangga saat berhasil mempresentasikan bagan struktur alur departemen hotel di hadapan teman-temannya. Suasana kelas bernuansa industri dan menumbuhkan etos kerja hospitality (keramahan dan profesionalisme).`;

    keberhasilan = `Penerapan metode ${metode} sangat kontekstual untuk materi "${rawMateri}", membuat siswa tidak sekadar menghafal definisi melainkan memahami sinergi pelayanan prima (service excellence) hotel secara utuh. Ketercapaian TP mencapai ${cap}%.`;

    kendala = `Perbedaan kosakata bahasa Inggris perhotelan di antara siswa membuat waktu telaah kasus sedikit lebih panjang dari yang dialokasikan, sehingga sesi kesimpulan di akhir pertemuan berlangsung cukup cepat.`;

    tindakLanjut = `Pada pertemuan berikutnya, adakan kuis penguatan istilah perhotelan 10 menit di awal sesi, dilanjutkan simulasi role-play skenario tamu komplain untuk menguji kecepatan koordinasi lintas departemen.`;
  }
  // === GENERASI KHUSUS DOMAIN MATEMATIKA ===
  else if (isMathDomain) {
    anekdot = `Pada pembelajaran materi "${rawMateri}" di kelas ${kls}, siswa menunjukkan rasa ingin tahu saat menghadapi masalah matematika kontekstual. Beberapa kelompok belajar tampak saling mencocokkan langkah penyelesaian aljabar dan berdiskusi aktif menemukan rumus yang paling efisien.`;

    if (pem < 75) {
      kesulitan = `Siswa masih sering keliru pada operasi tanda hitung, manipulasi simbol aljabar, atau kurang teliti dalam proses substitusi langkah demi langkah pada topik "${rawMateri}".`;
    } else {
      kesulitan = `Siswa sudah menguasai rumus dasar materi "${rawMateri}" (${pem}%), namun masih membutuhkan bimbingan saat menghadapi soal cerita terbuka atau soal penerapan bertingkat (HOTS).`;
    }

    responPositif = `Siswa mengekspresikan kepuasan ("Aha! moment") ketika berhasil memecahkan soal tantangan dan memverifikasi jawabannya secara mandiri di depan kelas.`;

    keberhasilan = `Metode ${metode} memfasilitasi penalaran logis siswa pada materi "${rawMateri}". Pemodelan visual dan diskusi kelompok efektif mereduksi ketakutan siswa terhadap hitungan matematis.`;

    kendala = `Rentang kecepatan berhitung siswa cukup lebar, sehingga kelompok yang cepat selesai membutuhkan soal tantangan tambahan agar tidak mengganggu kelompok yang masih membutuhkan bimbingan.`;

    tindakLanjut = `Menyiapkan lembar kerja berdiferensiasi (LKPD tiering) pada pertemuan mendatang dengan menyediakan scaffolding untuk siswa bertaraf dasar dan soal investigatif untuk kelompok mahir.`;
  }
  // === GENERASI KHUSUS DOMAIN SAINS / IPA ===
  else if (isScienceDomain) {
    anekdot = `Siswa kelas ${kls} sangat bersemangat saat mengeksplorasi fenomena alam pada topik "${rawMateri}". Diskusi kelompok berjalan dinamis dengan siswa mengajukan hipotesis awal dan menghubungkannya dengan fakta pengamatan nyata.`;

    if (pem < 75) {
      kesulitan = `Terdapat miskonsepsi pada abstraksi konsep mikroskopis/mekanisme proses ilmiah terkait "${rawMateri}", serta kesulitan dalam merumuskan kesimpulan berbasis data pengamatan.`;
    } else {
      kesulitan = `Konsep esensial "${rawMateri}" dipahami dengan baik (${pem}%), kendala minor hanya pada penggunaan istilah ilmiah yang tepat dalam penjelasan tertulis.`;
    }

    responPositif = `Siswa antusias ketika mengamati visualisasi/animasi dan simulasi konsep ilmiah. Keterlibatan aktif kelompok mencapai ${keak}%.`;

    keberhasilan = `Pendekatan ilmiah dengan metode ${metode} berhasil membangkitkan keterampilan berpikir saintifik dan kemampuan mengidentifikasi variabel penting pada materi "${rawMateri}".`;

    kendala = `Alokasi waktu untuk menyajikan hasil analisis data kelompok membutuhkan kedisiplinan timer yang lebih ketat agar semua kelompok mendapat porsi umpan balik.`;

    tindakLanjut = `Melakukan penguatan konsep kunci dengan video pendek interaktif di awal sesi berikutnya, serta memberikan umpan balik formatif tertulis atas laporan kelompok.`;
  }
  // === GENERASI KHUSUS BAHASA / LITERASI ===
  else if (isLanguageDomain) {
    anekdot = `Siswa di kelas ${kls} terlibat aktif dalam menganalisis struktur dan kaidah kebahasaan materi "${rawMateri}". Terjadi diskusi hangat saat tiap kelompok mengemukakan interpretasi dan argumen terhadap teks yang dibaca.`;

    kesulitan = pem < 75
      ? `Siswa masih kesulitan membedakan unsur kebahasaan spesifik dan menyusun kalimat efektif yang padu sesuai kaidah materi "${rawMateri}".`
      : `Siswa telah memahami struktur materi "${rawMateri}" (${pem}%), hanya perlu pengayaan variasi diksi dan kohesi antarkalimat dalam menyusun teks.`;

    responPositif = `Siswa berani membacakan hasil karya dan memberikan apresiasi membangun (peer feedback) kepada rekan sekelas dengan suasana yang suportif.`;

    keberhasilan = `Metode ${metode} merangsang kemampuan literasi kritis dan keberanian berbicara di depan umum pada materi "${rawMateri}".`;

    kendala = `Sebagian siswa yang pemalu masih butuh dorongan ekstra agar percaya diri menyampaikan pandangan pribadinya dalam diskusi pleno kelas.`;

    tindakLanjut = `Menerapkan teknik scaffolding 'Think-Pair-Share' pada sesi berikutnya agar siswa memiliki kesempatan menyusun gagasannya berdua sebelum berbagi ke kelas besar.`;
  }
  // === GENERASI UMUM / DOMAIN FLEKSIBEL SESUAI DATA LENGKAP ===
  else {
    const tpText = rawTP ? `yang berfokus pada ${rawTP}` : 'yang dirancang guru';

    if (keak >= 80) {
      anekdot = `Selama pembelajaran materi "${rawMateri}" di kelas ${kls}, dinamika belajar berlangsung sangat hidup. Siswa aktif berkolaborasi dalam kelompok berbasis metode ${metode}, mengajukan pertanyaan kritis, dan saling membantu dalam menuntaskan tugas ${tpText}.`;
    } else if (keak >= 65) {
      anekdot = `Siswa di kelas ${kls} mengikuti pembelajaran topik "${rawMateri}" dengan tertib dan cukup fokus. Interaksi mulai mengalir hangat ketika guru mengaitkan konsep materi dengan contoh kasus nyata yang dekat dengan kehidupan siswa sehari-hari.`;
    } else {
      anekdot = `Pada awal sesi materi "${rawMateri}", siswa di kelas ${kls} cenderung pasif dan ragu-ragu menyampaikan ide. Namun setelah diberikan panduan bertahap dan pemantik studi kasus nyata, partisipasi belajar perlahan mulai terbangun.`;
    }

    if (pem < 70) {
      kesulitan = `Berdasarkan evaluasi formatif (${pem}%), sebagian siswa masih mengalami kesulitan dalam memahami konsep prasyarat dan abstraksi langkah penyelesaian pada materi "${rawMateri}". Masih terjadi miskonsepsi dalam menghubungkan teori dengan penerapan nyata.`;
    } else if (pem < 82) {
      kesulitan = `Sebagian besar siswa telah menguasai konsep dasar "${rawMateri}", namun masih ditemukan ketidaktelitian saat menganalisis studi kasus bertingkat atau variasi pertanyaan aplikasi tingkat lanjut.`;
    } else {
      kesulitan = `Tingkat pemahaman siswa tergolong tinggi (${pem}%). Tantangan yang tersisa adalah memfasilitasi kecepatan belajar yang berbeda di antara siswa agar siswa yang cepat tidak merasa bosan sementara yang bertaraf sedang tetap terlayani.`;
    }

    if (antusias === 'Tinggi' || keak >= 80) {
      responPositif = `Siswa sangat antusias dan bersemangat selama tahapan kegiatan inti ${metode}. Banyak siswa menunjukkan inisiatif memimpin kelompok dan percaya diri saat sesi berbagi kesimpulan materi "${rawMateri}".`;
    } else if (antusias === 'Sedang') {
      responPositif = `Siswa merespons baik bimbingan guru dan mengapresiasi kejelasan langkah kerja yang diberikan. Siswa merasa terbantu dengan adanya lembar panduan terstruktur pada materi "${rawMateri}".`;
    } else {
      responPositif = `Siswa mulai menunjukkan peningkatan motivasi setelah menerima afirmasi positif dan pendampingan personal dari guru saat menghadapi bagian materi yang sulit.`;
    }

    if (metode.includes('Problem Based')) {
      keberhasilan = `Penerapan Problem Based Learning (PBL) pada materi "${rawMateri}" sukses mendorong siswa berpikir kritis dan mencari solusi mandiri. Siswa belajar membedah masalah kontekstual secara sistematis dengan ketercapaian TP mencapai ${cap}%.`;
    } else if (metode.includes('Project Based')) {
      keberhasilan = `Model PjBL efektif menumbuhkan kolaborasi, manajemen waktu, dan kepemilikan hasil karya siswa terkait materi "${rawMateri}". Ketercapaian TP tercatat optimal (${cap}%).`;
    } else if (metode.includes('Discovery') || metode.includes('Inquiry')) {
      keberhasilan = `Discovery/Inquiry Learning memantik rasa ingin tahu dan kepuasan intelektual siswa saat berhasil merumuskan kesimpulan konsep "${rawMateri}" secara mandiri dari data yang dieksplorasi.`;
    } else if (metode.includes('Berdiferensiasi')) {
      keberhasilan = `Pembelajaran Berdiferensiasi berhasil mengakomodasi kesiapan belajar siswa yang beragam pada topik "${rawMateri}". Siswa belajar tanpa tekanan dan menunjukkan progres capaian terukur (${cap}%).`;
    } else if (metode.includes('Gamifikasi')) {
      keberhasilan = `Gamifikasi dan kuis interaktif sukses meningkatkan keterlibatan siswa secara masif hingga ${keak}%, menghadirkan atmosfer belajar yang menyenangkan tanpa mengurangi bobot esensi materi "${rawMateri}".`;
    } else if (metode.includes('Praktikum')) {
      keberhasilan = `Praktikum langsung memberikan pengalaman belajar konkret yang memperkuat retensi memori dan verifikasi teori "${rawMateri}" secara nyata.`;
    } else {
      keberhasilan = `Penerapan metode ${metode} berjalan efektif dan terstruktur. Penyampaian materi "${rawMateri}" berlangsung komunikatif dengan umpan balik langsung kepada siswa (Capaian TP: ${cap}%).`;
    }

    if (keak < 70) {
      kendala = `Sebagian siswa pendiam masih memerlukan dorongan ekstra untuk berani berbicara dalam forum besar; waktu pembelajaran juga cukup tersita untuk pengkondisian awal.`;
    } else {
      kendala = `Alokasi waktu diskusi pada materi "${rawMateri}" terasa sangat padat karena siswa antusias bertanya dan mengulas contoh kasus, sehingga waktu refleksi penutup harus dipersingkat.`;
    }

    if (pem < 75 || cap < 75) {
      tindakLanjut = `Melakukan sesi penguatan / bimbingan remedial kelompok kecil di awal pertemuan berikutnya untuk materi "${rawMateri}", serta menyederhanakan penjelasan menggunakan analogi visual yang lebih dekat dengan siswa.`;
    } else if (pem >= 85) {
      tindakLanjut = `Menyiapkan aktivitas pengayaan (enrichment) bertaraf analisis HOTS untuk materi lanjutan "${rawMateri}", serta memberdayakan siswa berprestasi sebagai tutor sebaya di kelompok belajar.`;
    } else {
      tindakLanjut = `Melanjutkan ke sub-materi berikutnya dengan memberikan kuis formatif kilat (5-10 menit) di awal pertemuan untuk mengunci kestabilan pemahaman siswa pada topik "${rawMateri}".`;
    }
  }

  return {
    pengalamanSiswa: {
      antusiasme: antusias,
      catatanAnekdot: anekdot,
      titikKesulitan: kesulitan,
      responsPositif: responPositif,
    },
    keberhasilanMetode: keberhasilan,
    kendalaMetode: kendala,
    tindakLanjut: tindakLanjut,
    source: 'heuristic',
  };
}

export function generateSupervisoryNarrative(
  teacherName: string,
  subject: string,
  totalSessions: number,
  avgPemahaman: number,
  avgKeaktifan: number,
  trendDirection: string,
  delta: number,
  bestMethod: string
): string {
  const growthSign = delta >= 0 ? `+${delta}%` : `${delta}%`;
  return `Berdasarkan hasil supervisi dan rekapitulasi data refleksi pembelajaran ${subject} sebanyak ${totalSessions} pertemuan yang diampu oleh ${teacherName}, peserta didik menunjukkan tren perkembangan yang berkategori ${trendDirection.toUpperCase()} dengan perubahan capaian sebesar ${growthSign}. Rata-rata tingkat pemahaman konsep mencapai ${avgPemahaman}%, diiringi partisipasi aktif siswa sebesar ${avgKeaktifan}%. Metode "${bestMethod}" terbukti menjadi pendekatan paling efektif dalam memfasilitasi keterlibatan belajar dan pencapaian tujuan pembelajaran secara optimal.`;
}
