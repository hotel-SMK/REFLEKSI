import React, { useState, useEffect } from 'react';
import { TeacherIdentity, PrincipalIdentity } from '../types/journal';
import { UserCheck, Building2, Calendar, FileText, Check, X, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherIdentity;
  principal: PrincipalIdentity;
  onSave: (teacher: TeacherIdentity, principal: PrincipalIdentity) => void;
}

export const IdentityModal: React.FC<Props> = ({
  isOpen,
  onClose,
  teacher,
  principal,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'guru' | 'kepsek'>('guru');
  const [teacherData, setTeacherData] = useState<TeacherIdentity>({ ...teacher });
  const [principalData, setPrincipalData] = useState<PrincipalIdentity>({ ...principal });

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(teacherData, principalData);
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
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <UserCheck className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Identitas Dokumen Refleksi</h2>
              <p className="text-xs text-indigo-200 mt-0.5">
                Dicantumkan resmi pada lembar pengesahan berkas Word (.docx) & cetak PDF
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            aria-label="Tutup jendela"
            className="p-2 rounded-xl text-indigo-200 hover:text-white hover:bg-white/20 active:bg-white/30 transition-all cursor-pointer flex items-center justify-center"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('guru')}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'guru'
                ? 'bg-white border-indigo-600 text-indigo-700 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span>1. Identitas Guru Pengampu</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kepsek')}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'kepsek'
                ? 'bg-white border-indigo-600 text-indigo-700 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>2. Identitas Kepala Sekolah</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {activeTab === 'guru' ? (
            <div className="space-y-4 text-sm text-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Nama Lengkap Guru (tanpa gelar) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherData.nama}
                    onChange={(e) => setTeacherData({ ...teacherData, nama: e.target.value })}
                    placeholder="Contoh: Hj. Endang Wahyuningsih"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Gelar Akademik <span className="text-slate-400 font-normal">(opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={teacherData.gelar}
                    onChange={(e) => setTeacherData({ ...teacherData, gelar: e.target.value })}
                    placeholder="Contoh: S.Pd., M.Pd."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    NIP / NUPTK <span className="text-slate-400 font-normal">(atau '-' jika non-PNS)</span>
                  </label>
                  <input
                    type="text"
                    value={teacherData.nip}
                    onChange={(e) => setTeacherData({ ...teacherData, nip: e.target.value })}
                    placeholder="Contoh: 19840512 200801 2 007"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Pangkat / Golongan Ruang
                  </label>
                  <input
                    type="text"
                    value={teacherData.pangkatGolongan}
                    onChange={(e) => setTeacherData({ ...teacherData, pangkatGolongan: e.target.value })}
                    placeholder="Contoh: Pembina / IV-a atau Guru Pertama / IX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Mata Pelajaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherData.mataPelajaran}
                    onChange={(e) => setTeacherData({ ...teacherData, mataPelajaran: e.target.value })}
                    placeholder="Contoh: Matematika / IPA / Bahasa Indonesia"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Kelas & Fase yang Diampu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherData.kelasDiampu}
                    onChange={(e) => setTeacherData({ ...teacherData, kelasDiampu: e.target.value })}
                    placeholder="Contoh: Fase E - Kelas X-1, X-2"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Nama Satuan Pendidikan / Sekolah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherData.sekolah}
                    onChange={(e) => setTeacherData({ ...teacherData, sekolah: e.target.value })}
                    placeholder="Contoh: SMA Negeri 1 Nusantara"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Semester & Tahun Ajaran
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={teacherData.semester}
                      onChange={(e) => setTeacherData({ ...teacherData, semester: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="Ganjil">Semester Ganjil</option>
                      <option value="Genap">Semester Genap</option>
                    </select>
                    <input
                      type="text"
                      value={teacherData.tahunAjaran}
                      onChange={(e) => setTeacherData({ ...teacherData, tahunAjaran: e.target.value })}
                      placeholder="2026/2027"
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Alamat Lengkap Satuan Pendidikan (untuk Kop Dokumen)
                </label>
                <input
                  type="text"
                  value={teacherData.alamatSekolah}
                  onChange={(e) => setTeacherData({ ...teacherData, alamatSekolah: e.target.value })}
                  placeholder="Contoh: Jl. Pendidikan Mandiri No. 45, Kebayoran Baru, Jakarta Selatan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-sm text-slate-700">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-start space-x-2.5">
                <Building2 className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <p>
                  Identitas Kepala Sekolah digunakan pada kolom pengesahan laporan resmi jurnal refleksi
                  sebagai tanda verifikasi kegiatan pembelajaran dan supervisi akademik.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Nama Lengkap Kepala Sekolah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={principalData.nama}
                    onChange={(e) => setPrincipalData({ ...principalData, nama: e.target.value })}
                    placeholder="Contoh: Drs. H. Mulyono"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Gelar Akademik <span className="text-slate-400 font-normal">(opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={principalData.gelar}
                    onChange={(e) => setPrincipalData({ ...principalData, gelar: e.target.value })}
                    placeholder="Contoh: M.M. / M.Pd."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    NIP Kepala Sekolah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={principalData.nip}
                    onChange={(e) => setPrincipalData({ ...principalData, nip: e.target.value })}
                    placeholder="Contoh: 19730215 199802 1 002"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Pangkat / Golongan Ruang
                  </label>
                  <input
                    type="text"
                    value={principalData.pangkatGolongan}
                    onChange={(e) => setPrincipalData({ ...principalData, pangkatGolongan: e.target.value })}
                    placeholder="Contoh: Pembina Utama Muda / IV-c"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Jabatan Resmi
                  </label>
                  <input
                    type="text"
                    value={principalData.jabatan}
                    onChange={(e) => setPrincipalData({ ...principalData, jabatan: e.target.value })}
                    placeholder="Contoh: Kepala SMA Negeri 1 Nusantara"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Kota / Kabupaten Pengesahan
                  </label>
                  <input
                    type="text"
                    value={principalData.kotaKabupaten}
                    onChange={(e) => setPrincipalData({ ...principalData, kotaKabupaten: e.target.value })}
                    placeholder="Contoh: Jakarta Selatan"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Tanggal Dokumen Pengesahan
                </label>
                <input
                  type="date"
                  value={principalData.tanggalDokumen}
                  onChange={(e) => setPrincipalData({ ...principalData, tanggalDokumen: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Data tersimpan otomatis di browser lokal</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors cursor-pointer"
              >
                Batal / Tutup
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Identitas</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
