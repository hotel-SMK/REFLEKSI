import React, { useState } from 'react';
import { ReflectionEntry } from '../types/journal';
import { analyzeStudentTrends } from '../utils/trendAnalysis';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Award,
  Users,
  Target,
  Brain,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Layers,
  ChevronRight,
  Filter,
  RefreshCw,
  Wand2,
  FileDown,
  Printer,
} from 'lucide-react';

interface Props {
  entries: ReflectionEntry[];
  onSelectEntry?: (entry: ReflectionEntry) => void;
  onDownloadWord?: () => void;
  onPrintPreview?: () => void;
}

export const TrendAnalysisView: React.FC<Props> = ({
  entries,
  onSelectEntry,
  onDownloadWord,
  onPrintPreview,
}) => {
  const [selectedFilterClass, setSelectedFilterClass] = useState<string>('ALL');
  const [activeMetric, setActiveMetric] = useState<'all' | 'pemahaman' | 'keaktifan' | 'ketercapaian'>('all');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [justRefreshed, setJustRefreshed] = useState<boolean>(false);

  const handleGenerateTrends = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
      setJustRefreshed(true);
      setTimeout(() => setJustRefreshed(false), 3000);
    }, 400);
  };

  // Available classes for filter
  const classes = Array.from(new Set(entries.map((e) => e.kelas))).filter(Boolean);

  const filteredEntries =
    selectedFilterClass === 'ALL'
      ? entries
      : entries.filter((e) => e.kelas === selectedFilterClass);

  const { summary, methodStats, chronologicalEntries, anecdoteHighlights } =
    analyzeStudentTrends(filteredEntries);

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Belum Ada Data Refleksi</h3>
        <p className="text-slate-500 max-w-md mx-auto text-sm">
          Tambahkan setidaknya 1 atau 2 catatan refleksi mengajar untuk melihat visualisasi grafik tren
          kemajuan siswa dan efektivitas metode secara otomatis.
        </p>
      </div>
    );
  }

  // Koordinat SVG untuk Chart
  const svgWidth = 800;
  const svgHeight = 260;
  const paddingX = 50;
  const paddingY = 40;
  const innerWidth = svgWidth - paddingX * 2;
  const innerHeight = svgHeight - paddingY * 2;

  const totalPoints = chronologicalEntries.length;
  const getX = (index: number) => {
    if (totalPoints <= 1) return paddingX + innerWidth / 2;
    return paddingX + (index / (totalPoints - 1)) * innerWidth;
  };
  const getY = (val: number) => {
    // Range 0 - 100
    const clamped = Math.max(0, Math.min(100, val));
    return paddingY + innerHeight - (clamped / 100) * innerHeight;
  };

  // Generate SVG path for a given metric
  const makePath = (key: 'pemahamanKonsep' | 'keaktifanSiswa' | 'ketercapaianTP') => {
    if (totalPoints === 0) return '';
    return chronologicalEntries
      .map((entry, idx) => {
        const x = getX(idx);
        const y = getY(entry[key]);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const makeAreaPath = (key: 'pemahamanKonsep' | 'keaktifanSiswa' | 'ketercapaianTP') => {
    if (totalPoints === 0) return '';
    const linePath = makePath(key);
    const lastX = getX(totalPoints - 1);
    const firstX = getX(0);
    const bottomY = getY(0);
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const pathPemahaman = makePath('pemahamanKonsep');
  const pathKeaktifan = makePath('keaktifanSiswa');
  const pathKetercapaian = makePath('ketercapaianTP');

  const areaPemahaman = makeAreaPath('pemahamanKonsep');

  return (
    <div className="space-y-6">
      {/* Top Banner & Filter Kelas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-indigo-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Mesin Analisis Tren Pedagogis Otomatis</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Analisis Tren Kemajuan Siswa & Efektivitas Pembelajaran
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-2xl">
            Sistem secara real-time memetakan kurva daya serap konsep, dinamika keaktifan, dan
            menguji metode mengajar mana yang menghasilkan dampak paling signifikan dari waktu ke waktu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {classes.length > 1 && (
            <div className="flex items-center space-x-2 bg-white/10 p-1.5 rounded-xl border border-white/10 shrink-0">
              <Filter className="w-4 h-4 text-indigo-200 ml-2" />
              <select
                value={selectedFilterClass}
                onChange={(e) => setSelectedFilterClass(e.target.value)}
                className="bg-transparent text-white text-xs font-medium pr-3 py-1 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL" className="text-slate-900">
                  Semua Kelas ({entries.length} Sesi)
                </option>
                {classes.map((cls) => (
                  <option key={cls} value={cls} className="text-slate-900">
                    Kelas {cls}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleGenerateTrends}
            disabled={isRegenerating}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            title="Analisis dan hitung ulang tren secara otomatis"
          >
            {isRegenerating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
            ) : (
              <Wand2 className="w-3.5 h-3.5 text-slate-950" />
            )}
            <span>{isRegenerating ? 'Menganalisis Data...' : 'Generate Tren Sesuai Data'}</span>
          </button>

          {onDownloadWord && (
            <button
              onClick={onDownloadWord}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              title="Unduh Laporan Analisis Tren & Jurnal (.docx)"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh Word</span>
            </button>
          )}

          {onPrintPreview && (
            <button
              onClick={onPrintPreview}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              title="Cetak atau simpan PDF resmi"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Kartu Metrik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pemahaman Konsep */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rerata Pemahaman Konsep
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Brain className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-800">
              {summary.rataRataPemahaman}%
            </span>
            <span
              className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                summary.trenPemahamanArah === 'naik'
                  ? 'bg-emerald-50 text-emerald-700'
                  : summary.trenPemahamanArah === 'turun'
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {summary.trenPemahamanArah === 'naik' && <TrendingUp className="w-3 h-3 mr-1" />}
              {summary.trenPemahamanArah === 'turun' && <TrendingDown className="w-3 h-3 mr-1" />}
              {summary.trenPemahamanArah === 'stabil' && <Minus className="w-3 h-3 mr-1" />}
              {summary.deltaPemahaman >= 0 ? `+${summary.deltaPemahaman}%` : `${summary.deltaPemahaman}%`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Tren: <strong className="text-slate-700 capitalize">{summary.trenPemahamanArah}</strong> dari awal
            ke pertemuan terakhir
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500"></div>
        </div>

        {/* Card 2: Keaktifan Siswa */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rerata Keaktifan Siswa
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-800">
              {summary.rataRataKeaktifan}%
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              {summary.tingkatKemandirianSiswa}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Interaksi diskusi & respon positif selama sesi
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
        </div>

        {/* Card 3: Ketercapaian TP */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ketercapaian TP
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-800">
              {summary.rataRataKetercapaian}%
            </span>
            <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
              {summary.totalPertemuan} Sesi Terdokumentasi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Ketuntasan tujuan kurikulum yang dicanangkan
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>
        </div>

        {/* Card 4: Metode Terbaik */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Metode Paling Berdampak
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="truncate">
            <span className="text-base font-bold text-slate-800 block truncate" title={summary.metodeTerbaik.metode}>
              {summary.metodeTerbaik.metode}
            </span>
            <span className="text-xs font-semibold text-purple-700">
              Skor Efektivitas: <strong>{summary.metodeTerbaik.skorRataRata}%</strong>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Diterapkan {summary.metodeTerbaik.jumlahSesi} kali dengan respon tertinggi
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500"></div>
        </div>
      </div>

      {/* Visualisasi Kurva Tren Kemajuan (Interactive SVG Chart) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>Kurva Progres Kemajuan Belajar Siswa dari Waktu ke Waktu</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik / arahkan kursor ke titik grafik untuk melihat rincian pertemuan, materi, dan metode
            </p>
          </div>

          {/* Toggle Metrics buttons */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setActiveMetric('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeMetric === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Indikator
            </button>
            <button
              onClick={() => setActiveMetric('pemahaman')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
                activeMetric === 'pemahaman'
                  ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                  : 'text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>Pemahaman</span>
            </button>
            <button
              onClick={() => setActiveMetric('keaktifan')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
                activeMetric === 'keaktifan'
                  ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Keaktifan</span>
            </button>
            <button
              onClick={() => setActiveMetric('ketercapaian')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
                activeMetric === 'ketercapaian'
                  ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Capaian TP</span>
            </button>
          </div>
        </div>

        {/* SVG Chart Container */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[600px] select-none"
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines (0, 25, 50, 75, 100) */}
            {[0, 25, 50, 75, 100].map((val) => {
              const y = getY(val);
              return (
                <g key={val}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray={val === 0 || val === 100 ? undefined : '4 4'}
                    strokeWidth={val === 75 ? 1.5 : 1}
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#94A3B8"
                    fontFamily="inherit"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* Target line highlight at 75% (Standar Ketuntasan) */}
            <line
              x1={paddingX}
              y1={getY(75)}
              x2={svgWidth - paddingX}
              y2={getY(75)}
              stroke="#CBD5E1"
              strokeDasharray="2 2"
              strokeWidth="1.5"
            />
            <text
              x={svgWidth - paddingX + 6}
              y={getY(75) + 3}
              fontSize="10"
              fill="#64748B"
              fontWeight="600"
            >
              KKM 75%
            </text>

            {/* Area fill for Pemahaman */}
            {(activeMetric === 'all' || activeMetric === 'pemahaman') && (
              <path d={areaPemahaman} fill="url(#areaGradient)" />
            )}

            {/* Lines */}
            {(activeMetric === 'all' || activeMetric === 'pemahaman') && (
              <path
                d={pathPemahaman}
                fill="none"
                stroke="#4F46E5"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {(activeMetric === 'all' || activeMetric === 'keaktifan') && (
              <path
                d={pathKeaktifan}
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeDasharray={activeMetric === 'all' ? '6 4' : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {(activeMetric === 'all' || activeMetric === 'ketercapaian') && (
              <path
                d={pathKetercapaian}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Datapoints & interactive hover circles */}
            {chronologicalEntries.map((entry, idx) => {
              const x = getX(idx);
              const yPem = getY(entry.pemahamanKonsep);
              const isHovered = hoveredPointIndex === idx;

              return (
                <g
                  key={entry.id}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                  onClick={() => onSelectEntry && onSelectEntry(entry)}
                >
                  {/* Vertical guide line on hover */}
                  {isHovered && (
                    <line
                      x1={x}
                      y1={paddingY}
                      x2={x}
                      y2={svgHeight - paddingY}
                      stroke="#818CF8"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Circle Pemahaman */}
                  {(activeMetric === 'all' || activeMetric === 'pemahaman') && (
                    <circle
                      cx={x}
                      cy={yPem}
                      r={isHovered ? 7 : 5}
                      fill="#FFFFFF"
                      stroke="#4F46E5"
                      strokeWidth={isHovered ? 4 : 2.5}
                    />
                  )}

                  {/* Circle Keaktifan */}
                  {(activeMetric === 'all' || activeMetric === 'keaktifan') && (
                    <circle
                      cx={x}
                      cy={getY(entry.keaktifanSiswa)}
                      r={isHovered ? 6 : 4}
                      fill="#FFFFFF"
                      stroke="#10B981"
                      strokeWidth={isHovered ? 3 : 2}
                    />
                  )}

                  {/* Circle Ketercapaian */}
                  {(activeMetric === 'all' || activeMetric === 'ketercapaian') && (
                    <circle
                      cx={x}
                      cy={getY(entry.ketercapaianTP)}
                      r={isHovered ? 6 : 4}
                      fill="#FFFFFF"
                      stroke="#F59E0B"
                      strokeWidth={isHovered ? 3 : 2}
                    />
                  )}

                  {/* X-axis label (Pertemuan & Tanggal) */}
                  <text
                    x={x}
                    y={svgHeight - paddingY + 18}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight={isHovered ? '700' : '500'}
                    fill={isHovered ? '#1E1B4B' : '#64748B'}
                  >
                    Pert {entry.pertemuanKe}
                  </text>
                  <text
                    x={x}
                    y={svgHeight - paddingY + 30}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#94A3B8"
                  >
                    {entry.tanggal.slice(5)}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Card */}
          {hoveredPointIndex !== null && chronologicalEntries[hoveredPointIndex] && (
            <div className="absolute top-2 right-4 bg-slate-900/95 text-white p-3.5 rounded-xl text-xs max-w-xs shadow-xl backdrop-blur-md border border-slate-700 pointer-events-none z-10 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 mb-2">
                <span className="font-bold text-indigo-300">
                  Pertemuan {chronologicalEntries[hoveredPointIndex].pertemuanKe} ({chronologicalEntries[hoveredPointIndex].kelas})
                </span>
                <span className="text-[10px] text-slate-400">
                  {chronologicalEntries[hoveredPointIndex].tanggal}
                </span>
              </div>
              <p className="font-medium text-slate-200 line-clamp-1 mb-1">
                {chronologicalEntries[hoveredPointIndex].materiPokok}
              </p>
              <div className="text-[11px] text-indigo-200 bg-indigo-950/60 px-2 py-0.5 rounded-md inline-block mb-2">
                Metode: {chronologicalEntries[hoveredPointIndex].metodePembelajaran}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-800">
                <div>
                  <div className="text-[10px] text-indigo-300">Pemahaman</div>
                  <div className="font-bold text-sm text-white">
                    {chronologicalEntries[hoveredPointIndex].pemahamanKonsep}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-300">Keaktifan</div>
                  <div className="font-bold text-sm text-white">
                    {chronologicalEntries[hoveredPointIndex].keaktifanSiswa}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-amber-300">Capaian TP</div>
                  <div className="font-bold text-sm text-white">
                    {chronologicalEntries[hoveredPointIndex].ketercapaianTP}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-1 bg-indigo-600 rounded-full"></span>
            <span className="font-medium">Pemahaman Konsep Siswa</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-1 bg-emerald-500 rounded-full"></span>
            <span className="font-medium">Keaktifan & Partisipasi</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-1 bg-amber-500 rounded-full"></span>
            <span className="font-medium">Ketercapaian Tujuan (TP)</span>
          </div>
        </div>
      </div>

      {/* Grid 2 Kolom: Efektivitas Metode & Rekomendasi Pedagogis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri: Peringkat Efektivitas Metode Pembelajaran */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Efektivitas Metode Pembelajaran
                </h3>
                <p className="text-xs text-slate-500">
                  Komparasi dampak metode terhadap pemahaman & partisipasi siswa
                </p>
              </div>
            </div>
            <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2.5 py-1 rounded-lg">
              {methodStats.length} Metode Teruji
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {methodStats.map((ms, idx) => (
              <div
                key={ms.metode}
                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 transition-colors bg-slate-50/50"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-xs sm:text-sm text-slate-800">
                      {ms.metode}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">({ms.jumlahSesi}x sesi)</span>
                    <span className="text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {ms.skorKomposit}%
                    </span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 0
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600'
                        : idx === 1
                        ? 'bg-gradient-to-r from-indigo-500 to-sky-500'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${ms.skorKomposit}%` }}
                  ></div>
                </div>

                {/* Submetrics badges */}
                <div className="flex items-center space-x-4 text-[11px] text-slate-500">
                  <span>
                    Pemahaman: <strong className="text-slate-700">{ms.rataPemahaman}%</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Keaktifan: <strong className="text-slate-700">{ms.rataKeaktifan}%</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Capaian TP: <strong className="text-slate-700">{ms.rataKetercapaian}%</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Rekomendasi Pedagogis Otomatis & Anomali */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Temuan & Rekomendasi Pedagogis Otomatis
              </h3>
              <p className="text-xs text-slate-500">
                Dihasilkan dari analisis pola kemajuan kurikuler secara komprehensif
              </p>
            </div>
          </div>

          {/* List Rekomendasi */}
          <div className="space-y-3 pt-2">
            {summary.rekomendasiOtomatis.map((rek, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-gradient-to-br from-indigo-50/70 to-slate-50 rounded-xl border border-indigo-100 flex items-start space-x-3 text-xs leading-relaxed text-slate-700"
              >
                <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <p>{rek}</p>
              </div>
            ))}

            {summary.anomaliCatatan.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Sesi yang Perlu Perhatian / Remedial:</span>
                </h4>
                <div className="space-y-2">
                  {summary.anomaliCatatan.map((anomali, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-xs"
                    >
                      {anomali}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Catatan Anekdot & Pengalaman Belajar Siswa yang Menonjol */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Sorotan Pengalaman Belajar Siswa (Student Voice & Anecdotes)
              </h3>
              <p className="text-xs text-slate-500">
                Dokumentasi peristiwa otentik dinamika belajar di kelas selama rangkaian sesi
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {anecdoteHighlights.slice(-6).map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>{item.tanggal}</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-md ${
                      item.antusiasme === 'Tinggi'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Antusiasme {item.antusiasme}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-800 line-clamp-1">
                  {item.materi}
                </h4>
                <p className="text-xs text-slate-600 italic mt-2 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/60">
                  "{item.catatan || 'Siswa antusias mengikuti tahapan pembelajaran.'}"
                </p>
              </div>

              <div className="text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-200 flex justify-between">
                <span>Kelas {item.kelas}</span>
                <span className="text-indigo-600 font-semibold">{item.metode}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
