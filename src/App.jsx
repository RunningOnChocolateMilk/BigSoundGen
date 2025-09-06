import React, { useState, useEffect, useRef } from 'react'
import * as Tone from 'tone'
import SmartKeyboard from './components/SmartKeyboard'
import WaveformSelector from './components/WaveformSelector'
import ADSRControls from './components/ADSRControls'
import FilterControl from './components/FilterControl'
import AdvancedEffectsProcessor from './components/AdvancedEffectsProcessor'
import RandomizeButton from './components/RandomizeButton'
import SmartPresets from './components/SmartPresets'
import NashvilleChordMapper from './components/NashvilleChordMapper'
import ChordModificationController from './components/ChordModificationController'
import SmartChordProgressionAI from './components/SmartChordProgressionAI'
import VisualFeedbackDisplay from './components/VisualFeedbackDisplay'
import MusicGuidance from './components/MusicGuidance'

function App() {
  // Synthesizer state
  const [synth, setSynth] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState('')
  
  // Synth parameters
  const [waveform, setWaveform] = useState('sine')
  const [adsr, setAdsr] = useState({
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 1.0
  })
  const [filterCutoff, setFilterCutoff] = useState(1000)
  const [effects, setEffects] = useState({
    reverb: false,
    delay: false
  })

  // Smart features state
  const [currentPreset, setCurrentPreset] = useState(null)
  const [currentChord, setCurrentChord] = useState(null)
  const [currentProgression, setCurrentProgression] = useState(null)
  const [currentKey, setCurrentKey] = useState('C')
  const [currentModification, setCurrentModification] = useState('major')
  const [scale, setScale] = useState('major')
  const [activeNotes, setActiveNotes] = useState(new Set())
  const [aiSuggestions, setAiSuggestions] = useState([])

  // Initialize synthesizer
  useEffect(() => {
    const initSynth = async () => {
      try {
        setDebugInfo('Initializing Tone.js...')
        
        // Check if Tone.js is available
        if (typeof Tone === 'undefined') {
          throw new Error('Tone.js is not loaded')
        }
        
        setDebugInfo('Creating synthesizer...')
        
        // Create synthesizer with polyphony
        const newSynth = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: waveform
          },
          envelope: {
            attack: adsr.attack,
            decay: adsr.decay,
            sustain: adsr.sustain,
            release: adsr.release
          }
        }).toDestination()

        setDebugInfo('Setting up audio chain...')
        
        // Add filter
        const filter = new Tone.Filter(filterCutoff, 'lowpass')
        newSynth.connect(filter)
        filter.toDestination()

        // Add effects
        const reverb = new Tone.Reverb(2).toDestination()
        const delay = new Tone.PingPongDelay('4n', 0.2).toDestination()
        
        // Connect effects conditionally
        if (effects.reverb) {
          filter.connect(reverb)
        }
        if (effects.delay) {
          filter.connect(delay)
        }

        setSynth(newSynth)
        setIsInitialized(true)
        setDebugInfo('Synthesizer ready!')
        setError(null)
      } catch (error) {
        console.error('Failed to initialize synthesizer:', error)
        setError(error.message)
        setDebugInfo(`Error: ${error.message}`)
      }
    }

    initSynth()
  }, [])

  // Update synthesizer parameters when state changes
  useEffect(() => {
    if (synth && isInitialized) {
      synth.set({
        oscillator: { type: waveform },
        envelope: adsr
      })
    }
  }, [synth, waveform, adsr, isInitialized])

  // Handle note trigger
  const triggerNote = (note) => {
    if (synth && isInitialized) {
      try {
        synth.triggerAttack(note)
        setActiveNotes(prev => new Set([...prev, note]))
        console.log('Playing note:', note)
      } catch (error) {
        console.error('Error triggering note:', error)
      }
    }
  }

  // Handle note release
  const releaseNote = (note) => {
    if (synth && isInitialized) {
      try {
        synth.triggerRelease(note)
        setActiveNotes(prev => {
          const newSet = new Set(prev)
          newSet.delete(note)
          return newSet
        })
        console.log('Releasing note:', note)
      } catch (error) {
        console.error('Error releasing note:', error)
      }
    }
  }

  // Stop all notes (emergency stop)
  const stopAllNotes = () => {
    if (synth && isInitialized) {
      try {
        synth.releaseAll()
        setActiveNotes(new Set())
        console.log('Stopped all notes')
      } catch (error) {
        console.error('Error stopping notes:', error)
      }
    }
  }

  // Handle chord modification
  const handleChordModify = (modification) => {
    setCurrentModification(modification)
    console.log('Chord modification:', modification)
  }

  // Handle AI chord suggestions
  const handleAIChordSuggest = (chord, suggestions) => {
    console.log('AI suggested chord:', chord, suggestions)
    setAiSuggestions(suggestions)
  }

  // Handle Nashville chord selection
  const handleNashvilleChord = (chordData) => {
    setCurrentChord(chordData)
    // Trigger all notes in the chord
    chordData.notes.forEach(note => triggerNote(note))
  }

  // Handle preset selection
  const handlePresetSelect = (preset) => {
    if (preset) {
      setWaveform(preset.settings.waveform)
      setAdsr(preset.settings.adsr)
      setFilterCutoff(preset.settings.filterCutoff)
      setEffects(preset.settings.effects)
      setCurrentPreset(preset.id)
      
      // Set appropriate scale for preset
      const scaleMap = {
        ambient: 'major',
        electronic: 'minor',
        classical: 'major',
        retro: 'pentatonic',
        bass: 'blues',
        pad: 'major'
      }
      setScale(scaleMap[preset.id] || 'major')
    } else {
      // Random preset
      const presets = ['ambient', 'electronic', 'classical', 'retro', 'bass', 'pad']
      const randomPreset = presets[Math.floor(Math.random() * presets.length)]
      handlePresetSelect({ id: randomPreset })
    }
  }

  // Handle chord progression selection
  const handleChordSelect = (chordProgression) => {
    if (chordProgression) {
      setCurrentChord(chordProgression)
    } else {
      // Random chord progression
      const progressions = [
        { id: 'happy', chords: ['C4', 'F4', 'G4', 'C4'], pattern: 'I - IV - V - I' },
        { id: 'sad', chords: ['Am4', 'Dm4', 'G4', 'Am4'], pattern: 'i - iv - V - i' },
        { id: 'pop', chords: ['C4', 'Am4', 'F4', 'G4'], pattern: 'I - vi - IV - V' },
        { id: 'blues', chords: ['C4', 'C4', 'F4', 'C4', 'G4', 'F4', 'C4', 'G4'], pattern: 'I - I - IV - I - V - IV - I - V' }
      ]
      const randomProgression = progressions[Math.floor(Math.random() * progressions.length)]
      setCurrentChord(randomProgression)
    }
  }

  // Randomize all parameters
  const randomizePatch = () => {
    const waveforms = ['sine', 'square', 'sawtooth', 'triangle']
    const randomWaveform = waveforms[Math.floor(Math.random() * waveforms.length)]
    
    setWaveform(randomWaveform)
    setAdsr({
      attack: Math.random() * 2,
      decay: Math.random() * 2,
      sustain: Math.random(),
      release: Math.random() * 3
    })
    setFilterCutoff(Math.random() * 2000 + 200)
    setEffects({
      reverb: Math.random() > 0.5,
      delay: Math.random() > 0.5
    })
    setCurrentPreset(null)
    setCurrentChord(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-synth-darker to-synth-dark text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-synth-primary mb-2">
            BigSoundGen
          </h1>
          <p className="text-gray-300 text-lg mb-2">
            Idiot-Proof Music Synthesizer
          </p>
          <p className="text-gray-400 text-sm">
            Make great music without knowing music theory! 🎵
          </p>
        </header>

        {/* Hichord-Level Smart Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Nashville Number System */}
          <div className="bg-synth-dark/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <NashvilleChordMapper 
              onChordTrigger={triggerNote}
              onChordRelease={releaseNote}
              currentKey={currentKey}
              currentChord={currentChord}
            />
          </div>
          
          {/* Chord Modification Controller */}
          <div className="bg-synth-dark/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <ChordModificationController 
              onChordModify={handleChordModify}
              currentModification={currentModification}
            />
          </div>
          
          {/* Smart Chord AI */}
          <div className="bg-synth-dark/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <SmartChordProgressionAI 
              onProgressionSelect={setCurrentProgression}
              currentProgression={currentProgression}
              onAIChordSuggest={handleAIChordSuggest}
            />
          </div>
        </div>

        {/* Smart Presets */}
        <div className="mb-8">
          <div className="bg-synth-dark/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <SmartPresets 
              onPresetSelect={handlePresetSelect}
              currentPreset={currentPreset}
            />
          </div>
        </div>

        {/* Visual Feedback Display */}
        <div className="mb-8">
          <VisualFeedbackDisplay 
            currentChord={currentChord}
            currentKey={currentKey}
            activeNotes={activeNotes}
            currentModification={currentModification}
            currentProgression={currentProgression}
            aiSuggestions={aiSuggestions}
          />
        </div>

        {/* Main Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* Left Column - Oscillator & ADSR */}
          <div className="space-y-6">
            <div className="bg-synth-dark/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-synth-accent">
                Oscillator
              </h2>
              <WaveformSelector 
                waveform={waveform} 
                onWaveformChange={setWaveform} 
              />
            </div>

            <div className="bg-synth-dark/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-synth-accent">
                ADSR Envelope
              </h2>
              <ADSRControls 
                adsr={adsr} 
                onAdsrChange={setAdsr} 
              />
            </div>
          </div>

          {/* Center Column - Filter & Effects */}
          <div className="space-y-6">
            <div className="bg-synth-dark/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-synth-accent">
                Filter
              </h2>
              <FilterControl 
                cutoff={filterCutoff} 
                onCutoffChange={setFilterCutoff} 
              />
            </div>

            <div className="bg-synth-dark/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-synth-accent">
                Advanced Effects
              </h2>
              <AdvancedEffectsProcessor 
                effects={effects} 
                onEffectsChange={setEffects} 
              />
            </div>

            <div className="bg-synth-dark/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <RandomizeButton onRandomize={randomizePatch} />
            </div>
          </div>

          {/* Right Column - Keyboard */}
          <div className="bg-synth-dark/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-synth-accent">
              Smart Keyboard
            </h2>
            <SmartKeyboard 
              onNoteTrigger={triggerNote}
              onNoteRelease={releaseNote}
              onStopAll={stopAllNotes}
              currentChord={currentChord}
              scale={scale}
            />
          </div>

          {/* Guidance Column */}
          <div>
            <MusicGuidance 
              currentPreset={currentPreset}
              currentChord={currentChord}
              scale={scale}
            />
          </div>
        </div>

        {/* Status and Controls */}
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-4">
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${
              error 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : isInitialized 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                error ? 'bg-red-400' : isInitialized ? 'bg-green-400' : 'bg-yellow-400'
              }`}></div>
              {error ? 'Error Loading' : isInitialized ? 'Synthesizer Ready' : 'Initializing...'}
            </div>
            
            {/* Global Emergency Stop */}
            {isInitialized && (
              <button
                onClick={stopAllNotes}
                className="btn-secondary px-4 py-2 text-sm"
              >
                🛑 Emergency Stop
              </button>
            )}
          </div>
          
          {/* Debug Information */}
          {debugInfo && (
            <div className="text-sm text-gray-400">
              {debugInfo}
            </div>
          )}
          
          {/* Error Details */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 max-w-md mx-auto">
              <div className="text-red-400 font-semibold mb-2">Error Details:</div>
              <div className="text-red-300 text-sm">{error}</div>
              <div className="text-xs text-gray-400 mt-2">
                Check browser console for more details
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
