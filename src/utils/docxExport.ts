import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  Packer,
  ShadingType,
} from 'docx';
import { TeacherIdentity, PrincipalIdentity, ReflectionEntry } from '../types/journal';
import { analyzeStudentTrends } from './trendAnalysis';
import { generateSupervisoryNarrative } from './reflectionGenerator';

export async function generateWordDocument(
  teacher: TeacherIdentity,
  principal: PrincipalIdentity,
  reflections: ReflectionEntry[]
): Promise<Blob> {
  const { summary, methodStats, chronologicalEntries } = analyzeStudentTrends(reflections);

  const primaryColor = '1E3A8A'; // Deep Navy
  const secondaryColor = '047857'; // Emerald
  const grayBorder = 'D1D5DB';

  // Helper untuk cell border tipis
  const standardBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: grayBorder },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: grayBorder },
    left: { style: BorderStyle.SINGLE, size: 1, color: grayBorder },
    right: { style: BorderStyle.SINGLE, size: 1, color: grayBorder },
  };

  const headerBorders = {
    top: { style: BorderStyle.SINGLE, size: 2, color: primaryColor },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: primaryColor },
    left: { style: BorderStyle.SINGLE, size: 1, color: grayBorder },
    right: { style: BorderStyle.SINGLE, size: 1, color: grayBorder },
  };

  // 1. Header / Kop Sekolah
  const schoolKop = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: 'PEMERINTAH DAERAH PROVINSI / DINAS PENDIDIKAN',
          bold: true,
          size: 20,
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: teacher.sekolah.toUpperCase(),
          bold: true,
          size: 26,
          font: 'Times New Roman',
          color: primaryColor,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 140 },
      children: [
        new TextRun({
          text: `${teacher.alamatSekolah} | Tahun Ajaran ${teacher.tahunAjaran}`,
          italics: true,
          size: 18,
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      border: {
        bottom: { style: BorderStyle.DOUBLE, size: 6, color: '000000' },
      },
      children: [],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 80 },
      children: [
        new TextRun({
          text: 'JURNAL REFLEKSI GURU MENGAJAR',
          bold: true,
          size: 28,
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: 'DOKUMENTASI PENGALAMAN BELAJAR SISWA & ANALISIS EFEKTIVITAS METODE PEMBELAJARAN',
          bold: true,
          size: 18,
          font: 'Times New Roman',
          color: '4B5563',
        }),
      ],
    }),
  ];

  // 2. Tabel Identitas Guru & Kepala Sekolah
  const identityTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
            borders: standardBorders,
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'A. IDENTITAS GURU', bold: true, size: 20, font: 'Times New Roman' })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
            borders: standardBorders,
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'B. IDENTITAS KEPALA SEKOLAH', bold: true, size: 20, font: 'Times New Roman' })],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: standardBorders,
            children: [
              new Paragraph({ children: [new TextRun({ text: `Nama Guru: `, bold: true, size: 18 }), new TextRun({ text: `${teacher.nama}, ${teacher.gelar}`, size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: `NIP: `, bold: true, size: 18 }), new TextRun({ text: teacher.nip || '-', size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: `Pangkat / Gol: `, bold: true, size: 18 }), new TextRun({ text: teacher.pangkatGolongan || '-', size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: `Mata Pelajaran: `, bold: true, size: 18 }), new TextRun({ text: teacher.mataPelajaran, size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: `Kelas / Fase: `, bold: true, size: 18 }), new TextRun({ text: teacher.kelasDiampu, size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: `Semester: `, bold: true, size: 18 }), new TextRun({ text: `${teacher.semester} / T.A. ${teacher.tahunAjaran}`, size: 18 })] }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: standardBorders,
            children: [
              new Paragraph({ children: [new TextRun({ text: `Nama Kepala Sekolah: `, bold: true, size: 18 }), new TextRun({ text: `${principal.nama}, ${principal.gelar}`, size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: `NIP: `, bold: true, size: 18 }), new TextRun({ text: principal.nip || '-', size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: `Pangkat / Gol: `, bold: true, size: 18 }), new TextRun({ text: principal.pangkatGolongan || '-', size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: `Jabatan: `, bold: true, size: 18 }), new TextRun({ text: principal.jabatan, size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: `Satuan Pendidikan: `, bold: true, size: 18 }), new TextRun({ text: teacher.sekolah, size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: `Kota / Tanggal: `, bold: true, size: 18 }), new TextRun({ text: `${principal.kotaKabupaten}, ${principal.tanggalDokumen}`, size: 18 })] }),
            ],
          }),
        ],
      }),
    ],
  });

  // 3. Ringkasan Analisis Tren Kemajuan Siswa Otomatis
  const trendSummaryParagraphs = [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 100 },
      children: [
        new TextRun({
          text: 'I. ANALISIS TREN KEMAJUAN SISWA & EFEKTIVITAS METODE SECARA OTOMATIS',
          bold: true,
          size: 22,
          font: 'Times New Roman',
          color: primaryColor,
        }),
      ],
    }),
  ];

  // Tabel Rekap Metrik
  const metricTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: 'EFF6FF' },
            borders: standardBorders,
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Rata-rata Pemahaman', bold: true, size: 18 })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${summary.rataRataPemahaman}%`, bold: true, size: 26, color: primaryColor })] }),
            ],
          }),
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: 'ECFDF5' },
            borders: standardBorders,
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Rata-rata Keaktifan', bold: true, size: 18 })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${summary.rataRataKeaktifan}%`, bold: true, size: 26, color: secondaryColor })] }),
            ],
          }),
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: 'FEF3C7' },
            borders: standardBorders,
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Ketercapaian TP', bold: true, size: 18 })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${summary.rataRataKetercapaian}%`, bold: true, size: 26, color: 'B45309' })] }),
            ],
          }),
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: 'F5F3FF' },
            borders: standardBorders,
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Arah Tren & Delta', bold: true, size: 18 })] }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${summary.trenPemahamanArah.toUpperCase()} (${summary.deltaPemahaman >= 0 ? '+' : ''}${summary.deltaPemahaman}%)`,
                    bold: true,
                    size: 22,
                    color: summary.trenPemahamanArah === 'naik' ? secondaryColor : 'DC2626',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const supervisoryNarrativeText = generateSupervisoryNarrative(
    `${teacher.nama}, ${teacher.gelar}`,
    teacher.mataPelajaran,
    summary.totalPertemuan,
    summary.rataRataPemahaman,
    summary.rataRataKeaktifan,
    summary.trenPemahamanArah,
    summary.deltaPemahaman,
    summary.metodeTerbaik.metode
  );

  const narrativeParagraph = new Paragraph({
    spacing: { before: 140, after: 120 },
    children: [
      new TextRun({
        text: 'Sintesis Supervisi Kemajuan Belajar Siswa (Narasi Otomatis): ',
        bold: true,
        size: 18,
        font: 'Times New Roman',
      }),
      new TextRun({
        text: supervisoryNarrativeText,
        italics: true,
        size: 18,
        font: 'Times New Roman',
      }),
    ],
  });

  // Rekomendasi Otomatis List
  const recommendations = [
    narrativeParagraph,
    new Paragraph({
      spacing: { before: 140, after: 60 },
      children: [
        new TextRun({
          text: 'Temuan & Rekomendasi Pedagogis Otomatis dari Sistem:',
          bold: true,
          size: 18,
          font: 'Times New Roman',
        }),
      ],
    }),
    ...summary.rekomendasiOtomatis.map(
      (rek, idx) =>
        new Paragraph({
          spacing: { after: 50 },
          bullet: { level: 0 },
          children: [
            new TextRun({
              text: `${rek}`,
              size: 18,
              font: 'Times New Roman',
            }),
          ],
        })
    ),
  ];

  // Peringkat Efektivitas Metode
  const methodRankTitle = new Paragraph({
    spacing: { before: 140, after: 80 },
    children: [
      new TextRun({
        text: 'Tabel Peringkat Efektivitas Metode Pembelajaran yang Diterapkan:',
        bold: true,
        size: 18,
        font: 'Times New Roman',
      }),
    ],
  });

  const methodTableRows = [
    new TableRow({
      children: [
        new TableCell({ borders: headerBorders, shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' }, children: [new Paragraph({ children: [new TextRun({ text: 'No', bold: true, size: 18 })] })] }),
        new TableCell({ borders: headerBorders, shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' }, children: [new Paragraph({ children: [new TextRun({ text: 'Metode Pembelajaran', bold: true, size: 18 })] })] }),
        new TableCell({ borders: headerBorders, shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' }, children: [new Paragraph({ children: [new TextRun({ text: 'Frekuensi', bold: true, size: 18 })] })] }),
        new TableCell({ borders: headerBorders, shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' }, children: [new Paragraph({ children: [new TextRun({ text: 'Rerata Pemahaman', bold: true, size: 18 })] })] }),
        new TableCell({ borders: headerBorders, shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' }, children: [new Paragraph({ children: [new TextRun({ text: 'Rerata Keaktifan', bold: true, size: 18 })] })] }),
        new TableCell({ borders: headerBorders, shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' }, children: [new Paragraph({ children: [new TextRun({ text: 'Skor Efektivitas', bold: true, size: 18 })] })] }),
      ],
    }),
    ...methodStats.map((ms, idx) => {
      return new TableRow({
        children: [
          new TableCell({ borders: standardBorders, children: [new Paragraph({ children: [new TextRun({ text: String(idx + 1), size: 18 })] })] }),
          new TableCell({ borders: standardBorders, children: [new Paragraph({ children: [new TextRun({ text: ms.metode, bold: true, size: 18 })] })] }),
          new TableCell({ borders: standardBorders, children: [new Paragraph({ children: [new TextRun({ text: `${ms.jumlahSesi} kali`, size: 18 })] })] }),
          new TableCell({ borders: standardBorders, children: [new Paragraph({ children: [new TextRun({ text: `${ms.rataPemahaman}%`, size: 18 })] })] }),
          new TableCell({ borders: standardBorders, children: [new Paragraph({ children: [new TextRun({ text: `${ms.rataKeaktifan}%`, size: 18 })] })] }),
          new TableCell({ borders: standardBorders, children: [new Paragraph({ children: [new TextRun({ text: `${ms.skorKomposit}%`, bold: true, color: primaryColor, size: 18 })] })] }),
        ],
      });
    }),
  ];

  const methodSummaryTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: methodTableRows,
  });

  // 4. Tabel Jurnal Refleksi Mengajar Lengkap
  const journalSectionHeader = new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    children: [
      new TextRun({
        text: 'II. CATATAN JURNAL REFLEKSI MENGAJAR SETIAP PERTEMUAN',
        bold: true,
        size: 22,
        font: 'Times New Roman',
        color: primaryColor,
      }),
    ],
  });

  const journalTableRows = [
    new TableRow({
      children: [
        new TableCell({ width: { size: 8, type: WidthType.PERCENTAGE }, borders: headerBorders, shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Pert / Tgl', bold: true, size: 17 })] })] }),
        new TableCell({ width: { size: 22, type: WidthType.PERCENTAGE }, borders: headerBorders, shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' }, children: [new Paragraph({ children: [new TextRun({ text: 'Materi Pokok & TP', bold: true, size: 17 })] })] }),
        new TableCell({ width: { size: 18, type: WidthType.PERCENTAGE }, borders: headerBorders, shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' }, children: [new Paragraph({ children: [new TextRun({ text: 'Metode & Metrik', bold: true, size: 17 })] })] }),
        new TableCell({ width: { size: 26, type: WidthType.PERCENTAGE }, borders: headerBorders, shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' }, children: [new Paragraph({ children: [new TextRun({ text: 'Pengalaman Belajar Siswa', bold: true, size: 17 })] })] }),
        new TableCell({ width: { size: 26, type: WidthType.PERCENTAGE }, borders: headerBorders, shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' }, children: [new Paragraph({ children: [new TextRun({ text: 'Efektivitas Metode & Rencana Tindak Lanjut', bold: true, size: 17 })] })] }),
      ],
    }),
    ...chronologicalEntries.map((entry) => {
      return new TableRow({
        children: [
          new TableCell({
            borders: standardBorders,
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Ke-${entry.pertemuanKe}`, bold: true, size: 17 })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: entry.tanggal, size: 15, color: '6B7280' })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Kls ${entry.kelas}`, size: 15, bold: true })] }),
            ],
          }),
          new TableCell({
            borders: standardBorders,
            children: [
              new Paragraph({ children: [new TextRun({ text: entry.materiPokok, bold: true, size: 17 })] }),
              new Paragraph({ spacing: { before: 30 }, children: [new TextRun({ text: 'TP: ', italics: true, size: 15 }), new TextRun({ text: entry.tujuanPembelajaran, size: 15 })] }),
            ],
          }),
          new TableCell({
            borders: standardBorders,
            children: [
              new Paragraph({ children: [new TextRun({ text: entry.metodePembelajaran, bold: true, size: 16, color: primaryColor })] }),
              new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: `• Pemahaman: ${entry.pemahamanKonsep}%`, size: 15 })] }),
              new Paragraph({ children: [new TextRun({ text: `• Keaktifan: ${entry.keaktifanSiswa}%`, size: 15 })] }),
              new Paragraph({ children: [new TextRun({ text: `• Capaian TP: ${entry.ketercapaianTP}%`, size: 15 })] }),
            ],
          }),
          new TableCell({
            borders: standardBorders,
            children: [
              new Paragraph({ children: [new TextRun({ text: `Antusiasme: `, bold: true, size: 15 }), new TextRun({ text: entry.pengalamanSiswa.antusiasme, size: 15 })] }),
              new Paragraph({ spacing: { before: 30 }, children: [new TextRun({ text: `Peristiwa / Anekdot: `, bold: true, size: 15 }), new TextRun({ text: entry.pengalamanSiswa.catatanAnekdot || '-', size: 15 })] }),
              new Paragraph({ spacing: { before: 30 }, children: [new TextRun({ text: `Titik Kesulitan: `, bold: true, size: 15, color: 'B91C1C' }), new TextRun({ text: entry.pengalamanSiswa.titikKesulitan || '-', size: 15 })] }),
              new Paragraph({ spacing: { before: 30 }, children: [new TextRun({ text: `Respon Positif: `, bold: true, size: 15, color: '047857' }), new TextRun({ text: entry.pengalamanSiswa.responsPositif || '-', size: 15 })] }),
            ],
          }),
          new TableCell({
            borders: standardBorders,
            children: [
              new Paragraph({ children: [new TextRun({ text: `Keberhasilan: `, bold: true, size: 15 }), new TextRun({ text: entry.keberhasilanMetode || '-', size: 15 })] }),
              new Paragraph({ spacing: { before: 30 }, children: [new TextRun({ text: `Kendala: `, bold: true, size: 15 }), new TextRun({ text: entry.kendalaMetode || '-', size: 15 })] }),
              new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: `Rencana Tindak Lanjut: `, bold: true, size: 15, color: primaryColor }), new TextRun({ text: entry.tindakLanjut || '-', size: 15 })] }),
            ],
          }),
        ],
      });
    }),
  ];

  const journalTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: journalTableRows,
  });

  // 5. Lembar Pengesahan (Signature block)
  const signatureSection = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: [
              new Paragraph({ spacing: { before: 240 }, children: [new TextRun({ text: 'Mengetahui,', size: 18, font: 'Times New Roman' })] }),
              new Paragraph({ children: [new TextRun({ text: principal.jabatan, bold: true, size: 18, font: 'Times New Roman' })] }),
              new Paragraph({ spacing: { before: 600 }, children: [new TextRun({ text: `${principal.nama}, ${principal.gelar}`, bold: true, underline: {}, size: 18, font: 'Times New Roman' })] }),
              new Paragraph({ children: [new TextRun({ text: `NIP. ${principal.nip}`, size: 18, font: 'Times New Roman' })] }),
              new Paragraph({ children: [new TextRun({ text: `Pangkat/Gol: ${principal.pangkatGolongan}`, size: 16, font: 'Times New Roman' })] }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: [
              new Paragraph({ spacing: { before: 240 }, children: [new TextRun({ text: `${principal.kotaKabupaten}, ${principal.tanggalDokumen}`, size: 18, font: 'Times New Roman' })] }),
              new Paragraph({ children: [new TextRun({ text: `Guru Mata Pelajaran ${teacher.mataPelajaran}`, bold: true, size: 18, font: 'Times New Roman' })] }),
              new Paragraph({ spacing: { before: 600 }, children: [new TextRun({ text: `${teacher.nama}, ${teacher.gelar}`, bold: true, underline: {}, size: 18, font: 'Times New Roman' })] }),
              new Paragraph({ children: [new TextRun({ text: `NIP. ${teacher.nip}`, size: 18, font: 'Times New Roman' })] }),
              new Paragraph({ children: [new TextRun({ text: `Pangkat/Gol: ${teacher.pangkatGolongan}`, size: 16, font: 'Times New Roman' })] }),
            ],
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...schoolKop,
          identityTable,
          ...trendSummaryParagraphs,
          metricTable,
          ...recommendations,
          methodRankTitle,
          methodSummaryTable,
          journalSectionHeader,
          journalTable,
          signatureSection,
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export async function generateSingleEntryWordDocument(
  teacher: TeacherIdentity,
  principal: PrincipalIdentity,
  entry: ReflectionEntry
): Promise<Blob> {
  const primaryColor = '1E3A8A';
  const grayBorder = 'D1D5DB';

  const standardBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: grayBorder },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: grayBorder },
    left: { style: BorderStyle.SINGLE, size: 1, color: grayBorder },
    right: { style: BorderStyle.SINGLE, size: 1, color: grayBorder },
  };

  const schoolKop = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: 'PEMERINTAH DAERAH PROVINSI / DINAS PENDIDIKAN',
          bold: true,
          size: 20,
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: teacher.sekolah.toUpperCase(),
          bold: true,
          size: 26,
          font: 'Times New Roman',
          color: primaryColor,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `${teacher.alamatSekolah} | Tahun Ajaran ${teacher.tahunAjaran}`,
          italics: true,
          size: 18,
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 180 },
      border: {
        bottom: { style: BorderStyle.DOUBLE, size: 6, color: '000000' },
      },
      children: [],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 60 },
      children: [
        new TextRun({
          text: `LAPORAN REFLEKSI GURU MENGAJAR - PERTEMUAN KE-${entry.pertemuanKe}`,
          bold: true,
          size: 26,
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Materi: ${entry.materiPokok} | Tanggal: ${entry.tanggal} | Kelas: ${entry.kelas}`,
          bold: true,
          size: 18,
          font: 'Times New Roman',
          color: '4B5563',
        }),
      ],
    }),
  ];

  const infoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: standardBorders,
            children: [
              new Paragraph({ children: [new TextRun({ text: 'Nama Guru: ', bold: true, size: 18 }), new TextRun({ text: `${teacher.nama}, ${teacher.gelar}`, size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: 'NIP: ', bold: true, size: 18 }), new TextRun({ text: teacher.nip || '-', size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: 'Mata Pelajaran: ', bold: true, size: 18 }), new TextRun({ text: teacher.mataPelajaran, size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: 'Alokasi Waktu: ', bold: true, size: 18 }), new TextRun({ text: `${entry.durasiMenit} Menit`, size: 18 })] }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: standardBorders,
            children: [
              new Paragraph({ children: [new TextRun({ text: 'Metode Pembelajaran: ', bold: true, size: 18 }), new TextRun({ text: entry.metodePembelajaran, size: 18, color: primaryColor })] }),
              new Paragraph({ children: [new TextRun({ text: 'Pemahaman Konsep: ', bold: true, size: 18 }), new TextRun({ text: `${entry.pemahamanKonsep}%`, size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: 'Keaktifan Siswa: ', bold: true, size: 18 }), new TextRun({ text: `${entry.keaktifanSiswa}%`, size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: 'Ketercapaian TP: ', bold: true, size: 18 }), new TextRun({ text: `${entry.ketercapaianTP}%`, size: 18 })] }),
            ],
          }),
        ],
      }),
    ],
  });

  const detailParagraphs = [
    new Paragraph({
      spacing: { before: 200, after: 60 },
      children: [
        new TextRun({ text: 'Tujuan Pembelajaran (TP):', bold: true, size: 20, color: primaryColor }),
      ],
    }),
    new Paragraph({
      spacing: { after: 140 },
      children: [new TextRun({ text: entry.tujuanPembelajaran, size: 18 })],
    }),

    new Paragraph({
      spacing: { before: 140, after: 60 },
      children: [
        new TextRun({ text: 'Catatan Pengalaman Belajar Siswa (Anekdot):', bold: true, size: 20, color: primaryColor }),
      ],
    }),
    new Paragraph({
      spacing: { after: 140 },
      children: [
        new TextRun({ text: `(Tingkat Antusiasme: ${entry.pengalamanSiswa.antusiasme}) `, bold: true, size: 17 }),
        new TextRun({ text: entry.pengalamanSiswa.catatanAnekdot || '-', size: 18 }),
      ],
    }),

    new Paragraph({
      spacing: { before: 140, after: 60 },
      children: [
        new TextRun({ text: 'Titik Kesulitan / Miskonsepsi Siswa:', bold: true, size: 20, color: 'B91C1C' }),
      ],
    }),
    new Paragraph({
      spacing: { after: 140 },
      children: [new TextRun({ text: entry.pengalamanSiswa.titikKesulitan || '-', size: 18 })],
    }),

    new Paragraph({
      spacing: { before: 140, after: 60 },
      children: [
        new TextRun({ text: 'Respons Positif Siswa:', bold: true, size: 20, color: '047857' }),
      ],
    }),
    new Paragraph({
      spacing: { after: 140 },
      children: [new TextRun({ text: entry.pengalamanSiswa.responsPositif || '-', size: 18 })],
    }),

    new Paragraph({
      spacing: { before: 140, after: 60 },
      children: [
        new TextRun({ text: 'Keberhasilan Penerapan Metode:', bold: true, size: 20, color: primaryColor }),
      ],
    }),
    new Paragraph({
      spacing: { after: 140 },
      children: [new TextRun({ text: entry.keberhasilanMetode || '-', size: 18 })],
    }),

    new Paragraph({
      spacing: { before: 140, after: 60 },
      children: [
        new TextRun({ text: 'Kendala yang Dihadapi:', bold: true, size: 20, color: '4B5563' }),
      ],
    }),
    new Paragraph({
      spacing: { after: 140 },
      children: [new TextRun({ text: entry.kendalaMetode || '-', size: 18 })],
    }),

    new Paragraph({
      spacing: { before: 140, after: 60 },
      children: [
        new TextRun({ text: 'Rencana Tindak Lanjut Pertemuan Berikutnya:', bold: true, size: 20, color: primaryColor }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: entry.tindakLanjut || '-', size: 18, bold: true })],
    }),
  ];

  const signatureSection = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: [
              new Paragraph({ spacing: { before: 240 }, children: [new TextRun({ text: 'Mengetahui,', size: 18, font: 'Times New Roman' })] }),
              new Paragraph({ children: [new TextRun({ text: principal.jabatan, bold: true, size: 18, font: 'Times New Roman' })] }),
              new Paragraph({ spacing: { before: 600 }, children: [new TextRun({ text: `${principal.nama}, ${principal.gelar}`, bold: true, underline: {}, size: 18, font: 'Times New Roman' })] }),
              new Paragraph({ children: [new TextRun({ text: `NIP. ${principal.nip}`, size: 18, font: 'Times New Roman' })] }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: [
              new Paragraph({ spacing: { before: 240 }, children: [new TextRun({ text: `${principal.kotaKabupaten}, ${entry.tanggal}`, size: 18, font: 'Times New Roman' })] }),
              new Paragraph({ children: [new TextRun({ text: `Guru Mata Pelajaran ${teacher.mataPelajaran}`, bold: true, size: 18, font: 'Times New Roman' })] }),
              new Paragraph({ spacing: { before: 600 }, children: [new TextRun({ text: `${teacher.nama}, ${teacher.gelar}`, bold: true, underline: {}, size: 18, font: 'Times New Roman' })] }),
              new Paragraph({ children: [new TextRun({ text: `NIP. ${teacher.nip}`, size: 18, font: 'Times New Roman' })] }),
            ],
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...schoolKop,
          infoTable,
          ...detailParagraphs,
          signatureSection,
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
