// Configuration checker for GitHub Pages
console.log('🔍 BigSoundGen Configuration Checker');
console.log('=====================================');

// Check current URL
console.log('Current URL:', window.location.href);
console.log('Base path:', window.location.pathname);

// Check if we're on GitHub Pages
const isGitHubPages = window.location.hostname.includes('github.io');
console.log('On GitHub Pages:', isGitHubPages);

// Check for common issues
const issues = [];

// Check if assets are loading
const scripts = document.querySelectorAll('script[src]');
const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');

console.log('Scripts found:', scripts.length);
console.log('Stylesheets found:', stylesheets.length);

scripts.forEach((script, i) => {
  console.log(`Script ${i + 1}:`, script.src);
});

stylesheets.forEach((link, i) => {
  console.log(`Stylesheet ${i + 1}:`, link.href);
});

// Check for 404s
if (scripts.length === 0) {
  issues.push('No scripts found - check base path configuration');
}

if (stylesheets.length === 0) {
  issues.push('No stylesheets found - check base path configuration');
}

// Check React root
const root = document.getElementById('root');
if (root && root.children.length === 0) {
  issues.push('React root is empty - check for JavaScript errors');
}

if (issues.length > 0) {
  console.error('❌ Issues found:');
  issues.forEach(issue => console.error('  -', issue));
} else {
  console.log('✅ Configuration looks good!');
}

console.log('=====================================');
console.log('If you see issues, check:');
console.log('1. Update homepage in package.json with your GitHub username');
console.log('2. Update base path in vite.config.js to match your repo name');
console.log('3. Check browser console for JavaScript errors');
