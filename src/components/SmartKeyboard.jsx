import React from 'react'

const SmartKeyboard = ({ onNoteTrigger, onNoteRelease, onStopAll, currentChord, scale, activeNotes }) => {
  // Define keyboard layout - two octaves
  const keys = [
    // First octave
    { note: 'C4', isBlack: false, key: 'a' },
    { note: 'C#4', isBlack: true, key: 'w' },
    { note: 'D4', isBlack: false, key: 's' },
    { note: 'D#4', isBlack: true, key: 'e' },
    { note: 'E4', isBlack: false, key: 'd' },
    { note: 'F4', isBlack: false, key: 'f' },
    { note: 'F#4', isBlack: true, key: 't' },
    { note: 'G4', isBlack: false, key: 'g' },
    { note: 'G#4', isBlack: true, key: 'y' },
    { note: 'A4', isBlack: false, key: 'h' },
    { note: 'A#4', isBlack: true, key: 'u' },
    { note: 'B4', isBlack: false, key: 'j' },
    // Second octave
    { note: 'C5', isBlack: false, key: 'k' },
    { note: 'C#5', isBlack: true, key: 'o' },
    { note: 'D5', isBlack: false, key: 'l' },
    { note: 'D#5', isBlack: true, key: 'p' },
    { note: 'E5', isBlack: false, key: ';' },
    { note: 'F5', isBlack: false, key: "'" },
    { note: 'F#5', isBlack: true, key: ']' },
    { note: 'G5', isBlack: false, key: '\\' },
  ]

  // Track local active notes for keyboard events
  const [localActiveNotes, setLocalActiveNotes] = React.useState(new Set())

  // Define scales for highlighting
  const scales = {
    major: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'],
    minor: ['C4', 'D4', 'D#4', 'F4', 'G4', 'G#4', 'A#4', 'C5', 'D5', 'D#5', 'F5', 'G5'],
    pentatonic: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5'],
    blues: ['C4', 'D#4', 'F4', 'F#4', 'G4', 'A#4', 'C5', 'D#5', 'F5', 'F#5', 'G5']
  }

  // Get notes that sound good with current chord
  const getHarmoniousNotes = () => {
    if (!currentChord || !currentChord.chords) return []
    
    const currentChordNote = currentChord.chords[0] // Use first chord as reference
    const rootNote = currentChordNote.replace(/\d+/, '') // Remove octave number
    
    // Define chord tones (simplified)
    const chordTones = {
      'C': ['C', 'E', 'G'],
      'D': ['D', 'F#', 'A'],
      'E': ['E', 'G#', 'B'],
      'F': ['F', 'A', 'C'],
      'G': ['G', 'B', 'D'],
      'A': ['A', 'C#', 'E'],
      'B': ['B', 'D#', 'F#'],
      'Am': ['A', 'C', 'E'],
      'Dm': ['D', 'F', 'A'],
      'Em': ['E', 'G', 'B'],
      'Fm': ['F', 'G#', 'C'],
      'Gm': ['G', 'A#', 'D'],
      'Bb': ['Bb', 'D', 'F']
    }

    const tones = chordTones[rootNote] || []
    return keys.filter(key => 
      tones.some(tone => key.note.includes(tone))
    ).map(key => key.note)
  }

  const harmoniousNotes = getHarmoniousNotes()
  const scaleNotes = scales[scale] || []

  // Handle keyboard events
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      const key = keys.find(k => k.key === event.key.toLowerCase())
      if (key && !localActiveNotes.has(key.note)) {
        event.preventDefault()
        setLocalActiveNotes(prev => new Set([...prev, key.note]))
        onNoteTrigger(key.note)
      }
    }

    const handleKeyUp = (event) => {
      const key = keys.find(k => k.key === event.key.toLowerCase())
      if (key && localActiveNotes.has(key.note)) {
        event.preventDefault()
        setLocalActiveNotes(prev => {
          const newSet = new Set(prev)
          newSet.delete(key.note)
          return newSet
        })
        onNoteRelease(key.note)
      }
    }

    // Emergency stop with Escape key
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setLocalActiveNotes(new Set())
        onStopAll()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [keys, onNoteTrigger, onNoteRelease, onStopAll, localActiveNotes])

  const handleMouseDown = (note) => {
    if (!localActiveNotes.has(note)) {
      setLocalActiveNotes(prev => new Set([...prev, note]))
      onNoteTrigger(note)
    }
  }

  const handleMouseUp = (note) => {
    if (localActiveNotes.has(note)) {
      setLocalActiveNotes(prev => {
        const newSet = new Set(prev)
        newSet.delete(note)
        return newSet
      })
      onNoteRelease(note)
    }
  }

  const handleMouseLeave = (note) => {
    if (localActiveNotes.has(note)) {
      setLocalActiveNotes(prev => {
        const newSet = new Set(prev)
        newSet.delete(note)
        return newSet
      })
      onNoteRelease(note)
    }
  }

  // Get key styling based on harmony and activity
  const getKeyStyle = (key) => {
    const isActive = localActiveNotes.has(key.note) || (activeNotes && activeNotes.has(key.note))
    const isHarmonious = harmoniousNotes.includes(key.note)
    const isInScale = scaleNotes.includes(key.note)
    
    if (isActive) {
      return key.isBlack 
        ? 'bg-synth-accent text-white' 
        : 'bg-synth-primary text-white'
    }
    
    if (isHarmonious) {
      return key.isBlack 
        ? 'bg-green-600 text-white border-green-500' 
        : 'bg-green-500 text-white border-green-400'
    }
    
    if (isInScale) {
      return key.isBlack 
        ? 'bg-blue-600 text-white border-blue-500' 
        : 'bg-blue-500 text-white border-blue-400'
    }
    
    return key.isBlack 
      ? 'bg-gray-800 text-white border-gray-600' 
      : 'bg-white text-gray-800 border-gray-300'
  }

  return (
    <div className="relative">
      {/* Legend */}
      <div className="mb-4 p-3 bg-synth-dark/50 rounded-lg border border-gray-700">
        <div className="flex justify-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-synth-primary rounded"></div>
            <span className="text-gray-300">Active</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-300">Chord Tones</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-300">Scale Notes</span>
          </div>
        </div>
      </div>

      {/* White keys */}
      <div className="flex">
        {keys.filter(key => !key.isBlack).map((key, index) => (
          <button
            key={key.note}
            className={`
              relative z-10 h-24 w-8 border transition-colors duration-100
              hover:opacity-80 active:opacity-60 rounded-b-lg shadow-lg
              ${getKeyStyle(key)}
            `}
            onMouseDown={() => handleMouseDown(key.note)}
            onMouseUp={() => handleMouseUp(key.note)}
            onMouseLeave={() => handleMouseLeave(key.note)}
            style={{ marginLeft: index > 0 ? '-1px' : '0' }}
            title={`${key.note} - ${key.key.toUpperCase()}`}
          >
            <div className="text-xs font-mono mt-16">
              {key.key.toUpperCase()}
            </div>
          </button>
        ))}
      </div>

      {/* Black keys */}
      <div className="absolute top-0 left-0 flex">
        {keys.filter(key => key.isBlack).map((key, index) => {
          const whiteKeyIndex = keys.findIndex(k => k.note === key.note) - 1
          return (
            <button
              key={key.note}
              className={`
                relative z-20 h-16 w-6 border transition-colors duration-100
                hover:opacity-80 active:opacity-60 rounded-b-lg shadow-lg ml-2
                ${getKeyStyle(key)}
              `}
              onMouseDown={() => handleMouseDown(key.note)}
              onMouseUp={() => handleMouseUp(key.note)}
              onMouseLeave={() => handleMouseLeave(key.note)}
              style={{ 
                marginLeft: `${whiteKeyIndex * 28 - 12}px`
              }}
              title={`${key.note} - ${key.key.toUpperCase()}`}
            >
              <div className="text-xs font-mono mt-10">
                {key.key.toUpperCase()}
              </div>
            </button>
          )
        })}
      </div>

      {/* Emergency Stop Button */}
      <div className="mt-4 text-center">
        <button
          onClick={() => {
            setLocalActiveNotes(new Set())
            onStopAll()
          }}
          className="btn-secondary px-4 py-2 text-sm"
        >
          🛑 Stop All Notes
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">
          Use your computer keyboard or click the keys above
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Keys: A S D F G H J K L ; ' \ (and W E T Y U O P ] for sharps)
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Press <span className="font-mono bg-gray-700 px-1 rounded">ESC</span> or click "Stop All Notes" to stop all sounds
        </p>
        <p className="text-xs text-synth-accent mt-2">
          💡 Green keys sound great with your current chord!
        </p>
      </div>
    </div>
  )
}

export default SmartKeyboard
