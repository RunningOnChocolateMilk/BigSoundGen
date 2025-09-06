import React from 'react'

const AdvancedEffectsProcessor = ({ effects, onEffectsChange }) => {
  const [isExpanded, setIsExpanded] = React.useState(false)

  const handleEffectToggle = (effectName) => {
    onEffectsChange({
      ...effects,
      [effectName]: !effects[effectName]
    })
  }

  const handleEffectValueChange = (effectName, parameter, value) => {
    onEffectsChange({
      ...effects,
      [effectName]: {
        ...effects[effectName],
        [parameter]: value
      }
    })
  }

  const effectControls = [
    {
      name: 'reverb',
      label: 'Reverb',
      icon: '🌊',
      description: 'Adds spatial depth and ambience',
      parameters: [
        { name: 'roomSize', label: 'Room Size', min: 0.1, max: 1, step: 0.1, default: 0.5 },
        { name: 'wet', label: 'Mix', min: 0, max: 1, step: 0.1, default: 0.3 }
      ]
    },
    {
      name: 'delay',
      label: 'Delay',
      icon: '🔄',
      description: 'Creates echo and rhythmic patterns',
      parameters: [
        { name: 'delayTime', label: 'Time', min: 0.1, max: 2, step: 0.1, default: 0.5 },
        { name: 'feedback', label: 'Feedback', min: 0, max: 0.9, step: 0.1, default: 0.3 },
        { name: 'wet', label: 'Mix', min: 0, max: 1, step: 0.1, default: 0.3 }
      ]
    },
    {
      name: 'tremolo',
      label: 'Tremolo',
      icon: '🌊',
      description: 'Rapid volume modulation for vintage effect',
      parameters: [
        { name: 'frequency', label: 'Speed', min: 0.1, max: 20, step: 0.5, default: 5 },
        { name: 'depth', label: 'Depth', min: 0, max: 1, step: 0.1, default: 0.5 },
        { name: 'wet', label: 'Mix', min: 0, max: 1, step: 0.1, default: 0.5 }
      ]
    },
    {
      name: 'flanger',
      label: 'Flanger',
      icon: '🌀',
      description: 'Jet-like sweeping effect',
      parameters: [
        { name: 'delay', label: 'Delay', min: 0.001, max: 0.02, step: 0.001, default: 0.005 },
        { name: 'depth', label: 'Depth', min: 0, max: 1, step: 0.1, default: 0.5 },
        { name: 'frequency', label: 'Speed', min: 0.1, max: 10, step: 0.1, default: 1 },
        { name: 'wet', label: 'Mix', min: 0, max: 1, step: 0.1, default: 0.3 }
      ]
    },
    {
      name: 'chorus',
      label: 'Chorus',
      icon: '🎭',
      description: 'Thickens and widens the sound',
      parameters: [
        { name: 'frequency', label: 'Speed', min: 0.1, max: 5, step: 0.1, default: 1 },
        { name: 'delayTime', label: 'Delay', min: 0.001, max: 0.01, step: 0.001, default: 0.005 },
        { name: 'depth', label: 'Depth', min: 0, max: 1, step: 0.1, default: 0.5 },
        { name: 'wet', label: 'Mix', min: 0, max: 1, step: 0.1, default: 0.3 }
      ]
    },
    {
      name: 'distortion',
      label: 'Distortion',
      icon: '⚡',
      description: 'Adds grit and character',
      parameters: [
        { name: 'distortion', label: 'Amount', min: 0, max: 1, step: 0.1, default: 0.3 },
        { name: 'wet', label: 'Mix', min: 0, max: 1, step: 0.1, default: 0.5 }
      ]
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-synth-accent">
          🎛️ Advanced Effects
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {isExpanded ? '📁' : '📂'}
        </button>
      </div>

      {/* Basic Effects Toggle */}
      <div className="grid grid-cols-2 gap-3">
        {effectControls.slice(0, 4).map(effect => (
          <div key={effect.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{effect.icon}</span>
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
                onClick={() => handleEffectToggle(effect.name)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                  ${effects[effect.name]?.enabled || effects[effect.name] === true
                    ? 'bg-synth-primary' 
                    : 'bg-gray-600'
                  }
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                    ${effects[effect.name]?.enabled || effects[effect.name] === true ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Effect visualization */}
            <div className="h-4 bg-synth-darker rounded-lg overflow-hidden">
              {(effects[effect.name]?.enabled || effects[effect.name] === true) ? (
                <div className="h-full bg-gradient-to-r from-synth-primary to-synth-secondary animate-pulse"></div>
              ) : (
                <div className="h-full bg-gray-700"></div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Controls */}
      {isExpanded && (
        <div className="space-y-4">
          <div className="border-t border-gray-700 pt-4">
            <h4 className="font-semibold text-synth-accent mb-4">
              🎚️ Effect Parameters
            </h4>
            
            {effectControls.map(effect => {
              if (!effects[effect.name]?.enabled && effects[effect.name] !== true) return null
              
              return (
                <div key={effect.name} className="mb-6 p-4 bg-synth-dark/50 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg">{effect.icon}</span>
                    <span className="font-semibold text-synth-accent">{effect.label}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {effect.parameters.map(param => {
                      const currentValue = effects[effect.name]?.[param.name] || param.default
                      
                      return (
                        <div key={param.name} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">
                              {param.label}
                            </label>
                            <span className="text-xs text-synth-accent font-mono">
                              {currentValue.toFixed(param.name === 'delayTime' || param.name === 'delay' ? 3 : 1)}
                            </span>
                          </div>
                          
                          <input
                            type="range"
                            min={param.min}
                            max={param.max}
                            step={param.step}
                            value={currentValue}
                            onChange={(e) => handleEffectValueChange(effect.name, param.name, parseFloat(e.target.value))}
                            className="slider w-full"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* LFO Section */}
          <div className="bg-synth-dark/50 rounded-lg p-4 border border-gray-700">
            <h4 className="font-semibold text-synth-accent mb-3">
              🌊 Low Frequency Oscillator (LFO)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">LFO Rate</label>
                <input
                  type="range"
                  min="0.1"
                  max="20"
                  step="0.1"
                  value={effects.lfo?.rate || 2}
                  onChange={(e) => handleEffectValueChange('lfo', 'rate', parseFloat(e.target.value))}
                  className="slider w-full"
                />
                <div className="text-xs text-synth-accent font-mono">
                  {(effects.lfo?.rate || 2).toFixed(1)} Hz
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">LFO Depth</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={effects.lfo?.depth || 0.5}
                  onChange={(e) => handleEffectValueChange('lfo', 'depth', parseFloat(e.target.value))}
                  className="slider w-full"
                />
                <div className="text-xs text-synth-accent font-mono">
                  {(effects.lfo?.depth || 0.5).toFixed(1)}
                </div>
              </div>
            </div>
            
            <div className="mt-3">
              <button
                onClick={() => handleEffectToggle('lfo')}
                className={`
                  px-3 py-1 rounded text-sm font-medium transition-colors
                  ${effects.lfo?.enabled 
                    ? 'bg-synth-primary text-white' 
                    : 'bg-gray-600 text-gray-300'
                  }
                `}
              >
                {effects.lfo?.enabled ? 'LFO ON' : 'LFO OFF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedEffectsProcessor
