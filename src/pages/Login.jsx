import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (!error) {
        const uniqueId = Math.random().toString(36).substring(2, 10);
        await supabase.from('profiles').insert([{ id: data.user.id, unique_id: uniqueId, email: email }]);
        alert("Registered! Please Login.");
        setIsRegister(false);
      } else alert(error.message);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6">{isRegister ? 'Register' : 'Admin Login'}</h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <input type="email" placeholder="Email" className="w-full bg-gray-800 p-4 rounded-xl outline-none" onChange={(e)=>setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="w-full bg-gray-800 p-4 rounded-xl outline-none" onChange={(e)=>setPassword(e.target.value)} required />
          <button className="w-full bg-green-600 font-bold py-4 rounded-xl">{loading ? 'Wait...' : (isRegister ? 'SIGN UP' : 'LOGIN')}</button>
        </form>
        <button onClick={() => setIsRegister(!isRegister)} className="w-full mt-4 text-sm text-gray-400">
          {isRegister ? "Have account? Login" : "New? Register"}
        </button>
      </div>
    </div>
  );
};
export default Login;
