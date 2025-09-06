import React from 'react'

const RandomizeButton = ({ onRandomize }) => {
  const [isAnimating, setIsAnimating] = React.useState(false)

  const handleRandomize = () => {
    setIsAnimating(true)
    onRandomize()
    
    // Reset animation after a short delay
    setTimeout(() => {
      setIsAnimating(false)
    }, 1000)
  }

  return (
    <div className="text-center">
      <button
        onClick={handleRandomize}
        disabled={isAnimating}
        className={`
          btn-primary px-6 py-3 text-lg font-semibold
          ${isAnimating ? 'animate-pulse' : ''}
          transition-all duration-300 hover:scale-105 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <div className="flex items-center space-x-2">
          <span className={`text-xl ${isAnimating ? 'animate-spin' : ''}`}>
            🎲
          </span>
          <span>
            {isAnimating ? 'Randomizing...' : 'Randomize Patch'}
          </span>
        </div>
      </button>
      
      <div className="mt-3 text-xs text-gray-400">
        Generate a completely random synthesizer configuration
      </div>

      {/* Randomization preview */}
      <div className="mt-4 p-3 bg-synth-darker rounded-lg">
        <div className="text-xs text-gray-500 mb-2">What gets randomized:</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-synth-primary rounded-full"></span>
            <span className="text-gray-300">Waveform</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            <span className="text-gray-300">ADSR</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-gray-300">Filter</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            <span className="text-gray-300">Effects</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RandomizeButton
