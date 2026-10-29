import React, { useState, useEffect } from 'react';
import { ReflectionEntry, TeachingMethod } from '../types/journal';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Wand2,
  RefreshCw,
  FileDown,
  Info,
} from 'lucide-react';
import {
  generateReflection,
  generateSingleField,
  GenerateInput,
} from '../utils/reflectionGenerator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: ReflectionEntry) => void;
  entryToEdit?: ReflectionEntry | null;
  suggestedPertemuanKe: number;
  defaultKelas?: string;
}

const METHOD_OPTIONS: TeachingMethod[] = [
  'Problem Based Learning (PBL)',
  'Project Based Learning (PjBL)',
  'Discovery / Inquiry Learning',
  'Pembelajaran Berdiferensiasi',
  'Kooperatif (Jigsaw/STAD)',
  'Ceramah Interaktif & Diskusi',
  'Gamifikasi & Kuis Interaktif',
  'Praktikum / Eksperimen Langsung',
  'Flipped Classroom',
];

export const ReflectionFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  entryToEdit,
  suggestedPertemuanKe,
  defaultKelas = 'X-1',
}) => {
  const [formData, setFormData] = useState<Omit<ReflectionEntry, 'id' | 'createdAt' | 'updatedAt'>>({
    tanggal: new Date().toISOString().split('T')[0],
    pertemuanKe: suggestedPertemuanKe,
    kelas: defaultKelas,
    materiPokok: '',
    tujuanPembelajaran: '',
    metodePembelajaran: 'Problem Based Learning (PBL)',
    durasiMenit: 90,
    pemahamanKonsep: 75,
    keaktifanSiswa: 80,
    ketercapaianTP: 75,
    pengalamanSiswa: {
      antusiasme: 'Tinggi',
      catatanAnekdot: '',
      titikKesulitan: '',
      responsPositif: '',
    },
    keberhasilanMetode: '',
    kendalaMetode: '',
    faktorPendukung: '',
    tindakLanjut: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSource, setGenerationSource] = useState<'ai' | 'heuristic' | null>(null);
  const [justGenerated, setJustGenerated] = useState(false);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  // Sync form when opening or editing
  useEffect(() => {
    if (entryToEdit) {
      setFormData({
        tanggal: entryToEdit.tanggal,
        pertemuanKe: entryToEdit.pertemuanKe,
        kelas: entryToEdit.kelas,
        materiPokok: entryToEdit.materiPokok,
        tujuanPembelajaran: entryToEdit.tujuanPembelajaran,
        metodePembelajaran: entryToEdit.metodePembelajaran,
        durasiMenit: entryToEdit.durasiMenit,
        pemahamanKonsep: entryToEdit.pemahamanKonsep,
        keaktifanSiswa: entryToEdit.keaktifanSiswa,
        ketercapaianTP: entryToEdit.ketercapaianTP,
        pengalamanSiswa: { ...entryToEdit.pengalamanSiswa },
        keberhasilanMetode: entryToEdit.keberhasilanMetode,
        kendalaMetode: entryToEdit.kendalaMetode,
        faktorPendukung: entryToEdit.faktorPendukung || '',
        tindakLanjut: entryToEdit.tindakLanjut,
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        pertemuanKe: suggestedPertemuanKe,
        kelas: defaultKelas,
        tanggal: new Date().toISOString().split('T')[0],
      }));
    }
    setValidationWarning(null);
  }, [entryToEdit, suggestedPertemuanKe, defaultKelas, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
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

  // CRITICAL: If modal is not open, do not render to DOM!
  if (!isOpen) {
    return null;
  }

  // Helper to load sample data (e.g., Perhotelan Departemen Hotel)
  const handleLoadSampleData = () => {
    setFormData({
      tanggal: '2026-10-29',
      pertemuanKe: 21,
      kelas: 'Fase F - XI Perhotelan',
      materiPokok: 'Jenis-Jenis Departemen Hotel & Alur Operasional',
      tujuanPembelajaran:
        'Peserta didik mampu mengklasifikasikan departemen hotel (Front of the House vs Back of the House) serta menjelaskan koordinasi layanan tamu.',
      metodePembelajaran: 'Problem Based Learning (PBL)',
      durasiMenit: 90,
      pemahamanKonsep: 78,
      keaktifanSiswa: 85,
      ketercapaianTP: 80,
      pengalamanSiswa: {
        antusiasme: 'Tinggi',
        catatanAnekdot: '',
        titikKesulitan: '',
        responsPositif: '',
      },
      keberhasilanMetode: '',
      kendalaMetode: '',
      faktorPendukung: 'LKPD studi kasus guest cycle',
      tindakLanjut: '',
    });
    setValidationWarning(null);
  };

  const getInputData = (): GenerateInput => ({
    materiPokok: formData.materiPokok.trim(),
    tujuanPembelajaran: formData.tujuanPembelajaran.trim(),
    metodePembelajaran: formData.metodePembelajaran,
    pemahamanKonsep: formData.pemahamanKonsep,
    keaktifanSiswa: formData.keaktifanSiswa,
    ketercapaianTP: formData.ketercapaianTP,
    antusiasme: formData.pengalamanSiswa.antusiasme,
    kelas: formData.kelas.trim() || 'Fase',
    durasiMenit: formData.durasiMenit,
  });

  // Generate full reflection based on filled data
  const handleGenerateAll = async () => {
    if (!formData.materiPokok.trim()) {
      setValidationWarning('Silakan ketikkan "Materi Pokok / Topik" terlebih dahulu agar refleksi tersusun akurat sesuai materi Anda.');
      return;
    }
    setValidationWarning(null);
    setIsGenerating(true);

    try {
      const input = getInputData();
      const generated = await generateReflection(input);

      setFormData((prev) => ({
        ...prev,
        pengalamanSiswa: {
          ...prev.pengalamanSiswa,
          catatanAnekdot: generated.pengalamanSiswa.catatanAnekdot,
          titikKesulitan: generated.pengalamanSiswa.titikKesulitan,
          responsPositif: generated.pengalamanSiswa.responsPositif,
        },
        keberhasilanMetode: generated.keberhasilanMetode,
        kendalaMetode: generated.kendalaMetode,
        tindakLanjut: generated.tindakLanjut,
      }));

      setGenerationSource(generated.source || 'heuristic');
      setJustGenerated(true);
      setTimeout(() => setJustGenerated(false), 4000);
    } catch (err) {
      console.error('Error generating reflection:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Re-generate individual field
  const handleRegenerateField = (
    field: 'catatanAnekdot' | 'titikKesulitan' | 'responsPositif' | 'keberhasilanMetode' | 'kendalaMetode' | 'tindakLanjut'
  ) => {
    if (!formData.materiPokok.trim()) {
      setValidationWarning('Ketikkan materi pokok terlebih dahulu sebelum regenerasi bidang narasi.');
      return;
    }
    setValidationWarning(null);
    const input = getInputData();
    const newText = generateSingleField(field, input);

    if (field === 'catatanAnekdot' || field === 'titikKesulitan' || field === 'responsPositif') {
      setFormData((prev) => ({
        ...prev,
        pengalamanSiswa: {
          ...prev.pengalamanSiswa,
          [field]: newText,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: newText,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.materiPokok.trim()) {
      setValidationWarning('Materi pokok tidak boleh kosong.');
      return;
    }
    const now = new Date().toISOString();
    const finalEntry: ReflectionEntry = {
      ...formData,
      id: entryToEdit ? entryToEdit.id : `ref-${Date.now()}`,
      createdAt: entryToEdit ? entryToEdit.createdAt : now,
      updatedAt: now,
    };
    onSave(finalEntry);
    onClose();
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
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <BookOpen className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {entryToEdit ? 'Edit Catatan Jurnal Refleksi Mengajar' : 'Tulis Jurnal Refleksi Mengajar Baru'}
              </h2>
              <p className="text-xs text-indigo-200">
                Dokumentasikan data pengalaman belajar siswa, efektivitas metode & tindak lanjut
              </p>
            </div>
          </div>

          {/* Tombol Close Utama */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            aria-label="Tutup jendela"
            title="Tutup (ESC)"
            className="p-2 rounded-xl text-indigo-200 hover:text-white hover:bg-white/20 active:bg-white/30 transition-all cursor-pointer flex items-center justify-center focus:outline-hidden focus:ring-2 focus:ring-white/40"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-sm text-slate-700">
          {/* Validation Warning Alert if any */}
          {validationWarning && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center space-x-2.5 text-amber-900 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{validationWarning}</span>
            </div>
          )}

          {/* 1. Sesi & Informasi Dasar */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>1. Informasi Sesi Pembelajaran</span>
              </h3>
              <button
                type="button"
                onClick={handleLoadSampleData}
                className="text-[11px] text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 font-semibold px-2.5 py-1 rounded-md border border-indigo-200 transition-colors flex items-center space-x-1 cursor-pointer"
                title="Gunakan contoh data (Departemen Perhotelan)"
              >
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>Muat Contoh Data Sesi</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pertemuan Ke- <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.pertemuanKe}
                  onChange={(e) => setFormData({ ...formData, pertemuanKe: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kelas / Rombel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.kelas}
                  onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                  placeholder="Contoh: X-1 atau Fase F"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alokasi Waktu (Menit)
                </label>
                <input
                  type="number"
                  value={formData.durasiMenit}
                  onChange={(e) => setFormData({ ...formData, durasiMenit: parseInt(e.target.value) || 90 })}
                  placeholder="90"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Materi Pokok / Topik <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.materiPokok}
                  onChange={(e) => {
                    setFormData({ ...formData, materiPokok: e.target.value });
                    if (validationWarning) setValidationWarning(null);
                  }}
                  placeholder="Contoh: Jenis-jenis Departemen Hotel / Aljabar / Ekosistem"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Metode Pembelajaran yang Diterapkan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.metodePembelajaran}
                  onChange={(e) => setFormData({ ...formData, metodePembelajaran: e.target.value as TeachingMethod })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {METHOD_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tujuan Pembelajaran (TP) / Capaian Sesi <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={formData.tujuanPembelajaran}
                onChange={(e) => setFormData({ ...formData, tujuanPembelajaran: e.target.value })}
                placeholder="Contoh: Peserta didik mampu menjelaskan fungsi utama setiap departemen hotel dan alur koordinasi pelayanan tamu."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 2. Indikator Evaluasi Kuantitatif (Sliders untuk Analisis Tren Otomatis) */}
          <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>2. Indikator Kuantitatif (Menentukan Analisis & Tren)</span>
              </h3>
              <span className="text-[11px] text-indigo-700 font-medium">Rentang 0 - 100%</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pemahaman Konsep */}
              <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-2xs">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-800">Pemahaman Konsep</label>
                  <span className="text-xs font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-md">
                    {formData.pemahamanKonsep}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={formData.pemahamanKonsep}
                  onChange={(e) => setFormData({ ...formData, pemahamanKonsep: Number(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-1">Daya serap materi siswa di kelas</p>
              </div>

              {/* Keaktifan Siswa */}
              <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-800">Keaktifan / Partisipasi</label>
                  <span className="text-xs font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-md">
                    {formData.keaktifanSiswa}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={formData.keaktifanSiswa}
                  onChange={(e) => setFormData({ ...formData, keaktifanSiswa: Number(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-1">Interaksi, bertanya, kerja kelompok</p>
              </div>

              {/* Ketercapaian TP */}
              <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-2xs">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-800">Ketercapaian TP</label>
                  <span className="text-xs font-bold text-amber-600 px-2 py-0.5 bg-amber-50 rounded-md">
                    {formData.ketercapaianTP}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={formData.ketercapaianTP}
                  onChange={(e) => setFormData({ ...formData, ketercapaianTP: Number(e.target.value) })}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-1">Persentase tujuan tuntas hari ini</p>
              </div>
            </div>
          </div>

          {/* GENERATE SECTION: TOMBOL GENERATE SESUAI DATA DIISI */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-4 rounded-xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-indigo-700/50">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <Wand2 className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold tracking-wide uppercase text-indigo-200">
                  Generator Refleksi Otomatis Sesuai Data
                </span>
                {justGenerated && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                    ✓ Selesai ({generationSource === 'ai' ? 'AI' : 'Cerdas'})
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-100/90 max-w-lg leading-relaxed">
                Menyusun narasi anekdot belajar, kesulitan spesifik, respons positif, analisis metode, dan rencana tindak lanjut sesuai materi "{formData.materiPokok || '...'}" dan nilai indikator di atas.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateAll}
              disabled={isGenerating}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shrink-0 shadow-lg cursor-pointer ${
                isGenerating
                  ? 'bg-indigo-700 text-indigo-200 cursor-wait'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold hover:shadow-amber-500/25 active:scale-95'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
                  <span>Menganalisis & Mengenerate...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Generate Narasi Sesuai Data</span>
                </>
              )}
            </button>
          </div>

          {/* 3. Pengalaman Belajar Siswa */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>3. Catatan Pengalaman Belajar Siswa</span>
              </h3>
              <span className="text-[11px] text-slate-500">Dapat diedit atau digenerate ulang per bagian</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tingkat Antusiasme Siswa
                </label>
                <div className="flex flex-col space-y-1.5">
                  {(['Tinggi', 'Sedang', 'Perlu Motivasi'] as const).map((lvl) => (
                    <label
                      key={lvl}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                        formData.pengalamanSiswa.antusiasme === lvl
                          ? 'border-indigo-600 bg-indigo-50/70 font-semibold text-indigo-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="antusiasme"
                        checked={formData.pengalamanSiswa.antusiasme === lvl}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            pengalamanSiswa: { ...formData.pengalamanSiswa, antusiasme: lvl },
                          })
                        }
                        className="accent-indigo-600"
                      />
                      <span>{lvl}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Catatan Anekdot / Peristiwa Belajar Nyata Siswa
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRegenerateField('catatanAnekdot')}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1 cursor-pointer"
                      title="Regenerate kalimat anekdot ini saja"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Regenerate Anekdot</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.pengalamanSiswa.catatanAnekdot}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pengalamanSiswa: { ...formData.pengalamanSiswa, catatanAnekdot: e.target.value },
                      })
                    }
                    placeholder="Contoh: Siswa aktif menyusun diagram alur departemen hotel; saat sesi presentasi, kelompok 2 berinisiatif membagi peran layaknya staf operasional hotel..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-red-700 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Titik Kesulitan / Miskonsepsi Siswa</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRegenerateField('titikKesulitan')}
                    className="text-[11px] text-red-600 hover:text-red-800 font-medium flex items-center space-x-1 cursor-pointer"
                    title="Regenerate bagian titik kesulitan ini saja"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={formData.pengalamanSiswa.titikKesulitan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pengalamanSiswa: { ...formData.pengalamanSiswa, titikKesulitan: e.target.value },
                    })
                  }
                  placeholder="Contoh: Siswa masih keliru membedakan departemen Front of the House dan Back of the House..."
                  className="w-full px-3 py-1.5 border border-red-200 rounded-lg text-xs focus:ring-2 focus:ring-red-400 focus:outline-hidden bg-red-50/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-emerald-700 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Respons Positif / Keberhasilan Siswa</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRegenerateField('responsPositif')}
                    className="text-[11px] text-emerald-600 hover:text-emerald-800 font-medium flex items-center space-x-1 cursor-pointer"
                    title="Regenerate bagian respons positif ini saja"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={formData.pengalamanSiswa.responsPositif}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pengalamanSiswa: { ...formData.pengalamanSiswa, responsPositif: e.target.value },
                    })
                  }
                  placeholder="Contoh: Siswa sangat bersemangat saat mempresentasikan bagan organisasi hotel di depan kelas..."
                  className="w-full px-3 py-1.5 border border-emerald-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-hidden bg-emerald-50/20"
                />
              </div>
            </div>
          </div>

          {/* 4. Refleksi Efektivitas Metode & Rencana Tindak Lanjut */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <span>4. Refleksi Efektivitas Metode & Rencana Tindak Lanjut</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Keberhasilan Metode (Apa yang efektif?) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRegenerateField('keberhasilanMetode')}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1 cursor-pointer"
                    title="Regenerate bagian ini saja"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  required
                  value={formData.keberhasilanMetode}
                  onChange={(e) => setFormData({ ...formData, keberhasilanMetode: e.target.value })}
                  placeholder="Contoh: Metode Problem Based Learning terbukti efektif membantu siswa memahami sinergi antar departemen dalam melayani tamu..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Kendala Penerapan Metode <span className="text-slate-400 font-normal">(jika ada)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRegenerateField('kendalaMetode')}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-medium flex items-center space-x-1 cursor-pointer"
                    title="Regenerate kendala"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={formData.kendalaMetode}
                  onChange={(e) => setFormData({ ...formData, kendalaMetode: e.target.value })}
                  placeholder="Contoh: Penguasaan istilah perhotelan berbahasa Inggris masih beragam sehingga diskusi kelompok sedikit melampaui waktu estimasi..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-indigo-900">
                  Rencana Tindak Lanjut / Aksi Pertemuan Berikutnya <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleRegenerateField('tindakLanjut')}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1 cursor-pointer"
                  title="Regenerate tindak lanjut"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate</span>
                </button>
              </div>
              <textarea
                rows={2}
                required
                value={formData.tindakLanjut}
                onChange={(e) => setFormData({ ...formData, tindakLanjut: e.target.value })}
                placeholder="Contoh: Mengadakan sesi simulasi role-play tamu check-in pada pertemuan berikutnya dan menyiapkan glosarium istilah industri hotel..."
                className="w-full px-3 py-1.5 border border-indigo-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-indigo-50/20"
              />
            </div>
          </div>

          {/* Footer Form */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors cursor-pointer flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Batal / Tutup</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{entryToEdit ? 'Simpan Perubahan' : 'Tambahkan ke Jurnal'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
