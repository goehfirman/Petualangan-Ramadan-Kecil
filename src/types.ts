export interface AmalanRecord {
  student_name: string;
  day: number;
  sholat_subuh: 'jamaah' | 'munfarid' | null;
  sholat_dzuhur: 'jamaah' | 'munfarid' | null;
  sholat_ashar: 'jamaah' | 'munfarid' | null;
  sholat_maghrib: 'jamaah' | 'munfarid' | null;
  sholat_isya: 'jamaah' | 'munfarid' | null;
  sholat_tarawih: 'jamaah' | 'munfarid' | null;
  sahur: boolean;
  puasa: boolean;
  sholat_dhuha: boolean;
  infaq: boolean;
  dzikir: boolean;
  itikaf: boolean;
  help_activity?: string;
  help_description?: string;
  quran_type?: 'baca' | 'murojaah' | 'hafalan';
  quran_note?: string;
  quran_pages: number;
  total_exp: number;
  updated_at: string;
}

export interface StudentRank {
  name: string;
  kelas?: string;
  exp: number;
}
