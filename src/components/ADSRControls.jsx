import React from 'react'

const ADSRControls = ({ adsr, onAdsrChange }) => {
  const handleChange = (param, value) => {
    onAdsrChange({
      ...adsr,
      [param]: parseFloat(value)
    })
  }

  const adsrParams = [
    {
      key: 'attack',
      label: 'Attack',
      description: 'How quickly the note reaches full volume',
      min: 0,
      max: 2,
      step: 0.01,
      color: 'from-red-500 to-orange-500'
    },
    {
      key: 'decay',
      label: 'Decay',
      description: 'How quickly it drops to sustain level',
      min: 0,
      max: 2,
      step: 0.01,
      color: 'from-orange-500 to-yellow-500'
    },
    {
      key: 'sustain',
      label: 'Sustain',
      description: 'The held volume level',
      min: 0,
      max: 1,
      step: 0.01,
      color: 'from-yellow-500 to-green-500'
    },
    {
      key: 'release',
      label: 'Release',
      description: 'How quickly it fades when released',
      min: 0,
      max: 3,
      step: 0.01,
      color: 'from-green-500 to-blue-500'
    }
  ]

  return (
    <div className="space-y-4">
      {adsrParams.map(param => (
        <div key={param.key} className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-300">
              {param.label}
            </label>
            <span className="text-xs text-synth-accent font-mono">
              {adsr[param.key].toFixed(2)}s
            </span>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min={param.min}
              max={param.max}
              step={param.step}
              value={adsr[param.key]}
              onChange={(e) => handleChange(param.key, e.target.value)}
              className={`
                slider w-full h-2 rounded-lg appearance-none cursor-pointer
                bg-gradient-to-r ${param.color}
              `}
              style={{
                background: `linear-gradient(to right, 
                  ${param.color.includes('red') ? '#ef4444' : 
                    param.color.includes('orange') ? '#f97316' :
                    param.color.includes('yellow') ? '#eab308' : '#22c55e'} 
                  ${(adsr[param.key] - param.min) / (param.max - param.min) * 100}%, 
                  #374151 ${(adsr[param.key] - param.min) / (param.max - param.min) * 100}%)`
              }}
            />
          </div>
          
          <div className="text-xs text-gray-400">
            {param.description}
          </div>
        </div>
      ))}

      {/* ADSR Visual Representation */}
      <div className="mt-6 p-3 bg-synth-darker rounded-lg">
        <div className="text-xs text-gray-500 mb-2">Envelope Shape:</div>
        <div className="h-16 relative">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <linearGradient id="adsrGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="33%" stopColor="#f97316" />
                <stop offset="66%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            <path
              d={`M 0,${64 - adsr.sustain * 32} 
                  L ${adsr.attack * 20},8 
                  L ${adsr.attack * 20 + adsr.decay * 20},${64 - adsr.sustain * 32} 
                  L ${adsr.attack * 20 + adsr.decay * 20 + 40},${64 - adsr.sustain * 32} 
                  L ${adsr.attack * 20 + adsr.decay * 20 + 40 + adsr.release * 20},64`}
              stroke="url(#adsrGradient)"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default ADSRControls
