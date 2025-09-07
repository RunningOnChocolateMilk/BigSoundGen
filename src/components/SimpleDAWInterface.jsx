import React, { useState, useEffect } from 'react'
import * as Tone from 'tone'

const SimpleDAWInterface = () => {
  // Core state
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentKey, setCurrentKey] = useState('C')
  const [currentInstrument, setCurrentInstrument] = useState('piano')
  const [activeChords, setActiveChords] = useState(new Set())
  const [pressedKeys, setPressedKeys] = useState(new Set())
  
  // Synthesizer
  const [synth, setSynth] = useState(null)
  
  // DAW State
  const [currentTime, setCurrentTime] = useState('00:00.0')
  const [tempo, setTempo] = useState(120)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const [metronomeEnabled, setMetronomeEnabled] = useState(false)
  const [volume, setVolume] = useState(0.7)
  
  // Track State
  const [tracks, setTracks] = useState([
    { id: 1, name: 'Synth Track', mute: false, solo: false, volume: 0.7, hasContent: false },
    { id: 2, name: 'Drum Track', mute: false, solo: false, volume: 0.7, hasContent: false },
    { id: 3, name: 'Bass Track', mute: false, solo: false, volume: 0.7, hasContent: false },
    { id: 4, name: 'Lead Track', mute: false, solo: false, volume: 0.7, hasContent: false }
  ])
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  
  // Chord mappings
  const chordMappings = {
    'C': {
      'I': { name: 'C', notes: ['C3', 'E3', 'G3'], type: 'major' },
      'ii': { name: 'Dm', notes: ['D3', 'F3', 'A3'], type: 'minor' },
      'iii': { name: 'Em', notes: ['E3', 'G3', 'B3'], type: 'minor' },
      'IV': { name: 'F', notes: ['F3', 'A3', 'C4'], type: 'major' },
      'V': { name: 'G', notes: ['G3', 'B3', 'D4'], type: 'major' },
      'vi': { name: 'Am', notes: ['A3', 'C4', 'E4'], type: 'minor' },
      'vii°': { name: 'Bdim', notes: ['B3', 'D4', 'F4'], type: 'diminished' }
    }
  }

  // Instrument presets
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
    },
    strings: {
      name: 'Strings',
      icon: '🎻',
      waveform: 'triangle',
      adsr: { attack: 0.5, decay: 1.0, sustain: 0.8, release: 2.5 },
      filterCutoff: 2500,
      effects: { reverb: true, delay: false },
      detune: 0,
      volume: -7
    },
    brass: {
      name: 'Brass',
      icon: '🎺',
      waveform: 'sawtooth',
      adsr: { attack: 0.1, decay: 0.4, sustain: 0.7, release: 0.8 },
      filterCutoff: 1800,
      effects: { reverb: true, delay: false },
      detune: 0,
      volume: -4
    },
    choir: {
      name: 'Choir',
      icon: '👥',
      waveform: 'sine',
      adsr: { attack: 0.3, decay: 0.8, sustain: 0.9, release: 2.0 },
      filterCutoff: 1200,
      effects: { reverb: true, delay: true },
      detune: 0,
      volume: -6
    },
    bell: {
      name: 'Bell',
      icon: '🔔',
      waveform: 'triangle',
      adsr: { attack: 0.0, decay: 0.1, sustain: 0.1, release: 3.0 },
      filterCutoff: 4000,
      effects: { reverb: true, delay: false },
      detune: 0,
      volume: -8
    },
    pluck: {
      name: 'Pluck',
      icon: '🪕',
      waveform: 'triangle',
      adsr: { attack: 0.0, decay: 0.05, sustain: 0.0, release: 0.3 },
      filterCutoff: 2000,
      effects: { reverb: false, delay: true },
      detune: 0,
      volume: -3
    },
    ambient: {
      name: 'Ambient',
      icon: '🌌',
      waveform: 'sine',
      adsr: { attack: 3.0, decay: 2.0, sustain: 0.9, release: 5.0 },
      filterCutoff: 800,
      effects: { reverb: true, delay: true },
      detune: 0,
      volume: -12
    }
  }

  // Effects state
  const [effects, setEffects] = useState({
    reverb: false,
    delay: false,
    tremolo: false,
    flanger: false,
    sidechain: false,
    eq: false
  })

  // ADSR state
  const [adsr, setAdsr] = useState({
    attack: 0.1,
    decay: 0.2,
    sustain: 0.7,
    release: 1.2
  })

  // Filter state
  const [filterCutoff, setFilterCutoff] = useState(2000)

  // Initialize everything
  useEffect(() => {
    // Just set initialized to true immediately
    setIsInitialized(true)
    console.log('Interface loaded')
  }, [])

  // Handle instrument change
  const changeInstrument = (instrumentName) => {
    const preset = instrumentPresets[instrumentName]
    if (!preset || !synth) return

    // Apply all instrument parameters
    synth.set({
      oscillator: { 
        type: preset.waveform,
        detune: preset.detune
      },
      envelope: preset.adsr,
      volume: preset.volume
    })

    // Update filter cutoff
    if (synth.effectsChain && synth.effectsChain.filter) {
      synth.effectsChain.filter.set({
        frequency: preset.filterCutoff
      })
    }

    // Update effects
    if (synth.effectsChain) {
      const { reverb, delay } = synth.effectsChain
      if (preset.effects.reverb) {
        reverb.wet.value = 0.3
      } else {
        reverb.wet.value = 0
      }
      
      if (preset.effects.delay) {
        delay.wet.value = 0.1
      } else {
        delay.wet.value = 0
      }
    }

    setCurrentInstrument(instrumentName)
    setAdsr(preset.adsr)
    setFilterCutoff(preset.filterCutoff)
  }

  // Chord functions
  const triggerChord = (chordNumber) => {
    if (!synth) return
    
    const chord = chordMappings[currentKey][chordNumber]
    if (chord) {
      console.log('Playing chord:', chordNumber, chord.notes)
      chord.notes.forEach(note => {
        synth.triggerAttack(note)
      })
      setActiveChords(prev => new Set([...prev, chordNumber]))
    }
  }

  const releaseChord = (chordNumber) => {
    if (!synth) return
    
    const chord = chordMappings[currentKey][chordNumber]
    if (chord) {
      chord.notes.forEach(note => {
        synth.triggerRelease(note)
      })
      setActiveChords(prev => {
        const newSet = new Set(prev)
        newSet.delete(chordNumber)
        return newSet
      })
    }
  }

  const stopAllNotes = () => {
    if (synth) {
      synth.releaseAll()
      setActiveChords(new Set())
    }
  }

  // Transport controls
  const playPause = () => {
    if (isPlaying) {
      Tone.Transport.stop()
      setIsPlaying(false)
    } else {
      Tone.Transport.start()
      setIsPlaying(true)
    }
  }

  const stop = () => {
    Tone.Transport.stop()
    Tone.Transport.position = 0
    setIsPlaying(false)
    setCurrentTime('00:00.0')
  }

  // Recording functions
  const startRecording = async () => {
    try {
      const audioContext = Tone.context
      const destination = audioContext.createMediaStreamDestination()
      synth.connect(destination)

      const recorder = new MediaRecorder(destination.stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      const chunks = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setRecordedAudio(blob)
        setIsRecording(false)
      }

      recorder.start(1000)
      setIsRecording(true)
      setRecordingTime(0)
      setRecordedAudio(null)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
  }

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.repeat) return
      
      const keyMap = {
        '1': 'I', '2': 'ii', '3': 'iii', '4': 'IV',
        '5': 'V', '6': 'vi', '7': 'vii°'
      }
      
      if (keyMap[event.key]) {
        event.preventDefault()
        triggerChord(keyMap[event.key])
        setPressedKeys(prev => new Set([...prev, event.key]))
      }
      
      if (event.key === 'Escape') {
        stopAllNotes()
      }
    }

    const handleKeyUp = (event) => {
      const keyMap = {
        '1': 'I', '2': 'ii', '3': 'iii', '4': 'IV',
        '5': 'V', '6': 'vi', '7': 'vii°'
      }
      
      if (keyMap[event.key]) {
        event.preventDefault()
        releaseChord(keyMap[event.key])
        setPressedKeys(prev => {
          const newSet = new Set(prev)
          newSet.delete(event.key)
          return newSet
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [currentKey, synth])

  // Recording timer
  useEffect(() => {
    let interval = null
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(time => time + 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  if (!isInitialized) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Top Menu Bar */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <span className="font-bold text-lg">ChordMaster</span>
          </div>
          <div className="flex gap-4 text-sm">
            <button className="hover:text-blue-400 transition-colors">File</button>
            <button className="hover:text-blue-400 transition-colors">Edit</button>
            <button className="hover:text-blue-400 transition-colors">Settings</button>
            <button className="hover:text-blue-400 transition-colors">Help</button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-green-400">Ready</div>
          <div className="text-sm font-semibold">Untitled Project</div>
          <button 
            onClick={async () => {
              try {
                await Tone.start()
                console.log('Tone.js context started')
                
                const newSynth = new Tone.PolySynth(Tone.Synth, {
                  oscillator: { type: 'sine' },
                  envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 1.2 }
                }).toDestination()
                
                setSynth(newSynth)
                newSynth.triggerAttackRelease('C4', '8n')
                console.log('Test note played')
              } catch (error) {
                console.error('Audio initialization failed:', error)
              }
            }}
            className="px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-700"
          >
            Test Audio
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700">Save</button>
          <button className="px-3 py-1 bg-gray-600 rounded text-sm hover:bg-gray-500">Export</button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Row - Timeline and Tracks */}
        <div className="flex-1 flex">
          {/* Left Track Control Panel */}
          <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Tracks</h3>
              {tracks.map((track) => (
                <div key={track.id} className="bg-gray-700 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">{track.name}</div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setTracks(prev => prev.map(t => 
                          t.id === track.id ? { ...t, solo: !t.solo } : t
                        ))}
                        className={`w-6 h-6 rounded text-xs ${
                          track.solo ? 'bg-yellow-600' : 'bg-gray-600'
                        }`}
                      >
                        S
                      </button>
                      <button 
                        onClick={() => setTracks(prev => prev.map(t => 
                          t.id === track.id ? { ...t, mute: !t.mute } : t
                        ))}
                        className={`w-6 h-6 rounded text-xs ${
                          track.mute ? 'bg-red-600' : 'bg-gray-600'
                        }`}
                      >
                        M
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Vol</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1" 
                        value={track.volume}
                        onChange={(e) => setTracks(prev => prev.map(t => 
                          t.id === track.id ? { ...t, volume: parseFloat(e.target.value) } : t
                        ))}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Pan</span>
                      <input 
                        type="range" 
                        min="-1" 
                        max="1" 
                        step="0.1" 
                        value="0"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full py-2 bg-gray-700 rounded text-sm hover:bg-gray-600">
                + Add Track
              </button>
            </div>
          </div>

          {/* Central Timeline/Arrangement View */}
          <div className="flex-1 flex flex-col">
            {/* Timeline Header */}
            <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center px-4">
              <div className="flex gap-8 text-sm text-gray-400">
                {Array.from({ length: 16 }, (_, i) => (
                  <div key={i} className="w-8 text-center">{i + 1}</div>
                ))}
              </div>
            </div>

            {/* Track Area */}
            <div className="flex-1 bg-gray-900 p-4">
              <div className="space-y-2">
                {tracks.map((track) => (
                  <div key={track.id} className="h-16 bg-gray-800 rounded border border-gray-700 flex items-center px-4">
                    <div className="w-32 text-sm font-semibold">{track.name}</div>
                    <div className="flex-1 flex gap-2">
                      {track.hasContent ? (
                        <div className="h-12 bg-blue-600 rounded flex items-center px-3">
                          <div className="text-sm">Audio Clip</div>
                        </div>
                      ) : (
                        <div className="h-12 bg-gray-700 rounded flex items-center px-3 text-gray-500">
                          Empty
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Synth Panel */}
        <div className="h-64 bg-gray-800 border-t border-gray-700 p-4">
          <div className="h-full flex gap-6">
            {/* Instrument Selection */}
            <div className="w-64">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Instruments</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(instrumentPresets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => changeInstrument(key)}
                    className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                      currentInstrument === key
                        ? 'border-blue-400 bg-blue-400/20 text-blue-300'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">{preset.icon}</div>
                      <div className="text-xs font-semibold">{preset.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Key Selection */}
            <div className="w-32">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Key</h3>
              <div className="grid grid-cols-2 gap-2">
                {['C', 'G', 'D', 'A', 'E', 'F'].map(key => (
                  <button
                    key={key}
                    onClick={() => setCurrentKey(key)}
                    className={`p-3 rounded-lg border-2 font-mono text-lg font-bold transition-all duration-300 ${
                      currentKey === key
                        ? 'border-blue-400 bg-blue-400/20 text-blue-300'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {/* Nashville Chords */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Nashville Chords</h3>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(chordMappings[currentKey]).map(([num, chord]) => (
                  <button
                    key={num}
                    onMouseDown={() => triggerChord(num)}
                    onMouseUp={() => releaseChord(num)}
                    onMouseLeave={() => releaseChord(num)}
                    className={`p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      activeChords.has(num)
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    <div className="text-xs text-gray-400">{num}</div>
                    <div>{chord.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ADSR Controls */}
            <div className="w-48">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">ADSR</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Attack</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="2" 
                    step="0.01" 
                    value={adsr.attack}
                    onChange={(e) => setAdsr(prev => ({ ...prev, attack: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Decay</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="2" 
                    step="0.01" 
                    value={adsr.decay}
                    onChange={(e) => setAdsr(prev => ({ ...prev, decay: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Sustain</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={adsr.sustain}
                    onChange={(e) => setAdsr(prev => ({ ...prev, sustain: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Release</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="5" 
                    step="0.01" 
                    value={adsr.release}
                    onChange={(e) => setAdsr(prev => ({ ...prev, release: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Effects */}
            <div className="w-48">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Effects</h3>
              <div className="space-y-2">
                {Object.entries(effects).map(([effect, enabled]) => (
                  <button
                    key={effect}
                    onClick={() => setEffects(prev => ({ ...prev, [effect]: !enabled }))}
                    className={`w-full py-2 px-3 rounded text-xs font-semibold transition-all duration-300 ${
                      enabled ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {effect.charAt(0).toUpperCase() + effect.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="mt-4">
                <label className="text-xs text-gray-400 block mb-1">Filter Cutoff</label>
                <input 
                  type="range" 
                  min="100" 
                  max="4000" 
                  step="10" 
                  value={filterCutoff}
                  onChange={(e) => setFilterCutoff(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Recording */}
            <div className="w-32">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Recording</h3>
              <div className="space-y-2">
                <button
                  onClick={startRecording}
                  disabled={isRecording}
                  className={`w-full py-2 rounded text-xs font-semibold transition-all duration-300 ${
                    isRecording
                      ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {isRecording ? 'Recording...' : 'Record'}
                </button>
                <button
                  onClick={stopRecording}
                  disabled={!isRecording}
                  className={`w-full py-2 rounded text-xs font-semibold transition-all duration-300 ${
                    !isRecording
                      ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  Stop
                </button>
                {isRecording && (
                  <div className="text-center text-xs text-gray-400">
                    {recordingTime}s
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Transport and Settings Bar */}
      <div className="h-16 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20"
            />
          </div>
          <div className="text-sm font-mono">{currentTime}</div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={stop}
            className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center hover:bg-gray-500"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z"/>
            </svg>
          </button>
          <button 
            onClick={playPause}
            className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center hover:bg-gray-500"
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          <button className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center hover:bg-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm">Key: {currentKey}</div>
          <div className="text-sm">Tempo: {tempo}</div>
          <button 
            onClick={() => setIsLooping(!isLooping)}
            className={`px-3 py-1 rounded text-sm ${
              isLooping ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            Loop
          </button>
          <button 
            onClick={() => setMetronomeEnabled(!metronomeEnabled)}
            className={`px-3 py-1 rounded text-sm ${
              metronomeEnabled ? 'bg-yellow-600' : 'bg-gray-600'
            }`}
          >
            Metronome
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">-</button>
          <button className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">+</button>
        </div>
      </div>
    </div>
  )
}

export default SimpleDAWInterface
