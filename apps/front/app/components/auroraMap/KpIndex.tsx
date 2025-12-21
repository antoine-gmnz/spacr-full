interface KpIndexProps {
  kpIndex: number;
  timestamp?: string;
}

function getKpLevel(kp: number): { level: string; color: string; description: string } {
  if (kp < 2) {
    return {
      level: 'Quiet',
      color: 'text-green-400',
      description: 'Minimal aurora activity. Visible only at high latitudes.',
    };
  }
  if (kp < 4) {
    return {
      level: 'Unsettled',
      color: 'text-yellow-400',
      description: 'Moderate activity. Aurora visible at latitudes above 60°.',
    };
  }
  if (kp < 5) {
    return {
      level: 'Active',
      color: 'text-orange-400',
      description: 'Increased activity. Aurora pushing southward.',
    };
  }
  if (kp < 6) {
    return {
      level: 'Minor Storm',
      color: 'text-red-400',
      description: 'G1 storm. Aurora visible at latitudes above 55°.',
    };
  }
  if (kp < 7) {
    return {
      level: 'Moderate Storm',
      color: 'text-red-500',
      description: 'G2 storm. Aurora visible at latitudes above 50°.',
    };
  }
  if (kp < 8) {
    return {
      level: 'Strong Storm',
      color: 'text-purple-500',
      description: 'G3 storm. Aurora visible at latitudes above 45°.',
    };
  }
  if (kp < 9) {
    return {
      level: 'Severe Storm',
      color: 'text-purple-600',
      description: 'G4 storm. Aurora visible at mid-latitudes!',
    };
  }
  return {
    level: 'Extreme Storm',
    color: 'text-fuchsia-500',
    description: 'G5 storm. Aurora visible at low latitudes! Rare event!',
  };
}

export function KpIndex({ kpIndex, timestamp }: KpIndexProps) {
  const kpInfo = getKpLevel(kpIndex);
  const percentage = Math.min((kpIndex / 9) * 100, 100);

  return (
    <div className="bg-card border-0 rounded-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Kp Index</h3>
        <span className={`text-sm font-medium ${kpInfo.color}`}>{kpInfo.level}</span>
      </div>

      {/* Kp Value Display */}
      <div className="flex items-end gap-2 mb-4">
        <span className={`text-5xl font-bold ${kpInfo.color}`}>{kpIndex.toFixed(1)}</span>
        <span className="text-slate-400 text-sm mb-2">/ 9</span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-secondary-foreground rounded-full overflow-hidden mb-3">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, 
              #22c55e 0%, 
              #eab308 30%, 
              #f97316 50%, 
              #ef4444 70%, 
              #a855f7 90%, 
              #d946ef 100%
            )`,
          }}
        />
        {/* Scale markers */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <div key={n} className="absolute top-0 bottom-0 w-px bg-slate-600" style={{ left: `${(n / 9) * 100}%` }} />
        ))}
      </div>

      {/* Scale Labels */}
      <div className="flex justify-between text-xs text-slate-500 mb-4">
        <span>0</span>
        <span>3</span>
        <span>6</span>
        <span>9</span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-300">{kpInfo.description}</p>

      {/* Timestamp */}
      {timestamp && <p className="text-xs text-slate-500 mt-3">Last updated: {new Date(timestamp).toLocaleString()}</p>}
    </div>
  );
}

export default KpIndex;
