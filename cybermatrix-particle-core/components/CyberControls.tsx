/// <reference lib="dom" />
import React from 'react';
import { ParticleConfig } from '../types';

interface CyberControlsProps {
  config: ParticleConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParticleConfig>>;
  onFileUpload: (file: File) => void;
  onReset: () => void;
  fps: number;
}

export const CyberControls: React.FC<CyberControlsProps> = ({ 
  config, 
  setConfig, 
  onFileUpload, 
  onReset,
  fps
}) => {
  
  const handleChange = (key: keyof ParticleConfig, value: number | string | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      onFileUpload(target.files[0]);
    }
  };

  return (
    <div className="absolute top-4 left-4 z-40 w-full max-w-xs p-4 border border-[#00ff41] bg-black/80 backdrop-blur-sm text-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.3)] max-h-[90vh] overflow-y-auto rounded-sm">
      <h1 className="text-xl font-bold mb-4 border-b border-[#00ff41] pb-2 tracking-widest glow-text">
        // SYSTEM_CORE
      </h1>
      
      <div className="mb-6 space-y-4">
        {/* Status Monitor */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-4 border border-green-900 p-2 bg-green-900/10">
          <div>FPS_RATE:</div>
          <div className="text-right font-bold">{fps}</div>
          <div>STATUS:</div>
          <div className="text-right text-green-400 animate-pulse">ONLINE</div>
        </div>

        {/* Interaction Radius */}
        <div className="flex flex-col">
          <label className="text-xs mb-1 opacity-80 flex justify-between">
            <span>FIELD_RADIUS</span>
            <span>{config.mouseRadius}px</span>
          </label>
          <input 
            type="range" 
            min="20" 
            max="1000" 
            value={config.mouseRadius}
            onChange={(e) => handleChange('mouseRadius', Number((e.target as HTMLInputElement).value))}
            className="accent-[#00ff41] h-1 bg-green-900 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Particle Size */}
        <div className="flex flex-col">
          <label className="text-xs mb-1 opacity-80 flex justify-between">
            <span>PARTICLE_SIZE</span>
            <span>{config.particleSize}px</span>
          </label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={config.particleSize}
            onChange={(e) => handleChange('particleSize', Number((e.target as HTMLInputElement).value))}
            className="accent-[#00ff41] h-1 bg-green-900 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Reaction Speed (Ease) */}
        <div className="flex flex-col">
          <label className="text-xs mb-1 opacity-80 flex justify-between">
            <span>REACTION_VELOCITY</span>
            <span>{(config.ease * 100).toFixed(0)}%</span>
          </label>
          <input 
            type="range" 
            min="0.01" 
            max="0.5" 
            step="0.01"
            value={config.ease}
            onChange={(e) => handleChange('ease', Number((e.target as HTMLInputElement).value))}
            className="accent-[#00ff41] h-1 bg-green-900 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Mode Toggles */}
        <div className="flex items-center justify-between py-2 border-t border-green-900">
          <span className="text-xs">MATRIX_MODE</span>
          <button 
            onClick={() => handleChange('isMatrixMode', !config.isMatrixMode)}
            className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${config.isMatrixMode ? 'bg-[#00ff41]' : 'bg-gray-800'}`}
          >
            <div className={`bg-black w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${config.isMatrixMode ? 'translate-x-6' : ''}`}></div>
          </button>
        </div>

        {/* Color Selection */}
        <div className="flex flex-col gap-2 pt-2 border-t border-green-900">
           <label className="text-xs opacity-80">PHOSPHOR_COLOR</label>
           <div className="flex gap-2">
             {['#00ff41', '#00ffff', '#ff0055', '#ffffff'].map((c) => (
               <button
                key={c}
                onClick={() => handleChange('color', c)}
                className={`w-6 h-6 rounded border ${config.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
               />
             ))}
           </div>
        </div>

      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4 border-t border-[#00ff41]">
        <div className="relative group">
            <label htmlFor="file-upload" className="block w-full py-2 px-4 bg-[#003b00] hover:bg-[#005500] text-[#00ff41] text-center text-xs cursor-pointer border border-[#00ff41] transition-all hover:shadow-[0_0_10px_#00ff41]">
                [ UPLOAD_TARGET_DATA ]
            </label>
            <input 
                id="file-upload"
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
        
        <button 
            onClick={onReset}
            className="block w-full py-2 px-4 bg-transparent hover:bg-red-900/30 text-red-500 text-center text-xs cursor-pointer border border-red-500 transition-all hover:shadow-[0_0_10px_#ff0000]"
        >
            [ REBOOT_SYSTEM ]
        </button>
      </div>

      <div className="mt-4 text-[10px] text-center opacity-50">
        V.2.0.45 // GEOMETRIC_ENGINE
      </div>
    </div>
  );
};