import { memo, useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface Constellation {
  stars: number[];
  connections: [number, number][];
}

/**
 * ConstellationBackground - Subtle starfield with constellation lines
 * Overlays on top of content with very subtle opacity
 */
export const ConstellationBackground = memo(function ConstellationBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const constellationsRef = useRef<Constellation[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      generateStars();
    };

    const generateStars = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const starCount = Math.floor((width * height) / 6000); // More stars
      
      starsRef.current = [];
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.8 + 0.3,
          opacity: Math.random() * 0.6 + 0.2,
          twinkleSpeed: Math.random() * 0.015 + 0.003,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }

      // Generate constellations
      generateConstellations();
    };

    const generateConstellations = () => {
      const stars = starsRef.current;
      constellationsRef.current = [];
      
      const numConstellations = Math.min(8, Math.floor(stars.length / 6));
      const usedStars = new Set<number>();

      for (let c = 0; c < numConstellations; c++) {
        let seedIndex = -1;
        for (let i = 0; i < stars.length; i++) {
          if (!usedStars.has(i)) {
            seedIndex = i;
            break;
          }
        }
        if (seedIndex === -1) break;

        const seed = stars[seedIndex];
        const constellationStars: number[] = [seedIndex];
        usedStars.add(seedIndex);

        const maxStars = Math.floor(Math.random() * 3) + 3;
        const maxDist = 180;

        for (let i = 0; i < stars.length && constellationStars.length < maxStars; i++) {
          if (usedStars.has(i)) continue;
          
          const star = stars[i];
          const dist = Math.hypot(star.x - seed.x, star.y - seed.y);
          
          if (dist < maxDist) {
            constellationStars.push(i);
            usedStars.add(i);
          }
        }

        const connections: [number, number][] = [];
        for (let i = 0; i < constellationStars.length - 1; i++) {
          connections.push([constellationStars[i], constellationStars[i + 1]]);
        }
        if (constellationStars.length > 2 && Math.random() > 0.4) {
          connections.push([constellationStars[0], constellationStars[constellationStars.length - 1]]);
        }

        constellationsRef.current.push({ stars: constellationStars, connections });
      }
    };

    const animate = (time: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      // Subtle colors - dimmer stars
      const starColor = isDark ? '140, 160, 200' : '120, 130, 170';
      const lineColor = isDark ? '100, 120, 160' : '140, 150, 180';
      const opacityMultiplier = isDark ? 0.4 : 0.25; // Very subtle

      // Draw constellation lines
      constellationsRef.current.forEach(constellation => {
        constellation.connections.forEach(([a, b]) => {
          const starA = starsRef.current[a];
          const starB = starsRef.current[b];
          if (!starA || !starB) return;

          const avgOpacity = (starA.opacity + starB.opacity) / 2;
          const twinkle = Math.sin(time * 0.0008 + starA.twinkleOffset) * 0.3 + 0.7;
          
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${lineColor}, ${avgOpacity * 0.12 * twinkle * opacityMultiplier})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(starA.x, starA.y);
          ctx.lineTo(starB.x, starB.y);
          ctx.stroke();
        });
      });

      // Draw stars
      starsRef.current.forEach(star => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
        const opacity = star.opacity * twinkle * opacityMultiplier;
        
        ctx.beginPath();
        ctx.fillStyle = `rgba(${starColor}, ${opacity})`;
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glow for larger stars
        if (star.size > 1.2) {
          ctx.beginPath();
          const gradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.size * 4
          );
          gradient.addColorStop(0, `rgba(${starColor}, ${opacity * 0.4})`);
          gradient.addColorStop(1, `rgba(${starColor}, 0)`);
          ctx.fillStyle = gradient;
          ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animationRef.current = requestAnimationFrame(animate);

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      aria-hidden="true"
    />
  );
});

export default ConstellationBackground;

