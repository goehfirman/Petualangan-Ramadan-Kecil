import React, { useState, useMemo } from 'react';
import { studentData } from '../data/students';

interface LoginProps {
  onLogin: (name: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');

  // Get unique classes
  const classes = useMemo(() => {
    const uniqueClasses = new Set(studentData.map(s => s.kelas));
    return Array.from(uniqueClasses).sort();
  }, []);

  // Filter students based on selected class
  const filteredStudents = useMemo(() => {
    if (!selectedClass) return [];
    return studentData.filter(s => s.kelas === selectedClass).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedClass]);

  const handleLogin = () => {
    if (isAdminMode) {
      if (adminUsername === 'admin' && password === '11223344') {
        onLogin('admin');
      } else {
        setError('Username atau Password Admin salah!');
      }
      return;
    }

    if (!selectedClass) {
      setError('Pilih kelas terlebih dahulu!');
      return;
    }

    if (!selectedName) {
      setError('Pilih nama terlebih dahulu!');
      return;
    }

    if (!password) {
      setError('Masukkan password!');
      return;
    }

    const student = studentData.find(s => s.name === selectedName && s.kelas === selectedClass);
    
    if (student && student.password === password) {
      onLogin(selectedName);
    } else {
      setError('Password salah!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card-gradient p-8 max-w-md w-full border-4 border-white animate-slide-in">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4 animate-bounce-subtle">
            <img 
              src="https://i.ibb.co.com/trFqzRQ/LOGO-PEKAYON-09.png" 
              alt="Logo SDN Pekayon 09" 
              className="w-24 h-24 object-contain drop-shadow-lg"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-4xl font-black mt-4 text-orange-500 drop-shadow-sm">
            {isAdminMode ? 'Admin Panel' : 'Petualangan Ramadhan'}
          </h1>
          <p className="text-xl font-bold text-blue-600 mt-2">SDN Pekayon 09</p>
        </div>
        
        <div className="space-y-6">
          {isAdminMode ? (
            <div>
              <label className="block text-blue-600 mb-2 font-bold text-lg">👤 Username Admin</label>
              <input 
                type="text" 
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="Masukkan username admin" 
                className="w-full px-4 py-3 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-800 placeholder-blue-300 focus:outline-none focus:border-orange-400 transition"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-blue-600 mb-2 font-bold text-lg">🏫 Kelas</label>
                <select 
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedName(''); // Reset name when class changes
                    setError('');
                  }}
                  className="w-full px-4 py-3 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-800 focus:outline-none focus:border-orange-400 transition font-bold"
                >
                  <option value="" className="text-gray-800">-- Pilih Kelas --</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls} className="text-gray-800">{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-blue-600 mb-2 font-bold text-lg">👤 Nama Siswa</label>
                <select 
                  value={selectedName}
                  onChange={(e) => setSelectedName(e.target.value)}
                  disabled={!selectedClass}
                  className={`w-full px-4 py-3 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-800 focus:outline-none focus:border-orange-400 transition font-bold ${!selectedClass ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="" className="text-gray-800">-- Pilih Nama --</option>
                  {filteredStudents.map((student) => (
                    <option key={student.name} value={student.name} className="text-gray-800">{student.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          
          <div>
            <label className="block text-blue-600 mb-2 font-bold text-lg">🔐 Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isAdminMode ? "Masukkan password admin" : "Masukkan password siswa"}
              className="w-full px-4 py-3 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-800 placeholder-blue-300 focus:outline-none focus:border-orange-400 transition"
            />
          </div>

          <button 
            onClick={handleLogin}
            className="w-full py-4 btn-primary btn-pop text-white font-black text-xl rounded-2xl mt-6 cursor-pointer"
          >
            {isAdminMode ? '🔓 Masuk Admin' : '✨ MULAI PETUALANGAN ✨'}
          </button>
          
          {error && <p className="text-red-500 font-bold text-center mt-2">{error}</p>}

          <div className="text-center mt-6">
            <button 
              onClick={() => {
                setIsAdminMode(!isAdminMode);
                setError('');
                setPassword('');
                setAdminUsername('');
                setSelectedName('');
                setSelectedClass('');
              }}
              className="text-sm font-bold text-blue-400 hover:text-blue-600 underline cursor-pointer"
            >
              {isAdminMode ? 'Kembali ke Login Siswa' : 'Masuk sebagai Admin'}
            </button>
          </div>
        </div>
        
        {!isAdminMode && (
          <p className="text-center text-blue-400 font-medium text-sm mt-8 italic">
            "Ayo semangat puasanya ya adik-adik! ✨"
          </p>
        )}
      </div>
    </div>
  );
}
