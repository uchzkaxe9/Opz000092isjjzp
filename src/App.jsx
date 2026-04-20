import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PhishingPage from './pages/PhishingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Is line se user seedha Login.jsx par jayega */}
        <Route path="/" element={<Login />} />
        
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/hack/:id" element={<PhishingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
