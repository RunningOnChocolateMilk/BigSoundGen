import React, { useState, useEffect } from 'react'
import * as Tone from 'tone'

const ChordMasterInterface = () => {
  // State management
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentKey, setCurrentKey] = useState('C')
  const [currentInstrument, setCurrentInstrument] = useState('piano')
  const [activeChords, setActiveChords] = useState(new Set())
  const [chordModification, setChordModification] = useState('major')
  const [metronomeEnabled, setMetronomeEnabled] = useState(false)
  const [metronomeBPM, setMetronomeBPM] = useState(120)
  const [effects, setEffects] = useState({
    reverb: false,
    delay: false,
    tremolo: false,
    flanger: false
  })
  const [displayMode, setDisplayMode] = useState('chord') // chord, progression, settings

  // Synthesizer and effects
  const [synth, setSynth] = useState(null)
  const [metronome, setMetronome] = useState(null)
  const [activeNotes, setActiveNotes] = useState(new Set())

  // Instrument presets with realistic sounds
  const instrumentPresets = {
    piano: {
      name: 'Piano',
      icon: '🎹',
      waveform: 'triangle',
      adsr: { attack: 0.01, decay: 0.3, sustain: 0.3, release: 1.5 },
      filterCutoff: 3000,
      effects: { reverb: true, delay: false },
      detune: 0,
      volume: -6
    },
    synth: {
      name: 'Synth',
      icon: '🎛️',
      waveform: 'sawtooth',
      adsr: { attack: 0.1, decay: 0.3, sustain: 0.7, release: 0.8 },
      filterCutoff: 1200,
      effects: { reverb: false, delay: true },
      detune: 0,
      volume: -3
    },
    bass: {
      name: 'Bass',
      icon: '🎸',
      waveform: 'square',
      adsr: { attack: 0.05, decay: 0.2, sustain: 0.8, release: 0.4 },
      filterCutoff: 300,
      effects: { reverb: false, delay: false },
      detune: 0,
      volume: -2
    },
    pad: {
      name: 'Pad',
      icon: '☁️',
      waveform: 'sine',
      adsr: { attack: 2.0, decay: 1.5, sustain: 0.9, release: 3.0 },
      filterCutoff: 600,
      effects: { reverb: true, delay: true },
      detune: 0,
      volume: -8
    },
    lead: {
      name: 'Lead',
      icon: '🎷',
      waveform: 'sawtooth',
      adsr: { attack: 0.02, decay: 0.1, sustain: 0.9, release: 0.3 },
      filterCutoff: 2000,
      effects: { reverb: true, delay: false },
      detune: 0,
      volume: -4
    },
    organ: {
      name: 'Organ',
      icon: '🎹',
      waveform: 'square',
      adsr: { attack: 0.0, decay: 0.0, sustain: 1.0, release: 0.05 },
      filterCutoff: 1500,
      effects: { reverb: true, delay: false },
      detune: 0,
      volume: -5
    }
  }

  // Nashville chord mappings (same as before but simplified)
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

  // Initialize synthesizer with realistic settings
  useEffect(() => {
    const initSynth = async () => {
      try {
        // Create a more realistic synthesizer
        const newSynth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { 
            type: 'triangle',
            detune: 0
          },
          envelope: { 
            attack: 0.01, 
            decay: 0.3, 
            sustain: 0.3, 
            release: 1.5 
          },
          volume: -6
        })

        // Add filter for more realistic sound shaping
        const filter = new Tone.Filter(3000, 'lowpass')
        
        // Add effects
        const reverb = new Tone.Reverb({
          decay: 2,
          wet: 0.3
        })
        
        const delay = new Tone.PingPongDelay({
          delayTime: '8n',
          feedback: 0.2,
          wet: 0.2
        })

        // Connect the audio chain
        newSynth.connect(filter)
        filter.connect(reverb)
        filter.connect(delay)
        reverb.toDestination()
        delay.toDestination()

        setSynth(newSynth)
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize synthesizer:', error)
      }
    }

    initSynth()
  }, [])

  // Initialize metronome
  useEffect(() => {
    if (isInitialized) {
      const newMetronome = new Tone.Loop((time) => {
        const osc = new Tone.Oscillator(800, 'sine').toDestination()
        osc.start(time).stop(time + 0.1)
      }, '4n')
      
      setMetronome(newMetronome)
    }
  }, [isInitialized])

  // Handle chord trigger (polyphonic - can play multiple chords)
  const triggerChord = (chordNumber) => {
    if (!synth || !isInitialized) return
    
    const chordData = chordMappings[currentKey][chordNumber]
    if (!chordData) return

    // Check if chord is already playing
    if (activeChords.has(chordNumber)) return

    console.log('Triggering chord:', chordNumber, chordData.notes)
    
    // Add chord to active chords
    setActiveChords(prev => new Set([...prev, chordNumber]))
    
    // Trigger each note in the chord
    chordData.notes.forEach(note => {
      synth.triggerAttack(note)
      setActiveNotes(prev => new Set([...prev, note]))
    })
  }

  // Handle chord release (polyphonic)
  const releaseChord = (chordNumber) => {
    if (!synth || !isInitialized) return
    
    const chordData = chordMappings[currentKey][chordNumber]
    if (!chordData) return

    // Check if chord is actually playing
    if (!activeChords.has(chordNumber)) return

    console.log('Releasing chord:', chordNumber, chordData.notes)
    
    // Remove chord from active chords
    setActiveChords(prev => {
      const newSet = new Set(prev)
      newSet.delete(chordNumber)
      return newSet
    })
    
    // Release each note in the chord
    chordData.notes.forEach(note => {
      synth.triggerRelease(note)
      setActiveNotes(prev => {
        const newSet = new Set(prev)
        newSet.delete(note)
        return newSet
      })
    })
  }

  // Track pressed keys to prevent sticky behavior
  const [pressedKeys, setPressedKeys] = useState(new Set())

  // Keyboard event handlers for number keys
  useEffect(() => {
    const numberKeyMapping = { 
      '1': 'I', 
      '2': 'ii', 
      '3': 'iii', 
      '4': 'IV', 
      '5': 'V', 
      '6': 'vi', 
      '7': 'vii°' 
    }

    const handleKeyDown = (event) => {
      const key = event.key
      
      // Emergency stop with ESC key
      if (key === 'Escape') {
        event.preventDefault()
        stopAllNotes()
        return
      }
      
      if (numberKeyMapping[key] && !pressedKeys.has(key)) {
        event.preventDefault()
        const chordNumber = numberKeyMapping[key]
        
        // Mark key as pressed
        setPressedKeys(prev => new Set([...prev, key]))
        
        // Trigger the chord (polyphonic - can play multiple chords)
        triggerChord(chordNumber)
      }
    }

    const handleKeyUp = (event) => {
      const key = event.key
      if (numberKeyMapping[key] && pressedKeys.has(key)) {
        event.preventDefault()
        const chordNumber = numberKeyMapping[key]
        
        console.log('Key up:', key, 'chord:', chordNumber, 'active chords:', Array.from(activeChords))
        
        // Mark key as released
        setPressedKeys(prev => {
          const newSet = new Set(prev)
          newSet.delete(key)
          return newSet
        })
        
        // Release the specific chord for this key
        releaseChord(chordNumber)
      }
    }

    // Add window blur event to stop all notes when window loses focus
    const handleWindowBlur = () => {
      console.log('Window lost focus - stopping all notes')
      stopAllNotes()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleWindowBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [synth, isInitialized, currentKey, activeChords, pressedKeys])

  // Stop all notes (emergency stop)
  const stopAllNotes = () => {
    if (synth && isInitialized) {
      try {
        console.log('Emergency stop - releasing all notes')
        synth.releaseAll()
        setActiveChords(new Set())
        setActiveNotes(new Set())
        setPressedKeys(new Set()) // Clear pressed keys too
        console.log('All notes stopped')
      } catch (error) {
        console.error('Error stopping notes:', error)
      }
    }
  }

  // Handle metronome toggle
  const toggleMetronome = () => {
    if (!metronome) return
    
    if (metronomeEnabled) {
      metronome.stop()
      Tone.Transport.stop()
    } else {
      Tone.Transport.bpm.value = metronomeBPM
      metronome.start()
      Tone.Transport.start()
    }
    setMetronomeEnabled(!metronomeEnabled)
  }

  // Handle instrument change
  const changeInstrument = (instrumentName) => {
    const preset = instrumentPresets[instrumentName]
    if (!preset || !synth) return

    // Apply all instrument parameters
    synth.set({
      oscillator: { 
        type: preset.waveform,
        detune: preset.detune || 0
      },
      envelope: preset.adsr,
      volume: preset.volume || 0
    })
    
    setCurrentInstrument(instrumentName)
    console.log(`Switched to ${preset.name} instrument`)
  }

  // Handle key change
  const changeKey = (newKey) => {
    // Stop any currently playing chords
    if (synth && isInitialized && activeChords.size > 0) {
      synth.releaseAll()
    }
    
    setCurrentKey(newKey)
    setActiveChords(new Set())
    setActiveNotes(new Set())
    setPressedKeys(new Set()) // Clear pressed keys when changing key
  }

  // Cleanup effect to stop all notes when component unmounts
  useEffect(() => {
    return () => {
      if (synth && isInitialized) {
        synth.releaseAll()
      }
    }
  }, [synth, isInitialized])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-800 to-blue-800 border-b border-purple-600 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">🎵</div>
            <div>
              <h1 className="text-3xl font-bold text-white">ChordMaster</h1>
              <div className="text-sm text-purple-200">Smart Chord Synthesizer</div>
            </div>
          </div>
          
          {/* Status Indicator & Emergency Stop */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white/10 rounded-full px-4 py-2">
              <div className={`w-3 h-3 rounded-full ${isInitialized ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-sm font-medium">{isInitialized ? 'System Ready' : 'Initializing...'}</span>
            </div>
            
            {/* Emergency Stop Button */}
            {isInitialized && (
              <button
                onClick={stopAllNotes}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🛑 Stop All
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8">
        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Panel - Instrument & Key Selection */}
          <div className="space-y-8">
            {/* Instrument Selection */}
            <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="text-2xl mr-3">🎹</span>
                Sound Palette
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(instrumentPresets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => changeInstrument(key)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      currentInstrument === key
                        ? 'border-purple-400 bg-purple-400/20 text-purple-300 shadow-lg shadow-purple-500/25'
                        : 'border-purple-600/50 bg-purple-900/20 hover:border-purple-500 hover:bg-purple-800/30'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{preset.icon}</div>
                      <div className="text-sm font-semibold">{preset.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Key Selection */}
            <div className="bg-gradient-to-br from-blue-800/30 to-indigo-800/30 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="text-2xl mr-3">🎼</span>
                Musical Key
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {['C', 'G', 'D', 'A', 'E', 'F'].map(key => (
                  <button
                    key={key}
                    onClick={() => changeKey(key)}
                    className={`p-4 rounded-xl border-2 font-mono text-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                      currentKey === key
                        ? 'border-blue-400 bg-blue-400/20 text-blue-300 shadow-lg shadow-blue-500/25'
                        : 'border-blue-600/50 bg-blue-900/20 hover:border-blue-500 hover:bg-blue-800/30'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {/* Metronome */}
            <div className="bg-gradient-to-br from-green-800/30 to-emerald-800/30 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="text-2xl mr-3">⏱️</span>
                Rhythm Engine
              </h2>
              <div className="space-y-6">
                <button
                  onClick={toggleMetronome}
                  className={`w-full p-4 rounded-xl border-2 font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                    metronomeEnabled
                      ? 'border-green-400 bg-green-400/20 text-green-300 shadow-lg shadow-green-500/25'
                      : 'border-green-600/50 bg-green-900/20 hover:border-green-500 hover:bg-green-800/30'
                  }`}
                >
                  {metronomeEnabled ? '⏸️ Stop Beat' : '▶️ Start Beat'}
                </button>
                
                <div className="space-y-3">
                  <label className="text-sm text-green-200 font-medium">Tempo: {metronomeBPM} BPM</label>
                  <input
                    type="range"
                    min="60"
                    max="200"
                    value={metronomeBPM}
                    onChange={(e) => setMetronomeBPM(parseInt(e.target.value))}
                    className="w-full h-2 bg-green-900/50 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-green-300">
                    <span>60</span>
                    <span>200</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - Chord Matrix */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-indigo-800/30 to-purple-800/30 backdrop-blur-sm rounded-2xl p-8 border border-indigo-500/30 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-3 flex items-center justify-center">
                  <span className="text-4xl mr-4">🎵</span>
                  Chord Matrix
                </h2>
                <p className="text-indigo-200 text-lg">Key of <span className="font-mono text-indigo-300 text-xl font-bold">{currentKey}</span></p>
                <p className="text-indigo-300/70 text-sm mt-2">Press number keys 1-7 or click buttons • Hold multiple keys for polyphonic chords • ESC to stop all</p>
              </div>

              {/* Chord Buttons */}
              <div className="grid grid-cols-4 gap-6">
                {[
                  { number: 'I', label: '1', description: 'Tonic', color: 'from-red-500 to-pink-500' },
                  { number: 'ii', label: '2', description: 'Supertonic', color: 'from-orange-500 to-red-500' },
                  { number: 'iii', label: '3', description: 'Mediant', color: 'from-yellow-500 to-orange-500' },
                  { number: 'IV', label: '4', description: 'Subdominant', color: 'from-green-500 to-yellow-500' },
                  { number: 'V', label: '5', description: 'Dominant', color: 'from-blue-500 to-green-500' },
                  { number: 'vi', label: '6', description: 'Submediant', color: 'from-indigo-500 to-blue-500' },
                  { number: 'vii°', label: '7', description: 'Leading Tone', color: 'from-purple-500 to-indigo-500' }
                ].map((button) => {
                  const chordData = chordMappings[currentKey][button.number]
                  const isActive = activeChords.has(button.number)
                  
                  return (
                    <button
                      key={button.number}
                      onMouseDown={() => triggerChord(button.number)}
                      onMouseUp={() => releaseChord(button.number)}
                      onMouseLeave={() => releaseChord(button.number)}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        isActive
                          ? `border-white bg-gradient-to-br ${button.color} text-white shadow-2xl shadow-white/25`
                          : 'border-indigo-600/50 bg-indigo-900/20 hover:border-indigo-500 hover:bg-indigo-800/30'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-3">{button.label}</div>
                        <div className="text-lg font-mono font-semibold">{chordData.name}</div>
                        <div className="text-sm text-indigo-200 mt-1">{button.description}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Panel - Display & Effects */}
          <div className="space-y-8">
            {/* Smart Display */}
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="text-2xl mr-3">📺</span>
                Smart Display
              </h2>
              <div className="bg-black rounded-xl p-6 font-mono text-sm border border-gray-700">
                <div className="text-green-400 mb-3 text-lg font-bold">ChordMaster v2.0</div>
                <div className="space-y-2">
                  <div className="text-blue-400">Key: <span className="text-white">{currentKey}</span></div>
                  <div className="text-purple-400">Sound: <span className="text-white">{instrumentPresets[currentInstrument].name}</span></div>
                  {activeChords.size > 0 && (
                    <div className="text-yellow-400">
                      Chords: <span className="text-white">
                        {Array.from(activeChords).map(chord => chordMappings[currentKey][chord].name).join(', ')}
                      </span>
                    </div>
                  )}
                  {metronomeEnabled && (
                    <div className="text-red-400">Beat: <span className="text-white">{metronomeBPM} BPM</span></div>
                  )}
                  <div className="text-gray-400 mt-3 text-xs">
                    Active Notes: {activeNotes.size}
                  </div>
                </div>
              </div>
            </div>

            {/* Effects */}
            <div className="bg-gradient-to-br from-pink-800/30 to-rose-800/30 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/30 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="text-2xl mr-3">✨</span>
                Sound Effects
              </h2>
              <div className="space-y-4">
                {Object.entries(effects).map(([effect, enabled]) => (
                  <div key={effect} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-sm capitalize text-pink-200 font-medium">{effect}</span>
                    <button
                      onClick={() => setEffects(prev => ({ ...prev, [effect]: !enabled }))}
                      className={`w-14 h-7 rounded-full transition-all duration-300 ${
                        enabled ? 'bg-pink-400' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                        enabled ? 'translate-x-7' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChordMasterInterface
