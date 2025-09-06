import React from 'react'

const VisualFeedbackDisplay = ({ 
  currentChord, 
  currentKey, 
  activeNotes, 
  currentModification,
  currentProgression,
  aiSuggestions 
}) => {
  const [displayMode, setDisplayMode] = React.useState('chord') // chord, progression, ai

  const displayModes = [
    { id: 'chord', label: 'Chord', icon: '🎵' },
    { id: 'progression', label: 'Progression', icon: '🎼' },
    { id: 'ai', label: 'AI', icon: '🤖' }
  ]

  const getChordDisplay = () => {
    if (!currentChord) return 'No chord selected'
    
    return (
      <div className="space-y-3">
        <div className="text-center">
          <div className="text-3xl font-bold text-synth-primary mb-1">
            {currentChord.name}
          </div>
          <div className="text-sm text-gray-400">
            {currentChord.type} chord in {currentKey}
          </div>
        </div>
        
        <div className="flex justify-center space-x-2">
          {currentChord.notes.map((note, index) => (
            <div
              key={index}
              className={`
                w-12 h-12 rounded-lg flex items-center justify-center text-sm font-mono
                ${activeNotes.has(note) 
                  ? 'bg-synth-primary text-white' 
                  : 'bg-gray-700 text-gray-300'
                }
              `}
            >
              {note}
            </div>
          ))}
        </div>
        
        {currentModification && (
          <div className="text-center">
            <div className="text-sm text-synth-accent">
              Modified: {currentModification}
            </div>
          </div>
        )}
      </div>
    )
  }

  const getProgressionDisplay = () => {
    if (!currentProgression) return 'No progression selected'
    
    return (
      <div className="space-y-3">
        <div className="text-center">
          <div className="text-xl font-bold text-synth-accent mb-1">
            {currentProgression.name}
          </div>
          <div className="text-sm text-gray-400">
            {currentProgression.pattern} • {currentProgression.genre}
          </div>
        </div>
        
        <div className="flex justify-center space-x-2">
          {currentProgression.chords.map((chord, index) => (
            <div
              key={index}
              className="w-16 h-16 bg-synth-secondary/20 border border-synth-secondary/30 rounded-lg flex items-center justify-center text-sm font-mono text-synth-secondary"
            >
              {chord}
            </div>
          ))}
        </div>
        
        <div className="text-center text-xs text-gray-400">
          {currentProgression.description}
        </div>
      </div>
    )
  }

  const getAIDisplay = () => {
    if (!aiSuggestions || aiSuggestions.length === 0) {
      return (
        <div className="text-center text-gray-400">
          <div className="text-2xl mb-2">🤖</div>
          <div>AI is analyzing your music...</div>
          <div className="text-xs mt-2">Play some chords to get suggestions!</div>
        </div>
      )
    }
    
    return (
      <div className="space-y-3">
        <div className="text-center">
          <div className="text-lg font-bold text-green-400 mb-1">
            AI Suggestions
          </div>
          <div className="text-sm text-gray-400">
            Based on your playing pattern
          </div>
        </div>
        
        <div className="space-y-2">
          {aiSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 bg-green-500/10 border border-green-500/30 rounded"
            >
              <div>
                <div className="font-semibold text-green-400">
                  {suggestion.chord}
                </div>
                <div className="text-xs text-gray-400">
                  {suggestion.reason}
                </div>
              </div>
              <div className="text-xs text-synth-accent font-mono">
                {(suggestion.confidence * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getCurrentDisplay = () => {
    switch (displayMode) {
      case 'chord': return getChordDisplay()
      case 'progression': return getProgressionDisplay()
      case 'ai': return getAIDisplay()
      default: return getChordDisplay()
    }
  }

  return (
    <div className="bg-synth-dark/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-synth-accent">
          📺 Visual Display
        </h2>
        <div className="flex space-x-1">
          {displayModes.map(mode => (
            <button
              key={mode.id}
              onClick={() => setDisplayMode(mode.id)}
              className={`
                px-2 py-1 rounded text-xs font-medium transition-colors
                ${displayMode === mode.id 
                  ? 'bg-synth-primary text-white' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }
              `}
            >
              {mode.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Main Display Area */}
      <div className="bg-synth-darker rounded-lg p-6 min-h-[200px] flex items-center justify-center">
        {getCurrentDisplay()}
      </div>

      {/* Status Bar */}
      <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Active Notes: {activeNotes.size}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Key: {currentKey}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-synth-accent rounded-full animate-pulse"></div>
          <span>Live</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex justify-center space-x-2">
        <button className="btn-secondary px-3 py-1 text-xs">
          📊 Stats
        </button>
        <button className="btn-secondary px-3 py-1 text-xs">
          💾 Save
        </button>
        <button className="btn-secondary px-3 py-1 text-xs">
          🔄 Reset
        </button>
      </div>
    </div>
  )
}

export default VisualFeedbackDisplay
