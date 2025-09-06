import React from 'react'

const EffectsControls = ({ effects, onEffectsChange }) => {
  const handleToggle = (effect) => {
    onEffectsChange({
      ...effects,
      [effect]: !effects[effect]
    })
  }

  const effectControls = [
    {
      key: 'reverb',
      label: 'Reverb',
      description: 'Adds spatial depth and ambience',
      icon: '🌊'
    },
    {
      key: 'delay',
      label: 'Delay',
      description: 'Creates echo and rhythmic patterns',
      icon: '🔄'
    }
  ]

  return (
    <div className="space-y-4">
      {effectControls.map(effect => (
        <div key={effect.key} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{effect.icon}</span>
              <div>
                <div className="text-sm font-medium text-gray-300">
                  {effect.label}
                </div>
                <div className="text-xs text-gray-400">
                  {effect.description}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => handleToggle(effect.key)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                ${effects[effect.key] 
                  ? 'bg-synth-primary' 
                  : 'bg-gray-600'
                }
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                  ${effects[effect.key] ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Effect visualization */}
          <div className="mt-2 p-2 bg-synth-darker rounded-lg">
            <div className="text-xs text-gray-500 mb-1">
              {effect.label} {effects[effect.key] ? 'ON' : 'OFF'}
            </div>
            <div className="h-6 flex items-center justify-center">
              {effects[effect.key] ? (
                <div className={`
                  w-full h-2 rounded-full
                  ${effect.key === 'reverb' 
                    ? 'bg-gradient-to-r from-blue-400/30 to-blue-600/30 animate-pulse' 
                    : 'bg-gradient-to-r from-purple-400/30 to-purple-600/30'
                  }
                `}>
                  <div className={`
                    h-full rounded-full
                    ${effect.key === 'reverb' 
                      ? 'bg-gradient-to-r from-blue-400 to-blue-600' 
                      : 'bg-gradient-to-r from-purple-400 to-purple-600'
                    }
                    animate-pulse
                  `}></div>
                </div>
              ) : (
                <div className="w-full h-2 bg-gray-700 rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Effects Chain Visualization */}
      <div className="mt-6 p-3 bg-synth-darker rounded-lg">
        <div className="text-xs text-gray-500 mb-2">Signal Chain:</div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2 py-1 bg-synth-primary/20 text-synth-primary rounded">
            Synth
          </span>
          <span className="text-gray-500">→</span>
          <span className="px-2 py-1 bg-synth-secondary/20 text-synth-secondary rounded">
            Filter
          </span>
          {effects.reverb && (
            <>
              <span className="text-gray-500">→</span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                Reverb
              </span>
            </>
          )}
          {effects.delay && (
            <>
              <span className="text-gray-500">→</span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                Delay
              </span>
            </>
          )}
          <span className="text-gray-500">→</span>
          <span className="px-2 py-1 bg-synth-accent/20 text-synth-accent rounded">
            Output
          </span>
        </div>
      </div>
    </div>
  )
}

export default EffectsControls
