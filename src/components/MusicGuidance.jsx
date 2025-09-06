import React from 'react'

const MusicGuidance = ({ currentPreset, currentChord, scale }) => {
  const [showTips, setShowTips] = React.useState(true)

  const tips = {
    ambient: {
      title: "🌙 Ambient Music Tips",
      tips: [
        "Play slowly and let notes ring out",
        "Use long, sustained notes for atmosphere",
        "Try playing chords one note at a time (arpeggios)",
        "Experiment with different octaves for depth"
      ]
    },
    electronic: {
      title: "⚡ Electronic Music Tips", 
      tips: [
        "Play rhythmic patterns with short, punchy notes",
        "Try repeating the same note quickly",
        "Use the lower octave for basslines",
        "Layer different rhythms for complexity"
      ]
    },
    classical: {
      title: "🎼 Classical Music Tips",
      tips: [
        "Play melodies that rise and fall naturally",
        "Use longer notes for emotional expression",
        "Try playing scales up and down",
        "Experiment with dynamics (loud and soft)"
      ]
    },
    retro: {
      title: "🎹 Retro Synth Tips",
      tips: [
        "Play catchy, memorable melodies",
        "Use the pentatonic scale for easy success",
        "Try playing the same pattern in different octaves",
        "Keep it simple and repetitive"
      ]
    },
    bass: {
      title: "🎵 Bass Music Tips",
      tips: [
        "Focus on the lower octave (left side of keyboard)",
        "Play single notes with rhythm",
        "Try playing root notes of chords",
        "Keep it simple and groovy"
      ]
    },
    pad: {
      title: "☁️ Pad Music Tips",
      tips: [
        "Hold down multiple notes at once",
        "Play chords and let them sustain",
        "Use slow, gentle movements",
        "Layer different chord inversions"
      ]
    }
  }

  const chordTips = {
    happy: "Play the highlighted green keys - they'll sound great together!",
    sad: "Try playing slower, more emotional melodies with these chords.",
    jazz: "Experiment with complex rhythms and syncopation.",
    pop: "These chords are used in countless hit songs - play catchy melodies!",
    blues: "Try playing the same note repeatedly, then slide to another.",
    ambient: "Hold down multiple notes and let them blend together."
  }

  const currentTips = tips[currentPreset] || tips.ambient
  const currentChordTip = chordTips[currentChord?.id] || "Play any notes and see what sounds good!"

  return (
    <div className="bg-synth-dark/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-synth-accent">
          🎯 Music Guidance
        </h2>
        <button
          onClick={() => setShowTips(!showTips)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {showTips ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>

      {showTips && (
        <div className="space-y-4">
          {/* Current Style Tips */}
          {currentPreset && (
            <div className="bg-synth-primary/10 border border-synth-primary/30 rounded-lg p-4">
              <h3 className="font-semibold text-synth-primary mb-2">
                {currentTips.title}
              </h3>
              <ul className="space-y-1 text-sm text-gray-300">
                {currentTips.tips.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-synth-accent mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Chord Progression Tips */}
          {currentChord && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-green-400 mb-2">
                🎵 Chord Progression Tips
              </h3>
              <p className="text-sm text-gray-300 mb-2">
                {currentChordTip}
              </p>
              <div className="text-xs text-gray-400">
                <p>Pattern: <span className="font-mono text-green-400">{currentChord.pattern}</span></p>
                <p>Chords: <span className="font-mono text-green-400">{currentChord.chords.join(' - ')}</span></p>
              </div>
            </div>
          )}

          {/* General Tips */}
          <div className="bg-synth-secondary/10 border border-synth-secondary/30 rounded-lg p-4">
            <h3 className="font-semibold text-synth-secondary mb-2">
              💡 Quick Start Tips
            </h3>
            <ul className="space-y-1 text-sm text-gray-300">
              <li className="flex items-start space-x-2">
                <span className="text-synth-accent mt-0.5">•</span>
                <span>Start with the <strong>green keys</strong> - they always sound good!</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-synth-accent mt-0.5">•</span>
                <span>Try playing <strong>3-4 notes</strong> in a row to make melodies</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-synth-accent mt-0.5">•</span>
                <span>Hold down <strong>multiple keys</strong> at once for chords</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-synth-accent mt-0.5">•</span>
                <span>Don't worry about mistakes - <strong>experiment freely!</strong></span>
              </li>
            </ul>
          </div>

          {/* Scale Information */}
          {scale && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-blue-400 mb-2">
                🎼 Scale: {scale.charAt(0).toUpperCase() + scale.slice(1)}
              </h3>
              <p className="text-sm text-gray-300">
                The <strong>blue keys</strong> belong to this scale and will sound harmonious together.
              </p>
            </div>
          )}
        </div>
      )}

      {!showTips && (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">Tips are hidden</p>
          <button
            onClick={() => setShowTips(true)}
            className="btn-primary px-4 py-2"
          >
            Show Tips
          </button>
        </div>
      )}
    </div>
  )
}

export default MusicGuidance
