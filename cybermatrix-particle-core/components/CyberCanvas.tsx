/// <reference lib="dom" />
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ParticleConfig } from '../types';

interface CyberCanvasProps {
  config: ParticleConfig;
  imageSrc: string | null; // Null means use procedural generation
  setFps: (fps: number) => void;
}

class Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
  force: number;
  angle: number;
  distance: number;
  friction: number;
  ease: number;
  char: string;

  constructor(x: number, y: number, canvasWidth: number, canvasHeight: number, size: number, color: string) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight; // Start random for scatter effect
    this.originX = x;
    this.originY = y;
    this.color = color;
    this.size = size;
    this.vx = 0;
    this.vy = 0;
    this.force = 0;
    this.angle = 0;
    this.distance = 0;
    this.friction = 0.95; // Damping
    this.ease = 0.15; // Return speed
    // Random hex char for matrix effect
    const chars = "0123456789ABCDEF";
    this.char = chars[Math.floor(Math.random() * chars.length)];
  }

  update(mouseX: number, mouseY: number, mouseRadius: number, currentEase: number, friction: number) {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    this.distance = dx * dx + dy * dy;
    // Physics calculation
    // We use squared distance for performance (avoiding sqrt inside loop)
    const forceDistance = mouseRadius * mouseRadius;

    if (this.distance < forceDistance) {
        this.angle = Math.atan2(dy, dx);
        this.force = -mouseRadius / Math.sqrt(this.distance);
        
        if (this.distance < 50) this.force = -20; // Strong repulsion close center

        const tx = Math.cos(this.angle) * this.force;
        const ty = Math.sin(this.angle) * this.force;
        
        this.vx += tx;
        this.vy += ty;
    }

    // Return to origin logic
    this.vx += (this.originX - this.x) * currentEase;
    this.vy += (this.originY - this.y) * currentEase;

    // Apply physics
    this.vx *= friction;
    this.vy *= friction;
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D, isMatrix: boolean) {
    if (isMatrix) {
        ctx.fillStyle = this.color;
        ctx.font = `${this.size * 2}px monospace`;
        ctx.fillText(this.char, this.x, this.y);
    } else {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
  }
}

export const CyberCanvas: React.FC<CyberCanvasProps> = ({ config, imageSrc, setFps }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const requestRef = useRef<number>(0);
  const mouse = useRef({ x: 0, y: 0 });
  const lastFrameTime = useRef<number>(0);

  // --- Procedural Pattern Generator ---
  // Creates a complex geometric mandala-like pattern if no image is uploaded
  const drawProceduralPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.lineCap = 'square';

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.4;

    // Helper: Radial symmetry
    const drawSymmetry = (sides: number, callback: (angle: number) => void) => {
        const step = (Math.PI * 2) / sides;
        for (let i = 0; i < sides; i++) {
            callback(i * step);
        }
    };

    // Layer 1: Outer Geometric Ring
    drawSymmetry(12, (angle) => {
        ctx.beginPath();
        const x1 = centerX + Math.cos(angle) * maxRadius;
        const y1 = centerY + Math.sin(angle) * maxRadius;
        const x2 = centerX + Math.cos(angle + Math.PI/6) * (maxRadius * 0.8);
        const y2 = centerY + Math.sin(angle + Math.PI/6) * (maxRadius * 0.8);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Inner connections
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(centerX, centerY);
        ctx.stroke();
    });

    // Layer 2: Inner Hexagon Maze
    ctx.lineWidth = 2;
    drawSymmetry(6, (angle) => {
        const r = maxRadius * 0.5;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        
        // Chevron shapes
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle + 2) * 40, y + Math.sin(angle + 2) * 40);
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle - 2) * 40, y + Math.sin(angle - 2) * 40);
        ctx.stroke();
    });

    // Layer 3: Core Circuit
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius * 0.15, 0, Math.PI * 2);
    ctx.stroke();
    
    drawSymmetry(8, (angle) => {
         const r = maxRadius * 0.15;
         const r2 = maxRadius * 0.3;
         ctx.beginPath();
         ctx.moveTo(centerX + Math.cos(angle) * r, centerY + Math.sin(angle) * r);
         ctx.lineTo(centerX + Math.cos(angle) * r2, centerY + Math.sin(angle) * r2);
         ctx.stroke();
    });
  };

  // --- Initialization Logic ---
  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas to full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create an offscreen logic to draw the image and scan it
    const effect = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw source (Image or Procedural)
        if (imageSrc) {
            const img = new Image();
            img.src = imageSrc;
            img.onload = () => {
                // Scale image to fit while maintaining aspect ratio
                const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.8;
                const w = img.width * scale;
                const h = img.height * scale;
                const x = (canvas.width - w) / 2;
                const y = (canvas.height - h) / 2;
                ctx.drawImage(img, x, y, w, h);
                scanAndCreateParticles(ctx, canvas.width, canvas.height);
            };
        } else {
            drawProceduralPattern(ctx, canvas.width, canvas.height);
            scanAndCreateParticles(ctx, canvas.width, canvas.height);
        }
    };

    // 2. Scan pixel data
    const scanAndCreateParticles = (context: CanvasRenderingContext2D, width: number, height: number) => {
        const pixels = context.getImageData(0, 0, width, height).data;
        const newParticles: Particle[] = [];
        const gap = config.gap; // Scan step

        for (let y = 0; y < height; y += gap) {
            for (let x = 0; x < width; x += gap) {
                const index = (y * width + x) * 4;
                const r = pixels[index];
                const g = pixels[index + 1];
                const b = pixels[index + 2];
                const alpha = pixels[index + 3];

                // Brightness check (simple avg)
                const brightness = (r + g + b) / 3;

                // Threshold for spawning a particle
                if (alpha > 0 && brightness > 30) {
                    newParticles.push(new Particle(x, y, width, height, config.particleSize, config.color));
                }
            }
        }
        setParticles(newParticles);
    };

    effect();
  }, [config.gap, config.particleSize, config.color, imageSrc]);

  // Handle initial mount and config changes requiring full re-init (like loading new image)
  useEffect(() => {
    initParticles();
  }, [initParticles]);

  // --- Animation Loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (time: number) => {
        // FPS Calc
        const delta = time - lastFrameTime.current;
        if (delta >= 1000) {
            lastFrameTime.current = time;
        }
        // Rough FPS for UI
        setFps(Math.round(1000 / (Math.max(delta, 1))));

        // Clear with trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Creates the "trace" effect
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw particles
        particles.forEach(p => {
            // Update physics
            // Check if we need to update props dynamically that aren't in particle state
            // (We pass current config values to update method)
            p.color = config.color; // Dynamic color update
            p.size = config.particleSize;

            p.update(mouse.current.x, mouse.current.y, config.mouseRadius, config.ease, config.friction);
            p.draw(ctx, config.isMatrixMode);
        });

        requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(requestRef.current);
  }, [particles, config, setFps]);

  // --- Interaction Handlers ---
  const handleMouseMove = (e: React.MouseEvent) => {
    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
     if(e.touches.length > 0) {
         mouse.current.x = e.touches[0].clientX;
         mouse.current.y = e.touches[0].clientY;
     }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="fixed top-0 left-0 w-full h-full bg-black cursor-crosshair"
    />
  );
};