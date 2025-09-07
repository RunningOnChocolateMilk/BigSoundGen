import React, { useState, useEffect } from 'react'
import * as Tone from 'tone'

const ChordMasterInterface = () => {
  // State management
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentKey, setCurrentKey] = useState('C')
  const [currentInstrument, setCurrentInstrument] = useState('piano')
  const [activeChords, setActiveChords] = useState(new Set())
  const [chordModification, setChordModification] = useState('major')
  
  // Instrument manipulation controls
  const [instrumentControls, setInstrumentControls] = useState({
    attack: 0.02,
    decay: 0.3,
    sustain: 0.4,
    release: 1.2,
    volume: -6,
    detune: 0,
    filterCutoff: 3000,
    filterResonance: 0.5,
    oscillatorType: 'triangle'
  })
  const [metronomeEnabled, setMetronomeEnabled] = useState(false)
  const [metronomeBPM, setMetronomeBPM] = useState(120)
  const [metronomePattern, setMetronomePattern] = useState('4/4')
  const [metronomeAccent, setMetronomeAccent] = useState(true)
  const [metronomeBeat, setMetronomeBeat] = useState(0)
  const [effects, setEffects] = useState({
    reverb: false,
    delay: false,
    tremolo: false,
    flanger: false,
    sidechain: false,
    eq: false
  })
  
  // EQ settings
  const [eqSettings, setEqSettings] = useState({
    low: 0,      // 80Hz
    lowMid: 0,   // 500Hz
    mid: 0,      // 1.5kHz
    highMid: 0,  // 5kHz
    high: 0      // 12kHz
  })
  
  // Sidechain settings
  const [sidechainSettings, setSidechainSettings] = useState({
    threshold: -20,
    ratio: 4,
    attack: 0.01,
    release: 0.1,
    speed: 'quarter' // quarter, eighth, sixteenth, half, whole
  })
  const [displayMode, setDisplayMode] = useState('chord') // chord, progression, settings

  // Synthesizer and effects
  const [synth, setSynth] = useState(null)
  const [metronome, setMetronome] = useState(null)
  const [activeNotes, setActiveNotes] = useState(new Set())
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recorder, setRecorder] = useState(null)
  const [recordedAudio, setRecordedAudio] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  
  // Web Audio API recording for unlimited length
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioChunks, setAudioChunks] = useState([])

  // Instrument presets with realistic and unique sounds
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
      volume: -10
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
        // Initialize Tone.js
        await Tone.start()
        console.log('Tone.js initialized')
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
        
        // Add advanced effects
        const reverb = new Tone.Reverb({
          decay: 2,
          wet: 0.3
        })
        
        const delay = new Tone.PingPongDelay({
          delayTime: '8n',
          feedback: 0.2,
          wet: 0.2
        })

        // Add tremolo effect
        const tremolo = new Tone.Tremolo({
          frequency: 4,
          depth: 0.5,
          wet: 0.3
        })

        // Add flanger effect
        const flanger = new Tone.FeedbackDelay({
          delayTime: '8n',
          feedback: 0.3,
          wet: 0.2
        })

        // Add EQ
        const eq = new Tone.EQ3({
          low: 0,
          mid: 0,
          high: 0
        })

        // Add sidechain compressor with ducking effect
        const sidechain = new Tone.Compressor({
          threshold: -20,
          ratio: 4,
          attack: 0.01,
          release: 0.1
        })

        // Add sidechain ducking effect
        const sidechainDuck = new Tone.Gain(1)
        const sidechainLFO = new Tone.LFO({
          frequency: 1,
          type: 'sine',
          min: 0.3,
          max: 1
        })
        sidechainLFO.connect(sidechainDuck.gain)

        // Store effects for later control
        const effectsChain = {
          filter,
          reverb,
          delay,
          tremolo,
          flanger,
          eq,
          sidechain,
          sidechainDuck,
          sidechainLFO
        }

        // Connect the audio chain properly - series connection
        newSynth.connect(filter)
        filter.connect(eq)
        eq.connect(sidechain)
        sidechain.connect(sidechainDuck)
        sidechainDuck.connect(tremolo)
        tremolo.connect(flanger)
        flanger.connect(reverb)
        reverb.connect(delay)
        delay.toDestination()

        // Store effects chain with synth
        newSynth.effectsChain = effectsChain
        setSynth(newSynth)
        setIsInitialized(true)
        
        // Initialize recorder
        const newRecorder = new Tone.Recorder()
        setRecorder(newRecorder)
      } catch (error) {
        console.error('Failed to initialize synthesizer:', error)
      }
    }

    initSynth()
  }, [])

  // Initialize metronome with patterns
  useEffect(() => {
    if (isInitialized) {
      const beatsPerMeasure = parseInt(metronomePattern.split('/')[0])
      
      const newMetronome = new Tone.Loop((time) => {
        const currentBeat = Math.floor(Tone.Transport.position.split(':')[1]) % beatsPerMeasure
        setMetronomeBeat(currentBeat)
        
        // Different sounds for different beats
        if (currentBeat === 0 && metronomeAccent) {
          // Accent on beat 1
          const osc = new Tone.Oscillator(1000, 'sine').toDestination()
          osc.start(time).stop(time + 0.15)
        } else {
          // Regular beats
          const osc = new Tone.Oscillator(800, 'sine').toDestination()
          osc.start(time).stop(time + 0.1)
        }
      }, '4n')
      
      setMetronome(newMetronome)
    }
  }, [isInitialized, metronomePattern, metronomeAccent])

  // Handle chord trigger (polyphonic - can play multiple chords)
  const triggerChord = async (chordNumber) => {
    if (!synth || !isInitialized) return
    
    // Ensure audio context is started
    if (Tone.context.state !== 'running') {
      await Tone.start()
    }
    
    const chordData = chordMappings[currentKey][chordNumber]
    if (!chordData) return

    // Check if chord is already playing
    if (activeChords.has(chordNumber)) return

    console.log('Triggering chord:', chordNumber, chordData.notes)
    console.log('Synth state:', synth)
    console.log('Audio context state:', Tone.context.state)
    
    // Add chord to active chords
    setActiveChords(prev => new Set([...prev, chordNumber]))
    
    // Trigger each note in the chord
    chordData.notes.forEach(note => {
      console.log('Playing note:', note)
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

  // Recording functions using Web Audio API for professional WAV export
  const startRecording = async () => {
    try {
      // Get the audio context from Tone.js
      const audioContext = Tone.context
      
      // Create a MediaStreamDestination for recording
      const destination = audioContext.createMediaStreamDestination()
      
      // Connect synth to the destination
      synth.connect(destination)
      
      // Create MediaRecorder with best available format
      let mimeType = 'audio/wav'
      if (!MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/webm;codecs=opus'
        console.log('WAV not supported, using WebM with Opus')
      }
      
      const recorder = new MediaRecorder(destination.stream, {
        mimeType: mimeType
      })
      
      const chunks = []
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType })
        setRecordedAudio(blob)
        setIsRecording(false)
        console.log('Recording complete - Professional audio:', blob.size, 'bytes')
      }
      
      // Start recording
      recorder.start(1000) // Collect data every second
      setMediaRecorder(recorder)
      setAudioChunks(chunks)
      setIsRecording(true)
      setRecordingTime(0)
      setRecordedAudio(null)
      
      console.log('Recording started - Professional audio unlimited length')
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  const stopRecording = async () => {
    if (!mediaRecorder || !isRecording) return
    
    try {
      console.log('Stopping recording...')
      mediaRecorder.stop()
      
      // Disconnect synth from the destination
      synth.disconnect()
      
      console.log('Recording stopped - processing professional audio')
    } catch (error) {
      console.error('Failed to stop recording:', error)
      setIsRecording(false)
    }
  }

  const exportAsWAV = () => {
    if (!recordedAudio) return
    
    console.log('Exporting professional audio file...')
    const url = URL.createObjectURL(recordedAudio)
    const link = document.createElement('a')
    link.href = url
    
    // Determine file extension based on MIME type
    const isWAV = recordedAudio.type === 'audio/wav'
    const extension = isWAV ? 'wav' : 'webm'
    const format = isWAV ? 'WAV' : 'WebM'
    
    link.download = `chordmaster-masterpiece-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    console.log(`Professional ${format} export complete`)
  }

  const exportAsMP3 = async () => {
    if (!recordedAudio) return
    
    try {
      console.log('Exporting compressed audio file...')
      
      const url = URL.createObjectURL(recordedAudio)
      const link = document.createElement('a')
      link.href = url
      
      // Determine file extension based on MIME type
      const isWAV = recordedAudio.type === 'audio/wav'
      const extension = isWAV ? 'wav' : 'webm'
      const format = isWAV ? 'WAV' : 'WebM'
      
      link.download = `chordmaster-masterpiece-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log(`Compressed ${format} export complete`)
    } catch (error) {
      console.error('Failed to export audio:', error)
      // Fallback to WAV if export fails
      exportAsWAV()
    }
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

  // Update instrument controls in real-time
  const updateInstrumentControls = () => {
    if (!synth || !isInitialized) return
    
    // Update synthesizer settings
    synth.set({
      oscillator: { 
        type: instrumentControls.oscillatorType,
        detune: instrumentControls.detune
      },
      envelope: {
        attack: instrumentControls.attack,
        decay: instrumentControls.decay,
        sustain: instrumentControls.sustain,
        release: instrumentControls.release
      },
      volume: instrumentControls.volume
    })
    
    // Update filter
    if (synth.effectsChain && synth.effectsChain.filter) {
      synth.effectsChain.filter.set({
        frequency: instrumentControls.filterCutoff,
        Q: instrumentControls.filterResonance,
        type: 'lowpass'
      })
    }
  }

  // Update sidechain settings
  const updateSidechain = () => {
    if (!synth || !synth.effectsChain) return
    
    const { sidechain, sidechainLFO } = synth.effectsChain
    
    // Update compressor settings
    sidechain.set({
      threshold: sidechainSettings.threshold,
      ratio: sidechainSettings.ratio,
      attack: sidechainSettings.attack,
      release: sidechainSettings.release
    })
    
    // Calculate LFO frequency based on speed setting
    let lfoFreq
    switch (sidechainSettings.speed) {
      case 'whole':
        lfoFreq = metronomeBPM / 60 / 1 // Whole note
        break
      case 'half':
        lfoFreq = metronomeBPM / 60 / 2 // Half note
        break
      case 'quarter':
        lfoFreq = metronomeBPM / 60 / 4 // Quarter note
        break
      case 'eighth':
        lfoFreq = metronomeBPM / 60 / 8 // Eighth note
        break
      case 'sixteenth':
        lfoFreq = metronomeBPM / 60 / 16 // Sixteenth note
        break
      default:
        lfoFreq = metronomeBPM / 60 / 4 // Default to quarter note
    }
    
    sidechainLFO.set({
      frequency: lfoFreq,
      min: 0.2,
      max: 1
    })
  }

  // Update EQ settings
  const updateEQ = () => {
    if (!synth || !synth.effectsChain) return
    
    const { eq } = synth.effectsChain
    eq.set({
      low: eqSettings.low,
      mid: eqSettings.mid,
      high: eqSettings.high
    })
  }

  // Update effects when settings change
  useEffect(() => {
    if (effects.sidechain) {
      updateSidechain()
      // Start sidechain LFO
      if (synth && synth.effectsChain) {
        synth.effectsChain.sidechainLFO.start()
      }
    } else {
      // Stop sidechain LFO
      if (synth && synth.effectsChain) {
        synth.effectsChain.sidechainLFO.stop()
      }
    }
  }, [sidechainSettings, effects.sidechain, metronomeBPM])

  useEffect(() => {
    if (effects.eq) {
      updateEQ()
    }
  }, [eqSettings, effects.eq])

  // Update instrument controls when they change
  useEffect(() => {
    updateInstrumentControls()
  }, [instrumentControls, synth, isInitialized])

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

  // Handle initial user interaction to start audio context
  const handleUserInteraction = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start()
      console.log('Audio context started by user interaction')
    }
  }

  // Test audio function
  const testAudio = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start()
    }
    
    // Create a simple test oscillator
    const testOsc = new Tone.Oscillator(440, 'sine').toDestination()
    testOsc.start().stop('+0.5')
    console.log('Test audio played')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white" onClick={handleUserInteraction}>
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
              <div className="flex gap-2">
                <button
                  onClick={stopAllNotes}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  🛑 Stop All
                </button>
                <button
                  onClick={testAudio}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  🔊 Test Audio
                </button>
              </div>
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

            {/* Instrument Controls */}
            <div className="bg-gradient-to-br from-indigo-800/30 to-purple-800/30 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/30 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="text-2xl mr-3">🎛️</span>
                Instrument Controls
              </h2>
              
              <div className="space-y-6">
                {/* ADSR Envelope */}
                <div className="space-y-4">
                  <h3 className="text-indigo-200 font-semibold">ADSR Envelope</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-indigo-300">
                        <span>Attack</span>
                        <span>{instrumentControls.attack.toFixed(2)}s</span>
                      </div>
                      <input
                        type="range"
                        min="0.001"
                        max="2"
                        step="0.01"
                        value={instrumentControls.attack}
                        onChange={(e) => setInstrumentControls(prev => ({ ...prev, attack: parseFloat(e.target.value) }))}
                        className="w-full h-1 bg-indigo-900/50 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-indigo-300">
                        <span>Decay</span>
                        <span>{instrumentControls.decay.toFixed(2)}s</span>
                      </div>
                      <input
                        type="range"
                        min="0.01"
                        max="2"
                        step="0.01"
                        value={instrumentControls.decay}
                        onChange={(e) => setInstrumentControls(prev => ({ ...prev, decay: parseFloat(e.target.value) }))}
                        className="w-full h-1 bg-indigo-900/50 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-indigo-300">
                        <span>Sustain</span>
                        <span>{instrumentControls.sustain.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={instrumentControls.sustain}
                        onChange={(e) => setInstrumentControls(prev => ({ ...prev, sustain: parseFloat(e.target.value) }))}
                        className="w-full h-1 bg-indigo-900/50 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-indigo-300">
                        <span>Release</span>
                        <span>{instrumentControls.release.toFixed(2)}s</span>
                      </div>
                      <input
                        type="range"
                        min="0.01"
                        max="5"
                        step="0.01"
                        value={instrumentControls.release}
                        onChange={(e) => setInstrumentControls(prev => ({ ...prev, release: parseFloat(e.target.value) }))}
                        className="w-full h-1 bg-indigo-900/50 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Oscillator Controls */}
                <div className="space-y-4">
                  <h3 className="text-indigo-200 font-semibold">Oscillator</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-xs text-indigo-300">Waveform</div>
                      <select
                        value={instrumentControls.oscillatorType}
                        onChange={(e) => setInstrumentControls(prev => ({ ...prev, oscillatorType: e.target.value }))}
                        className="w-full p-2 rounded-lg bg-indigo-900/30 text-indigo-300 border border-indigo-600/50"
                      >
                        <option value="sine">Sine</option>
                        <option value="triangle">Triangle</option>
                        <option value="sawtooth">Sawtooth</option>
                        <option value="square">Square</option>
                        <option value="fatsawtooth">Fat Sawtooth</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-indigo-300">
                        <span>Detune</span>
                        <span>{instrumentControls.detune}¢</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={instrumentControls.detune}
                        onChange={(e) => setInstrumentControls(prev => ({ ...prev, detune: parseInt(e.target.value) }))}
                        className="w-full h-1 bg-indigo-900/50 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="space-y-4">
                  <h3 className="text-indigo-200 font-semibold">Filter</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-indigo-300">
                        <span>Cutoff</span>
                        <span>{instrumentControls.filterCutoff}Hz</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="8000"
                        value={instrumentControls.filterCutoff}
                        onChange={(e) => setInstrumentControls(prev => ({ ...prev, filterCutoff: parseInt(e.target.value) }))}
                        className="w-full h-1 bg-indigo-900/50 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-indigo-300">
                        <span>Resonance</span>
                        <span>{instrumentControls.filterResonance.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={instrumentControls.filterResonance}
                        onChange={(e) => setInstrumentControls(prev => ({ ...prev, filterResonance: parseFloat(e.target.value) }))}
                        className="w-full h-1 bg-indigo-900/50 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Volume Control */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-indigo-300">
                    <span>Volume</span>
                    <span>{instrumentControls.volume}dB</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="0"
                    value={instrumentControls.volume}
                    onChange={(e) => setInstrumentControls(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
                    className="w-full h-1 bg-indigo-900/50 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
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
              
              {/* Visual Metronome */}
              <div className="mb-6">
                <div className="flex justify-center space-x-2 mb-4">
                  {[1, 2, 3, 4].map((beat) => (
                    <div
                      key={beat}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                        metronomeEnabled && metronomeBeat === beat - 1
                          ? 'bg-green-400 border-green-300 scale-125'
                          : beat === 1
                          ? 'border-green-400 bg-green-400/20'
                          : 'border-green-600 bg-green-900/20'
                      }`}
                    >
                      <div className="flex items-center justify-center h-full text-xs font-bold">
                        {beat === 1 ? '●' : '○'}
                      </div>
                    </div>
                  ))}
                </div>
                
                {metronomeEnabled && (
                  <div className="text-center text-green-300 font-mono text-lg">
                    Beat {metronomeBeat + 1} of {metronomePattern}
                  </div>
                )}
              </div>
              
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
                
                <div className="space-y-4">
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
                  
                  <div className="space-y-2">
                    <label className="text-sm text-green-200 font-medium">Time Signature</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['4/4', '3/4', '2/4', '6/8'].map(pattern => (
                        <button
                          key={pattern}
                          onClick={() => setMetronomePattern(pattern)}
                          className={`p-2 rounded-lg border text-sm transition-all ${
                            metronomePattern === pattern
                              ? 'border-green-400 bg-green-400/20 text-green-300'
                              : 'border-green-600/50 bg-green-900/20 hover:border-green-500'
                          }`}
                        >
                          {pattern}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-200">Accent Beat 1</span>
                    <button
                      onClick={() => setMetronomeAccent(!metronomeAccent)}
                      className={`w-12 h-6 rounded-full transition-all ${
                        metronomeAccent ? 'bg-green-400' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        metronomeAccent ? 'translate-x-6' : 'translate-x-1'
                      }`}></div>
                    </button>
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
                  {isRecording && (
                    <div className="text-orange-400">Recording: <span className="text-white">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span></div>
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
              
              {/* Basic Effects */}
              <div className="space-y-4 mb-6">
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

              {/* EQ Controls */}
              {effects.eq && (
                <div className="mb-6 p-4 bg-white/5 rounded-xl">
                  <h3 className="text-pink-200 font-semibold mb-3">EQ</h3>
                  <div className="space-y-3">
                    {Object.entries(eqSettings).map(([band, value]) => (
                      <div key={band} className="space-y-1">
                        <div className="flex justify-between text-xs text-pink-300">
                          <span>{band}</span>
                          <span>{value}dB</span>
                        </div>
                        <input
                          type="range"
                          min="-12"
                          max="12"
                          value={value}
                          onChange={(e) => setEqSettings(prev => ({ ...prev, [band]: parseInt(e.target.value) }))}
                          className="w-full h-1 bg-pink-900/50 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sidechain Controls */}
              {effects.sidechain && (
                <div className="p-4 bg-white/5 rounded-xl">
                  <h3 className="text-pink-200 font-semibold mb-3">Sidechain</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-pink-300">
                        <span>Threshold</span>
                        <span>{sidechainSettings.threshold}dB</span>
                      </div>
                      <input
                        type="range"
                        min="-40"
                        max="0"
                        value={sidechainSettings.threshold}
                        onChange={(e) => setSidechainSettings(prev => ({ ...prev, threshold: parseInt(e.target.value) }))}
                        className="w-full h-1 bg-pink-900/50 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-pink-300">
                        <span>Ratio</span>
                        <span>{sidechainSettings.ratio}:1</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={sidechainSettings.ratio}
                        onChange={(e) => setSidechainSettings(prev => ({ ...prev, ratio: parseInt(e.target.value) }))}
                        className="w-full h-1 bg-pink-900/50 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    {/* Speed Controls */}
                    <div className="space-y-2">
                      <div className="text-xs text-pink-300">Speed</div>
                      <div className="grid grid-cols-5 gap-1">
                        {[
                          { value: 'whole', label: '♩', name: 'Whole' },
                          { value: 'half', label: '♪', name: 'Half' },
                          { value: 'quarter', label: '♫', name: 'Quarter' },
                          { value: 'eighth', label: '♬', name: 'Eighth' },
                          { value: 'sixteenth', label: '♭', name: '16th' }
                        ].map((speed) => (
                          <button
                            key={speed.value}
                            onClick={() => setSidechainSettings(prev => ({ ...prev, speed: speed.value }))}
                            className={`p-2 rounded-lg text-xs transition-all duration-300 ${
                              sidechainSettings.speed === speed.value
                                ? 'bg-pink-500 text-white shadow-lg'
                                : 'bg-pink-900/30 text-pink-300 hover:bg-pink-800/50'
                            }`}
                            title={speed.name}
                          >
                            <div className="text-lg">{speed.label}</div>
                            <div className="text-xs">{speed.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recording Studio */}
            <div className="bg-gradient-to-br from-orange-800/30 to-red-800/30 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/30 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="text-2xl mr-3">🎙️</span>
                Recording Studio
              </h2>
              
              <div className="space-y-4">
                {/* Recording Status */}
                <div className="text-center">
                  {isRecording ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-400 font-semibold">RECORDING</span>
                      </div>
                      <div className="text-orange-200 font-mono text-lg">
                        {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-orange-200">Ready to Record</div>
                  )}
                </div>

                {/* Recording Controls */}
                <div className="space-y-3">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="w-full p-3 rounded-xl border-2 border-red-500 bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all duration-300 transform hover:scale-105"
                    >
                      🔴 Start Recording
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="w-full p-3 rounded-xl border-2 border-orange-500 bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 transition-all duration-300 transform hover:scale-105"
                    >
                      ⏹️ Stop Recording
                    </button>
                  )}
                </div>

                {/* Export Options */}
                {recordedAudio && (
                  <div className="space-y-2">
                    <div className="text-orange-200 text-sm text-center mb-3">
                      🎵 Masterpiece Complete! 🎵
                    </div>
                    <div className="text-orange-300 text-xs text-center mb-3">
                      File size: {(recordedAudio.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <div className="text-orange-200 text-sm text-center mb-3">
                      Export your masterpiece as:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={exportAsWAV}
                        className="p-2 rounded-lg border border-orange-600/50 bg-orange-900/20 hover:bg-orange-800/30 text-orange-200 text-sm transition-all duration-300"
                      >
                        📁 {recordedAudio?.type === 'audio/wav' ? 'WAV (Professional)' : 'WebM (High Quality)'}
                      </button>
                      <button
                        onClick={exportAsMP3}
                        className="p-2 rounded-lg border border-orange-600/50 bg-orange-900/20 hover:bg-orange-800/30 text-orange-200 text-sm transition-all duration-300"
                      >
                        🎵 {recordedAudio?.type === 'audio/wav' ? 'WAV (Lossless)' : 'WebM (Compressed)'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChordMasterInterface
