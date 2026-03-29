const fs = require('fs');
const path = require('path');

const cssPath = path.join(process.cwd(), 'src/index.css');
let css = fs.readFileSync(cssPath, 'utf8');

try {
  // Replace complete theme block
  const themeRegex = new RegExp('@theme \\{[\\s\\S]*?\\}', 'g');
  css = css.replace(themeRegex, `@theme {
  --font-sans: "Plus Jakarta Sans", "Inter", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  --color-primary-50: #b3e5cd;
  --color-primary-100: #75ba9f;
  --color-primary-200: #75ba9f;
  --color-primary-300: #418c73;
  --color-primary-400: #418c73;
  --color-primary-500: #418c73;
  --color-primary-600: #295a4b;
  --color-primary-700: #295a4b;
  --color-primary-800: #0d1b18;
  --color-primary-900: #0d1b18;
  --color-primary-950: #0d1b18;
}`);

  css = css.replace(new RegExp('\\/\\* ── Glassmorphism nav bar ── \\*\\/[\\s\\S]*?\\/\\* ── Content cards ── \\*\\/', 'g'), `/* ── Navigation bar ── */
  .glass {
    background: #ffffff;
    border: 1px solid rgba(65, 140, 115, 0.16);
    box-shadow: 0 4px 32px -8px rgba(65, 140, 115, 0.12), 0 1px 4px rgba(0,0,0,0.06);
  }
  .dark .glass {
    background: #0d1b18;
    border: 1px solid rgba(65, 140, 115, 0.2);
    box-shadow: 0 4px 24px -8px rgba(0,0,0,0.5);
  }

  /* ── Content cards ── */`);

  css = css.replace(new RegExp('\\/\\* ── Content cards ── \\*\\/[\\s\\S]*?\\/\\* ── Gradient heading text ── \\*\\/', 'g'), `/* ── Content cards ── */
  .glass-card {
    background: #ffffff;
    border: 1px solid rgba(65, 140, 115, 0.12);
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 6px 32px -8px rgba(65, 140, 115, 0.12);
  }
  .dark .glass-card {
    background: #122420;
    border: 1px solid rgba(65, 140, 115, 0.2);
    box-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 8px 32px -8px rgba(0,0,0,0.5);
  }

  /* ── Gradient heading text ── */`);

  css = css.replace(new RegExp('\\.text-gradient \\{[\\s\\S]*?\\}', 'g'), `.text-gradient {
    color: #418c73;
  }
  .dark .text-gradient {
    color: #75ba9f;
  }`);

  css = css.replace(new RegExp('rgba\\(124,58,237,[0-9.]+\\)', 'g'), 'rgba(65,140,115,0.28)');
  css = css.replace(new RegExp('rgba\\(139,\\s*92,\\s*246,\\s*[0-9.]+\\)', 'g'), 'rgba(65,140,115,0.32)');

  css = css.replace(new RegExp('\\.skill-pill \\{[\\s\\S]*?\\.dark \\.skill-pill:hover', 'g'), `.skill-pill {
    display: inline-flex;
    align-items: center;
    padding: 0.45rem 1.1rem;
    border-radius: 0.8rem;
    font-size: 0.875rem;
    font-weight: 600;
    border: 1.5px solid rgba(65, 140, 115, 0.3);
    background: #ffffff;
    color: #295a4b;
    cursor: default;
    user-select: none;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 6px rgba(65, 140, 115, 0.1);
    letter-spacing: 0.01em;
  }
  .dark .skill-pill {
    background: #142823;
    border-color: rgba(65, 140, 115, 0.4);
    color: #b3e5cd;
    box-shadow: 0 1px 6px rgba(0,0,0,0.3);
  }
  .skill-pill:hover {
    background: #295a4b;
    border-color: transparent;
    color: #ffffff;
    transform: scale(1.07) translateY(-3px);
    box-shadow: 0 10px 24px -6px rgba(65, 140, 115, 0.5);
  }
  .dark .skill-pill:hover`);

  css = css.replace(new RegExp('\\.glow-violet \\{[\\s\\S]*?\\}', 'g'), `.glow-violet {
    box-shadow: 0 0 48px rgba(65,140,115,0.22), 0 0 96px rgba(65,140,115,0.08);
  }`);

  css = css.replace(new RegExp('\\.nav-progress-bar \\{[\\s\\S]*?\\}', 'g'), `.nav-progress-bar {
  position: fixed; top: 0; left: 0; height: 2.5px;
  background: #75ba9f;
  z-index: 99999;
  border-radius: 0 2px 2px 0;
  box-shadow: 0 0 14px rgba(65, 140, 115, 0.8), 0 0 28px rgba(65, 140, 115, 0.35);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease;
}`);

  css = css.replace(new RegExp('\\.dark body \\{[\\s\\S]*?\\}', 'g'), `.dark body {
    color: #e2e8f0;
    background: #0d1b18;
    background-attachment: fixed;
  }`);

  css = css.replace(new RegExp('body \\{[\\s\\S]*?\\}\\n', 'g'), `body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    color: #0d1b18;
    font-family: "Plus Jakarta Sans", "Inter", sans-serif;
    background: #f8fafc;
    background-attachment: fixed;
    min-height: 100vh;
    transition: background 1.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
`);

  css = css.replace(new RegExp('::selection \\{[\\s\\S]*?\\}', 'g'), `::selection {
    background: rgba(65,140,115,0.25);
    color: #0d1b18;
  }
  .dark ::selection {
    background: rgba(65,140,115,0.35);
    color: #b3e5cd;
  }`);

  css = css.replace(new RegExp('section#about,[\\s\\S]*?\\.dark section#achievements \\{[\\s\\S]*?\\}', 'g'), `section#about,
section#skills,
section#achievements {
  background: transparent;
  position: relative;
}
.dark section#about,
.dark section#skills,
.dark section#achievements {
  background: transparent;
}`);

  css = css.replace(new RegExp('background: #7c3aed;', 'g'), 'background: #418c73;');
  css = css.replace(new RegExp('border: 1\\.5px solid rgba\\(139, 92, 246, 0\\.5\\);', 'g'), 'border: 1.5px solid rgba(65, 140, 115, 0.5);');
  css = css.replace(new RegExp('background: #a855f7;', 'g'), 'background: #75ba9f;');
  css = css.replace(new RegExp('border-color: rgba\\(168,85,247,0\\.35\\);', 'g'), 'border-color: rgba(117,186,159,0.35);');
  css = css.replace(new RegExp('background: rgba\\(139,92,246,0\\.06\\);', 'g'), 'background: rgba(65,140,115,0.06);');
  css = css.replace(new RegExp('background: #ec4899;', 'g'), 'background: #b3e5cd;');
  css = css.replace(new RegExp('border-color: rgba\\(236,72,153,0\\.6\\);', 'g'), 'border-color: rgba(179,229,205,0.6);');

  fs.writeFileSync(cssPath, css);
  console.log('CSS modified successfully.');

  const appPath = path.join(process.cwd(), 'src/App.jsx');
  let app = fs.readFileSync(appPath, 'utf8');

  // Regex string replacements
  app = app.replace(/bg-violet-(100|200|300|400|500|600|700|800|900|950)/g, 'bg-primary-$1');
  app = app.replace(/text-violet-(100|200|300|400|500|600|700|800|900|950)/g, 'text-primary-$1');
  app = app.replace(/border-violet-(100|200|300|400|500|600|700|800|900|950)/g, 'border-primary-$1');
  app = app.replace(/shadow-violet-(100|200|300|400|500|600|700|800|900|950)/g, 'shadow-primary-$1');
  app = app.replace(/from-violet-(100|200|300|400|500|600|700|800|900|950)/g, 'from-primary-$1');
  app = app.replace(/via-violet-(100|200|300|400|500|600|700|800|900|950)/g, 'via-primary-$1');
  app = app.replace(/to-violet-(100|200|300|400|500|600|700|800|900|950)/g, 'to-primary-$1');

  // purple pink indigo
  app = app.replace(/purple-(100|200|300|400|500|600|700|800|900|950)/g, 'primary-$1');
  app = app.replace(/pink-(100|200|300|400|500|600|700|800|900|950)/g, 'primary-$1');
  app = app.replace(/indigo-(100|200|300|400|500|600|700|800|900|950)/g, 'primary-$1');

  // background color for the dark mode wrapper
  app = app.replace(/dark:bg-zinc-950/g, 'dark:bg-[#0d1b18]');
  app = app.replace(/dark:bg-zinc-900/g, 'dark:bg-[#122420]');

  // remove blobs entirely
  app = app.replace(/<div className="[^"]*?animate-blob[^"]*?" \/>\n?\s*/g, '');

  // sparkes trail colors array:
  app = app.replace(/const COLORS = \['#7c3aed', '#a855f7', '#ec4899', '#8b5cf6', '#c084fc'\];/g, "const COLORS = ['#75ba9f', '#418c73', '#b3e5cd', '#295a4b'];");

  // Remove structural gradients
  app = app.replace(/<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-primary-500 to-primary-500" \/>\n?\s*/g, '');
  app = app.replace(/<div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-500 to-primary-500 rounded-l-2xl" \/>\n?\s*/g, '');

  fs.writeFileSync(appPath, app);
  console.log('App modified successfully.');

} catch(e) { 
  fs.writeFileSync('err.txt', e.toString() + '\\n' + e.stack, 'utf8');
}
