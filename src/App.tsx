import { useState,useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import UserLayout from './UserLayouts';
import AdminLayout from './AdminLayouts';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-black'}`}>
        <Routes>
          {/* User Routes */}
          <Route path="/*" element={<UserLayout />} />

          {/* Admin Routes */}
          <Route 
            path="/admin/*" 
            element={<AdminLayout darkMode={darkMode} setDarkMode={setDarkMode} />} 
          />
        </Routes>
      </div>
  );
}
