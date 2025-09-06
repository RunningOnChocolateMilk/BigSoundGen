import React from 'react'

const WaveformSelector = ({ waveform, onWaveformChange }) => {
  const waveforms = [
    { value: 'sine', label: 'Sine', description: 'Smooth, pure tone' },
    { value: 'square', label: 'Square', description: 'Hollow, woody sound' },
    { value: 'sawtooth', label: 'Sawtooth', description: 'Bright, buzzy' },
    { value: 'triangle', label: 'Triangle', description: 'Soft, mellow' }
  ]

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Waveform Type
      </label>
      <select
        value={waveform}
        onChange={(e) => onWaveformChange(e.target.value)}
        className="
          w-full px-3 py-2 bg-synth-dark border border-gray-600 rounded-lg
          text-white focus:outline-none focus:ring-2 focus:ring-synth-primary
          focus:border-transparent transition-all duration-200
        "
      >
        {waveforms.map(wave => (
          <option key={wave.value} value={wave.value}>
            {wave.label}
          </option>
        ))}
      </select>
      
      {/* Waveform description */}
      <div className="text-sm text-gray-400">
        {waveforms.find(w => w.value === waveform)?.description}
      </div>

      {/* Visual waveform representation */}
      <div className="mt-4 p-3 bg-synth-darker rounded-lg">
        <div className="text-xs text-gray-500 mb-2">Waveform Preview:</div>
        <div className="h-8 flex items-center justify-center">
          <div className={`w-16 h-8 border border-synth-primary rounded ${
            waveform === 'sine' ? 'bg-gradient-to-r from-transparent via-synth-primary to-transparent' :
            waveform === 'square' ? 'bg-synth-primary' :
            waveform === 'sawtooth' ? 'bg-gradient-to-br from-transparent to-synth-primary' :
            'bg-gradient-to-t from-transparent to-synth-primary'
          }`}></div>
        </div>
      </div>
    </div>
  )
}

export default WaveformSelector
