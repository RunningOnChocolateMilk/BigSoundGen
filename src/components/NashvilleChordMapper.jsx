import React from 'react'

const NashvilleChordMapper = ({ onChordTrigger, onChordRelease, currentKey = 'C', currentChord }) => {
  const [activeChord, setActiveChord] = React.useState(null)
  const [pressedKeys, setPressedKeys] = React.useState(new Set())

  // Nashville Number System chord mappings
  const chordMappings = {
    'C': {
      'I': { name: 'C', notes: ['C4', 'E4', 'G4'], type: 'major' },
      'ii': { name: 'Dm', notes: ['D4', 'F4', 'A4'], type: 'minor' },
      'iii': { name: 'Em', notes: ['E4', 'G4', 'B4'], type: 'minor' },
      'IV': { name: 'F', notes: ['F4', 'A4', 'C5'], type: 'major' },
      'V': { name: 'G', notes: ['G4', 'B4', 'D5'], type: 'major' },
      'vi': { name: 'Am', notes: ['A4', 'C5', 'E5'], type: 'minor' },
      'vii°': { name: 'B°', notes: ['B4', 'D5', 'F5'], type: 'diminished' }
    },
    'G': {
      'I': { name: 'G', notes: ['G3', 'B3', 'D4'], type: 'major' },
      'ii': { name: 'Am', notes: ['A3', 'C4', 'E4'], type: 'minor' },
      'iii': { name: 'Bm', notes: ['B3', 'D4', 'F#4'], type: 'minor' },
      'IV': { name: 'C', notes: ['C4', 'E4', 'G4'], type: 'major' },
      'V': { name: 'D', notes: ['D4', 'F#4', 'A4'], type: 'major' },
      'vi': { name: 'Em', notes: ['E4', 'G4', 'B4'], type: 'minor' },
      'vii°': { name: 'F#°', notes: ['F#4', 'A4', 'C5'], type: 'diminished' }
    },
    'D': {
      'I': { name: 'D', notes: ['D3', 'F#3', 'A3'], type: 'major' },
      'ii': { name: 'Em', notes: ['E3', 'G3', 'B3'], type: 'minor' },
      'iii': { name: 'F#m', notes: ['F#3', 'A3', 'C#4'], type: 'minor' },
      'IV': { name: 'G', notes: ['G3', 'B3', 'D4'], type: 'major' },
      'V': { name: 'A', notes: ['A3', 'C#4', 'E4'], type: 'major' },
      'vi': { name: 'Bm', notes: ['B3', 'D4', 'F#4'], type: 'minor' },
      'vii°': { name: 'C#°', notes: ['C#4', 'E4', 'G4'], type: 'diminished' }
    },
    'A': {
      'I': { name: 'A', notes: ['A3', 'C#4', 'E4'], type: 'major' },
      'ii': { name: 'Bm', notes: ['B3', 'D4', 'F#4'], type: 'minor' },
      'iii': { name: 'C#m', notes: ['C#4', 'E4', 'G#4'], type: 'minor' },
      'IV': { name: 'D', notes: ['D4', 'F#4', 'A4'], type: 'major' },
      'V': { name: 'E', notes: ['E4', 'G#4', 'B4'], type: 'major' },
      'vi': { name: 'F#m', notes: ['F#4', 'A4', 'C#5'], type: 'minor' },
      'vii°': { name: 'G#°', notes: ['G#4', 'B4', 'D5'], type: 'diminished' }
    },
    'E': {
      'I': { name: 'E', notes: ['E3', 'G#3', 'B3'], type: 'major' },
      'ii': { name: 'F#m', notes: ['F#3', 'A3', 'C#4'], type: 'minor' },
      'iii': { name: 'G#m', notes: ['G#3', 'B3', 'D#4'], type: 'minor' },
      'IV': { name: 'A', notes: ['A3', 'C#4', 'E4'], type: 'major' },
      'V': { name: 'B', notes: ['B3', 'D#4', 'F#4'], type: 'major' },
      'vi': { name: 'C#m', notes: ['C#4', 'E4', 'G#4'], type: 'minor' },
      'vii°': { name: 'D#°', notes: ['D#4', 'F#4', 'A4'], type: 'diminished' }
    },
    'F': {
      'I': { name: 'F', notes: ['F3', 'A3', 'C4'], type: 'major' },
      'ii': { name: 'Gm', notes: ['G3', 'Bb3', 'D4'], type: 'minor' },
      'iii': { name: 'Am', notes: ['A3', 'C4', 'E4'], type: 'minor' },
      'IV': { name: 'Bb', notes: ['Bb3', 'D4', 'F4'], type: 'major' },
      'V': { name: 'C', notes: ['C4', 'E4', 'G4'], type: 'major' },
      'vi': { name: 'Dm', notes: ['D4', 'F4', 'A4'], type: 'minor' },
      'vii°': { name: 'E°', notes: ['E4', 'G4', 'Bb4'], type: 'diminished' }
    }
  }

n  const chords = chordMappings[currentKey] || chordMappings['C']

  // Number key to chord mapping
  const numberKeyMapping = {
    '1': 'I',
    '2': 'ii', 
    '3': 'iii',
    '4': 'IV',
    '5': 'V',
    '6': 'vi',
    '7': 'vii°'
  }

  // Handle keyboard events for number keys
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key
      if (numberKeyMapping[key] && !pressedKeys.has(key)) {
        event.preventDefault()
        const chordNumber = numberKeyMapping[key]
        const chordData = chords[chordNumber]
        if (chordData) {
          setPressedKeys(prev => new Set([...prev, key]))
          handleChordPress(chordNumber, chordData)
        }
      }
    }

    const handleKeyUp = (event) => {
      const key = event.key
      if (numberKeyMapping[key] && pressedKeys.has(key)) {
        event.preventDefault()
        const chordNumber = numberKeyMapping[key]
        const chordData = chords[chordNumber]
        if (chordData) {
          setPressedKeys(prev => {
            const newSet = new Set(prev)
            newSet.delete(key)
            return newSet
          })
          handleChordRelease(chordNumber, chordData)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [chords, pressedKeys])

  const handleChordPress = (chordNumber, chordData) => {
    setActiveChord(chordNumber)
    // Trigger all notes in the chord
    chordData.notes.forEach(note => {
      onChordTrigger(note)
    })
  }

  const handleChordRelease = (chordNumber, chordData) => {
    setActiveChord(null)
    // Release all notes in the chord
    chordData.notes.forEach(note => {
      onChordRelease(note)
    })
  }

  const chordButtons = [
    { number: 'I', label: '1', description: 'Tonic - Home base' },
    { number: 'ii', label: '2', description: 'Supertonic - Gentle' },
    { number: 'iii', label: '3', description: 'Mediant - Warm' },
    { number: 'IV', label: '4', description: 'Subdominant - Bright' },
    { number: 'V', label: '5', description: 'Dominant - Strong' },
    { number: 'vi', label: '6', description: 'Submediant - Soft' },
    { number: 'vii°', label: '7', description: 'Leading tone - Tense' }
  ]

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-synth-accent mb-2">
          🎵 Nashville Chord System
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Key of <span className="font-mono text-synth-primary">{currentKey}</span> - 
          Press number keys 1-7 or click buttons to play harmonized chords!
        </p>
      </div>

      {/* Chord Buttons Grid */}
      <div className="grid grid-cols-4 gap-3">
        {chordButtons.map((button) => {
          const chordData = chords[button.number]
          const isActive = activeChord === button.number
          const isKeyPressed = pressedKeys.has(button.label)
          
          return (
            <button
              key={button.number}
              onMouseDown={() => handleChordPress(button.number, chordData)}
              onMouseUp={() => handleChordRelease(button.number, chordData)}
              onMouseLeave={() => handleChordRelease(button.number, chordData)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                ${isActive || isKeyPressed
                  ? 'border-synth-primary bg-synth-primary/20 text-synth-primary' 
                  : 'border-gray-600 bg-synth-dark/50 hover:border-synth-secondary hover:bg-synth-secondary/10'
                }
              `}
              title={`${button.number}: ${chordData.name} - ${button.description} (Press ${button.label})`}
            >
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">
                  {button.label}
                </div>
                <div className="text-xs font-mono">
                  {chordData.name}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {chordData.type}
                </div>
              </div>
              
              {/* Visual indicator for chord type */}
              <div className={`
                absolute top-1 right-1 w-2 h-2 rounded-full
                ${chordData.type === 'major' ? 'bg-green-400' :
                  chordData.type === 'minor' ? 'bg-blue-400' :
                  'bg-red-400'}
              `}></div>
            </button>
          )
        })}
      </div>

      {/* Chord Progression Suggestions */}
      <div className="bg-synth-dark/50 rounded-lg p-4 border border-gray-700">
        <h4 className="font-semibold text-synth-accent mb-3">
          🎼 Popular Progressions
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-synth-primary">1-5-6-4</span>
            <span className="text-gray-400">Pop Classic</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-synth-primary">1-6-4-5</span>
            <span className="text-gray-400">50s Progression</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-synth-primary">1-4-5-1</span>
            <span className="text-gray-400">Simple & Strong</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-synth-primary">1-2-5-1</span>
            <span className="text-gray-400">Jazz Turnaround</span>
          </div>
        </div>
      </div>

      {/* Current Chord Display */}
      {activeChord && (
        <div className="bg-synth-primary/10 border border-synth-primary/30 rounded-lg p-3 text-center">
          <div className="text-synth-primary font-semibold">
            Playing: {chords[activeChord].name} ({activeChord})
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Notes: {chords[activeChord].notes.join(' - ')}
          </div>
          {pressedKeys.size > 0 && (
            <div className="text-xs text-synth-accent mt-2">
              Keys pressed: {Array.from(pressedKeys).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NashvilleChordMapper
