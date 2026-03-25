import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const exportPortfolio = async (data, themeChoice) => {
  const ensureProtocol = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) return url;
    return `https://${url}`;
  };

  const zip = new JSZip();

  const renderCustom = (item) => `
    <section class="py-24 scroll-mt-24 section" id="${item.id}">
      <div class="max-w-5xl mx-auto px-6 sm:px-12">
        <div class="glass-card rounded-[3rem] p-12 md:p-20 relative overflow-hidden transition-all duration-300">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full point-events-none -z-10"></div>
          <div class="flex flex-col text-center">
            ${data[item.id].title ? `<h3 class="text-4xl md:text-5xl font-black mb-8 tracking-tight text-slate-900 dark:text-white">${data[item.id].title}</h3>` : ''}
            <p class="text-xl font-medium text-slate-600 dark:text-slate-300 leading-relaxed mx-auto max-w-4xl whitespace-pre-wrap">${data[item.id].content}</p>
          </div>
        </div>
      </div>
    </section>`;

  const renderSectionMap = {
    hero: () => `
    <section class="hero-section min-h-screen flex items-center pt-24 pb-12 relative overflow-hidden" id="hero">
      <div class="absolute top-1/4 left-10 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div class="absolute top-1/3 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>
      <div class="absolute top-32 left-1/4 text-indigo-400/30 animate-pulse text-4xl">&#10022;</div>
      <div class="absolute bottom-32 right-1/4 text-teal-400/30 animate-pulse delay-500 text-3xl">&#10022;</div>
      <div class="max-w-[1400px] mx-auto px-6 sm:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
        <div class="flex flex-col text-center lg:text-left">
          ${data.hero.greeting ? `
          <div class="inline-flex items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-full glass-card w-fit mx-auto lg:mx-0 mb-8 border-indigo-500/20">
            <span class="text-indigo-500 text-lg">&#10022;</span>
            <p class="text-sm font-semibold tracking-widest uppercase text-slate-700 dark:text-slate-300">
              ${data.hero.greeting}
            </p>
          </div>` : ''}
          <h1 class="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-6 text-slate-900 dark:text-white leading-[1.1]">
            I'm <span class="text-gradient block mt-2">${data.hero.name} ${data.hero.lastName}</span>
          </h1>
          ${data.hero.role ? `
          <h2 class="text-2xl sm:text-3xl font-medium leading-relaxed mb-12 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0">
            ${data.hero.rolePrefix || ''} <span class="text-indigo-600 dark:text-indigo-400 font-semibold">${data.hero.role}</span> ${data.hero.roleSuffix || ''}
          </h2>` : ''}
          <div class="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            ${data.layout.find(l => l.id === 'projects' && l.visible) ? `
            <button class="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-full font-bold flex items-center justify-center gap-3 transition-transform hover:scale-105 shadow-[0_0_15px_rgba(0,0,0,0.2)] dark:shadow-[0_0_15px_rgba(255,255,255,0.2)]" onclick="document.getElementById('projects')?.scrollIntoView({behavior: 'smooth'})">
              View My Work <span class="text-xl">&rarr;</span>
            </button>` : ''}
            ${data.layout.find(l => l.id === 'contact' && l.visible) ? `
            <button class="glass-card px-8 py-4 rounded-full font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3 transition-all hover:scale-105 hover:border-indigo-500/50" onclick="document.getElementById('contact')?.scrollIntoView({behavior: 'smooth'})">
              Contact Me <span class="text-xl">&#9993;</span>
            </button>` : ''}
          </div>
        </div>
        <div class="flex justify-center relative lg:justify-end">
          <div class="relative w-full max-w-[480px] aspect-square group">
            <div class="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[3rem] blur-3xl opacity-20 dark:opacity-40 -z-10 animate-pulse"></div>
            <div class="w-full h-full hero-img-glow relative group">
              <div class="w-full h-full rounded-[calc(3rem-8px)] overflow-hidden relative">
                <img src="${data.hero.profileImage}" alt="Profile" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`,
    about: () => `
    <section class="py-32 scroll-mt-24 section relative" id="about">
      <div class="max-w-[1200px] mx-auto px-6 sm:px-12">
        <div class="glass-card rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none -z-10"></div>
          ${data.about.title ? `<h3 class="text-2xl font-bold mb-8 tracking-[0.2em] uppercase text-indigo-500">${data.about.title}</h3>` : ''}
          <p class="text-3xl md:text-5xl font-medium text-slate-800 dark:text-slate-200 leading-[1.4] tracking-tight">"${data.about.bio}"</p>
        </div>
      </div>
    </section>`,
    skills: () => `
    <section class="py-24 scroll-mt-24 section relative" id="skills">
      <div class="absolute top-1/2 right-10 w-48 h-48 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
      <div class="max-w-[1400px] mx-auto px-6 sm:px-12 relative">
        <div class="text-center mb-20">
          <h3 class="text-5xl md:text-6xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">${data.skills.title}</h3>
          <p class="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">Technologies, frameworks, and tools I master to build exceptional digital experiences.</p>
        </div>
        <div class="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
          ${data.skills.items.map(skill => `<div class="glass-card px-8 py-4 rounded-full font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 hover:border-indigo-500/30 transition-all cursor-default">${skill}</div>`).join('')}
        </div>
      </div>
    </section>`,
    projects: () => `
    <section class="py-24 scroll-mt-24 section relative" id="projects">
      <div class="absolute top-1/2 left-0 w-64 h-64 bg-teal-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div class="max-w-[1400px] mx-auto px-6 sm:px-12 relative">
        <div class="text-center mb-20">
          <h3 class="text-5xl md:text-6xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">${data.projects.title}</h3>
          <p class="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">A curated selection of my most recent and impactful work.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          ${data.projects.items.map(project => `
            <div class="glass-card rounded-[2.5rem] p-10 flex flex-col relative group overflow-hidden hover:-translate-y-2">
              <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]"></div>
              <div class="relative z-10 flex flex-col h-full">
                <h4 class="text-3xl font-black mb-4 text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">${project.title}</h4>
                <p class="text-lg text-slate-600 dark:text-slate-400 mb-8 flex-grow leading-relaxed font-medium">${project.description}</p>
                ${project.link ? `<a href="${ensureProtocol(project.link)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-3 text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-6 py-3 rounded-full font-bold w-fit hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-500 transition-all shadow-sm">
                  View Project &rarr;
                </a>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,
    experience: () => `
    <section class="py-24 scroll-mt-24 section relative" id="experience">
      <div class="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none -z-10"></div>
      <div class="max-w-[1200px] mx-auto px-6 sm:px-12 relative">
        <div class="text-center mb-20">
          <h3 class="text-5xl md:text-6xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">${data.experience.title}</h3>
          <p class="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">My professional trajectory and leadership roles.</p>
        </div>
        <div class="flex flex-col gap-8 relative before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-gradient-to-b before:from-indigo-500 before:to-purple-500 md:before:left-[8.5rem] lg:before:left-[10.5rem] before:rounded-full">
          ${data.experience.items.map(exp => `
            <div class="glass-card p-8 md:p-12 rounded-[2.5rem] relative ml-8 md:ml-[11rem] lg:ml-[14rem] lg:hover:translate-x-4 transition-all">
              <div class="absolute top-1/2 -translate-y-1/2 -left-[2.4rem] md:-left-[2.9rem] lg:-left-[3.9rem] w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-900 border-4 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10 transition-transform duration-300 hover:scale-125"></div>
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div class="space-y-2">
                  <h4 class="text-3xl font-black text-slate-900 dark:text-white">${exp.title}</h4>
                  ${exp.organization ? `<h5 class="text-lg text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wide">${exp.organization}</h5>` : ''}
                </div>
                ${exp.duration ? `<span class="inline-flex bg-slate-100 dark:bg-white/10 px-4 py-2 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 w-fit">${exp.duration}</span>` : ''}
              </div>
              ${exp.description ? `<p class="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">${exp.description}</p>` : ''}
              ${exp.achievements ? `
              <div class="bg-gradient-to-r from-indigo-500/10 to-transparent p-6 rounded-2xl border-l-4 border-indigo-500 mt-4">
                <p class="text-slate-800 dark:text-slate-200 font-semibold flex items-start gap-3">
                  <span class="text-indigo-500 text-xl">&#10022;</span> ${exp.achievements}
                </p>
              </div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,
    achievements: () => `
    <section class="py-24 scroll-mt-24 section relative" id="achievements">
      <div class="absolute top-1/2 left-10 w-48 h-48 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
      <div class="max-w-[1400px] mx-auto px-6 sm:px-12 relative">
        <div class="text-center mb-20">
          <h3 class="text-5xl md:text-6xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">${data.achievements.title}</h3>
          <p class="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">A record of continuous growth, awards, and certifications.</p>
        </div>
        <div class="flex flex-wrap justify-center items-stretch gap-8">
          ${data.achievements.items.map(ach => `
            <div class="glass-card rounded-[2.5rem] p-10 flex flex-col group hover:-translate-y-3 transition-all flex-grow basis-[300px] max-w-lg">
              <div class="w-16 h-16 bg-slate-100 dark:bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-slate-200 dark:border-white/10 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-transparent transition-colors text-indigo-500 text-3xl font-black">&#10022;</div>
              <h4 class="text-2xl font-black mb-3 text-slate-900 dark:text-white">${ach.title}</h4>
              <div class="flex items-center gap-2 mb-6">
                ${ach.issuer ? `<span class="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">${ach.issuer}</span>` : ''}
                ${(ach.issuer && ach.date) ? `<span class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>` : ''}
                ${ach.date ? `<span class="text-sm font-bold text-slate-500 dark:text-slate-400">${ach.date}</span>` : ''}
              </div>
              ${ach.description ? `<p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed flex-grow mb-8 font-medium">${ach.description}</p>` : ''}
              ${ach.link ? `<a href="${ensureProtocol(ach.link)}" target="_blank" rel="noopener noreferrer" class="mt-auto font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 hover:gap-3 transition-all border-b-2 border-transparent hover:border-indigo-500 w-fit pb-1">Verify Credential &rarr;</a>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,
    contact: () => {
      const links = [
        { id: 'email', pre: 'mailto:', label: 'Email', icon: '&#9993;' },
        { id: 'phone', pre: 'tel:', label: 'Phone', icon: '&phone;' }, // ☎ does not look good generally, let's use a standard unicode or text. Let's just use text strings for static export if lucide-react isn't available
        { id: 'linkedin', pre: 'https://linkedin.com/in/', label: 'LinkedIn', icon: 'in' },
        { id: 'github', pre: 'https://github.com/', label: 'GitHub', icon: '&lt;/&gt;' },
        { id: 'twitter', pre: 'https://twitter.com/', label: 'Twitter', icon: 'tw' }
      ].filter(social => data.contact[social.id]);

      return `
      <section class="py-32 scroll-mt-24 section relative" id="contact">
          <div class="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-500/5 dark:to-indigo-500/10 pointer-events-none -z-10"></div>
          <div class="max-w-[1400px] mx-auto px-6 sm:px-12">
              <div class="text-center mb-20">
                <h3 class="text-5xl md:text-6xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">${data.contact.title}</h3>
                <p class="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">Ready to create something magnificent? Send me a message.</p>
              </div>
              ${links.length > 0 ? `
              <div class="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
                  ${links.map(social => `
                  <a href="${social.id === 'email' ? `mailto:${data.contact.email}` : social.id === 'phone' ? `tel:${data.contact.phone}` : ensureProtocol(data.contact[social.id].includes('http') ? data.contact[social.id] : `${social.pre}${data.contact[social.id]}`)}" target="_blank" rel="noreferrer" class="glass-card p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-6 group hover:-translate-y-2 hover:border-indigo-500/50 transition-all flex-grow basis-[240px] max-w-sm">
                      <div class="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner text-xl font-bold">${social.id === 'phone' ? '&#9742;' : social.icon}</div>
                      <div class="flex flex-col gap-2 w-full">
                        <span class="text-xs font-black tracking-widest text-slate-400 uppercase">${social.label}</span>
                        <span class="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-500 truncate w-full block">${social.id === 'email' || social.id === 'phone' ? data.contact[social.id] : (data.contact[social.id].includes('http') ? 'Profile' : `@${data.contact[social.id].replace(/^@/, '')}`)}</span>
                      </div>
                  </a>`).join('')}
              </div>` : `<div class="text-center text-slate-500 font-medium p-10">No contact methods available.</div>`}
          </div>
      </section>`;
    }
  };

  const dynamicSections = data.layout
    .filter(item => item.visible)
    .map(item => item.id.startsWith('custom_') ? renderCustom(item) : renderSectionMap[item.id]())
    .join('\n');

  const navbarContent = `
    <nav class="fixed top-0 left-0 right-0 z-50 nav-glass">
      <div class="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-12 py-5">
        <div class="text-2xl font-black font-outfit text-slate-900 dark:text-white tracking-tighter">
          ${data.hero.name} <span class="text-gradient">${data.hero.lastName}</span>
        </div>
        <div class="hidden lg:flex items-center gap-8 text-sm font-bold tracking-wider uppercase font-outfit">
          ${data.layout.filter(l => l.visible).map(l => `<a href="#${l.id}" data-target="${l.id}" class="nav-link py-2 relative text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors before:absolute before:bottom-0 before:left-0 before:h-[3px] before:rounded-t-full before:bg-indigo-500 before:transition-all before:duration-300 before:w-0 hover:before:w-1/2">${data[l.id]?.title?.toUpperCase() || (l.id.startsWith('custom_') ? 'SECTION' : l.id.toUpperCase())}</a>`).join('\n')}
          ${data.layout.find(l => l.id === 'contact' && l.visible) ? `
          <button onclick="document.getElementById('hireMeModal').classList.remove('hidden')" class="ml-4 btn-primary px-7 py-3 rounded-full font-bold tracking-wider uppercase text-sm font-outfit cursor-pointer">
            HIRE ME
          </button>` : ''}
        </div>
      </div>
    </nav>
  `;

  const bgHTML = themeChoice === 'dark' 
  ? `
      <div class="fixed inset-0 bg-[#050505] -z-30 transition-colors duration-1000"></div>
      <div class="fixed inset-0 overflow-hidden pointer-events-none -z-20 transition-opacity duration-1000 text-white">
        <div class="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div class="absolute left-0 right-0 top-[-10%] m-auto h-[400px] w-[600px] rounded-full bg-indigo-500/20 blur-[120px]"></div>
      </div>
  `
  : `
      <div class="fixed inset-0 bg-[#fafafa] -z-30 transition-colors duration-1000"></div>
      <div class="fixed inset-0 overflow-hidden pointer-events-none -z-20 transition-opacity duration-1000 text-slate-900">
        <div class="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div class="absolute left-0 right-0 top-0 m-auto h-[500px] w-[800px] rounded-full bg-indigo-500/10 blur-[100px] translate-y-[-200px]"></div>
      </div>
  `;

  const htmlContent = `<!DOCTYPE html>
<html lang="en" class="${themeChoice}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.hero.name} ${data.hero.lastName} - Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <style type="text/tailwindcss">
      @theme {
        --font-outfit: "Outfit", sans-serif;
        --font-inter: "Inter", sans-serif;
      }


      @custom-variant dark (&:is(.dark *));
      
      @layer base {
        html { scroll-behavior: smooth; }
        body {
          @apply antialiased overflow-x-hidden font-inter transition-all duration-700 bg-slate-50 text-slate-800 selection:bg-indigo-500/30;
        }
        .dark body {
          @apply bg-[#030712] text-slate-200 selection:bg-indigo-500/50;
        }
        h1, h2, h3, h4, h5, h6 { @apply font-outfit tracking-tight; }
      }
      
      @layer utilities {
        .text-gradient {
          @apply bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent inline-block transition-all duration-500;
        }
        .dark .text-gradient {
          @apply from-cyan-400 via-blue-500 to-purple-500;
        }
        .glass-card {
          @apply bg-white border border-slate-200 shadow-sm transition-all duration-500 rounded-3xl relative overflow-hidden;
        }
        .glass-card:hover {
          @apply border-indigo-400 shadow-xl shadow-indigo-500/10 -translate-y-1;
        }
        .dark .glass-card {
          @apply bg-[#080808] border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-500;
        }
        .dark .glass-card:hover {
          @apply border-white/20 bg-[#0f0f0f] shadow-[0_0_30px_rgba(255,255,255,0.03)] -translate-y-1;
        }
        .btn-primary {
          @apply bg-slate-900 text-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300;
        }
        .dark .btn-primary {
          @apply bg-white text-slate-900 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-105;
        }
        .nav-glass {
          @apply bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm transition-all duration-500;
        }
        .dark .nav-glass {
          @apply bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 shadow-md;
        }
        .hero-img-glow {
          @apply rounded-[2.5rem] p-1.5 bg-gradient-to-br from-slate-200 to-slate-100 border border-white shadow-xl transform transition-all duration-700 hover:rotate-1 hover:scale-105;
        }
        .dark .hero-img-glow {
          @apply from-indigo-500/20 to-transparent border-white/10 shadow-[0_0_40px_rgba(79,70,229,0.1)] hover:shadow-[0_0_60px_rgba(79,70,229,0.2)] bg-[#111];
        }
      }
      
      .active {
        @apply text-slate-800 dark:text-white;
      }
      .active::before {
        @apply w-full;
      }
    </style>
</head>
<body class="relative min-h-screen pb-20">
    ${bgHTML}
    ${navbarContent}
    ${dynamicSections}
    ${data.layout.find(l => l.id === 'contact' && l.visible) ? `
    <div id="hireMeModal" class="hidden fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xl z-[999] flex items-center justify-center" style="animation: fadeIn 0.3s ease;" onclick="this.classList.add('hidden')">
      <div class="bg-white dark:bg-[#080808] border border-slate-200 dark:border-white/10 rounded-[3rem] p-8 md:p-12 w-[95%] max-w-4xl relative text-center shadow-[0_0_100px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <button class="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-white/5 p-3 rounded-full cursor-pointer" onclick="document.getElementById('hireMeModal').classList.add('hidden')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <h3 class="text-3xl md:text-4xl font-black font-outfit text-slate-900 dark:text-white mb-4 tracking-tight">Let's Work Together</h3>
        <p class="text-lg text-slate-500 dark:text-slate-400 mb-10 font-medium">Reach out via any of the platforms below.</p>
        
        <div class="flex flex-wrap justify-center gap-4 md:gap-6">
          ${[
            { id: 'email', pre: 'mailto:', label: 'Email', icon: '&#9993;' },
            { id: 'phone', pre: 'tel:', label: 'Phone', icon: '&#9742;' },
            { id: 'linkedin', pre: 'https://linkedin.com/in/', label: 'LinkedIn', icon: 'in' },
            { id: 'github', pre: 'https://github.com/', label: 'GitHub', icon: '&lt;/&gt;' },
            { id: 'twitter', pre: 'https://twitter.com/', label: 'Twitter', icon: 'tw' }
          ].filter(social => data.contact[social.id]).map(social => `
            <a href="${social.id === 'email' ? `mailto:${data.contact.email}` : social.id === 'phone' ? `tel:${data.contact.phone}` : ensureProtocol(data.contact[social.id].includes('http') ? data.contact[social.id] : `${social.pre}${data.contact[social.id]}`)}" target="_blank" rel="noreferrer" class="glass-card p-6 md:p-8 rounded-[2rem] flex flex-col items-center justify-center text-center gap-4 group hover:-translate-y-2 hover:border-indigo-500/50 transition-all flex-grow basis-[180px] max-w-[240px]">
              <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner text-xl font-bold">
                ${social.icon}
              </div>
              <div class="flex flex-col gap-1 w-full">
                <span class="text-[10px] md:text-xs font-black tracking-widest text-slate-400 uppercase">${social.label}</span>
                <span class="font-bold text-sm md:text-base text-slate-900 dark:text-white group-hover:text-indigo-500 truncate w-full block">
                  ${social.id === 'email' || social.id === 'phone' ? data.contact[social.id] : (data.contact[social.id].includes('http') ? 'Profile' : `@${data.contact[social.id].replace(/^@/, '')}`)}
                </span>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </div>` : ''}
    <script src="script.js"></script>
</body>
</html>`;

  const jsContent = `document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll('.section, .hero-section');
    const navLinks = document.querySelectorAll('.nav-link');

    sections.forEach(sec => {
      sec.classList.add('transition-all', 'duration-1000', 'ease-out', 'opacity-0', 'translate-y-12');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.remove('opacity-0', 'translate-y-12');
                entry.target.classList.add('opacity-100', 'translate-y-0');
                
                let targetId = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.dataset.target === targetId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.25, rootMargin: "-100px 0px 0px 0px" });

    sections.forEach(sec => observer.observe(sec));
});`;

  zip.file("index.html", htmlContent);
  zip.file("script.js", jsContent);

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "portfolio.zip");
};
