import React from 'react'

const ChordProgressionGenerator = ({ onChordSelect, currentChord }) => {
  const chordProgressions = [
    {
      id: 'happy',
      name: 'Happy & Uplifting',
      description: 'Major chords that sound bright and positive',
      icon: '😊',
      chords: ['C4', 'F4', 'G4', 'C4'],
      pattern: 'I - IV - V - I'
    },
    {
      id: 'sad',
      name: 'Melancholic',
      description: 'Minor chords for emotional, sad music',
      icon: '😢',
      chords: ['Am4', 'Dm4', 'G4', 'Am4'],
      pattern: 'i - iv - V - i'
    },
    {
      id: 'jazz',
      name: 'Jazz Sophistication',
      description: 'Complex chords for sophisticated sounds',
      icon: '🎷',
      chords: ['Cmaj74', 'Am74', 'Dm74', 'G74'],
      pattern: 'Cmaj7 - Am7 - Dm7 - G7'
    },
    {
      id: 'pop',
      name: 'Pop Sensation',
      description: 'Catchy progressions used in popular music',
      icon: '🎤',
      chords: ['C4', 'Am4', 'F4', 'G4'],
      pattern: 'I - vi - IV - V'
    },
    {
      id: 'blues',
      name: 'Blues Soul',
      description: 'Classic blues progression with soul',
      icon: '🎸',
      chords: ['C4', 'C4', 'F4', 'C4', 'G4', 'F4', 'C4', 'G4'],
      pattern: 'I - I - IV - I - V - IV - I - V'
    },
    {
      id: 'ambient',
      name: 'Ambient Drift',
      description: 'Slow, evolving chords for atmospheric music',
      icon: '🌊',
      chords: ['C4', 'F4', 'Bb4', 'F4'],
      pattern: 'I - IV - bVII - IV'
    }
  ]

  const [currentChordIndex, setCurrentChordIndex] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(false)

  const handleChordProgressionSelect = (progression) => {
    onChordSelect(progression)
    setCurrentChordIndex(0)
  }

  const playNextChord = () => {
    if (currentChord && currentChord.chords) {
      const nextIndex = (currentChordIndex + 1) % currentChord.chords.length
      setCurrentChordIndex(nextIndex)
      return currentChord.chords[nextIndex]
    }
    return null
  }

  const playPreviousChord = () => {
    if (currentChord && currentChord.chords) {
      const prevIndex = currentChordIndex === 0 
        ? currentChord.chords.length - 1 
        : currentChordIndex - 1
      setCurrentChordIndex(prevIndex)
      return currentChord.chords[prevIndex]
    }
    return null
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-synth-accent mb-2">
          🎵 Chord Progressions
        </h3>
        <p className="text-sm text-gray-400">
          Play chords that sound great together!
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {chordProgressions.map(progression => (
          <button
            key={progression.id}
            onClick={() => handleChordProgressionSelect(progression)}
            className={`
              p-3 rounded-lg border transition-all duration-200 text-left
              ${currentChord?.id === progression.id
                ? 'border-synth-primary bg-synth-primary/20 text-synth-primary'
                : 'border-gray-600 bg-synth-dark/50 hover:border-synth-secondary hover:bg-synth-secondary/10'
              }
            `}
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xl">{progression.icon}</span>
              <span className="font-medium text-sm">{progression.name}</span>
            </div>
            <p className="text-xs text-gray-400 mb-1">{progression.description}</p>
            <p className="text-xs font-mono text-synth-accent">{progression.pattern}</p>
          </button>
        ))}
      </div>

      {/* Chord Navigation */}
      {currentChord && (
        <div className="bg-synth-dark/50 rounded-lg p-4 border border-gray-700">
          <div className="text-center mb-3">
            <h4 className="font-semibold text-synth-accent mb-1">
              {currentChord.name}
            </h4>
            <p className="text-sm text-gray-400">
              Chord {currentChordIndex + 1} of {currentChord.chords.length}
            </p>
          </div>

          <div className="flex justify-center space-x-2 mb-3">
            <button
              onClick={() => playPreviousChord()}
              className="btn-secondary px-3 py-1 text-sm"
            >
              ⬅️ Previous
            </button>
            <button
              onClick={() => playNextChord()}
              className="btn-primary px-3 py-1 text-sm"
            >
              Next ➡️
            </button>
          </div>

          {/* Chord Visualization */}
          <div className="flex justify-center space-x-1">
            {currentChord.chords.map((chord, index) => (
              <div
                key={index}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono
                  ${index === currentChordIndex
                    ? 'bg-synth-primary text-white'
                    : 'bg-gray-600 text-gray-300'
                  }
                `}
              >
                {index + 1}
              </div>
            ))}
          </div>

          <div className="text-center mt-2">
            <p className="text-xs text-gray-400">
              Current: <span className="font-mono text-synth-accent">
                {currentChord.chords[currentChordIndex]}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={() => onChordSelect(null)}
          className="btn-secondary px-4 py-2 text-sm"
        >
          🎲 Random Progression
        </button>
      </div>
    </div>
  )
}

export default ChordProgressionGenerator
