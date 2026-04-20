import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { motion } from 'framer-motion';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isRegister) {
      // REGISTER LOGIC
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        // Naye user ke liye profile table mein unique_id create karein
        const uniqueId = Math.random().toString(36).substring(2, 10);
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: data.user.id, unique_id: uniqueId, email: email }]);

        if (profileError) setError("Profile creation failed!");
        else alert("Registration Successful! Please Login.");
        setIsRegister(false);
      }
    } else {
      // LOGIN LOGIC
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) setError(loginError.message);
      else navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md w-full bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-2">
          {isRegister ? 'Create Account' : 'Admin Access'}
        </h2>
        <p className="text-gray-500 text-center mb-8 text-sm uppercase tracking-widest">Siteguy Network</p>

        <form onSubmit={handleAuth} className="space-y-4">
          {error && <div className="text-red-400 bg-red-500/10 p-3 rounded-xl text-xs border border-red-500/50">{error}</div>}
          
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-gray-800 border border-gray-700 text-white p-4 rounded-xl outline-none focus:ring-1 focus:ring-green-500"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-gray-800 border border-gray-700 text-white p-4 rounded-xl outline-none focus:ring-1 focus:ring-green-500"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition">
            {loading ? 'Processing...' : (isRegister ? 'SIGN UP' : 'LOGIN')}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
          {isRegister ? "Already have an account?" : "New user?"} 
          <button onClick={() => setIsRegister(!isRegister)} className="text-green-500 ml-2 font-bold">
            {isRegister ? 'Login' : 'Register Now'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
              
