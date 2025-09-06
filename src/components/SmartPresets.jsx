import React from 'react'

const SmartPresets = ({ onPresetSelect, currentPreset }) => {
  const presets = [
    {
      id: 'ambient',
      name: 'Ambient Dreams',
      description: 'Soft, ethereal sounds perfect for relaxation',
      icon: '🌙',
      settings: {
        waveform: 'sine',
        adsr: { attack: 2.0, decay: 1.5, sustain: 0.8, release: 3.0 },
        filterCutoff: 800,
        effects: { reverb: true, delay: true }
      }
    },
    {
      id: 'electronic',
      name: 'Electronic Dance',
      description: 'Punchy, energetic sounds for electronic music',
      icon: '⚡',
      settings: {
        waveform: 'sawtooth',
        adsr: { attack: 0.05, decay: 0.3, sustain: 0.7, release: 0.8 },
        filterCutoff: 1500,
        effects: { reverb: false, delay: true }
      }
    },
    {
      id: 'classical',
      name: 'Classical Elegance',
      description: 'Warm, rich tones like orchestral instruments',
      icon: '🎼',
      settings: {
        waveform: 'triangle',
        adsr: { attack: 0.3, decay: 0.5, sustain: 0.6, release: 2.0 },
        filterCutoff: 1200,
        effects: { reverb: true, delay: false }
      }
    },
    {
      id: 'retro',
      name: 'Retro Synth',
      description: 'Nostalgic 80s synthesizer sounds',
      icon: '🎹',
      settings: {
        waveform: 'square',
        adsr: { attack: 0.1, decay: 0.4, sustain: 0.5, release: 1.2 },
        filterCutoff: 1000,
        effects: { reverb: true, delay: true }
      }
    },
    {
      id: 'bass',
      name: 'Deep Bass',
      description: 'Powerful low-end sounds for basslines',
      icon: '🎵',
      settings: {
        waveform: 'sawtooth',
        adsr: { attack: 0.1, decay: 0.2, sustain: 0.9, release: 0.5 },
        filterCutoff: 400,
        effects: { reverb: false, delay: false }
      }
    },
    {
      id: 'pad',
      name: 'Atmospheric Pad',
      description: 'Sustained, evolving textures for backgrounds',
      icon: '☁️',
      settings: {
        waveform: 'sine',
        adsr: { attack: 1.5, decay: 2.0, sustain: 0.8, release: 4.0 },
        filterCutoff: 600,
        effects: { reverb: true, delay: true }
      }
    }
  ]

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-synth-accent mb-2">
          🎨 Smart Presets
        </h3>
        <p className="text-sm text-gray-400">
          Choose a style and let the synth configure itself!
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {presets.map(preset => (
          <button
            key={preset.id}
            onClick={() => onPresetSelect(preset)}
            className={`
              p-3 rounded-lg border transition-all duration-200 text-left
              ${currentPreset === preset.id
                ? 'border-synth-primary bg-synth-primary/20 text-synth-primary'
                : 'border-gray-600 bg-synth-dark/50 hover:border-synth-secondary hover:bg-synth-secondary/10'
              }
            `}
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xl">{preset.icon}</span>
              <span className="font-medium text-sm">{preset.name}</span>
            </div>
            <p className="text-xs text-gray-400">{preset.description}</p>
          </button>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() => onPresetSelect(null)}
          className="btn-secondary px-4 py-2 text-sm"
        >
          🎲 Random Style
        </button>
      </div>
    </div>
  )
}

export default SmartPresets
