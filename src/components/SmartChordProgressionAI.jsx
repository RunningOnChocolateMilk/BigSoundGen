import React from 'react'

const SmartChordProgressionAI = ({ onProgressionSelect, currentProgression, onAIChordSuggest }) => {
  const [isLearning, setIsLearning] = React.useState(false)
  const [userHistory, setUserHistory] = React.useState([])
  const [aiSuggestions, setAiSuggestions] = React.useState([])

  // AI-powered chord progressions based on music theory and popular patterns
  const smartProgressions = {
    beginner: [
      {
        id: 'happy-basic',
        name: 'Happy Basic',
        difficulty: 'Beginner',
        chords: ['C', 'F', 'G', 'C'],
        pattern: 'I - IV - V - I',
        description: 'Perfect for uplifting songs',
        genre: 'Pop',
        confidence: 0.95
      },
      {
        id: 'sad-basic',
        name: 'Melancholic',
        difficulty: 'Beginner',
        chords: ['Am', 'F', 'C', 'G'],
        pattern: 'vi - IV - I - V',
        description: 'Emotional and beautiful',
        genre: 'Ballad',
        confidence: 0.92
      }
    ],
    intermediate: [
      {
        id: 'pop-classic',
        name: 'Pop Classic',
        difficulty: 'Intermediate',
        chords: ['C', 'Am', 'F', 'G'],
        pattern: 'I - vi - IV - V',
        description: 'Used in countless hit songs',
        genre: 'Pop',
        confidence: 0.98
      },
      {
        id: 'jazz-turnaround',
        name: 'Jazz Turnaround',
        difficulty: 'Intermediate',
        chords: ['C', 'Am', 'Dm', 'G'],
        pattern: 'I - vi - ii - V',
        description: 'Smooth jazz progression',
        genre: 'Jazz',
        confidence: 0.89
      },
      {
        id: 'blues-classic',
        name: 'Classic Blues',
        difficulty: 'Intermediate',
        chords: ['C', 'C', 'F', 'C', 'G', 'F', 'C', 'G'],
        pattern: 'I - I - IV - I - V - IV - I - V',
        description: 'Traditional blues structure',
        genre: 'Blues',
        confidence: 0.94
      }
    ],
    advanced: [
      {
        id: 'jazz-ii-v-i',
        name: 'Jazz ii-V-I',
        difficulty: 'Advanced',
        chords: ['Dm7', 'G7', 'Cmaj7'],
        pattern: 'ii7 - V7 - Imaj7',
        description: 'Sophisticated jazz harmony',
        genre: 'Jazz',
        confidence: 0.87
      },
      {
        id: 'modal-interchange',
        name: 'Modal Interchange',
        difficulty: 'Advanced',
        chords: ['C', 'Ab', 'Bb', 'F'],
        pattern: 'I - bVI - bVII - IV',
        description: 'Modern harmonic movement',
        genre: 'Alternative',
        confidence: 0.76
      }
    ]
  }

  // AI suggestion engine
  const generateAISuggestions = (userHistory) => {
    if (userHistory.length < 2) return []

    const lastChord = userHistory[userHistory.length - 1]
    const secondLastChord = userHistory[userHistory.length - 2]
    
    // Simple AI logic based on common chord movements
    const suggestions = []
    
    // Analyze chord movement patterns
    if (lastChord === 'C' && secondLastChord === 'F') {
      suggestions.push({
        chord: 'G',
        reason: 'Classic V chord resolution',
        confidence: 0.9
      })
    }
    
    if (lastChord === 'G' && secondLastChord === 'C') {
      suggestions.push({
        chord: 'Am',
        reason: 'Smooth vi chord movement',
        confidence: 0.85
      })
    }
    
    if (lastChord === 'Am' && secondLastChord === 'F') {
      suggestions.push({
        chord: 'C',
        reason: 'Return to tonic',
        confidence: 0.88
      })
    }
    
    return suggestions.slice(0, 3) // Return top 3 suggestions
  }

  const handleChordPlay = (chord) => {
    const newHistory = [...userHistory, chord].slice(-10) // Keep last 10 chords
    setUserHistory(newHistory)
    
    // Generate AI suggestions
    const suggestions = generateAISuggestions(newHistory)
    setAiSuggestions(suggestions)
    
    // Notify parent component
    onAIChordSuggest(chord, suggestions)
  }

  const handleProgressionSelect = (progression) => {
    onProgressionSelect(progression)
    setIsLearning(false)
  }

  const startLearningMode = () => {
    setIsLearning(true)
    setUserHistory([])
    setAiSuggestions([])
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-synth-accent mb-2">
          🤖 Smart Chord AI
        </h3>
        <p className="text-sm text-gray-400">
          AI-powered chord suggestions and progression learning
        </p>
      </div>

      {/* Learning Mode Toggle */}
      <div className="text-center">
        <button
          onClick={startLearningMode}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${isLearning 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'btn-primary'
            }
          `}
        >
          {isLearning ? '🧠 Learning Mode Active' : '🎓 Start Learning Mode'}
        </button>
      </div>

      {/* AI Suggestions */}
      {isLearning && aiSuggestions.length > 0 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <h4 className="font-semibold text-green-400 mb-3">
            💡 AI Suggestions
          </h4>
          <div className="space-y-2">
            {aiSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleChordPlay(suggestion.chord)}
                className="w-full p-2 bg-green-500/20 hover:bg-green-500/30 rounded text-left transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-green-400">
                    {suggestion.chord}
                  </span>
                  <span className="text-xs text-gray-400">
                    {(suggestion.confidence * 100).toFixed(0)}% match
                  </span>
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  {suggestion.reason}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* User History */}
      {isLearning && userHistory.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <h4 className="font-semibold text-blue-400 mb-3">
            📚 Your Chord History
          </h4>
          <div className="flex flex-wrap gap-2">
            {userHistory.map((chord, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm font-mono"
              >
                {chord}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Smart Progressions by Difficulty */}
      <div className="space-y-4">
        {Object.entries(smartProgressions).map(([difficulty, progressions]) => (
          <div key={difficulty} className="bg-synth-dark/50 rounded-lg p-4 border border-gray-700">
            <h4 className="font-semibold text-synth-accent mb-3 capitalize">
              {difficulty} Progressions
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {progressions.map(progression => (
                <button
                  key={progression.id}
                  onClick={() => handleProgressionSelect(progression)}
                  className={`
                    p-3 rounded-lg border transition-all duration-200 text-left
                    ${currentProgression?.id === progression.id
                      ? 'border-synth-primary bg-synth-primary/20 text-synth-primary'
                      : 'border-gray-600 bg-synth-dark/50 hover:border-synth-secondary hover:bg-synth-secondary/10'
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">{progression.name}</div>
                      <div className="text-sm text-gray-400">{progression.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-synth-accent font-mono">
                        {progression.pattern}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(progression.confidence * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {progression.chords.map((chord, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs font-mono"
                        >
                          {chord}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-400">
                      {progression.genre}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* AI Stats */}
      <div className="bg-synth-secondary/10 border border-synth-secondary/30 rounded-lg p-4">
        <h4 className="font-semibold text-synth-secondary mb-2">
          📊 AI Learning Stats
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Chords Analyzed</div>
            <div className="text-synth-secondary font-semibold">{userHistory.length}</div>
          </div>
          <div>
            <div className="text-gray-400">Suggestions Generated</div>
            <div className="text-synth-secondary font-semibold">{aiSuggestions.length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SmartChordProgressionAI
