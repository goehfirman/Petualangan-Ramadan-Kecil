import React, { useState, useEffect } from 'react';
import { AmalanRecord } from '../types';
import { calculateExp, getDateFromRamadhanDay, convertToHijri, getRamadhanDay } from '../utils/ramadhan';

interface AmalanProps {
  currentUser: string;
  currentDay: number;
  record: AmalanRecord | undefined;
  onSave: (record: AmalanRecord) => Promise<void>;
  onDayChange: (day: number) => void;
}

export default function Amalan({ currentUser, currentDay, record, onSave, onDayChange }: AmalanProps) {
  const [formData, setFormData] = useState<Partial<AmalanRecord>>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [displayDate, setDisplayDate] = useState<{ gregorian: string; hijri: string }>({ gregorian: '', hijri: '' });
  
  const actualRamadhanDay = getRamadhanDay();
  // Only allow editing for the current day
  const isEditable = currentDay === actualRamadhanDay;
  const isFuture = currentDay > actualRamadhanDay;
  const isPast = currentDay < actualRamadhanDay;

  useEffect(() => {
    // Update date display when currentDay changes
    const date = getDateFromRamadhanDay(currentDay);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setDisplayDate({
      gregorian: date.toLocaleDateString('id-ID', options),
      hijri: convertToHijri(date)
    });

    if (record) {
      setFormData(record);
    } else {
      // Reset form for new day/user if no record exists
      setFormData({
        student_name: currentUser,
        day: currentDay,
        sholat_subuh: null,
        sholat_dzuhur: null,
        sholat_ashar: null,
        sholat_maghrib: null,
        sholat_isya: null,
        sholat_tarawih: null,
        sahur: false,
        puasa: false,
        sholat_dhuha: false,
        infaq: false,
        dzikir: false,
        itikaf: false,
        help_activity: '',
        help_description: '',
        quran_type: 'baca',
        quran_note: '',
        quran_pages: 0,
        total_exp: 0
      });
    }
    setStatus('idle');
  }, [record, currentUser, currentDay]);

  const handleChange = (field: keyof AmalanRecord, value: any) => {
    if (!isEditable) return;

    // Special handling for quran_note to also update quran_pages
    let updated = { ...formData, [field]: value };
    
    if (field === 'quran_note') {
       updated.quran_pages = (value as string).trim().length > 0 ? 1 : 0;
    }

    // Recalculate EXP immediately for display
    updated.total_exp = calculateExp(updated);
    setFormData(updated);
    setStatus('idle');
  };

  const handleManualSave = async () => {
    if (!isEditable) return;
    
    setStatus('saving');
    
    // Construct full record
    const fullRecord: AmalanRecord = {
      student_name: currentUser,
      day: currentDay,
      sholat_subuh: formData.sholat_subuh || null,
      sholat_dzuhur: formData.sholat_dzuhur || null,
      sholat_ashar: formData.sholat_ashar || null,
      sholat_maghrib: formData.sholat_maghrib || null,
      sholat_isya: formData.sholat_isya || null,
      sholat_tarawih: formData.sholat_tarawih || null,
      sahur: formData.sahur || false,
      puasa: formData.puasa || false,
      sholat_dhuha: formData.sholat_dhuha || false,
      infaq: formData.infaq || false,
      dzikir: formData.dzikir || false,
      itikaf: formData.itikaf || false,
      help_activity: formData.help_activity || '',
      help_description: formData.help_description || '',
      quran_type: formData.quran_type || 'baca',
      quran_note: formData.quran_note || '',
      quran_pages: formData.quran_pages || 0,
      total_exp: formData.total_exp || 0,
      updated_at: new Date().toISOString()
    };

    try {
      await onSave(fullRecord);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error("Failed to save:", error);
      setStatus('error');
    }
  };

  const renderSholatRadio = (label: string, field: keyof AmalanRecord, icon: string) => (
    <div className={`bg-white rounded-2xl p-4 border-2 border-emerald-100 shadow-sm flex flex-col justify-between h-full ${!isEditable ? 'opacity-50 pointer-events-none' : ''}`}>
      <p className="font-black text-emerald-700 mb-3 flex items-center gap-2 text-base"><span className="text-2xl">{icon}</span> {label}</p>
      <div className="flex gap-2">
        <button
          onClick={() => handleChange(field, formData[field] === 'jamaah' ? null : 'jamaah')}
          disabled={!isEditable}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-black transition-all duration-200 border-2 btn-pop ${
            formData[field] === 'jamaah'
              ? 'bg-emerald-500 border-emerald-600 text-white shadow-[0_4px_0_#059669]'
              : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
          }`}
        >
          Berjamaah
          {formData[field] === 'jamaah' && <span className="block text-[10px] opacity-90">+15 ⭐</span>}
        </button>
        <button
          onClick={() => handleChange(field, formData[field] === 'munfarid' ? null : 'munfarid')}
          disabled={!isEditable}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-black transition-all duration-200 border-2 btn-pop ${
            formData[field] === 'munfarid'
              ? 'bg-blue-500 border-blue-600 text-white shadow-[0_4px_0_#2563EB]'
              : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100'
          }`}
        >
          Munfarid
          {formData[field] === 'munfarid' && <span className="block text-[10px] opacity-90">+10 ⭐</span>}
        </button>
      </div>
    </div>
  );

  return (
    <section className="space-y-6 animate-slide-in">
      <div className="card-gradient p-8 border-4 border-white shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-3xl bg-emerald-400 flex items-center justify-center text-3xl shadow-sm animate-bounce-subtle">✅</div>
            <div>
              <h2 className="text-3xl font-black text-blue-600">Amalan Harian</h2>
              <p className="text-orange-500 font-bold text-sm">Ayo kumpulkan bintangmu! ⭐</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <label className="text-blue-600 font-black mb-2 block text-lg">📅 Pilih Hari:</label>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onDayChange(currentDay - 1)}
                disabled={currentDay <= 1}
                className="w-12 h-12 rounded-2xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition disabled:opacity-50 cursor-pointer btn-pop border-2 border-blue-200"
              >
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <select 
                value={currentDay}
                onChange={(e) => onDayChange(parseInt(e.target.value))}
                className="flex-1 px-4 py-3 rounded-2xl bg-blue-50 border-4 border-blue-100 text-blue-600 text-center font-black text-xl focus:outline-none focus:border-orange-400"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day} className="text-gray-800">Hari ke-{day}</option>
                ))}
              </select>
              <button 
                onClick={() => onDayChange(currentDay + 1)}
                disabled={currentDay >= 30}
                className="w-12 h-12 rounded-2xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition disabled:opacity-50 cursor-pointer btn-pop border-2 border-blue-200"
              >
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="text-center bg-orange-50 rounded-2xl p-3 border-2 border-orange-100">
              <p className="text-orange-600 font-black">{displayDate.gregorian}</p>
              <p className="text-blue-400 font-bold text-sm">{displayDate.hijri}</p>
            </div>
          </div>
        </div>

        {isFuture && (
          <div className="bg-red-100 border-4 border-red-200 rounded-2xl p-4 mb-8 flex items-center gap-3">
            <div className="text-3xl">🔒</div>
            <div>
              <p className="font-black text-red-600">Belum Waktunya!</p>
              <p className="text-sm font-bold text-red-400">Kamu belum bisa mengisi amalan untuk hari yang belum datang ya.</p>
            </div>
          </div>
        )}

        {isPast && (
          <div className="bg-orange-100 border-4 border-orange-200 rounded-2xl p-4 mb-8 flex items-center gap-3">
            <div className="text-3xl">⌛</div>
            <div>
              <p className="font-black text-orange-600">Waktu Habis!</p>
              <p className="text-sm font-bold text-orange-400">Pengisian amalan untuk hari yang sudah lewat sudah ditutup ya.</p>
            </div>
          </div>
        )}

        <div className={`space-y-6 ${!isEditable ? 'opacity-60 pointer-events-none' : ''}`}>
          <div className="bg-orange-50 rounded-3xl p-5 border-4 border-orange-100">
            <h3 className="font-black text-orange-600 mb-4 flex items-center gap-2 text-xl">🌙 Puasa & Sahur</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 border-2 border-orange-100 shadow-sm btn-pop">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.sahur || false}
                    onChange={(e) => handleChange('sahur', e.target.checked)}
                    disabled={!isEditable}
                    className="w-6 h-6 rounded-lg accent-orange-500"
                  />
                  <span className="flex-1 font-black text-orange-700 flex items-center gap-2 text-lg"><span className="text-2xl">🥣</span> Sahur</span>
                  <span className="text-xs font-black bg-orange-500 text-white px-2 py-1 rounded-full">+10 ⭐</span>
                </label>
              </div>

              <div className="bg-white rounded-2xl p-4 border-2 border-orange-100 shadow-sm btn-pop">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.puasa || false}
                    onChange={(e) => handleChange('puasa', e.target.checked)}
                    disabled={!isEditable}
                    className="w-6 h-6 rounded-lg accent-orange-500"
                  />
                  <span className="flex-1 font-black text-orange-700 flex items-center gap-2 text-lg"><span className="text-2xl">✨</span> Puasa</span>
                  <span className="text-xs font-black bg-orange-500 text-white px-2 py-1 rounded-full">+15 ⭐</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-3xl p-5 border-4 border-emerald-100">
            <h3 className="font-black text-emerald-600 mb-4 flex items-center gap-2 text-xl">🕌 Sholat Kita</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderSholatRadio('Subuh', 'sholat_subuh', '🌅')}
              {renderSholatRadio('Dzuhur', 'sholat_dzuhur', '☀️')}
              {renderSholatRadio('Ashar', 'sholat_ashar', '🌤️')}
              {renderSholatRadio('Maghrib', 'sholat_maghrib', '🌅')}
              {renderSholatRadio('Isya', 'sholat_isya', '🌙')}
              {renderSholatRadio('Tarawih', 'sholat_tarawih', '⭐')}
              
              <div className="bg-white rounded-2xl p-4 border-2 border-emerald-100 shadow-sm sm:col-span-2 btn-pop">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.sholat_dhuha || false}
                    onChange={(e) => handleChange('sholat_dhuha', e.target.checked)}
                    disabled={!isEditable}
                    className="w-6 h-6 rounded-lg accent-emerald-500"
                  />
                  <span className="flex-1 font-black text-emerald-700 flex items-center gap-2 text-lg"><span className="text-2xl">☀️</span> Sholat Dhuha</span>
                  <span className="text-xs font-black bg-emerald-500 text-white px-2 py-1 rounded-full">+10 ⭐</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-3xl p-5 border-4 border-purple-100">
            <h3 className="font-black text-purple-600 mb-4 flex items-center gap-2 text-xl">💫 Amalan Hebat</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 bg-white rounded-2xl p-4 cursor-pointer hover:bg-purple-100 transition border-2 border-purple-100 btn-pop shadow-sm">
                <input 
                  type="checkbox" 
                  checked={formData.infaq || false}
                  onChange={(e) => handleChange('infaq', e.target.checked)}
                  disabled={!isEditable}
                  className="w-6 h-6 rounded-lg accent-purple-500"
                />
                <span className="font-black text-purple-700">💰 Infaq/Sedekah</span>
                <span className="text-xs font-black bg-purple-500 text-white px-2 py-1 rounded-full ml-auto">+15 ⭐</span>
              </label>
              <label className="flex items-center gap-3 bg-white rounded-2xl p-4 cursor-pointer hover:bg-purple-100 transition border-2 border-purple-100 btn-pop shadow-sm">
                <input 
                  type="checkbox" 
                  checked={formData.dzikir || false}
                  onChange={(e) => handleChange('dzikir', e.target.checked)}
                  disabled={!isEditable}
                  className="w-6 h-6 rounded-lg accent-purple-500"
                />
                <span className="font-black text-purple-700">📿 Dzikir</span>
                <span className="text-xs font-black bg-purple-500 text-white px-2 py-1 rounded-full ml-auto">+15 ⭐</span>
              </label>
              <label className="flex items-center gap-3 bg-white rounded-2xl p-4 cursor-pointer hover:bg-purple-100 transition border-2 border-purple-100 btn-pop shadow-sm">
                <input 
                  type="checkbox" 
                  checked={formData.itikaf || false}
                  onChange={(e) => handleChange('itikaf', e.target.checked)}
                  disabled={!isEditable}
                  className="w-6 h-6 rounded-lg accent-purple-500"
                />
                <span className="font-black text-purple-700">🕌 I'tikaf</span>
                <span className="text-xs font-black bg-purple-500 text-white px-2 py-1 rounded-full ml-auto">+15 ⭐</span>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 rounded-3xl p-5 border-4 border-blue-100">
            <h3 className="font-black text-blue-600 mb-4 flex items-center gap-2 text-xl">🧹 Membantu Orang Tua <span className="text-xs font-black bg-blue-500 text-white px-2 py-1 rounded-full">+20 ⭐</span></h3>
            <div className="space-y-4">
              <div>
                <label className="block text-blue-400 font-bold text-sm mb-1">Apa yang kamu bantu?</label>
                <input 
                  type="text" 
                  value={formData.help_activity || ''}
                  onChange={(e) => handleChange('help_activity', e.target.value)}
                  disabled={!isEditable}
                  placeholder="Contoh: Menyapu, Mencuci Piring..."
                  className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-blue-100 text-blue-800 focus:outline-none focus:border-blue-400 text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-blue-400 font-bold text-sm mb-1">Ceritakan pengalamanmu</label>
                <textarea 
                  value={formData.help_description || ''}
                  onChange={(e) => handleChange('help_description', e.target.value)}
                  disabled={!isEditable}
                  placeholder="Tulis ceritamu di sini..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-blue-100 text-blue-800 focus:outline-none focus:border-blue-400 text-sm font-bold resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-3xl p-5 border-4 border-amber-100">
            <h3 className="font-black text-amber-600 mb-4 flex items-center gap-2 text-xl">📖 Kegiatan Al-Quran</h3>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleChange('quran_type', 'baca')}
                  disabled={!isEditable}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-black transition-all btn-pop border-2 ${
                    (formData.quran_type || 'baca') === 'baca'
                      ? 'bg-amber-500 border-amber-600 text-white shadow-[0_4px_0_#D97706]'
                      : 'bg-white border-amber-100 text-amber-600 hover:bg-amber-50'
                  }`}
                >
                  📖 Baca Iqra/Quran
                </button>
                <button
                  onClick={() => handleChange('quran_type', 'murojaah')}
                  disabled={!isEditable}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-black transition-all btn-pop border-2 ${
                    formData.quran_type === 'murojaah'
                      ? 'bg-amber-500 border-amber-600 text-white shadow-[0_4px_0_#D97706]'
                      : 'bg-white border-amber-100 text-amber-600 hover:bg-amber-50'
                  }`}
                >
                  🔄 Murojaah
                </button>
                <button
                  onClick={() => handleChange('quran_type', 'hafalan')}
                  disabled={!isEditable}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-black transition-all btn-pop border-2 ${
                    formData.quran_type === 'hafalan'
                      ? 'bg-amber-500 border-amber-600 text-white shadow-[0_4px_0_#D97706]'
                      : 'bg-white border-amber-100 text-amber-600 hover:bg-amber-50'
                  }`}
                >
                  🧠 Hafalan Baru
                </button>
              </div>

              <div className="bg-white rounded-2xl p-4 border-2 border-amber-100">
                <div className="mb-4">
                  <label className="block text-amber-600 font-bold text-sm mb-1">
                    {(formData.quran_type || 'baca') === 'baca' ? 'Baca Surat/Jilid Apa?' : 
                     formData.quran_type === 'murojaah' ? 'Surat Apa yang Diulang?' : 
                     'Menghafal Surat Apa?'}
                  </label>
                  <input 
                    type="text" 
                    value={formData.quran_note || ''}
                    onChange={(e) => handleChange('quran_note', e.target.value)}
                    disabled={!isEditable}
                    placeholder={
                      (formData.quran_type || 'baca') === 'baca' ? "Contoh: Iqra 3 / Al-Fatihah" : 
                      formData.quran_type === 'murojaah' ? "Contoh: An-Nas" : 
                      "Contoh: Al-Lahab"
                    }
                    className="w-full px-4 py-3 rounded-xl bg-amber-50 border-2 border-amber-100 text-amber-800 focus:outline-none focus:border-amber-400 text-sm font-bold"
                  />
                </div>
                
                <div className="mt-3 text-right">
                  <span className={`text-xs font-black px-2 py-1 rounded-full transition-all ${
                    (formData.quran_pages || 0) > 0 
                      ? 'bg-amber-500 text-white opacity-100' 
                      : 'bg-gray-200 text-gray-400 opacity-50'
                  }`}>
                    +10 ⭐
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-yellow-100 rounded-3xl p-6 border-4 border-yellow-200 shadow-inner">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 font-black text-sm uppercase tracking-wider">Bintang Hari Ini</p>
              <p className="text-4xl font-black text-yellow-700">{formData.total_exp || 0} ⭐</p>
            </div>
            <div className="text-right">
              {status === 'saved' && <span className="text-emerald-600 font-black text-lg animate-bounce-subtle block">✨ BERHASIL! ✨</span>}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button 
            onClick={handleManualSave}
            disabled={!isEditable || status === 'saving'}
            className={`w-full py-5 font-black text-2xl rounded-3xl transition btn-pop shadow-md ${
              !isEditable 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-4 border-gray-300' 
                : status === 'saving'
                  ? 'bg-orange-300 text-white cursor-wait border-4 border-orange-400'
                  : 'btn-primary border-4 border-orange-600'
            }`}
          >
            {status === 'saving' ? '⏳ MENYIMPAN...' : '💾 SIMPAN AMALAN'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border-4 border-emerald-200 shadow-md">
        <p className="text-center text-emerald-600 font-bold italic text-base">🌟 "Ayo semangat ya, sedikit demi sedikit lama-lama menjadi bukit!" 🌟</p>
      </div>
    </section>
  );
}
