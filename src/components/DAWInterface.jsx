import React, { useState, useEffect } from 'react'
import * as Tone from 'tone'

const DAWInterface = () => {
  // Core state
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentKey, setCurrentKey] = useState('C')
  const [currentInstrument, setCurrentInstrument] = useState('piano')
  const [activeChords, setActiveChords] = useState(new Set())
  const [pressedKeys, setPressedKeys] = useState(new Set())
  
  // Synthesizer
  const [synth, setSynth] = useState(null)
  
  // Drum Machine State
  const [drumMachine, setDrumMachine] = useState({
    isEnabled: false,
    isPlaying: false,
    patterns: [],
    samples: {},
    currentPattern: 0
  })
  
  // Audio Looper State
  const [audioLooper, setAudioLooper] = useState({
    isEnabled: false,
    isPlaying: false,
    tracks: [],
    loopLength: 4,
    playbackLength: 4
  })
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordingDestination, setRecordingDestination] = useState('file')
  
  // DAW State
  const [currentTime, setCurrentTime] = useState('00:00.0')
  const [tempo, setTempo] = useState(120)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const [metronomeEnabled, setMetronomeEnabled] = useState(false)
  const [volume, setVolume] = useState(0.7)
  
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
      attack: 0.1,
      decay: 0.2,
      sustain: 0.7,
      release: 1.2,
      waveform: 'sine',
      filterCutoff: 2000,
      reverb: 0.3,
      delay: 0.1
    },
    synth: {
      name: 'Synth',
      attack: 0.05,
      decay: 0.1,
      sustain: 0.8,
      release: 0.5,
      waveform: 'sawtooth',
      filterCutoff: 1500,
      reverb: 0.2,
      delay: 0.2
    },
    strings: {
      name: 'Strings',
      attack: 0.3,
      decay: 0.4,
      sustain: 0.9,
      release: 2.0,
      waveform: 'triangle',
      filterCutoff: 1200,
      reverb: 0.5,
      delay: 0.1
    }
  }

  // Initialize everything
  useEffect(() => {
    const initSynth = async () => {
      const newSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 1.2 }
      }).toDestination()

      // Add effects
      const reverb = new Tone.Reverb(0.3).toDestination()
      const delay = new Tone.PingPongDelay('8n', 0.1).toDestination()
      const filter = new Tone.Filter(2000, 'lowpass').toDestination()
      const eq = new Tone.EQ3(-10, 0, 10).toDestination()
      const compressor = new Tone.Compressor(-30, 3).toDestination()

      newSynth.chain(filter, eq, compressor, delay, reverb)
      setSynth(newSynth)
    }


    const initDrumMachine = async () => {
      const drumSamples = {
        kick: new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 10,
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 }
        }).toDestination(),
        snare: new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 }
        }).toDestination(),
        hihat: new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: { attack: 0.01, decay: 0.1, sustain: 0.01, release: 0.1 }
        }).toDestination(),
        crash: new Tone.MetalSynth({
          frequency: 200,
          envelope: { attack: 0.01, decay: 0.5, sustain: 0.1, release: 0.5 },
          harmonicity: 5.1,
          modulationIndex: 32,
          resonance: 4000,
          octaves: 1.5
        }).toDestination()
      }

      const initialPatterns = [
        { name: 'Basic Beat', steps: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0] },
        { name: 'Hip Hop', steps: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0] },
        { name: 'House', steps: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0] }
      ]

      setDrumMachine(prev => ({
        ...prev,
        samples: drumSamples,
        patterns: initialPatterns
      }))

      // Set up drum sequencer after samples are ready
      const drumNames = ['kick', 'snare', 'hihat', 'crash']
      
      drumNames.forEach(drum => {
        Tone.Transport.scheduleRepeat((time) => {
          const currentPattern = drumMachine.patterns[drumMachine.currentPattern]
          if (currentPattern && currentPattern.steps && drumMachine.samples[drum]) {
            const stepIndex = Math.floor(Tone.Transport.position.split(':')[2]) % 16
            if (currentPattern.steps[stepIndex]) {
              drumMachine.samples[drum].triggerAttackRelease('8n', time)
            }
          }
        }, '16n')
      })
    }

    const initAudioLooper = async () => {
      const initialTracks = Array(8).fill(null).map((_, index) => ({
        id: index,
        name: `Track ${index + 1}`,
        hasContent: false,
        isRecording: false,
        mute: false,
        solo: false,
        loopLength: 4,
        playbackLength: 4,
        volume: 0.7,
        pan: 0,
        clips: []
      }))

      setAudioLooper(prev => ({
        ...prev,
        tracks: initialTracks
      }))
    }

    initSynth()
    initDrumMachine()
    initAudioLooper()
    setIsInitialized(true)
  }, [])

  // Chord functions
  const triggerChord = (chordNumber) => {
    if (!synth) return
    
    const chord = chordMappings[currentKey][chordNumber]
    if (chord) {
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

        if (recordingDestination === 'sequencer') {
          addRecordingToSequencer(blob)
        }
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

  const addRecordingToSequencer = (audioBlob) => {
    const emptyTrack = audioLooper.tracks.find(track => !track.hasContent)
    if (emptyTrack) {
      setAudioLooper(prev => {
        const newTracks = [...prev.tracks]
        const track = newTracks.find(t => t.id === emptyTrack.id)
        if (track) {
          track.hasContent = true
          track.audioBlob = audioBlob
        }
        return { ...prev, tracks: newTracks }
      })
    }
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
          <div className="w-6 h-6 bg-gray-600 rounded"></div>
          <div className="flex gap-4 text-sm">
            <button className="hover:text-blue-400 transition-colors">File</button>
            <button className="hover:text-blue-400 transition-colors">Edit</button>
            <button className="hover:text-blue-400 transition-colors">Settings</button>
            <button className="hover:text-blue-400 transition-colors">Tutorials</button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-green-400">Saved!</div>
          <div className="text-sm font-semibold">Untitled song</div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="w-6 h-6 bg-gray-600 rounded"></button>
          <button className="px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700">Share</button>
          <button className="w-6 h-6 bg-gray-600 rounded"></button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Left Track Control Panel */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          <div className="space-y-2">
            {audioLooper.tracks.map((track) => (
              <div key={track.id} className="bg-gray-700 rounded p-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">{track.name}</div>
                  <div className="flex gap-1">
                    <button className={`w-6 h-6 rounded text-xs ${track.solo ? 'bg-yellow-600' : 'bg-gray-600'}`}>S</button>
                    <button className={`w-6 h-6 rounded text-xs ${track.mute ? 'bg-red-600' : 'bg-gray-600'}`}>M</button>
                    <button className="w-6 h-6 rounded text-xs bg-gray-600">...</button>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Vol</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={track.volume}
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
                      value={track.pan}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full py-2 bg-gray-700 rounded text-sm hover:bg-gray-600">
              + Add New Track
            </button>
          </div>
        </div>

        {/* Central Timeline/Arrangement View */}
        <div className="flex-1 flex flex-col">
          {/* Timeline Header */}
          <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center px-4">
            <div className="flex gap-8 text-sm">
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="text-gray-400">{i + 1}</div>
              ))}
            </div>
          </div>

          {/* Track Area */}
          <div className="flex-1 bg-gray-900 p-4">
            <div className="space-y-2">
              {audioLooper.tracks.map((track) => (
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

        {/* Right Utility Panel */}
        <div className="w-64 bg-gray-800 border-l border-gray-700 p-4">
          <div className="space-y-4">
            {/* Synth Controls */}
            <div className="bg-gray-700 rounded p-3">
              <h3 className="text-sm font-semibold mb-2">Synth</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-400">Instrument</label>
                  <select 
                    value={currentInstrument}
                    onChange={(e) => setCurrentInstrument(e.target.value)}
                    className="w-full px-2 py-1 rounded bg-gray-600 text-white text-sm"
                  >
                    {Object.keys(instrumentPresets).map(key => (
                      <option key={key} value={key}>{instrumentPresets[key].name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Key</label>
                  <select 
                    value={currentKey}
                    onChange={(e) => setCurrentKey(e.target.value)}
                    className="w-full px-2 py-1 rounded bg-gray-600 text-white text-sm"
                  >
                    <option value="C">C</option>
                    <option value="G">G</option>
                    <option value="D">D</option>
                    <option value="A">A</option>
                    <option value="E">E</option>
                    <option value="B">B</option>
                    <option value="F#">F#</option>
                    <option value="C#">C#</option>
                    <option value="F">F</option>
                    <option value="Bb">Bb</option>
                    <option value="Eb">Eb</option>
                    <option value="Ab">Ab</option>
                  </select>
                </div>
                
                {/* Virtual Keyboard */}
                <div className="mt-3">
                  <div className="text-xs text-gray-400 mb-2">Virtual Keyboard</div>
                  <div className="flex gap-1">
                    {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(note => (
                      <button
                        key={note}
                        onMouseDown={() => {
                          if (synth) {
                            synth.triggerAttack(`${note}3`)
                            setPressedKeys(prev => new Set([...prev, note]))
                          }
                        }}
                        onMouseUp={() => {
                          if (synth) {
                            synth.triggerRelease(`${note}3`)
                            setPressedKeys(prev => {
                              const newSet = new Set(prev)
                              newSet.delete(note)
                              return newSet
                            })
                          }
                        }}
                        onMouseLeave={() => {
                          if (synth) {
                            synth.triggerRelease(`${note}3`)
                            setPressedKeys(prev => {
                              const newSet = new Set(prev)
                              newSet.delete(note)
                              return newSet
                            })
                          }
                        }}
                        className={`w-6 h-12 rounded text-xs font-semibold transition-all duration-200 ${
                          pressedKeys.has(note)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Chord Pad */}
            <div className="bg-gray-700 rounded p-3">
              <h3 className="text-sm font-semibold mb-2">Chords</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(chordMappings[currentKey]).map(([num, chord]) => (
                  <button
                    key={num}
                    onMouseDown={() => triggerChord(num)}
                    onMouseUp={() => releaseChord(num)}
                    onMouseLeave={() => releaseChord(num)}
                    className={`p-2 rounded text-sm font-semibold transition-all duration-200 ${
                      activeChords.has(num)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {chord.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Drum Machine */}
            <div className="bg-gray-700 rounded p-3">
              <h3 className="text-sm font-semibold mb-2">Beatmaker</h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (drumMachine.isPlaying) {
                        Tone.Transport.stop()
                        setDrumMachine(prev => ({ ...prev, isPlaying: false }))
                      } else {
                        Tone.Transport.start()
                        setDrumMachine(prev => ({ ...prev, isPlaying: true }))
                      }
                    }}
                    className={`px-3 py-1 rounded text-sm ${
                      drumMachine.isPlaying ? 'bg-red-600' : 'bg-green-600'
                    }`}
                  >
                    {drumMachine.isPlaying ? 'Stop' : 'Play'}
                  </button>
                </div>
                
                {/* Pattern Selector */}
                <div>
                  <label className="text-xs text-gray-400">Pattern</label>
                  <select 
                    value={drumMachine.currentPattern}
                    onChange={(e) => setDrumMachine(prev => ({ ...prev, currentPattern: parseInt(e.target.value) }))}
                    className="w-full px-2 py-1 rounded bg-gray-600 text-white text-sm"
                  >
                    {drumMachine.patterns.map((pattern, index) => (
                      <option key={index} value={index}>{pattern.name}</option>
                    ))}
                  </select>
                </div>

                {/* Drum Pads */}
                <div className="grid grid-cols-2 gap-1">
                  {Object.keys(drumMachine.samples).map(drum => (
                    <button
                      key={drum}
                      onClick={() => drumMachine.samples[drum].triggerAttackRelease('8n')}
                      className="p-2 bg-gray-600 rounded text-xs hover:bg-gray-500 active:bg-gray-400"
                    >
                      {drum}
                    </button>
                  ))}
                </div>

                {/* Step Sequencer */}
                <div className="space-y-1">
                  <div className="text-xs text-gray-400">Steps</div>
                  <div className="grid grid-cols-4 gap-1">
                    {Array.from({ length: 16 }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const newPatterns = [...drumMachine.patterns]
                          newPatterns[drumMachine.currentPattern].steps[i] = 
                            newPatterns[drumMachine.currentPattern].steps[i] ? 0 : 1
                          setDrumMachine(prev => ({ ...prev, patterns: newPatterns }))
                        }}
                        className={`w-6 h-6 rounded text-xs ${
                          drumMachine.patterns[drumMachine.currentPattern]?.steps[i] 
                            ? 'bg-blue-600' 
                            : 'bg-gray-600'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Transport and Settings Bar */}
      <div className="h-16 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-600 rounded"></div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={volume}
              className="w-20"
            />
          </div>
          <div className="text-sm">{currentTime}</div>
          <button 
            onClick={startRecording}
            disabled={isRecording}
            className={`px-3 py-1 rounded text-sm ${
              isRecording ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-500'
            }`}
          >
            Rec
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={stop}
            className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center hover:bg-gray-500"
          >
            ⏹
          </button>
          <button 
            onClick={playPause}
            className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center hover:bg-gray-500"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center hover:bg-gray-500">
            ⏭
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm">Key {currentKey}</div>
          <div className="text-sm">Tempo {tempo}</div>
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
          <button className="w-6 h-6 bg-gray-600 rounded">-</button>
          <button className="w-6 h-6 bg-gray-600 rounded">+</button>
          <button className="text-sm text-blue-400 hover:text-blue-300">Support</button>
        </div>
      </div>

      {/* Central Action Panel */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          <div className="grid grid-cols-3 gap-3">
            <button className="p-3 bg-gray-700 rounded hover:bg-gray-600 flex flex-col items-center gap-2">
              <div className="text-lg">🎵</div>
              <div className="text-xs">Browse loops</div>
            </button>
            <button className="p-3 bg-gray-700 rounded hover:bg-gray-600 flex flex-col items-center gap-2">
              <div className="text-lg">🎛️</div>
              <div className="text-xs">Patterns Beatmaker</div>
            </button>
            <button className="p-3 bg-gray-700 rounded hover:bg-gray-600 flex flex-col items-center gap-2">
              <div className="text-lg">🎹</div>
              <div className="text-xs">Play the synth</div>
            </button>
            <button className="p-3 bg-gray-700 rounded hover:bg-gray-600 flex flex-col items-center gap-2">
              <div className="text-lg">➕</div>
              <div className="text-xs">Add new track</div>
            </button>
            <button className="p-3 bg-gray-700 rounded hover:bg-gray-600 flex flex-col items-center gap-2">
              <div className="text-lg">📁</div>
              <div className="text-xs">Import file</div>
            </button>
            <button className="p-3 bg-gray-700 rounded hover:bg-gray-600 flex flex-col items-center gap-2">
              <div className="text-lg">👥</div>
              <div className="text-xs">Invite a friend</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DAWInterface
