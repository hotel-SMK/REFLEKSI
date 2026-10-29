import React, { useState } from 'react';
import { ReflectionEntry, TeacherIdentity, PrincipalIdentity } from '../types/journal';
import {
  X,
  FileDown,
  Printer,
  CheckCircle,
  AlertCircle,
  Clock,
  Edit3,
  Trash2,
} from 'lucide-react';
import { generateSingleEntryWordDocument, downloadBlob } from '../utils/docxExport';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  entry: ReflectionEntry | null;
  teacher: TeacherIdentity;
  principal: PrincipalIdentity;
  onEdit: (entry: ReflectionEntry) => void;
  onDelete: (id: string) => void;
}

export const EntryDetailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  entry,
  teacher,
  principal,
  onEdit,
  onDelete,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

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

  if (!isOpen || !entry) return null;

  const handleDownloadSingle = async () => {
    try {
      setIsDownloading(true);
      const blob = await generateSingleEntryWordDocument(teacher, principal, entry);
      const safeMateri = entry.materiPokok.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
      downloadBlob(blob, `Refleksi_Pertemuan_${entry.pertemuanKe}_${safeMateri}.docx`);
    } catch (err) {
      console.error('Error downloading single entry Word:', err);
      alert('Gagal mengunduh berkas Word.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintSingle = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-300 flex-wrap gap-y-1">
              <span className="px-2 py-0.5 bg-indigo-900/80 rounded-md border border-indigo-700">
                Pertemuan Ke-{entry.pertemuanKe}
              </span>
              <span>•</span>
              <span>Kelas {entry.kelas}</span>
              <span>•</span>
              <span>{entry.tanggal}</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{entry.materiPokok}</h2>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            aria-label="Tutup rincian"
            title="Tutup (ESC)"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer flex items-center justify-center"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm text-slate-700">
          {/* Tujuan Pembelajaran & Alokasi */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tujuan Pembelajaran (TP)
              </span>
              <span className="text-xs text-slate-500 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{entry.durasiMenit} Menit</span>
              </span>
            </div>
            <p className="text-slate-800 leading-relaxed font-medium">{entry.tujuanPembelajaran}</p>
            <div className="pt-2 flex items-center space-x-2 text-xs">
              <span className="font-semibold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                Metode: {entry.metodePembelajaran}
              </span>
            </div>
          </div>

          {/* 3 Metrik Kunci */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
              <div className="text-xs text-indigo-700 font-medium">Pemahaman Konsep</div>
              <div className="text-2xl font-bold text-indigo-900">{entry.pemahamanKonsep}%</div>
            </div>
            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
              <div className="text-xs text-emerald-700 font-medium">Keaktifan Siswa</div>
              <div className="text-2xl font-bold text-emerald-900">{entry.keaktifanSiswa}%</div>
            </div>
            <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl">
              <div className="text-xs text-amber-700 font-medium">Capaian TP</div>
              <div className="text-2xl font-bold text-amber-900">{entry.ketercapaianTP}%</div>
            </div>
          </div>

          {/* Pengalaman Belajar Siswa */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pengalaman Belajar Siswa
            </h3>
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-500">Antusiasme:</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    entry.pengalamanSiswa.antusiasme === 'Tinggi'
                      ? 'bg-emerald-100 text-emerald-800'
                      : entry.pengalamanSiswa.antusiasme === 'Sedang'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {entry.pengalamanSiswa.antusiasme}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  Catatan Anekdot / Perilaku Belajar Nyata:
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed italic">
                  "{entry.pengalamanSiswa.catatanAnekdot || 'Tidak ada catatan khusus.'}"
                </p>
              </div>

              {entry.pengalamanSiswa.titikKesulitan && (
                <div>
                  <span className="text-xs font-semibold text-rose-700 flex items-center space-x-1 mb-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Titik Kesulitan / Miskonsepsi Siswa:</span>
                  </span>
                  <p className="text-xs text-rose-900 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                    {entry.pengalamanSiswa.titikKesulitan}
                  </p>
                </div>
              )}

              {entry.pengalamanSiswa.responsPositif && (
                <div>
                  <span className="text-xs font-semibold text-emerald-700 flex items-center space-x-1 mb-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Respons Positif Siswa:</span>
                  </span>
                  <p className="text-xs text-emerald-900 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    {entry.pengalamanSiswa.responsPositif}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Efektivitas Metode & Rencana Tindak Lanjut */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Evaluasi Metode & Tindak Lanjut
            </h3>
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  Keberhasilan / Efektivitas Metode:
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {entry.keberhasilanMetode}
                </p>
              </div>

              {entry.kendalaMetode && (
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-1">
                    Kendala / Hambatan yang Muncul:
                  </span>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {entry.kendalaMetode}
                  </p>
                </div>
              )}

              <div>
                <span className="text-xs font-semibold text-indigo-900 block mb-1">
                  Rencana Tindak Lanjut Pertemuan Berikutnya:
                </span>
                <p className="text-xs text-indigo-900 bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-200 font-medium">
                  {entry.tindakLanjut}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions with Download & Close buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                if (confirm(`Yakin ingin menghapus catatan pertemuan ke-${entry.pertemuanKe}?`)) {
                  onDelete(entry.id);
                  onClose();
                }
              }}
              className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Sesi</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <button
              type="button"
              onClick={handleDownloadSingle}
              disabled={isDownloading}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              title="Unduh format Microsoft Word (.docx) untuk sesi ini"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Mengunduh...' : 'Unduh Word Sesi Ini'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onEdit(entry);
                onClose();
              }}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Sesi</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
