# BigSoundGen - Browser-Based Music Synthesizer

A modern, responsive web synthesizer built with React and Tone.js. Create and play music directly in your browser with a full-featured polyphonic synthesizer.

## Features

- **Polyphonic Synthesizer**: Play multiple notes simultaneously using Tone.js
- **Virtual Keyboard**: Click keys or use your computer keyboard to play notes
- **Waveform Selection**: Choose from sine, square, sawtooth, and triangle waves
- **ADSR Envelope**: Control attack, decay, sustain, and release parameters
- **Filter Control**: Adjust the low-pass filter cutoff frequency
- **Effects**: Toggle reverb and delay effects
- **Randomize**: Generate random synthesizer patches with one click
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, dark theme with TailwindCSS styling

## Quick Start

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   ```bash
   cd BigSoundGen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` (should open automatically)

## Usage

### Playing Notes

- **Mouse**: Click on the virtual keyboard keys
- **Computer Keyboard**: Use the following keys:
  - **White keys**: A S D F G H J K L ; ' \
  - **Black keys**: W E T Y U O P ] (sharps)

### Controls

1. **Oscillator Section**
   - Select waveform type from the dropdown
   - Visual preview shows the selected waveform

2. **ADSR Envelope**
   - **Attack**: How quickly notes reach full volume
   - **Decay**: How quickly they drop to sustain level
   - **Sustain**: The held volume level
   - **Release**: How quickly notes fade when released

3. **Filter**
   - Adjust cutoff frequency using the knob or slider
   - Range: 200Hz to 2000Hz
   - Visual frequency response display

4. **Effects**
   - Toggle reverb for spatial depth
   - Toggle delay for echo effects
   - Signal chain visualization

5. **Randomize**
   - Click to generate a completely random patch
   - All parameters will be randomized

## Project Structure

```
src/
├── components/
│   ├── VirtualKeyboard.jsx    # Keyboard component with note triggering
│   ├── WaveformSelector.jsx   # Oscillator waveform selection
│   ├── ADSRControls.jsx       # Envelope parameter controls
│   ├── FilterControl.jsx      # Filter cutoff control
│   ├── EffectsControls.jsx    # Reverb and delay toggles
│   └── RandomizeButton.jsx    # Patch randomization
├── App.jsx                     # Main application component
├── main.jsx                    # React entry point
└── index.css                   # Global styles and TailwindCSS
```

## Technical Details

- **React 18**: Modern React with hooks
- **Tone.js**: Web Audio API wrapper for synthesizer functionality
- **TailwindCSS**: Utility-first CSS framework for styling
- **Vite**: Fast build tool and development server

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

**Note**: Web Audio API support is required. Some older browsers may not work properly.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Deploying to GitHub Pages

### Option 1: Automatic Deployment (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click on "Settings" tab
   - Scroll down to "Pages" section
   - Under "Source", select "GitHub Actions"
   - The GitHub Actions workflow will automatically deploy your app

3. **Access your live app**
   - Your app will be available at: `https://yourusername.github.io/BigSoundGen`
   - Replace `yourusername` with your actual GitHub username

### Option 2: Manual Deployment

1. **Update the homepage URL in package.json**
   ```json
   "homepage": "https://yourusername.github.io/BigSoundGen"
   ```

2. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Select "Deploy from a branch"
   - Choose "gh-pages" branch
   - Your app will be live at the URL specified in package.json

### Option 3: Using GitHub CLI

```bash
# Build the project
npm run build

# Deploy using GitHub CLI
gh-pages -d dist
```

## Important Configuration Steps

### Before Deploying:

1. **Update the homepage URL in package.json**
   ```json
   "homepage": "https://yourusername.github.io/BigSoundGen"
   ```
   Replace `yourusername` with your actual GitHub username.

2. **Update the base path in vite.config.js**
   ```javascript
   base: '/BigSoundGen/',
   ```
   Replace `BigSoundGen` with your repository name if different.

3. **Test locally with production build**
   ```bash
   npm run build
   npm run preview
   ```

### Repository Setup:

1. **Create a new repository on GitHub**
   - Repository name: `BigSoundGen` (or your preferred name)
   - Make it public for free GitHub Pages hosting
   - Don't initialize with README (since we already have one)

2. **Push your code**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/BigSoundGen.git
   git push -u origin main
   ```

### Troubleshooting GitHub Pages:

- **404 Error**: Check that the `base` path in vite.config.js matches your repository name
- **Assets not loading**: Ensure the `homepage` field in package.json is correct
- **Build fails**: Check the GitHub Actions logs in your repository's "Actions" tab
- **Audio not working**: GitHub Pages serves over HTTPS, which is required for Web Audio API

## Customization

The synthesizer is built with modular components, making it easy to:

- Add new waveforms
- Implement additional effects
- Modify the UI layout
- Add MIDI controller support
- Extend the keyboard range

## Troubleshooting

### Audio Not Working
- Ensure your browser supports Web Audio API
- Check that audio is not muted in your browser/system
- Try refreshing the page
- Some browsers require user interaction before playing audio

### Performance Issues
- Close other audio applications
- Reduce the number of simultaneous notes
- Check browser developer tools for errors

## License

MIT License - feel free to use this project for learning, personal projects, or commercial applications.

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

---

**Enjoy making music with BigSoundGen! 🎵**
