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
    piano: { name: 'Piano', waveform: 'triangle' },
    synth: { name: 'Synth', waveform: 'sawtooth' },
    bass: { name: 'Bass', waveform: 'square' },
    strings: { name: 'Strings', waveform: 'triangle' }
  }

  // Initialize everything
  useEffect(() => {
    const initSynth = async () => {
      const newSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 1.2 }
      }).toDestination()

      setSynth(newSynth)
      setIsInitialized(true)
    }

    initSynth()
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
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700">Save</button>
          <button className="px-3 py-1 bg-gray-600 rounded text-sm hover:bg-gray-500">Export</button>
        </div>
      </div>

      {/* Main Content Area */}
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

        {/* Right Control Panel */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
          <div className="space-y-6">
            {/* Synth Controls */}
            <div className="bg-gray-700 rounded p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"/>
                </svg>
                Synthesizer
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-2">Instrument</label>
                  <select 
                    value={currentInstrument}
                    onChange={(e) => setCurrentInstrument(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-gray-600 text-white border border-gray-500"
                  >
                    {Object.keys(instrumentPresets).map(key => (
                      <option key={key} value={key}>{instrumentPresets[key].name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-300 block mb-2">Key</label>
                  <select 
                    value={currentKey}
                    onChange={(e) => setCurrentKey(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-gray-600 text-white border border-gray-500"
                  >
                    <option value="C">C</option>
                    <option value="G">G</option>
                    <option value="D">D</option>
                    <option value="A">A</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Chord Pad */}
            <div className="bg-gray-700 rounded p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                Nashville Chords
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
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

            {/* Recording Controls */}
            <div className="bg-gray-700 rounded p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3.16-2.54 5.7-5.7 5.7S6 14.16 6 11H4c0 4.42 3.58 8 8 8s8-3.58 8-8h-2.7z"/>
                </svg>
                Recording
              </h3>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={startRecording}
                    disabled={isRecording}
                    className={`flex-1 py-2 rounded font-semibold transition-all duration-300 ${
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
                    className={`flex-1 py-2 rounded font-semibold transition-all duration-300 ${
                      !isRecording
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    Stop
                  </button>
                </div>
                
                {isRecording && (
                  <div className="text-center text-sm text-gray-400">
                    Recording... {recordingTime}s
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
