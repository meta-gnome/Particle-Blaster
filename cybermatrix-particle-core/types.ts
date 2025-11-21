export interface ParticleConfig {
  particleSize: number;
  gap: number;
  mouseRadius: number;
  friction: number;
  ease: number;
  color: string;
  isMatrixMode: boolean; // If true, uses characters instead of squares
}

export interface CanvasDimensions {
  width: number;
  height: number;
}