import React, { useState, useEffect } from 'react';
import { TeacherIdentity, PrincipalIdentity, ReflectionEntry } from './types/journal';
import {
  initialTeacherIdentity,
  initialPrincipalIdentity,
  initialReflections,
} from './utils/sampleData';
import {
  generateWordDocument,
  generateSingleEntryWordDocument,
  downloadBlob,
} from './utils/docxExport';
import { analyzeStudentTrends } from './utils/trendAnalysis';
import { IdentityModal } from './components/IdentityModal';
import { ReflectionFormModal } from './components/ReflectionFormModal';
import { TrendAnalysisView } from './components/TrendAnalysisView';
import { PrintDocumentPreview } from './components/PrintDocumentPreview';
import { EntryDetailModal } from './components/EntryDetailModal';
import {
  BookOpen,
  TrendingUp,
  FileText,
  UserCheck,
  Plus,
  FileDown,
  Printer,
  Search,
  Filter,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit3,
  Download,
  Upload,
  RefreshCw,
  Award,
  Wand2,
} from 'lucide-react';

export default function App() {
  // 1. Persistent State in LocalStorage
  const [teacher, setTeacher] = useState<TeacherIdentity>(() => {
    const saved = localStorage.getItem('refleksiguru_teacher');
    return saved ? JSON.parse(saved) : initialTeacherIdentity;
  });

  const [principal, setPrincipal] = useState<PrincipalIdentity>(() => {
    const saved = localStorage.getItem('refleksiguru_principal');
    return saved ? JSON.parse(saved) : initialPrincipalIdentity;
  });

  const [reflections, setReflections] = useState<ReflectionEntry[]>(() => {
    const saved = localStorage.getItem('refleksiguru_entries');
    if (!saved) return initialReflections;
    try {
      const parsed: ReflectionEntry[] = JSON.parse(saved);
      const hasHotel = parsed.some(
        (e) => e.id === 'ref-021' || e.materiPokok.toLowerCase().includes('hotel')
      );
      if (!hasHotel) {
        const hotelEntry = initialReflections.find((e) => e.id === 'ref-021');
        if (hotelEntry) return [hotelEntry, ...parsed];
      }
      return parsed;
    } catch {
      return initialReflections;
    }
  });

  // 2. UI View State
  const [activeTab, setActiveTab] = useState<'trends' | 'journal' | 'preview'>('trends');
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<ReflectionEntry | null>(null);
  const [selectedEntryDetail, setSelectedEntryDetail] = useState<ReflectionEntry | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterMethod, setFilterMethod] = useState<string>('ALL');

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('refleksiguru_teacher', JSON.stringify(teacher));
  }, [teacher]);

  useEffect(() => {
    localStorage.setItem('refleksiguru_principal', JSON.stringify(principal));
  }, [principal]);

  useEffect(() => {
    localStorage.setItem('refleksiguru_entries', JSON.stringify(reflections));
  }, [reflections]);

  // Actions
  const handleSaveIdentity = (newTeacher: TeacherIdentity, newPrincipal: PrincipalIdentity) => {
    setTeacher(newTeacher);
    setPrincipal(newPrincipal);
  };

  const handleSaveReflection = (entry: ReflectionEntry) => {
    const existingIndex = reflections.findIndex((e) => e.id === entry.id);
    if (existingIndex >= 0) {
      const updated = [...reflections];
      updated[existingIndex] = entry;
      setReflections(updated);
    } else {
      setReflections([entry, ...reflections]);
    }
  };

  const [isDownloadingWord, setIsDownloadingWord] = useState(false);

  const handleDeleteReflection = (id: string) => {
    setReflections(reflections.filter((e) => e.id !== id));
  };

  const handleDownloadWord = async () => {
    try {
      setIsDownloadingWord(true);
      const blob = await generateWordDocument(teacher, principal, reflections);
      const safeName = teacher.nama.replace(/[^a-zA-Z0-9]/g, '_');
      downloadBlob(blob, `Jurnal_Refleksi_${safeName}_${teacher.mataPelajaran}.docx`);
    } catch (err) {
      console.error(err);
      alert('Gagal menghasilkan berkas Word.');
    } finally {
      setIsDownloadingWord(false);
    }
  };

  const handleDownloadSingleWord = async (entry: ReflectionEntry) => {
    try {
      const blob = await generateSingleEntryWordDocument(teacher, principal, entry);
      const safeMateri = entry.materiPokok.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 25);
      downloadBlob(blob, `Refleksi_Pertemuan_${entry.pertemuanKe}_${safeMateri}.docx`);
    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh berkas Word.');
    }
  };

  const handleResetData = () => {
    if (confirm('Kembalikan ke data contoh standar? Semua catatan yang Anda tulis akan digantikan dengan data sampel.')) {
      setTeacher(initialTeacherIdentity);
      setPrincipal(initialPrincipalIdentity);
      setReflections(initialReflections);
    }
  };

  const handleExportJSON = () => {
    const payload = {
      teacher,
      principal,
      reflections,
      version: '1.0',
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `Backup_Jurnal_Refleksi_${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.teacher && parsed.reflections) {
          setTeacher(parsed.teacher);
          if (parsed.principal) setPrincipal(parsed.principal);
          setReflections(parsed.reflections);
          alert('Berhasil mengimpor data jurnal refleksi!');
        } else {
          alert('Format berkas JSON tidak sesuai.');
        }
      } catch (err) {
        alert('Gagal membaca berkas JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filtered Reflections List
  const filteredReflections = reflections.filter((e) => {
    const matchSearch =
      e.materiPokok.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tujuanPembelajaran.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.metodePembelajaran.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.pengalamanSiswa.catatanAnekdot.toLowerCase().includes(searchQuery.toLowerCase());

    const matchClass = filterClass === 'ALL' || e.kelas === filterClass;
    const matchMethod = filterMethod === 'ALL' || e.metodePembelajaran === filterMethod;

    return matchSearch && matchClass && matchMethod;
  });

  const allClasses = Array.from(new Set(reflections.map((r) => r.kelas))).filter(Boolean);
  const allMethods = Array.from(new Set(reflections.map((r) => r.metodePembelajaran))).filter(Boolean);

  const nextPertemuan = reflections.length > 0 ? Math.max(...reflections.map((r) => r.pertemuanKe)) + 1 : 1;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & App Info */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
                    Refleksi<span className="text-indigo-600">Guru</span>
                  </h1>
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                    Kurikulum Merdeka / Nasional
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block truncate max-w-sm">
                  {teacher.sekolah} • {teacher.nama}, {teacher.gelar} ({teacher.mataPelajaran})
                </p>
              </div>
            </div>

            {/* Quick Actions (Identitas, Unduh Word, Unduh PDF, Tambah Sesi) */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Tombol Atur Identitas */}
              <button
                onClick={() => setIsIdentityModalOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center space-x-1.5 shadow-2xs"
                title="Kelola Identitas Guru & Kepala Sekolah"
              >
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span className="hidden md:inline">Identitas Guru & Kepsek</span>
              </button>

              {/* Unduh Word */}
              <button
                onClick={handleDownloadWord}
                disabled={isDownloadingWord}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                title="Unduh Dokumen Lengkap Word (.docx)"
              >
                <FileDown className="w-4 h-4" />
                <span className="hidden sm:inline">{isDownloadingWord ? 'Menyiapkan...' : 'Unduh Word'}</span>
              </button>

              {/* Cetak / PDF */}
              <button
                onClick={() => setIsPreviewModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center space-x-1.5"
                title="Pratinjau & Cetak PDF Resmi"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Cetak / PDF</span>
              </button>

              {/* Tambah Jurnal with Generate feature */}
              <button
                onClick={() => {
                  setEntryToEdit(null);
                  setIsFormModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                title="Tulis Catatan atau Generate Refleksi Baru"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Tulis & Generate Refleksi</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex items-center justify-between">
          <div className="flex space-x-2 sm:space-x-6">
            <button
              onClick={() => setActiveTab('trends')}
              className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center space-x-2 transition-colors ${
                activeTab === 'trends'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Analisis Tren Otomatis</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded-full">
                AI / Statistik
              </span>
            </button>

            <button
              onClick={() => setActiveTab('journal')}
              className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center space-x-2 transition-colors ${
                activeTab === 'journal'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Daftar Jurnal Refleksi ({reflections.length})</span>
            </button>

            <button
              onClick={() => setIsPreviewModalOpen(true)}
              className="py-3 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center space-x-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Pratinjau Format Resmi Cetak</span>
            </button>
          </div>

          {/* Backup / Restore Dropdown / Actions */}
          <div className="hidden lg:flex items-center space-x-3 text-xs text-slate-500 py-2">
            <button
              onClick={handleExportJSON}
              className="hover:text-slate-800 flex items-center space-x-1"
              title="Cadangkan data ke file JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup</span>
            </button>
            <span>•</span>
            <label className="hover:text-slate-800 flex items-center space-x-1 cursor-pointer" title="Pulihkan data dari file JSON">
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
            <span>•</span>
            <button
              onClick={handleResetData}
              className="hover:text-amber-700 flex items-center space-x-1"
              title="Reset ke data awal"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner Identitas Aktif */}
        <div className="mb-6 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-900 text-sm sm:text-base">
                  {teacher.nama}, {teacher.gelar}
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md">
                  NIP: {teacher.nip || '-'}
                </span>
                <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md">
                  {teacher.pangkatGolongan || 'Guru'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Mapel: <strong className="text-slate-700">{teacher.mataPelajaran}</strong> ({teacher.kelasDiampu}) •{' '}
                {teacher.sekolah} • {teacher.semester} {teacher.tahunAjaran}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 text-xs text-slate-600">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] text-slate-400">Kepala Sekolah Penilai:</div>
              <div className="font-semibold text-slate-800">
                {principal.nama}, {principal.gelar}
              </div>
              <div className="text-[11px] text-slate-500">NIP. {principal.nip || '-'}</div>
            </div>
            <button
              onClick={() => setIsIdentityModalOpen(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Ubah Identitas
            </button>
          </div>
        </div>

        {/* View 1: Analisis Tren Kemajuan Siswa Otomatis */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <TrendAnalysisView
              entries={reflections}
              onSelectEntry={(entry) => setSelectedEntryDetail(entry)}
              onDownloadWord={handleDownloadWord}
              onPrintPreview={() => setIsPreviewModalOpen(true)}
            />
          </div>
        )}

        {/* View 2: Daftar Jurnal Refleksi Mengajar */}
        {activeTab === 'journal' && (
          <div className="space-y-6">
            {/* Search & Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari materi, metode, atau catatan siswa..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Filter Controls */}
              <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <div className="flex items-center space-x-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shrink-0 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="bg-transparent text-slate-700 font-medium pr-2 focus:outline-hidden"
                  >
                    <option value="ALL">Semua Kelas</option>
                    {allClasses.map((c) => (
                      <option key={c} value={c}>
                        Kelas {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shrink-0 text-xs">
                  <select
                    value={filterMethod}
                    onChange={(e) => setFilterMethod(e.target.value)}
                    className="bg-transparent text-slate-700 font-medium pr-2 focus:outline-hidden"
                  >
                    <option value="ALL">Semua Metode</option>
                    {allMethods.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    setEntryToEdit(null);
                    setIsFormModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors shrink-0 flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Sesi</span>
                </button>
              </div>
            </div>

            {/* List / Cards of Reflections */}
            {filteredReflections.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700">Tidak ada jurnal refleksi yang cocok</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Coba ubah kata kunci pencarian atau bersihkan filter kelas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReflections.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all p-5 flex flex-col justify-between group space-y-4"
                  >
                    <div>
                      {/* Top Meta */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                            Pertemuan {entry.pertemuanKe}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            Kelas {entry.kelas}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{entry.tanggal}</span>
                      </div>

                      {/* Title & TP */}
                      <h3
                        onClick={() => setSelectedEntryDetail(entry)}
                        className="text-base font-bold text-slate-900 group-hover:text-indigo-600 cursor-pointer transition-colors"
                      >
                        {entry.materiPokok}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        <span className="font-semibold text-slate-600">TP: </span>
                        {entry.tujuanPembelajaran}
                      </p>

                      {/* Method Tag */}
                      <div className="mt-3">
                        <span className="inline-block text-[11px] font-semibold text-indigo-900 bg-indigo-50/80 px-2.5 py-1 rounded-md border border-indigo-100">
                          {entry.metodePembelajaran}
                        </span>
                      </div>

                      {/* Metrics Pill Grid */}
                      <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 bg-slate-50 rounded-xl text-center">
                        <div>
                          <div className="text-[10px] text-slate-400">Pemahaman</div>
                          <div className="text-sm font-extrabold text-indigo-700">
                            {entry.pemahamanKonsep}%
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Keaktifan</div>
                          <div className="text-sm font-extrabold text-emerald-700">
                            {entry.keaktifanSiswa}%
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Capaian TP</div>
                          <div className="text-sm font-extrabold text-amber-700">
                            {entry.ketercapaianTP}%
                          </div>
                        </div>
                      </div>

                      {/* Student Experience Quote */}
                      {entry.pengalamanSiswa.catatanAnekdot && (
                        <div className="mt-3 text-xs bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 italic text-slate-600 line-clamp-2">
                          "{entry.pengalamanSiswa.catatanAnekdot}"
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => setSelectedEntryDetail(entry)}
                        className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                      >
                        <span>Lihat Selengkapnya</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleDownloadSingleWord(entry)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Unduh format Word (.docx) untuk pertemuan ini"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEntryToEdit(entry);
                            setIsFormModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Refleksi"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus catatan pertemuan ke-${entry.pertemuanKe}?`)) {
                              handleDeleteReflection(entry.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Refleksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
        <p>
          RefleksiGuru © 2026 • Dirancang untuk Guru Pembelajar & Supervisi Pembelajaran Berdampak
        </p>
        <p className="mt-1 text-slate-400">
          Mendukung unduhan format Microsoft Word (.docx) & PDF A4 resmi beridentitas Guru & Kepala Sekolah
        </p>
      </footer>

      {/* Modals */}
      <IdentityModal
        isOpen={isIdentityModalOpen}
        onClose={() => setIsIdentityModalOpen(false)}
        teacher={teacher}
        principal={principal}
        onSave={handleSaveIdentity}
      />

      <ReflectionFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEntryToEdit(null);
        }}
        onSave={handleSaveReflection}
        entryToEdit={entryToEdit}
        suggestedPertemuanKe={nextPertemuan}
        defaultKelas={teacher.kelasDiampu.split(' ')[0] || 'X-1'}
      />

      <PrintDocumentPreview
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        teacher={teacher}
        principal={principal}
        reflections={reflections}
      />

      <EntryDetailModal
        isOpen={selectedEntryDetail !== null}
        onClose={() => setSelectedEntryDetail(null)}
        entry={selectedEntryDetail}
        teacher={teacher}
        principal={principal}
        onEdit={(entry) => {
          setEntryToEdit(entry);
          setIsFormModalOpen(true);
        }}
        onDelete={handleDeleteReflection}
      />
    </div>
  );
}
