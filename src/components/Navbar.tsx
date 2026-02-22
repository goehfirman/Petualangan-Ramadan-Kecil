import React from 'react';

interface NavbarProps {
  currentUser: string;
  totalExp: number;
  activeSection: string;
  onNavigate: (section: string) => void;
  onLogout: () => void;
  currentDate: string;
  currentTime: string;
}

export default function Navbar({ currentUser, totalExp, activeSection, onNavigate, onLogout, currentDate, currentTime }: NavbarProps) {
  const navItems = [
    { id: 'home', label: '🏠 Beranda' },
    { id: 'puasa', label: '📖 Panduan Puasa' },
    { id: 'amalan', label: '✅ Amalan Harian' },
    { id: 'quran', label: '📚 Khatam Quran' },
    { id: 'waktu', label: '🕌 Waktu Sholat' },
    { id: 'leaderboard', label: '🏆 Leaderboard' },
    { id: 'inquiry', label: '📬 Kotak Pertanyaan' },
  ];

  return (
    <nav className="bg-white border-b-4 border-blue-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="animate-bounce-subtle">
              <img 
                src="https://i.ibb.co.com/trFqzRQ/LOGO-PEKAYON-09.png" 
                alt="Logo SDN Pekayon 09" 
                className="w-10 h-10 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="font-black text-blue-600 text-lg leading-tight">Petualangan Ramadhan</h1>
              <p className="text-xs font-bold text-blue-500">SDN Pekayon 09</p>
              <p className="text-xs text-orange-500 font-bold">{currentUser}</p>
              <div className="flex flex-col">
                <p className="text-[10px] text-blue-400 font-medium">{currentDate}</p>
                <p className="text-[10px] text-blue-600 font-bold">⏰ {currentTime}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full border-2 border-yellow-200">
              <span className="text-yellow-500">⭐</span>
              <span className="font-black text-yellow-700">{totalExp} ⭐</span>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 bg-red-100 text-red-500 hover:bg-red-200 rounded-full transition btn-pop cursor-pointer border-2 border-red-200" 
              title="Keluar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex gap-2 pb-3 overflow-x-auto scroll-hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-4 py-2 rounded-2xl text-sm font-black whitespace-nowrap transition btn-pop cursor-pointer border-2 ${
                activeSection === item.id 
                  ? 'bg-orange-500 text-white border-orange-600 shadow-[0_4px_0_#D84315]' 
                  : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
