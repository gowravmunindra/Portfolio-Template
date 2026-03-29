const fs = require('fs');
const path = require('path');

const cssPath = path.join(process.cwd(), 'src/index.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace theme vars explicitly
css = css.replace(`@theme {
  --font-sans: "Plus Jakarta Sans", "Inter", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  --color-violet: #7c3aed;
  --color-purple: #a855f7;
  --color-pink:   #ec4899;
}`, `@theme {
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

// Just replace the glass with solid color classes
css = css.replace('backdrop-filter: blur(24px) saturate(180%);', '');
css = css.replace('-webkit-backdrop-filter: blur(24px) saturate(180%);', '');

// remove everything from the dark glass backgrounds
css = css.replace('background: rgba(8, 8, 18, 0.80);', 'background: #0d1b18;');
css = css.replace('background: rgba(14, 14, 26, 0.88);', 'background: #122420;');

// fix background in body dark mode
css = css.replace(`radial-gradient(ellipse 70% 50% at 15% 0%, rgba(109,40,217,0.22) 0%, transparent 55%),
      radial-gradient(ellipse 50% 40% at 85% 100%, rgba(219,39,119,0.12) 0%, transparent 55%),
      linear-gradient(180deg, #030308 0%, #080812 50%, #060610 100%);`, `#0d1b18;`);

css = css.replace(
  'linear-gradient(180deg, #030308 0%, #080812 50%, #060610 100%);',
  '#0d1b18;'
)

fs.writeFileSync(cssPath, css, 'utf8');

const appPath = path.join(process.cwd(), 'src/App.jsx');
let app = fs.readFileSync(appPath, 'utf8');

app = app.split('violet').join('primary');
app = app.split('purple').join('primary');
app = app.split('pink').join('primary');
app = app.split('indigo').join('primary');

// Update specific hex codes for custom cursor
app = app.split('#7c3aed').join('#418c73');
app = app.split('#a855f7').join('#75ba9f');
app = app.split('#ec4899').join('#b3e5cd');

// Dark bg wrapper changes
app = app.split('dark:bg-zinc-950').join('dark:bg-[#0d1b18]');
app = app.split('dark:bg-zinc-900').join('dark:bg-[#122420]');

// We can just remove the ambient blobs from rendering completely
app = app.replace(/<div className="absolute top-\[-20%\] right-\[-10%\] w-\[55%\] aspect-square rounded-full bg-primary-500\/15 dark:bg-primary-500\/10 blur-\[140px\] animate-blob -z-10" \/>/g, '');
app = app.replace(/<div className="absolute bottom-\[-10%\] left-\[-10%\] w-\[45%\] aspect-square rounded-full bg-primary-500\/12 dark:bg-primary-500\/8 blur-\[120px\] animate-blob delay-700 -z-10" \/>/g, '');
app = app.replace(/<div className="absolute top-\[30%\] left-\[40%\] w-\[30%\] aspect-square rounded-full bg-primary-500\/8 dark:bg-primary-500\/5 blur-\[100px\] animate-blob delay-300 -z-10" \/>/g, '');

app = app.replace(/<div className="absolute -top-40 -right-40 w-\[800px\] h-\[800px\] rounded-full bg-primary-400\/20 dark:bg-primary-600\/12 blur-\[200px\] animate-blob" \/>/g, '');
app = app.replace(/<div className="absolute -bottom-40 -left-40 w-\[700px\] h-\[700px\] rounded-full bg-primary-400\/16 dark:bg-primary-600\/10 blur-\[180px\] animate-blob delay-300" \/>/g, '');
app = app.replace(/<div className="absolute top-1\/2 left-1\/4 w-\[500px\] h-\[500px\] rounded-full bg-primary-400\/10 dark:bg-primary-600\/8 blur-\[150px\] animate-blob delay-700" \/>/g, '');


fs.writeFileSync(appPath, app, 'utf8');
