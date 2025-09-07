import React, { useState, useEffect } from 'react'
import * as Tone from 'tone'

const CompactInterface = () => {
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
    playbackLength: 4 // How many times each loop plays
  })
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordingDestination, setRecordingDestination] = useState('file') // 'file' or 'sequencer'
  
  // Navigation State
  const [activePanel, setActivePanel] = useState('sequencer')
  const [showPanels, setShowPanels] = useState(false)

  // Chord mappings
  const chordMappings = {
    'C': {
      'I': { name: 'C', notes: ['C3', 'E3', 'G3'], type: 'major' },
      'ii': { name: 'Dm', notes: ['D3', 'F3', 'A3'], type: 'minor' },
      'iii': { name: 'Em', notes: ['E3', 'G3', 'B3'], type: 'minor' },
      'IV': { name: 'F', notes: ['F3', 'A3', 'C4'], type: 'major' },
      'V': { name: 'G', notes: ['G3', 'B3', 'D4'], type: 'major' },
      'vi': { name: 'Am', notes: ['A3', 'C4', 'E4'], type: 'minor' },
      'vii°': { name: 'B°', notes: ['B3', 'D4', 'F4'], type: 'diminished' }
    }
  }

  // Instrument presets
  const instrumentPresets = {
    piano: { name: 'Piano' },
    synth: { name: 'Synth' },
    bass: { name: 'Bass' },
    pad: { name: 'Pad' }
  }

  // Initialize synthesizer
  useEffect(() => {
    const initSynth = async () => {
      try {
        const newSynth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.01, decay: 0.3, sustain: 0.3, release: 1.5 },
          volume: -6
        })
        
        newSynth.toDestination()
        setSynth(newSynth)
        setIsInitialized(true)
        
        // Initialize drum machine
        initDrumMachine()
        initAudioLooper()
      } catch (error) {
        console.error('Failed to initialize:', error)
      }
    }

    const initDrumMachine = async () => {
      const drumSamples = {
        kick: new Tone.MembraneSynth(),
        snare: new Tone.NoiseSynth(),
        hihat: new Tone.MetalSynth()
      }
      
      Object.values(drumSamples).forEach(sample => sample.toDestination())
      
      const initialPatterns = Array(4).fill(null).map((_, index) => ({
        id: index,
        name: `Pattern ${index + 1}`,
        tracks: {
          kick: Array(8).fill(false),
          snare: Array(8).fill(false),
          hihat: Array(8).fill(false)
        }
      }))

      setDrumMachine(prev => ({
        ...prev,
        samples: drumSamples,
        patterns: initialPatterns
      }))
    }

    const initAudioLooper = async () => {
      const initialTracks = Array(4).fill(null).map((_, index) => ({
        id: index,
        name: `Track ${index + 1}`,
        hasContent: false,
        isRecording: false,
        mute: false,
        loopLength: 4, // Individual track loop length
        playbackLength: 4, // How many times this track loops
        volume: 0.7,
        pan: 0
      }))

      setAudioLooper(prev => ({
        ...prev,
        tracks: initialTracks
      }))
    }

    initSynth()
  }, [])

  // Chord functions
  const triggerChord = (chordNumber) => {
    if (!synth || !isInitialized) return
    
    const chordKeys = Object.keys(chordMappings[currentKey])
    const chordData = chordMappings[currentKey]?.[chordKeys[chordNumber - 1]]
    
    if (!chordData) return
    
    chordData.notes.forEach(note => {
      synth.triggerAttack(note)
    })
    
    setActiveChords(prev => new Set([...prev, chordNumber]))
  }

  const releaseChord = (chordNumber) => {
    if (!synth || !isInitialized) return
    
    const chordKeys = Object.keys(chordMappings[currentKey])
    const chordData = chordMappings[currentKey]?.[chordKeys[chordNumber - 1]]
    
    if (!chordData) return
    
    chordData.notes.forEach(note => {
      synth.triggerRelease(note)
    })
    
    setActiveChords(prev => {
      const newSet = new Set(prev)
      newSet.delete(chordNumber)
      return newSet
    })
  }

  // Drum functions
  const playDrumSample = (sampleName) => {
    if (!drumMachine.samples[sampleName]) return
    drumMachine.samples[sampleName].triggerAttackRelease('C4', '8n')
  }

  const toggleDrumStep = (track, step) => {
    setDrumMachine(prev => {
      const newPatterns = [...prev.patterns]
      newPatterns[prev.currentPattern].tracks[track][step] = !newPatterns[prev.currentPattern].tracks[track][step]
      return { ...prev, patterns: newPatterns }
    })
  }

  // Looper functions
  const startLoopRecording = (trackId) => {
    setAudioLooper(prev => {
      const newTracks = [...prev.tracks]
      const track = newTracks.find(t => t.id === trackId)
      if (track) {
        track.isRecording = true
        track.hasContent = true
      }
      return { ...prev, tracks: newTracks }
    })
  }

  const toggleTrackMute = (trackId) => {
    setAudioLooper(prev => {
      const newTracks = [...prev.tracks]
      const track = newTracks.find(t => t.id === trackId)
      if (track) {
        track.mute = !track.mute
      }
      return { ...prev, tracks: newTracks }
    })
  }

  const updateTrackLoopLength = (trackId, length) => {
    setAudioLooper(prev => {
      const newTracks = [...prev.tracks]
      const track = newTracks.find(t => t.id === trackId)
      if (track) {
        track.loopLength = length
      }
      return { ...prev, tracks: newTracks }
    })
  }

  const updateTrackPlaybackLength = (trackId, length) => {
    setAudioLooper(prev => {
      const newTracks = [...prev.tracks]
      const track = newTracks.find(t => t.id === trackId)
      if (track) {
        track.playbackLength = length
      }
      return { ...prev, tracks: newTracks }
    })
  }

  const updateTrackVolume = (trackId, volume) => {
    setAudioLooper(prev => {
      const newTracks = [...prev.tracks]
      const track = newTracks.find(t => t.id === trackId)
      if (track) {
        track.volume = volume
      }
      return { ...prev, tracks: newTracks }
    })
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
        
        // If recording to sequencer, add to first available track
        if (recordingDestination === 'sequencer') {
          addRecordingToSequencer(blob)
        }
      }
      
      recorder.start(1000)
      setIsRecording(true)
      setRecordingTime(0)
      setRecordedAudio(null)
      
      console.log('Recording started - destination:', recordingDestination)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  const stopRecording = async () => {
    if (!isRecording) return
    
    try {
      // Stop recording logic here
      setIsRecording(false)
      console.log('Recording stopped')
    } catch (error) {
      console.error('Failed to stop recording:', error)
      setIsRecording(false)
    }
  }

  const addRecordingToSequencer = (audioBlob) => {
    // Find first empty track
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
      console.log('Recording added to sequencer track:', emptyTrack.id + 1)
    } else {
      console.log('No empty tracks available for recording')
    }
  }

  // Navigation functions
  const togglePanels = () => setShowPanels(!showPanels)
  const switchPanel = (panel) => {
    setActivePanel(panel)
    setShowPanels(false)
  }

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

  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              ChordMaster Pro
            </h1>
            <p className="text-gray-300 text-sm">Professional Music Production Suite</p>
          </div>
          
          {/* Navigation Button */}
          <div className="relative">
            <button
              onClick={togglePanels}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg flex items-center justify-center text-white font-bold text-lg"
            >
              ⚙️
            </button>
            
            {/* Panel Selection Menu */}
            {showPanels && (
              <div className="absolute top-14 right-0 bg-gray-800/95 backdrop-blur-sm rounded-xl p-2 shadow-2xl border border-white/20 z-50">
                <button
                  onClick={() => switchPanel('synth')}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 mb-1 ${
                    activePanel === 'synth' 
                      ? 'bg-pink-500 text-white' 
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  🎹 Synth
                </button>
                <button
                  onClick={() => switchPanel('beatmaker')}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 mb-1 ${
                    activePanel === 'beatmaker' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  🥁 Beatmaker
                </button>
                <button
                  onClick={() => switchPanel('sequencer')}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    activePanel === 'sequencer' 
                      ? 'bg-teal-500 text-white' 
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  🔄 Sequencer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Sequencer View (Main) */}
        {activePanel === 'sequencer' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 p-4 overflow-hidden">
              <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column - Audio Looper */}
                <div className="bg-gradient-to-br from-teal-800/30 to-cyan-800/30 backdrop-blur-sm rounded-2xl p-4 border border-teal-500/30 shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center">
                      <span className="text-xl mr-2">🔄</span>
                      Audio Looper
                    </h2>
                    <button
                      onClick={() => setAudioLooper(prev => ({ ...prev, isEnabled: !prev.isEnabled }))}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all duration-300 text-sm ${
                        audioLooper.isEnabled
                          ? 'bg-teal-500 text-white'
                          : 'bg-teal-900/50 text-teal-300 hover:bg-teal-800/50'
                      }`}
                    >
                      {audioLooper.isEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {audioLooper.isEnabled && (
                    <div className="space-y-4 h-full overflow-y-auto">
                      {/* Master Controls */}
                      <div className="flex items-center justify-between p-3 bg-teal-900/20 rounded-xl">
                        <button
                          onClick={() => setAudioLooper(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm ${
                            audioLooper.isPlaying
                              ? 'bg-red-500 text-white'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          {audioLooper.isPlaying ? '⏸️ STOP' : '▶️ PLAY'}
                        </button>
                        
                        <div className="flex gap-2">
                          <select
                            value={audioLooper.loopLength}
                            onChange={(e) => setAudioLooper(prev => ({ ...prev, loopLength: parseInt(e.target.value) }))}
                            className="px-2 py-1 rounded-lg bg-teal-900/30 text-teal-300 border border-teal-600/50 text-xs"
                          >
                            <option value={1}>1 Bar</option>
                            <option value={2}>2 Bars</option>
                            <option value={4}>4 Bars</option>
                            <option value={8}>8 Bars</option>
                          </select>
                        </div>
                      </div>

                      {/* Recording Controls */}
                      <div className="p-3 bg-teal-900/20 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-teal-200 font-semibold text-sm">Recording</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={startRecording}
                              disabled={isRecording}
                              className={`px-3 py-1 rounded-lg font-semibold transition-all duration-300 text-xs ${
                                isRecording
                                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                  : 'bg-red-500 text-white hover:bg-red-600'
                              }`}
                            >
                              {isRecording ? '🔴 Recording...' : '🔴 REC'}
                            </button>
                            <button
                              onClick={stopRecording}
                              disabled={!isRecording}
                              className={`px-3 py-1 rounded-lg font-semibold transition-all duration-300 text-xs ${
                                !isRecording
                                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                  : 'bg-orange-500 text-white hover:bg-orange-600'
                              }`}
                            >
                              ⏹️ STOP
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <label className="text-teal-300 text-xs">Output to:</label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setRecordingDestination('file')}
                              className={`px-2 py-1 rounded text-xs font-semibold transition-all duration-300 ${
                                recordingDestination === 'file'
                                  ? 'bg-teal-500 text-white'
                                  : 'bg-teal-900/50 text-teal-300 hover:bg-teal-800/50'
                              }`}
                            >
                              📁 File
                            </button>
                            <button
                              onClick={() => setRecordingDestination('sequencer')}
                              className={`px-2 py-1 rounded text-xs font-semibold transition-all duration-300 ${
                                recordingDestination === 'sequencer'
                                  ? 'bg-teal-500 text-white'
                                  : 'bg-teal-900/50 text-teal-300 hover:bg-teal-800/50'
                              }`}
                            >
                              🔄 Sequencer
                            </button>
                          </div>
                        </div>
                        
                        {isRecording && (
                          <div className="mt-2 text-center">
                            <div className="text-teal-400 text-xs">
                              Recording... {recordingTime}s
                            </div>
                            <div className="text-teal-500 text-xs">
                              Will save to {recordingDestination === 'sequencer' ? 'first available track' : 'file'}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Track List */}
                      <div className="space-y-2">
                        {audioLooper.tracks.map((track) => (
                          <div key={track.id} className={`p-3 rounded-xl border transition-all duration-300 ${
                            track.hasContent 
                              ? 'bg-teal-900/30 border-teal-500/50' 
                              : 'bg-teal-900/10 border-teal-700/30'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xs">
                                  {track.id + 1}
                                </div>
                                <div>
                                  <div className="text-teal-200 font-semibold text-sm">{track.name}</div>
                                  <div className="text-teal-400 text-xs">
                                    {track.hasContent ? `${track.loopLength} bars, ${track.playbackLength}x` : 'Empty'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => toggleTrackMute(track.id)}
                                  className={`px-2 py-1 rounded text-xs font-semibold transition-all duration-300 ${
                                    track.mute 
                                      ? 'bg-red-500 text-white' 
                                      : 'bg-teal-900/50 text-teal-300 hover:bg-teal-800/50'
                                  }`}
                                >
                                  {track.mute ? '🔇' : '🔊'}
                                </button>
                                
                                <button
                                  onClick={() => startLoopRecording(track.id)}
                                  className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-all duration-300"
                                >
                                  🔴 REC
                                </button>
                              </div>
                            </div>
                            
                            {/* Track Controls */}
                            {track.hasContent && (
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  <label className="text-teal-300 block mb-1">Loop Length</label>
                                  <select
                                    value={track.loopLength}
                                    onChange={(e) => updateTrackLoopLength(track.id, parseInt(e.target.value))}
                                    className="w-full px-2 py-1 rounded bg-teal-900/30 text-teal-300 border border-teal-600/50"
                                  >
                                    <option value={1}>1 Bar</option>
                                    <option value={2}>2 Bars</option>
                                    <option value={4}>4 Bars</option>
                                    <option value={8}>8 Bars</option>
                                    <option value={16}>16 Bars</option>
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="text-teal-300 block mb-1">Playback</label>
                                  <select
                                    value={track.playbackLength}
                                    onChange={(e) => updateTrackPlaybackLength(track.id, parseInt(e.target.value))}
                                    className="w-full px-2 py-1 rounded bg-teal-900/30 text-teal-300 border border-teal-600/50"
                                  >
                                    <option value={1}>1x</option>
                                    <option value={2}>2x</option>
                                    <option value={4}>4x</option>
                                    <option value={8}>8x</option>
                                    <option value={0}>∞ Loop</option>
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="text-teal-300 block mb-1">Volume</label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={track.volume}
                                    onChange={(e) => updateTrackVolume(track.id, parseFloat(e.target.value))}
                                    className="w-full"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Drum Machine */}
                <div className="bg-gradient-to-br from-purple-800/30 to-indigo-800/30 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/30 shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center">
                      <span className="text-xl mr-2">🥁</span>
                      Beatmaker
                    </h2>
                    <button
                      onClick={() => setDrumMachine(prev => ({ ...prev, isEnabled: !prev.isEnabled }))}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all duration-300 text-sm ${
                        drumMachine.isEnabled
                          ? 'bg-purple-500 text-white'
                          : 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50'
                      }`}
                    >
                      {drumMachine.isEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {drumMachine.isEnabled && (
                    <div className="space-y-4 h-full overflow-y-auto">
                      {/* Pattern Selection */}
                      <div className="grid grid-cols-4 gap-1">
                        {drumMachine.patterns.map((pattern, index) => (
                          <button
                            key={index}
                            onClick={() => setDrumMachine(prev => ({ ...prev, currentPattern: index }))}
                            className={`p-2 rounded-lg font-semibold transition-all duration-300 text-xs ${
                              drumMachine.currentPattern === index
                                ? 'bg-purple-500 text-white'
                                : 'bg-purple-900/30 text-purple-300 hover:bg-purple-800/50'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>

                      {/* Drum Pads */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { name: 'kick', label: 'Kick', color: 'red' },
                          { name: 'snare', label: 'Snare', color: 'blue' },
                          { name: 'hihat', label: 'Hi-Hat', color: 'green' }
                        ].map((drum) => (
                          <button
                            key={drum.name}
                            onMouseDown={() => playDrumSample(drum.name)}
                            className={`p-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 text-xs bg-${drum.color}-900/30 text-${drum.color}-300 hover:bg-${drum.color}-800/50 border border-${drum.color}-600/50`}
                          >
                            {drum.label}
                          </button>
                        ))}
                      </div>

                      {/* Sequencer Grid */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-purple-200 font-semibold text-sm">Sequencer</h3>
                          <button
                            onClick={() => setDrumMachine(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
                            className={`px-2 py-1 rounded text-xs font-semibold transition-all duration-300 ${
                              drumMachine.isPlaying
                                ? 'bg-green-500 text-white'
                                : 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50'
                            }`}
                          >
                            {drumMachine.isPlaying ? '⏸️' : '▶️'}
                          </button>
                        </div>
                        
                        {/* Step Grid */}
                        <div className="space-y-1">
                          {Object.entries(drumMachine.patterns[drumMachine.currentPattern]?.tracks || {}).map(([track, steps]) => (
                            <div key={track} className="flex items-center gap-2">
                              <div className="w-12 text-xs text-purple-300 font-semibold capitalize">
                                {track}
                              </div>
                              <div className="flex gap-1">
                                {steps.map((isActive, stepIndex) => (
                                  <button
                                    key={stepIndex}
                                    onClick={() => toggleDrumStep(track, stepIndex)}
                                    className={`w-6 h-6 rounded transition-all duration-200 ${
                                      isActive
                                        ? 'bg-purple-500 shadow-lg'
                                        : 'bg-purple-900/30 hover:bg-purple-800/50'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Synth View */}
        {activePanel === 'synth' && (
          <div className="h-full p-4 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">🎹 Synthesizer</h2>
                <p className="text-gray-300">Professional chord and melody creation</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Chord Matrix */}
                <div className="bg-gradient-to-br from-pink-800/30 to-purple-800/30 backdrop-blur-sm rounded-2xl p-4 border border-pink-500/30 shadow-2xl">
                  <h3 className="text-pink-200 font-semibold mb-3">Chord Matrix</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((number) => {
                      const isActive = activeChords.has(number)
                      return (
                        <button
                          key={number}
                          onMouseDown={() => triggerChord(number)}
                          onMouseUp={() => releaseChord(number)}
                          onMouseLeave={() => releaseChord(number)}
                          className={`p-4 rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                            isActive
                              ? 'bg-pink-500 text-white shadow-lg'
                              : 'bg-pink-900/30 text-pink-300 hover:bg-pink-800/50 border border-pink-600/50'
                          }`}
                        >
                          {number}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Instrument Palette */}
                <div className="bg-gradient-to-br from-blue-800/30 to-cyan-800/30 backdrop-blur-sm rounded-2xl p-4 border border-blue-500/30 shadow-2xl">
                  <h3 className="text-blue-200 font-semibold mb-3">Instruments</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(instrumentPresets).map(([key, preset]) => (
                      <button
                        key={key}
                        onClick={() => setCurrentInstrument(key)}
                        className={`p-3 rounded-lg font-semibold transition-all duration-300 text-sm ${
                          currentInstrument === key
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-900/30 text-blue-300 hover:bg-blue-800/50'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Beatmaker View */}
        {activePanel === 'beatmaker' && (
          <div className="h-full p-4 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">🥁 Beatmaker</h2>
                <p className="text-gray-300">Professional drum programming and sequencing</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Drum Pads */}
                <div className="bg-gradient-to-br from-purple-800/30 to-indigo-800/30 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/30 shadow-2xl">
                  <h3 className="text-purple-200 font-semibold mb-3">Drum Pads</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: 'kick', label: 'Kick', color: 'red' },
                      { name: 'snare', label: 'Snare', color: 'blue' },
                      { name: 'hihat', label: 'Hi-Hat', color: 'green' }
                    ].map((drum) => (
                      <button
                        key={drum.name}
                        onMouseDown={() => playDrumSample(drum.name)}
                        className={`p-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 bg-${drum.color}-900/30 text-${drum.color}-300 hover:bg-${drum.color}-800/50 border border-${drum.color}-600/50`}
                      >
                        {drum.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pattern Sequencer */}
                <div className="bg-gradient-to-br from-indigo-800/30 to-purple-800/30 backdrop-blur-sm rounded-2xl p-4 border border-indigo-500/30 shadow-2xl">
                  <h3 className="text-indigo-200 font-semibold mb-3">Pattern Sequencer</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                      {drumMachine.patterns.map((pattern, index) => (
                        <button
                          key={index}
                          onClick={() => setDrumMachine(prev => ({ ...prev, currentPattern: index }))}
                          className={`p-2 rounded-lg font-semibold transition-all duration-300 text-sm ${
                            drumMachine.currentPattern === index
                              ? 'bg-indigo-500 text-white'
                              : 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-800/50'
                          }`}
                        >
                          {pattern.name}
                        </button>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      {Object.entries(drumMachine.patterns[drumMachine.currentPattern]?.tracks || {}).map(([track, steps]) => (
                        <div key={track} className="flex items-center gap-2">
                          <div className="w-16 text-xs text-indigo-300 font-semibold capitalize">
                            {track}
                          </div>
                          <div className="flex gap-1">
                            {steps.map((isActive, stepIndex) => (
                              <button
                                key={stepIndex}
                                onClick={() => toggleDrumStep(track, stepIndex)}
                                className={`w-6 h-6 rounded transition-all duration-200 ${
                                  isActive
                                    ? 'bg-indigo-500 shadow-lg'
                                    : 'bg-indigo-900/30 hover:bg-indigo-800/50'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CompactInterface
