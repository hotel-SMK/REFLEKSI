export interface TeacherIdentity {
  nama: string;
  gelar: string;
  nip: string;
  pangkatGolongan: string;
  mataPelajaran: string;
  kelasDiampu: string;
  sekolah: string;
  alamatSekolah: string;
  semester: string;
  tahunAjaran: string;
}

export interface PrincipalIdentity {
  nama: string;
  gelar: string;
  nip: string;
  pangkatGolongan: string;
  jabatan: string;
  kotaKabupaten: string;
  tanggalDokumen: string;
}

export type TeachingMethod = 
  | 'Problem Based Learning (PBL)'
  | 'Project Based Learning (PjBL)'
  | 'Discovery / Inquiry Learning'
  | 'Pembelajaran Berdiferensiasi'
  | 'Kooperatif (Jigsaw/STAD)'
  | 'Ceramah Interaktif & Diskusi'
  | 'Gamifikasi & Kuis Interaktif'
  | 'Praktikum / Eksperimen Langsung'
  | 'Flipped Classroom';

export interface StudentExperienceNote {
  antusiasme: 'Tinggi' | 'Sedang' | 'Perlu Motivasi';
  catatanAnekdot: string; // Cerita/peristiwa spesifik perilaku belajar siswa
  titikKesulitan: string; // Konsep yang membingungkan siswa
  responsPositif: string; // Hal yang sangat disukai atau berhasil dipahami siswa
}

export interface ReflectionEntry {
  id: string;
  tanggal: string; // YYYY-MM-DD
  pertemuanKe: number;
  kelas: string;
  materiPokok: string;
  tujuanPembelajaran: string;
  metodePembelajaran: TeachingMethod;
  durasiMenit: number;

  // Metrik Evaluasi Kuantitatif (0 - 100)
  pemahamanKonsep: number; // Persentase pemahaman rata-rata siswa
  keaktifanSiswa: number; // Persentase keterlibatan aktif siswa
  ketercapaianTP: number; // Persentase tujuan pembelajaran yang tuntas

  // Catatan Pengalaman Belajar Siswa
  pengalamanSiswa: StudentExperienceNote;

  // Refleksi Efektivitas Metode
  keberhasilanMetode: string; // Apa yang efektif dari metode ini?
  kendalaMetode: string; // Hambatan saat metode diterapkan
  faktorPendukung: string; // Media, respon siswa, atau lingkungan belajar

  // Tindak Lanjut & Rencana Selanjutnya
  tindakLanjut: string; // Rencana aksi pertemuan berikutnya (remedial, pengayaan, modifikasi metode)
  catatanTambahan?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface TrendMetricSummary {
  rataRataPemahaman: number;
  rataRataKeaktifan: number;
  rataRataKetercapaian: number;
  trenPemahamanArah: 'naik' | 'turun' | 'stabil';
  deltaPemahaman: number;
  metodeTerbaik: {
    metode: string;
    skorRataRata: number;
    jumlahSesi: number;
  };
  totalPertemuan: number;
  tingkatKemandirianSiswa: string;
  rekomendasiOtomatis: string[];
  anomaliCatatan: string[];
}
