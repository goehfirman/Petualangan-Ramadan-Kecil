import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getAllRecords } from '../utils/ramadhan';
import { studentData } from '../data/students';
import { AmalanRecord } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface StudentSummary {
  name: string;
  kelas: string;
  totalExp: number;
  totalQuranPages: number;
  daysFilled: number;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [summaries, setSummaries] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [allRecords, setAllRecords] = useState<AmalanRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'exp'; direction: 'asc' | 'desc' }>({ key: 'exp', direction: 'desc' });

  useEffect(() => {
    async function fetchData() {
      try {
        const records = await getAllRecords();
        setAllRecords(records);

        const summaryMap = new Map<string, StudentSummary>();

        // Initialize all students with 0
        studentData.forEach(student => {
          summaryMap.set(student.name, {
            name: student.name,
            kelas: student.kelas,
            totalExp: 0,
            totalQuranPages: 0,
            daysFilled: 0
          });
        });

        // Aggregate data
        records.forEach(record => {
          const summary = summaryMap.get(record.student_name);
          if (summary) {
            summary.totalExp += (record.total_exp || 0);
            summary.totalQuranPages += (record.quran_pages || 0);
            summary.daysFilled += 1;
          }
        });

        setSummaries(Array.from(summaryMap.values()));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const classes = useMemo(() => {
    const uniqueClasses = new Set(studentData.map(s => s.kelas));
    return Array.from(uniqueClasses).sort();
  }, []);

  const filteredSummaries = useMemo(() => {
    let result = summaries;
    
    if (selectedClass) {
      result = result.filter(s => s.kelas === selectedClass);
    }

    return result.sort((a, b) => {
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortConfig.direction === 'asc'
          ? a.totalExp - b.totalExp
          : b.totalExp - a.totalExp;
      }
    });
  }, [summaries, selectedClass, sortConfig]);

  const handleSort = (key: 'name' | 'exp') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const downloadIndividualReport = (studentName: string) => {
    const doc = new jsPDF();
    const studentRecords = allRecords.filter(r => r.student_name === studentName).sort((a, b) => a.day - b.day);
    const summary = summaries.find(s => s.name === studentName);

    // Header
    doc.setFontSize(18);
    doc.text('Laporan Amalan Ramadhan', 14, 22);
    doc.setFontSize(12);
    doc.text(`Nama Siswa: ${studentName}`, 14, 32);
    doc.text(`Kelas: ${summary?.kelas || '-'}`, 14, 38);
    doc.text(`Total Bintang: ${summary?.totalExp || 0}`, 14, 44);
    doc.text(`Total Hal/Surat: ${summary?.totalQuranPages || 0}`, 14, 50);
    doc.text(`Hari Terisi: ${summary?.daysFilled || 0} / 30`, 14, 56);

    // Table
    const tableData = studentRecords.map(record => [
      `Hari ke-${record.day}`,
      record.sholat_subuh ? (record.sholat_subuh === 'jamaah' ? 'Jamaah' : 'Munfarid') : '-',
      record.sholat_dzuhur ? (record.sholat_dzuhur === 'jamaah' ? 'Jamaah' : 'Munfarid') : '-',
      record.sholat_ashar ? (record.sholat_ashar === 'jamaah' ? 'Jamaah' : 'Munfarid') : '-',
      record.sholat_maghrib ? (record.sholat_maghrib === 'jamaah' ? 'Jamaah' : 'Munfarid') : '-',
      record.sholat_isya ? (record.sholat_isya === 'jamaah' ? 'Jamaah' : 'Munfarid') : '-',
      record.sholat_tarawih ? (record.sholat_tarawih === 'jamaah' ? 'Jamaah' : 'Munfarid') : '-',
      record.sahur ? 'Ya' : 'Tidak',
      record.puasa ? 'Ya' : 'Tidak',
      record.quran_pages || 0,
      record.total_exp || 0
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['Hari', 'Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya', 'Tarawih', 'Sahur', 'Puasa', 'Quran (Hal/Surat)', 'Bintang']],
      body: tableData,
    });

    doc.save(`Laporan_${studentName.replace(/\s+/g, '_')}.pdf`);
  };

  const downloadClassReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text('Laporan Kelas - Petualangan Ramadhan', 14, 22);
    doc.setFontSize(12);
    doc.text(`Kelas: ${selectedClass || 'Semua Kelas'}`, 14, 32);
    doc.text(`Total Siswa: ${filteredSummaries.length}`, 14, 38);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 44);

    // Table
    const tableData = filteredSummaries.map((s, index) => [
      index + 1,
      s.name,
      s.kelas,
      s.daysFilled,
      s.totalQuranPages,
      s.totalExp
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['No', 'Nama Siswa', 'Kelas', 'Hari Terisi', 'Total Hal/Surat', 'Total Bintang']],
      body: tableData,
    });

    doc.save(`Laporan_Kelas_${selectedClass || 'Semua'}_Ramadhan.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-poppins">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">Admin Dashboard</h1>
            <p className="text-gray-400">Overview Amalan Siswa</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-yellow-400"
            >
              <option value="">Semua Kelas</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>

            <div className="flex gap-4">
              <button 
                onClick={downloadClassReport}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                📄 Download Laporan
              </button>
              <button 
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                🚪 Keluar
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-700 text-gray-300 uppercase text-sm">
                <tr>
                  <th className="px-6 py-4">Peringkat</th>
                  <th 
                    className="px-6 py-4 cursor-pointer hover:text-white transition group"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Nama Siswa
                      {sortConfig.key === 'name' && (
                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4">Kelas</th>
                  <th className="px-6 py-4 text-center">Hari Terisi</th>
                  <th className="px-6 py-4 text-center">Hal / Surat</th>
                  <th 
                    className="px-6 py-4 text-center cursor-pointer hover:text-white transition group"
                    onClick={() => handleSort('exp')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Total Bintang
                      {sortConfig.key === 'exp' && (
                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredSummaries.map((student, index) => (
                  <tr key={student.name} className="hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 font-medium text-gray-400">#{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-white">{student.name}</td>
                    <td className="px-6 py-4 text-gray-400">{student.kelas}</td>
                    <td className="px-6 py-4 text-center text-blue-300">{student.daysFilled} / 30</td>
                    <td className="px-6 py-4 text-center text-amber-300">{student.totalQuranPages}</td>
                    <td className="px-6 py-4 text-center font-bold text-yellow-400">{student.totalExp}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => downloadIndividualReport(student.name)}
                        className="text-sm bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 px-3 py-1 rounded border border-blue-500/30 transition"
                      >
                        ⬇️ PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Created by Teguh Firmansyah Apriliana <a href="https://instagram.com/goehfirmaan" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">@goehfirmaan</a></p>
        </footer>
      </div>
    </div>
  );
}
