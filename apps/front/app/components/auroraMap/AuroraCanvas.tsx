import { useRef, useEffect, useCallback, useState } from 'react';
import type { AuroraPoint } from '@/types/aurora';
import earthTexture from '@/assets/earth-texture-map.jpg';

interface AuroraCanvasProps {
  auroraData: AuroraPoint[];
  aspectRatio?: number; // width/height ratio, default 2:1
  selectedLocation?: { lat: number; lng: number } | null;
  onLocationClick?: (lat: number, lng: number) => void;
}

// Color gradient for aurora probability (matching NOAA green-yellow-red scale)
function getAuroraColor(probability: number): string {
  if (probability < 5) return 'transparent';
  if (probability < 15) return 'rgba(50, 180, 50, 0.5)'; // Dark green
  if (probability < 30) return 'rgba(80, 220, 80, 0.6)'; // Light green
  if (probability < 50) return 'rgba(150, 230, 50, 0.7)'; // Yellow-green
  if (probability < 70) return 'rgba(230, 200, 50, 0.75)'; // Yellow
  if (probability < 85) return 'rgba(255, 150, 50, 0.8)'; // Orange
  return 'rgba(255, 80, 50, 0.85)'; // Red
}

export function AuroraCanvas({ auroraData, aspectRatio = 2, selectedLocation, onLocationClick }: AuroraCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // Measure container and update dimensions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const containerWidth = container.clientWidth;
      const newWidth = containerWidth;
      const newHeight = Math.round(containerWidth / aspectRatio);
      setDimensions({ width: newWidth, height: newHeight });
    };

    // Initial measurement
    updateDimensions();

    // Observe resize
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [aspectRatio]);

  const { width, height } = dimensions;

  // Load the earth texture map
  useEffect(() => {
    const img = new Image();
    img.src = earthTexture;
    img.onload = () => setMapImage(img);
  }, []);

  // Convert coordinates to canvas position
  const coordsToCanvas = useCallback(
    (lng: number, lat: number) => {
      const x = ((lng + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;
      return { x, y };
    },
    [width, height]
  );

  // Convert canvas position to coordinates
  const canvasToCoords = useCallback(
    (x: number, y: number) => {
      const lng = (x / width) * 360 - 180;
      const lat = 90 - (y / height) * 180;
      return { lat, lng };
    },
    [width, height]
  );

  // Handle canvas click
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onLocationClick) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Scale for device pixel ratio
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const coords = canvasToCoords(x * scaleX, y * scaleY);
      onLocationClick(coords.lat, coords.lng);
    },
    [canvasToCoords, onLocationClick]
  );

  // Draw the map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas with dark background
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, width, height);

    // Draw the Earth texture map as background
    if (mapImage) {
      // Apply a slight darkening filter for better aurora visibility
      ctx.globalAlpha = 0.85;
      ctx.drawImage(mapImage, 0, 0, width, height);
      ctx.globalAlpha = 1.0;

      // Add a dark overlay to make aurora more visible
      ctx.fillStyle = 'rgba(0, 10, 30, 0.3)';
      ctx.fillRect(0, 0, width, height);
    }

    // Draw subtle grid overlay
    ctx.strokeStyle = 'rgba(100, 150, 200, 0.15)';
    ctx.lineWidth = 0.5;

    // Longitude lines
    for (let lng = -180; lng <= 180; lng += 30) {
      const { x } = coordsToCanvas(lng, 0);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Latitude lines
    for (let lat = -90; lat <= 90; lat += 30) {
      const { y } = coordsToCanvas(0, lat);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw equator with slightly more visibility
    ctx.strokeStyle = 'rgba(100, 150, 200, 0.3)';
    ctx.lineWidth = 1;
    const { y: equatorY } = coordsToCanvas(0, 0);
    ctx.beginPath();
    ctx.moveTo(0, equatorY);
    ctx.lineTo(width, equatorY);
    ctx.stroke();

    // Draw aurora data as a continuous heatmap overlay
    if (auroraData && auroraData.length > 0) {
      // Create an offscreen canvas for the aurora heatmap
      const auroraCanvas = document.createElement('canvas');
      auroraCanvas.width = width;
      auroraCanvas.height = height;
      const auroraCtx = auroraCanvas.getContext('2d');

      if (auroraCtx) {
        // First pass: Draw base aurora layer with all points
        auroraCtx.globalCompositeOperation = 'lighter';

        // Sort by probability (draw low first, high on top)
        const sortedData = [...auroraData].sort((a, b) => a.aurora - b.aurora);

        for (const point of sortedData) {
          // Only show points with meaningful probability
          if (point.aurora < 5) continue;

          const { x, y } = coordsToCanvas(point.longitude, point.latitude);

          // Calculate radius - scaled by probability
          const latFactor = Math.abs(point.latitude) > 55 ? 1.5 : 1.0;
          const baseRadius = Math.max(6, (point.aurora / 100) * 18) * latFactor;

          // Create smooth gradient
          const gradient = auroraCtx.createRadialGradient(x, y, 0, x, y, baseRadius);
          const color = getAuroraColor(point.aurora);

          // Extract RGB from color for gradient
          const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (rgbMatch) {
            const [, r, g, b] = rgbMatch;
            // Scale intensity directly with probability - keep it subtle for low activity
            const intensity = point.aurora / 100;
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${intensity * 0.5})`);
            gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${intensity * 0.3})`);
            gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${intensity * 0.12})`);
            gradient.addColorStop(1, 'transparent');
          }

          auroraCtx.fillStyle = gradient;
          auroraCtx.beginPath();
          auroraCtx.arc(x, y, baseRadius, 0, Math.PI * 2);
          auroraCtx.fill();
        }

        // Second pass: Add glow for medium+ probability areas (>30%)
        auroraCtx.globalCompositeOperation = 'screen';
        for (const point of sortedData) {
          if (point.aurora < 30) continue;

          const { x, y } = coordsToCanvas(point.longitude, point.latitude);
          const glowRadius = Math.max(8, (point.aurora / 100) * 20);

          const glowGradient = auroraCtx.createRadialGradient(x, y, 0, x, y, glowRadius);

          // Subtle aurora glow - intensity scales with probability
          const intensity = (point.aurora / 100) * 0.35;
          glowGradient.addColorStop(0, `rgba(100, 220, 130, ${intensity})`);
          glowGradient.addColorStop(0.5, `rgba(70, 190, 100, ${intensity * 0.4})`);
          glowGradient.addColorStop(1, 'transparent');

          auroraCtx.fillStyle = glowGradient;
          auroraCtx.beginPath();
          auroraCtx.arc(x, y, glowRadius, 0, Math.PI * 2);
          auroraCtx.fill();
        }

        // Third pass: Add bright core only for high probability (>50%)
        for (const point of sortedData) {
          if (point.aurora < 50) continue;

          const { x, y } = coordsToCanvas(point.longitude, point.latitude);
          const coreRadius = (point.aurora / 100) * 10;

          // Bright core for high activity areas
          const coreGradient = auroraCtx.createRadialGradient(x, y, 0, x, y, coreRadius);
          const intensity = (point.aurora - 50) / 50; // 0 at 50%, 1 at 100%
          coreGradient.addColorStop(0, `rgba(180, 255, 200, ${intensity * 0.7})`);
          coreGradient.addColorStop(0.5, `rgba(100, 230, 140, ${intensity * 0.35})`);
          coreGradient.addColorStop(1, 'transparent');

          auroraCtx.fillStyle = coreGradient;
          auroraCtx.beginPath();
          auroraCtx.arc(x, y, coreRadius, 0, Math.PI * 2);
          auroraCtx.fill();
        }

        // Composite the aurora layer onto the main canvas
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(auroraCanvas, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    // Draw subtle auroral zone indicators (magnetic latitude reference)
    ctx.strokeStyle = 'rgba(100, 200, 150, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);

    // Northern auroral zone (~65-70° latitude band)
    const northOvalY = coordsToCanvas(0, 67).y;
    ctx.beginPath();
    ctx.ellipse(width / 2, northOvalY, width * 0.42, height * 0.06, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Southern auroral zone
    const southOvalY = coordsToCanvas(0, -67).y;
    ctx.beginPath();
    ctx.ellipse(width / 2, southOvalY, width * 0.42, height * 0.06, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([]);

    // Draw selected location marker
    if (selectedLocation) {
      const { x, y } = coordsToCanvas(selectedLocation.lng, selectedLocation.lat);

      // Pulsing outer ring glow
      ctx.shadowColor = '#ff6b6b';
      ctx.shadowBlur = 10;

      // Outer ring
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Inner dot
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Crosshairs
      ctx.strokeStyle = 'rgba(255, 107, 107, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 22, y);
      ctx.lineTo(x - 8, y);
      ctx.moveTo(x + 8, y);
      ctx.lineTo(x + 22, y);
      ctx.moveTo(x, y - 22);
      ctx.lineTo(x, y - 8);
      ctx.moveTo(x, y + 8);
      ctx.lineTo(x, y + 22);
      ctx.stroke();
    }

    // Draw coordinate labels with better visibility
    ctx.fillStyle = 'rgba(220, 235, 255, 0.8)';
    ctx.font = 'bold 10px monospace';

    // Add text shadow for better readability over the map
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Latitude labels
    [-60, -30, 0, 30, 60].forEach(lat => {
      const { y } = coordsToCanvas(0, lat);
      ctx.fillText(`${lat}°`, 8, y + 4);
    });

    // Longitude labels
    [-120, -60, 0, 60, 120].forEach(lng => {
      const { x } = coordsToCanvas(lng, 0);
      ctx.fillText(`${lng}°`, x - 12, height - 8);
    });

    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }, [auroraData, width, height, selectedLocation, coordsToCanvas, mapImage]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas ref={canvasRef} style={{ width, height, cursor: onLocationClick ? 'crosshair' : 'default' }} onClick={handleClick} className="border border-slate-700" />
    </div>
  );
}

export default AuroraCanvas;
