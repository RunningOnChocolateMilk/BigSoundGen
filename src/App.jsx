import React, { useState, useEffect, useRef } from 'react'
import * as Tone from 'tone'
import VirtualKeyboard from './components/VirtualKeyboard'
import WaveformSelector from './components/WaveformSelector'
import ADSRControls from './components/ADSRControls'
import FilterControl from './components/FilterControl'
import EffectsControls from './components/EffectsControls'
import RandomizeButton from './components/RandomizeButton'

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
        console.log('Stopped all notes')
      } catch (error) {
        console.error('Error stopping notes:', error)
      }
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-synth-darker to-synth-dark text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-synth-primary mb-2">
            BigSoundGen
          </h1>
          <p className="text-gray-300 text-lg">
            Browser-based Music Synthesizer
          </p>
        </header>

        {/* Main Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
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
                Effects
              </h2>
              <EffectsControls 
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
              Virtual Keyboard
            </h2>
            <VirtualKeyboard 
              onNoteTrigger={triggerNote}
              onNoteRelease={releaseNote}
              onStopAll={stopAllNotes}
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
