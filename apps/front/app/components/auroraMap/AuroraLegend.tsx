export function AuroraLegend() {
  // NOAA-style color scale: green -> yellow -> orange -> red
  const levels = [
    { probability: '10-30%', color: 'bg-green-600/60', label: 'Low' },
    { probability: '30-50%', color: 'bg-lime-400/70', label: 'Moderate' },
    { probability: '50-70%', color: 'bg-yellow-400/75', label: 'Good' },
    { probability: '70-85%', color: 'bg-orange-500/80', label: 'High' },
    { probability: '85-100%', color: 'bg-red-500/85', label: 'Excellent' },
  ];

  return (
    <div className="bg-card border-0 rounded-sm p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Aurora Probability</h3>
      <div className="space-y-2">
        {levels.map(level => (
          <div key={level.label} className="flex items-center gap-3">
            <div className={`w-6 h-4 rounded ${level.color}`} />
            <span className="text-xs text-slate-300 flex-1">{level.label}</span>
            <span className="text-xs text-slate-500">{level.probability}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AuroraLegend;
