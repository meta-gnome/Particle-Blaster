/// <reference lib="dom" />
import React, { useState, useEffect } from 'react';
import { CyberCanvas } from './components/CyberCanvas';
import { CyberControls } from './components/CyberControls';
import { ParticleConfig } from './types';

const INITIAL_CONFIG: ParticleConfig = {
  particleSize: 2,
  gap: 5,
  mouseRadius: 150,
  friction: 0.92,
  ease: 0.1,
  color: '#00ff41',
  isMatrixMode: false,
};

function App() {
  const [config, setConfig] = useState<ParticleConfig>(INITIAL_CONFIG);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fps, setFps] = useState(0);

  // Handle File Upload
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageSrc(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setImageSrc(null);
    setConfig(INITIAL_CONFIG);
  };

  // Dynamic resize handler
  useEffect(() => {
    const handleResize = () => {
        // Canvas component handles resize via init, but we might want to trigger re-renders here if needed
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* Background Overlay Text (Aesthetic) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[20vw] font-bold text-[#00ff41] opacity-[0.02] pointer-events-none select-none whitespace-nowrap">
        SYSTEM_ROOT
      </div>

      <CyberControls 
        config={config}
        setConfig={setConfig}
        onFileUpload={handleFileUpload}
        onReset={handleReset}
        fps={fps}
      />
      
      <CyberCanvas 
        config={config}
        imageSrc={imageSrc}
        setFps={setFps}
      />
      
      {/* Aesthetic Footer */}
      <div className="fixed bottom-4 right-4 text-[#00ff41] text-xs opacity-50 pointer-events-none">
        SECURE CONNECTION ESTABLISHED
        <br />
        LATENCY: 12ms // ENCRYPTION: AES-256
      </div>
    </div>
  );
}

export default App;