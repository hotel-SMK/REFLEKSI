import React from 'react';
import { TeacherIdentity, PrincipalIdentity, ReflectionEntry } from '../types/journal';
import { analyzeStudentTrends } from '../utils/trendAnalysis';
import { Printer, FileDown, ArrowLeft, Check, Award, RefreshCw, Sparkles } from 'lucide-react';
import { generateWordDocument, downloadBlob } from '../utils/docxExport';
import { generateSupervisoryNarrative } from '../utils/reflectionGenerator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherIdentity;
  principal: PrincipalIdentity;
  reflections: ReflectionEntry[];
}

export const PrintDocumentPreview: React.FC<Props> = ({
  isOpen,
  onClose,
  teacher,
  principal,
  reflections,
}) => {
  const [isDownloading, setIsDownloading] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { summary, methodStats, chronologicalEntries } = analyzeStudentTrends(reflections);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = async () => {
    try {
      setIsDownloading(true);
      const blob = await generateWordDocument(teacher, principal, reflections);
      const safeName = teacher.nama.replace(/[^a-zA-Z0-9]/g, '_');
      downloadBlob(blob, `Jurnal_Refleksi_${safeName}_${teacher.mataPelajaran}.docx`);
    } catch (err) {
      console.error('Gagal membuat file Word:', err);
      alert('Terjadi kesalahan saat membuat berkas Word (.docx).');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Action Toolbar on Screen (Hidden on Print) */}
      <div className="sticky top-0 z-20 bg-slate-900/95 text-white px-6 py-4 border-b border-slate-700 flex flex-wrap items-center justify-between gap-4 print:hidden backdrop-blur-md shadow-lg">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="p-2 hover:bg-slate-800 active:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center space-x-1"
            title="Kembali (Tekan ESC)"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs font-medium hidden sm:inline">Kembali</span>
          </button>
          <div>
            <h2 className="text-base font-bold text-white">
              Pratinjau Dokumen Resmi Jurnal Refleksi
            </h2>
            <p className="text-xs text-slate-400">
              Format kedinasan standar A4 lengkap dengan identitas Guru & Kepala Sekolah
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            type="button"
            onClick={handleDownloadWord}
            disabled={isDownloading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>{isDownloading ? 'Menyiapkan Word...' : 'Unduh Word (.docx)'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Unduh PDF</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors flex items-center justify-center cursor-pointer"
            title="Tutup Pratinjau (ESC)"
          >
            <span className="text-xs font-semibold px-1 hidden md:inline">Tutup</span>
            <span className="text-base font-bold leading-none">✕</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (Simulated A4 paper) */}
      <div className="max-w-4xl mx-auto my-8 p-8 sm:p-12 bg-white rounded-xl shadow-2xl print:m-0 print:p-6 print:shadow-none print:w-full print:max-w-none text-slate-900 font-serif leading-normal">
        {/* KOP SURAT RESMI SEKOLAH */}
        <div className="text-center pb-3 border-b-4 border-double border-slate-900 mb-6">
          <p className="text-xs uppercase tracking-widest text-slate-700 font-sans font-semibold">
            Pemerintah Daerah Provinsi / Dinas Pendidikan
          </p>
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-slate-900 font-sans mt-0.5">
            {teacher.sekolah}
          </h1>
          <p className="text-xs text-slate-600 italic font-sans mt-1">
            {teacher.alamatSekolah} | Tahun Ajaran {teacher.tahunAjaran}
          </p>
        </div>

        {/* JUDUL DOKUMEN */}
        <div className="text-center mb-6 font-sans">
          <h2 className="text-base sm:text-lg font-extrabold uppercase text-slate-900 tracking-wide underline decoration-1 underline-offset-4">
            JURNAL REFLEKSI GURU MENGAJAR
          </h2>
          <p className="text-xs text-slate-600 font-medium uppercase tracking-wider mt-1">
            Dokumentasi Pengalaman Belajar Siswa, Efektivitas Metode Pembelajaran & Analisis Tren Kemajuan
          </p>
        </div>

        {/* TABEL IDENTITAS GURU & KEPALA SEKOLAH */}
        <div className="mb-6 font-sans text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-300 rounded-lg overflow-hidden bg-slate-50/50 print:bg-transparent">
            {/* Bagian Identitas Guru */}
            <div className="p-4 border-b md:border-b-0 md:border-r border-slate-300">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2.5 pb-1 border-b border-slate-200 flex items-center justify-between">
                <span>A. Identitas Guru Pengampu</span>
                <span className="text-[10px] text-indigo-600 font-semibold">Guru Mata Pelajaran</span>
              </h3>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex">
                  <span className="w-28 font-medium text-slate-600 shrink-0">Nama Guru</span>
                  <span className="font-semibold text-slate-900">: {teacher.nama}, {teacher.gelar}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium text-slate-600 shrink-0">NIP / NUPTK</span>
                  <span>: {teacher.nip || '-'}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium text-slate-600 shrink-0">Pangkat / Gol</span>
                  <span>: {teacher.pangkatGolongan || '-'}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium text-slate-600 shrink-0">Mata Pelajaran</span>
                  <span className="font-semibold text-slate-900">: {teacher.mataPelajaran}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium text-slate-600 shrink-0">Kelas Diampu</span>
                  <span>: {teacher.kelasDiampu}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium text-slate-600 shrink-0">Semester / TA</span>
                  <span>: {teacher.semester} / {teacher.tahunAjaran}</span>
                </div>
              </div>
            </div>

            {/* Bagian Identitas Kepala Sekolah */}
            <div className="p-4">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2.5 pb-1 border-b border-slate-200 flex items-center justify-between">
                <span>B. Identitas Kepala Sekolah</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Pejabat Penilai / Pembina</span>
              </h3>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex">
                  <span className="w-28 font-medium text-slate-600 shrink-0">Nama Kepala Sek.</span>
                  <span className="font-semibold text-slate-900">: {principal.nama}, {principal.gelar}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium text-slate-600 shrink-0">NIP</span>
                  <span>: {principal.nip || '-'}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium text-slate-600 shrink-0">Pangkat / Gol</span>
                  <span>: {principal.pangkatGolongan || '-'}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium text-slate-600 shrink-0">Jabatan</span>
                  <span>: {principal.jabatan}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium text-slate-600 shrink-0">Satuan Pendidikan</span>
                  <span>: {teacher.sekolah}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-medium text-slate-600 shrink-0">Kota Pengesahan</span>
                  <span>: {principal.kotaKabupaten}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BAGIAN I: REKAPITULASI ANALISIS TREN OTOMATIS */}
        <div className="mb-6 font-sans">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">
            I. Rangkuman Analisis Tren Kemajuan Siswa & Efektivitas Pembelajaran
          </h3>

          <div className="grid grid-cols-4 gap-2 text-center text-xs mb-4">
            <div className="p-2.5 bg-slate-100 rounded-md border border-slate-300">
              <div className="text-[10px] text-slate-600">Rerata Pemahaman</div>
              <div className="text-base font-bold text-slate-900">{summary.rataRataPemahaman}%</div>
            </div>
            <div className="p-2.5 bg-slate-100 rounded-md border border-slate-300">
              <div className="text-[10px] text-slate-600">Rerata Keaktifan</div>
              <div className="text-base font-bold text-slate-900">{summary.rataRataKeaktifan}%</div>
            </div>
            <div className="p-2.5 bg-slate-100 rounded-md border border-slate-300">
              <div className="text-[10px] text-slate-600">Ketercapaian TP</div>
              <div className="text-base font-bold text-slate-900">{summary.rataRataKetercapaian}%</div>
            </div>
            <div className="p-2.5 bg-slate-100 rounded-md border border-slate-300">
              <div className="text-[10px] text-slate-600">Tren Pertumbuhan</div>
              <div className="text-base font-bold text-emerald-700 capitalize">
                {summary.trenPemahamanArah} ({summary.deltaPemahaman >= 0 ? '+' : ''}{summary.deltaPemahaman}%)
              </div>
            </div>
          </div>

          {/* Temuan Pedagogis & Sintesis Naratif */}
          <div className="text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200 mb-4 space-y-2.5">
            <div>
              <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1">
                Sintesis Narasi Supervisi Akademik (Otomatis):
              </h4>
              <p className="text-slate-700 leading-relaxed italic bg-white p-2.5 rounded-md border border-slate-200/60">
                "{generateSupervisoryNarrative(
                  `${teacher.nama}, ${teacher.gelar}`,
                  teacher.mataPelajaran,
                  summary.totalPertemuan,
                  summary.rataRataPemahaman,
                  summary.rataRataKeaktifan,
                  summary.trenPemahamanArah,
                  summary.deltaPemahaman,
                  summary.metodeTerbaik.metode
                )}"
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-1">Kesimpulan & Rekomendasi Otomatis Sistem:</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {summary.rekomendasiOtomatis.map((rek, i) => (
                  <li key={i}>{rek}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tabel Ranking Efektivitas Metode */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-slate-200 text-slate-800 font-semibold">
                <tr>
                  <th className="p-2 border border-slate-300 text-center w-8">No</th>
                  <th className="p-2 border border-slate-300">Metode Pembelajaran</th>
                  <th className="p-2 border border-slate-300 text-center">Frekuensi</th>
                  <th className="p-2 border border-slate-300 text-center">Rerata Pemahaman</th>
                  <th className="p-2 border border-slate-300 text-center">Rerata Keaktifan</th>
                  <th className="p-2 border border-slate-300 text-center">Skor Efektivitas</th>
                </tr>
              </thead>
              <tbody>
                {methodStats.map((ms, idx) => (
                  <tr key={ms.metode} className="odd:bg-white even:bg-slate-50">
                    <td className="p-2 border border-slate-300 text-center">{idx + 1}</td>
                    <td className="p-2 border border-slate-300 font-medium">{ms.metode}</td>
                    <td className="p-2 border border-slate-300 text-center">{ms.jumlahSesi} sesi</td>
                    <td className="p-2 border border-slate-300 text-center">{ms.rataPemahaman}%</td>
                    <td className="p-2 border border-slate-300 text-center">{ms.rataKeaktifan}%</td>
                    <td className="p-2 border border-slate-300 text-center font-bold text-slate-900">
                      {ms.skorKomposit}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BAGIAN II: TABEL JURNAL REFLEKSI MENGAJAR */}
        <div className="mb-8 font-sans">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">
            II. Tabel Jurnal Refleksi Mengajar Per Pertemuan
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-left border-collapse border border-slate-300">
              <thead className="bg-slate-200 text-slate-800 font-semibold">
                <tr>
                  <th className="p-2 border border-slate-300 text-center w-12">Pert / Tgl</th>
                  <th className="p-2 border border-slate-300 w-48">Materi & Tujuan Pembelajaran</th>
                  <th className="p-2 border border-slate-300 w-36">Metode & Skor</th>
                  <th className="p-2 border border-slate-300">Pengalaman Belajar Siswa (Anekdot / Titik Sulit)</th>
                  <th className="p-2 border border-slate-300">Efektivitas Metode & Rencana Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody>
                {chronologicalEntries.map((e) => (
                  <tr key={e.id} className="odd:bg-white even:bg-slate-50 align-top">
                    <td className="p-2 border border-slate-300 text-center">
                      <div className="font-bold text-slate-900">Ke-{e.pertemuanKe}</div>
                      <div className="text-[10px] text-slate-500">{e.tanggal}</div>
                      <div className="text-[10px] font-semibold text-slate-700">Kls {e.kelas}</div>
                    </td>
                    <td className="p-2 border border-slate-300">
                      <div className="font-bold text-slate-900 mb-1">{e.materiPokok}</div>
                      <div className="text-[10px] text-slate-600 leading-tight">
                        <span className="italic font-medium">TP: </span>
                        {e.tujuanPembelajaran}
                      </div>
                    </td>
                    <td className="p-2 border border-slate-300">
                      <div className="font-semibold text-slate-800 mb-1">{e.metodePembelajaran}</div>
                      <div className="space-y-0.5 text-[10px] text-slate-600">
                        <div>• Pemahaman: {e.pemahamanKonsep}%</div>
                        <div>• Keaktifan: {e.keaktifanSiswa}%</div>
                        <div>• Capaian TP: {e.ketercapaianTP}%</div>
                      </div>
                    </td>
                    <td className="p-2 border border-slate-300">
                      <div className="mb-1">
                        <span className="font-semibold">Antusiasme:</span> {e.pengalamanSiswa.antusiasme}
                      </div>
                      <div className="mb-1 text-slate-700">
                        <span className="font-semibold">Anekdot:</span> "{e.pengalamanSiswa.catatanAnekdot || '-'}"
                      </div>
                      {e.pengalamanSiswa.titikKesulitan && (
                        <div className="text-red-800 text-[10px]">
                          <span className="font-semibold">Titik Sulit:</span> {e.pengalamanSiswa.titikKesulitan}
                        </div>
                      )}
                    </td>
                    <td className="p-2 border border-slate-300">
                      <div className="mb-1">
                        <span className="font-semibold">Keberhasilan:</span> {e.keberhasilanMetode}
                      </div>
                      {e.kendalaMetode && (
                        <div className="mb-1 text-slate-600">
                          <span className="font-semibold">Kendala:</span> {e.kendalaMetode}
                        </div>
                      )}
                      <div className="text-indigo-900 font-medium">
                        <span className="font-semibold">Tindak Lanjut:</span> {e.tindakLanjut}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* LEMBAR PENGESAHAN (SIGNATURE BLOCK) */}
        <div className="font-sans text-xs pt-4 border-t border-slate-300 page-break-inside-avoid">
          <div className="grid grid-cols-2 gap-8 text-center">
            {/* Tanda Tangan Kepala Sekolah */}
            <div>
              <p className="text-slate-700 mb-0.5">Mengetahui,</p>
              <p className="font-bold text-slate-900">{principal.jabatan}</p>
              <div className="h-20 flex items-center justify-center">
                <span className="text-[10px] text-slate-300 italic">[Tanda Tangan & Cap Sekolah]</span>
              </div>
              <p className="font-bold text-slate-900 underline decoration-1">
                {principal.nama}, {principal.gelar}
              </p>
              <p className="text-slate-600">NIP. {principal.nip || '-'}</p>
              <p className="text-[10px] text-slate-500">Pangkat/Gol: {principal.pangkatGolongan || '-'}</p>
            </div>

            {/* Tanda Tangan Guru Mata Pelajaran */}
            <div>
              <p className="text-slate-700 mb-0.5">
                {principal.kotaKabupaten}, {principal.tanggalDokumen}
              </p>
              <p className="font-bold text-slate-900">
                Guru Mata Pelajaran {teacher.mataPelajaran}
              </p>
              <div className="h-20 flex items-center justify-center">
                <span className="text-[10px] text-slate-300 italic">[Tanda Tangan Guru]</span>
              </div>
              <p className="font-bold text-slate-900 underline decoration-1">
                {teacher.nama}, {teacher.gelar}
              </p>
              <p className="text-slate-600">NIP. {teacher.nip || '-'}</p>
              <p className="text-[10px] text-slate-500">Pangkat/Gol: {teacher.pangkatGolongan || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
