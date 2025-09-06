import React from 'react'

const ChordModificationController = ({ onChordModify, currentModification }) => {
  const [isDragging, setIsDragging] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })

  const modifications = {
    'major': { x: 0, y: 1, name: 'Major', color: 'green' },
    'minor': { x: 0, y: -1, name: 'Minor', color: 'blue' },
    'seventh': { x: 1, y: 0, name: '7th', color: 'purple' },
    'sus2': { x: -1, y: 1, name: 'Sus2', color: 'yellow' },
    'sus4': { x: -1, y: -1, name: 'Sus4', color: 'orange' },
    'augmented': { x: 1, y: 1, name: 'Aug', color: 'red' },
    'diminished': { x: 1, y: -1, name: 'Dim', color: 'gray' }
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    updatePosition(e)
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      updatePosition(e)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const updatePosition = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const x = (e.clientX - rect.left - centerX) / centerX
    const y = (e.clientY - rect.top - centerY) / centerY
    
    // Clamp to circle
    const distance = Math.sqrt(x * x + y * y)
    const clampedX = distance > 1 ? x / distance : x
    const clampedY = distance > 1 ? y / distance : y
    
    setPosition({ x: clampedX, y: clampedY })
    
    // Determine modification based on position
    const modification = getModificationFromPosition(clampedX, clampedY)
    onChordModify(modification)
  }

  const getModificationFromPosition = (x, y) => {
    const threshold = 0.3
    
    if (y > threshold) {
      if (x > threshold) return 'augmented'
      if (x < -threshold) return 'sus2'
      return 'major'
    } else if (y < -threshold) {
      if (x > threshold) return 'diminished'
      if (x < -threshold) return 'sus4'
      return 'minor'
    } else {
      if (x > threshold) return 'seventh'
      return 'major' // default to major
    }
  }

  const getCurrentModification = () => {
    return getModificationFromPosition(position.x, position.y)
  }

  const currentMod = getCurrentModification()

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-synth-accent mb-2">
          🎛️ Chord Modifier
        </h3>
        <p className="text-sm text-gray-400">
          Drag to modify chord quality in real-time
        </p>
      </div>

      {/* Joystick Controller */}
      <div className="flex justify-center">
        <div 
          className="relative w-48 h-48 bg-synth-dark rounded-full border-2 border-gray-600 cursor-pointer"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Center point */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Modification zones */}
          {Object.entries(modifications).map(([key, mod]) => (
            <div
              key={key}
              className={`
                absolute w-16 h-16 rounded-full border-2 flex items-center justify-center text-xs font-semibold
                ${currentMod === key 
                  ? `border-${mod.color}-400 bg-${mod.color}-400/20 text-${mod.color}-400`
                  : `border-gray-600 bg-gray-700/50 text-gray-400`
                }
              `}
              style={{
                left: `${50 + mod.x * 30}%`,
                top: `${50 - mod.y * 30}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {mod.name}
            </div>
          ))}
          
          {/* Current position indicator */}
          <div
            className="absolute w-4 h-4 bg-synth-primary rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100"
            style={{
              left: `${50 + position.x * 30}%`,
              top: `${50 - position.y * 30}%`
            }}
          ></div>
        </div>
      </div>

      {/* Current Modification Display */}
      <div className="bg-synth-dark/50 rounded-lg p-4 border border-gray-700">
        <div className="text-center">
          <div className="text-lg font-semibold text-synth-accent mb-2">
            Current Modification
          </div>
          <div className={`
            inline-block px-4 py-2 rounded-lg font-semibold
            ${currentMod === 'major' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
              currentMod === 'minor' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              currentMod === 'seventh' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
              currentMod === 'sus2' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
              currentMod === 'sus4' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
              currentMod === 'augmented' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              'bg-gray-500/20 text-gray-400 border border-gray-500/30'}
          `}>
            {modifications[currentMod].name}
          </div>
        </div>
      </div>

      {/* Modification Guide */}
      <div className="bg-synth-dark/50 rounded-lg p-4 border border-gray-700">
        <h4 className="font-semibold text-synth-accent mb-3">
          🎯 Modification Guide
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span>Major - Bright & Happy</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <span>Minor - Sad & Emotional</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-400 rounded"></div>
            <span>7th - Jazz & Sophisticated</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span>Sus2 - Open & Suspended</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-400 rounded"></div>
            <span>Sus4 - Tense & Resolving</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span>Aug - Bright & Tense</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChordModificationController
