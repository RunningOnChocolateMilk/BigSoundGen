import React from 'react'

const FilterControl = ({ cutoff, onCutoffChange }) => {
  const handleChange = (value) => {
    onCutoffChange(parseFloat(value))
  }

  // Calculate rotation for knob indicator
  const rotation = (cutoff - 200) / (2000 - 200) * 270 - 135

  return (
    <div className="space-y-4">
      <div className="text-center">
        <label className="text-sm font-medium text-gray-300 block mb-2">
          Filter Cutoff
        </label>
        <div className="text-lg font-mono text-synth-accent">
          {Math.round(cutoff)} Hz
        </div>
      </div>

      {/* Custom Knob */}
      <div className="flex justify-center">
        <div className="relative">
          <div 
            className="knob"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const centerX = rect.left + rect.width / 2
              const centerY = rect.top + rect.height / 2
              const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
              const normalizedAngle = (angle + Math.PI) / (2 * Math.PI)
              const newCutoff = 200 + normalizedAngle * (2000 - 200)
              onCutoffChange(Math.max(200, Math.min(2000, newCutoff)))
            }}
          >
            <div 
              className="knob-indicator"
              style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
            />
          </div>
        </div>
      </div>

      {/* Slider as alternative control */}
      <div className="space-y-2">
        <input
          type="range"
          min="200"
          max="2000"
          step="10"
          value={cutoff}
          onChange={(e) => handleChange(e.target.value)}
          className="slider w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>200 Hz</span>
          <span>2000 Hz</span>
        </div>
      </div>

      {/* Filter type indicator */}
      <div className="text-center">
        <div className="inline-flex items-center px-3 py-1 bg-synth-primary/20 text-synth-primary rounded-full text-sm">
          Low Pass Filter
        </div>
      </div>

      {/* Frequency visualization */}
      <div className="mt-4 p-3 bg-synth-darker rounded-lg">
        <div className="text-xs text-gray-500 mb-2">Frequency Response:</div>
        <div className="h-12 relative">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <linearGradient id="filterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="1" />
                <stop offset={`${(cutoff - 200) / (2000 - 200) * 100}%`} stopColor="#6366f1" stopOpacity="1" />
                <stop offset={`${(cutoff - 200) / (2000 - 200) * 100}%`} stopColor="#6366f1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              d={`M 0,48 Q ${(cutoff - 200) / (2000 - 200) * 100},8 ${(cutoff - 200) / (2000 - 200) * 100},8 L 100,8`}
              stroke="url(#filterGradient)"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default FilterControl
