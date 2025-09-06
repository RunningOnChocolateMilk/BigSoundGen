import React from 'react'

const VirtualKeyboard = ({ onNoteTrigger, onNoteRelease, onStopAll }) => {
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

  // Track active notes to prevent duplicates
  const [activeNotes, setActiveNotes] = React.useState(new Set())

  // Handle keyboard events
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      const key = keys.find(k => k.key === event.key.toLowerCase())
      if (key && !activeNotes.has(key.note)) {
        event.preventDefault()
        setActiveNotes(prev => new Set([...prev, key.note]))
        onNoteTrigger(key.note)
      }
    }

    const handleKeyUp = (event) => {
      const key = keys.find(k => k.key === event.key.toLowerCase())
      if (key && activeNotes.has(key.note)) {
        event.preventDefault()
        setActiveNotes(prev => {
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
        setActiveNotes(new Set())
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
  }, [keys, onNoteTrigger, onNoteRelease, onStopAll, activeNotes])

  const handleMouseDown = (note) => {
    if (!activeNotes.has(note)) {
      setActiveNotes(prev => new Set([...prev, note]))
      onNoteTrigger(note)
    }
  }

  const handleMouseUp = (note) => {
    if (activeNotes.has(note)) {
      setActiveNotes(prev => {
        const newSet = new Set(prev)
        newSet.delete(note)
        return newSet
      })
      onNoteRelease(note)
    }
  }

  const handleMouseLeave = (note) => {
    if (activeNotes.has(note)) {
      setActiveNotes(prev => {
        const newSet = new Set(prev)
        newSet.delete(note)
        return newSet
      })
      onNoteRelease(note)
    }
  }

  return (
    <div className="relative">
      {/* White keys */}
      <div className="flex">
        {keys.filter(key => !key.isBlack).map((key, index) => (
          <button
            key={key.note}
            className={`
              relative z-10 h-24 w-8 border border-gray-300 
              hover:bg-gray-100 active:bg-gray-200 transition-colors duration-100
              rounded-b-lg shadow-lg
              ${activeNotes.has(key.note) 
                ? 'bg-synth-primary text-white' 
                : 'bg-white text-gray-800'
              }
            `}
            onMouseDown={() => handleMouseDown(key.note)}
            onMouseUp={() => handleMouseUp(key.note)}
            onMouseLeave={() => handleMouseLeave(key.note)}
            style={{ marginLeft: index > 0 ? '-1px' : '0' }}
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
                relative z-20 h-16 w-6 border border-gray-600
                hover:bg-gray-700 active:bg-gray-600 transition-colors duration-100
                rounded-b-lg shadow-lg ml-2
                ${activeNotes.has(key.note) 
                  ? 'bg-synth-accent text-white' 
                  : 'bg-gray-800 text-white'
                }
              `}
              onMouseDown={() => handleMouseDown(key.note)}
              onMouseUp={() => handleMouseUp(key.note)}
              onMouseLeave={() => handleMouseLeave(key.note)}
              style={{ 
                marginLeft: `${whiteKeyIndex * 28 - 12}px`
              }}
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
            setActiveNotes(new Set())
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
      </div>
    </div>
  )
}

export default VirtualKeyboard
