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
      <div class="max-w-5xl mx-auto px-6 lg:px-8">
        <div class="bg-white dark:bg-gray-800/40 p-12 md:p-20 rounded-[3rem] border border-gray-200 dark:border-gray-700 shadow-xl relative overflow-hidden text-center">
          <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          ${data[item.id].title ? `<h3 class="text-4xl md:text-5xl font-black mb-10 text-gray-900 dark:text-white tracking-tight">${data[item.id].title}</h3>` : ''}
          <p class="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed whitespace-pre-wrap">${data[item.id].content}</p>
        </div>
      </div>
    </section>`;

  const renderSectionHeader = (title, desc) => `
    <div class="max-w-4xl mx-auto text-center mb-16 px-4">
      <h2 class="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
        ${title}
      </h2>
      ${desc ? `<p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">${desc}</p>` : ''}
      <div class="mt-4 w-24 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full opacity-50"></div>
    </div>`;

  const renderSectionMap = {
    hero: () => `
    <section class="hero-section min-h-screen flex items-center pt-32 pb-20 relative overflow-hidden" id="hero">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div class="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] -z-10 animate-pulse delay-1000"></div>

      <div class="max-w-7xl mx-auto px-6 sm:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <div class="text-center lg:text-left">
          ${data.hero.greeting ? `
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 backdrop-blur-sm">
            <span class="text-indigo-500 text-lg">&#10022;</span>
            <span class="text-xs font-bold tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">
              ${data.hero.greeting}
            </span>
          </div>` : ''}

          <h1 class="text-5xl sm:text-7xl xl:text-8xl font-black mb-8 leading-[1.1] tracking-tight text-gray-900 dark:text-white">
            I'm <span class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent block mt-4">${data.hero.name} ${data.hero.lastName}</span>
          </h1>

          <p class="text-xl md:text-2xl font-medium text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            ${data.hero.rolePrefix || ''} <span class="text-gray-900 dark:text-white font-bold">${data.hero.role}</span> ${data.hero.roleSuffix || ''}
          </p>

          <div class="flex flex-wrap justify-center lg:justify-start gap-5">
            <button onclick="document.getElementById('projects')?.scrollIntoView({behavior: 'smooth'})" class="group bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300 hover:scale-105 shadow-xl shadow-indigo-600/20">
              View My Projects <span class="text-xl group-hover:translate-x-1 transition-transform">&rarr;</span>
            </button>
            <button onclick="document.getElementById('contact')?.scrollIntoView({behavior: 'smooth'})" class="bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 backdrop-blur-md px-8 py-4 rounded-2xl font-bold text-gray-900 dark:text-white transition-all duration-300 hover:scale-105">
              Get in Touch
            </button>
          </div>
        </div>
        
        <div class="relative group mx-auto lg:ml-auto">
          <div class="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
          <div class="relative aspect-square w-full max-w-[450px] rounded-[2.5rem] overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl transition hover:rotate-1">
            <img src="${data.hero.profileImage}" alt="Profile" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          </div>
        </div>
      </div>
    </section>`,
    about: () => `
    <section class="py-24 scroll-mt-24 section" id="about">
      <div class="max-w-6xl mx-auto px-6 lg:px-8">
        <div class="relative group">
          <div class="absolute -inset-px bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-[2px] opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div class="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl p-10 md:p-16 border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-hidden">
            <div class="absolute top-0 right-0 p-8 opacity-5 text-indigo-500 text-9xl">&#10022;</div>
            <div class="relative z-10 text-center max-w-4xl mx-auto">
              <span class="text-xs font-black tracking-[0.3em] uppercase text-indigo-500 inline-block mb-6">${data.about.title || 'About Me'}</span>
              <p class="text-2xl md:text-4xl text-gray-800 dark:text-gray-200 font-medium leading-[1.6] tracking-tight">
                "${data.about.bio}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>`,
    skills: () => `
    <section class="py-24 scroll-mt-24 section" id="skills">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        ${renderSectionHeader(data.skills.title, "A curated list of my specialized skills and technology stack.")}
        <div class="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
          ${data.skills.items.map(skill => `<div class="px-8 py-4 rounded-2xl font-bold text-gray-700 dark:text-gray-300 bg-white/5 hover:bg-indigo-500 hover:text-white border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20 cursor-default">${skill}</div>`).join('')}
        </div>
      </div>
    </section>`,
    projects: () => `
    <section class="py-24 scroll-mt-24 section" id="projects">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        ${renderSectionHeader(data.projects.title, "A curated gallery of my latest work, bridging innovation with impact through media-rich showcases.")}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${data.projects.items.map(project => `
            <div class="group relative bg-white dark:bg-gray-800/40 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col">
              <div class="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                ${project.videoUrl ? `
                  <iframe class="w-full h-full" src="${project.videoUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                ` : project.imageUrl ? `
                  <img src="${project.imageUrl}" alt="${project.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ` : `<div class="text-indigo-500 opacity-20 scale-150 group-hover:scale-[2] transition-transform duration-1000">&#8862;</div>`}
                
                <div class="absolute inset-0 bg-indigo-900/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  ${project.link ? `<a href="${ensureProtocol(project.link)}" target="_blank" rel="noopener noreferrer" class="p-3 bg-white text-indigo-600 rounded-full hover:scale-110 transition-transform shadow-xl font-bold text-xs uppercase">Live Site</a>` : ''}
                  ${project.codeLink ? `<a href="${ensureProtocol(project.codeLink)}" target="_blank" rel="noopener noreferrer" class="p-3 bg-white text-gray-900 rounded-full hover:scale-110 transition-transform shadow-xl font-bold text-xs uppercase">Source Code</a>` : ''}
                </div>
              </div>
              <div class="p-8 grow">
                <h3 class="text-2xl font-black mb-3 text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors uppercase tracking-tight line-clamp-1">${project.title}</h3>
                <p class="text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-6 line-clamp-3 text-sm italic">"${project.description}"</p>
                <div class="flex items-center gap-4 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/30">
                  ${project.link ? `<a href="${ensureProtocol(project.link)}" target="_blank" rel="noopener noreferrer" class="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:gap-3 transition-all">Live Demo &rarr;</a>` : ''}
                  ${project.codeLink ? `<a href="${ensureProtocol(project.codeLink)}" target="_blank" rel="noopener noreferrer" class="text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all ml-auto">Code</a>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,
    experience: () => `
    <section class="py-24 scroll-mt-24 section" id="experience">
      <div class="max-w-5xl mx-auto px-6 lg:px-8">
        ${renderSectionHeader(data.experience.title, "My professional journey and key achievements in the industry.")}
        <div class="space-y-8 relative before:absolute before:inset-y-0 before:left-0 md:before:left-1/2 md:before:-translate-x-px before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-purple-500 before:to-pink-500 before:opacity-30">
          ${data.experience.items.map((exp, index) => `
            <div class="relative group">
              <div class="md:flex items-center justify-between ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}">
                <div class="hidden md:block w-1/2"></div>
                <div class="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-0 md:top-1/2 md:-translate-y-1/2 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white dark:border-gray-900 shadow-[0_0_15px_rgba(79,70,229,0.5)] z-10"></div>
                <div class="md:w-[45%] ml-8 md:ml-0">
                  <div class="bg-white dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl group-hover:border-indigo-500/50 transition-all">
                    <div class="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <h4 class="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-1">${exp.title}</h4>
                        <p class="text-indigo-500 font-bold uppercase tracking-widest text-sm">${exp.organization}</p>
                      </div>
                      <span class="text-xs font-black px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
                        ${exp.duration}
                      </span>
                    </div>
                    <p class="text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic mb-4">${exp.description}</p>
                    ${exp.achievements ? `
                    <div class="mt-2 pt-4 border-t border-gray-100 dark:border-gray-700/50 font-bold text-sm flex items-center gap-2 tracking-tight text-gray-900 dark:text-gray-200">
                      <span class="text-indigo-500">&#10022;</span> ${exp.achievements}
                    </div>` : ''}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,
    achievements: () => `
    <section class="py-24 scroll-mt-24 section" id="achievements">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        ${renderSectionHeader(data.achievements.title, "Milestones and professional accolades earned through dedication.")}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          ${data.achievements.items.map(ach => `
            <div class="group flex flex-col p-10 bg-white dark:bg-gray-800/40 rounded-[2rem] border border-gray-200 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all relative overflow-hidden">
              <div class="absolute top-0 right-0 p-8 opacity-5 text-purple-500 text-9xl">&#10022;</div>
              <div class="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-500 mb-8 border border-indigo-500/20 text-3xl">&#10022;</div>
              <h4 class="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight leading-snug">${ach.title}</h4>
              <div class="flex items-center gap-3 mb-6 font-bold text-xs uppercase tracking-widest">
                <span class="text-indigo-500">${ach.issuer}</span>
                ${ach.date ? `<span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span><span class="text-gray-500">${ach.date}</span>` : ''}
              </div>
              <p class="text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic mb-8 grow">"${ach.description}"</p>
              ${ach.link ? `<a href="${ensureProtocol(ach.link)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-indigo-500 font-bold hover:gap-3 transition-all border-b border-transparent hover:border-indigo-500 pb-0.5 w-fit">Verify Credential &rarr;</a>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,
    contact: () => {
      const links = [
        { id: 'email', pre: 'mailto:', label: 'Email', icon: '&#9993;' },
        { id: 'phone', pre: 'tel:', label: 'Phone', icon: '&phone;' },
        { id: 'linkedin', pre: 'https://linkedin.com/in/', label: 'LinkedIn', icon: 'in' },
        { id: 'github', pre: 'https://github.com/', label: 'GitHub', icon: '&lt;/&gt;' },
        { id: 'twitter', pre: 'https://twitter.com/', label: 'Twitter', icon: 'tw' }
      ].filter(social => data.contact[social.id]);

      return `
      <section class="py-24 scroll-mt-24 section" id="contact">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
            ${renderSectionHeader(data.contact.title, "Interested in collaboration or have a project in mind? Let's connect.")}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              ${links.map(social => `
                <div class="group relative bg-white dark:bg-gray-800/60 p-10 rounded-3xl border border-gray-200 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all">
                  <div class="flex flex-col items-center gap-6 text-center">
                    <div class="w-20 h-20 rounded-2xl bg-indigo-500 group-hover:rotate-6 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-all text-4xl">
                      ${social.id === 'phone' ? '&#9742;' : social.icon}
                    </div>
                    <div>
                      <span class="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block font-outfit">${social.label}</span>
                      <a href="${social.id === 'email' ? `mailto:${data.contact.email}` : social.id === 'phone' ? `tel:${data.contact.phone}` : ensureProtocol(data.contact[social.id].includes('http') ? data.contact[social.id] : `${social.pre}${data.contact[social.id]}`)}" target="_blank" rel="noreferrer" class="text-xl font-bold text-gray-900 dark:text-white hover:text-indigo-500 transition-colors break-all">
                        ${social.id === 'email' || social.id === 'phone' ? data.contact[social.id] : (data.contact[social.id].includes('http') ? 'View Profile' : `@${data.contact[social.id].replace(/^@/, '')}`)}
                      </a>
                    </div>
                  </div>
                </div>`).join('')}
            </div>
        </div>
      </section>`;
    }
  };

  const dynamicSections = data.layout
    .filter(item => item.visible)
    .map(item => item.id.startsWith('custom_') ? renderCustom(item) : (renderSectionMap[item.id] ? renderSectionMap[item.id]() : ''))
    .join('\n');

  const navbarContent = `
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700/50 transition-all duration-300">
      <div class="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-12 py-5">
        <div class="text-2xl font-black tracking-tighter text-gray-900 dark:text-white group cursor-pointer" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">
          ${data.hero.name} <span class="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent group-hover:to-pink-500 transition-all duration-500">${data.hero.lastName}</span>
        </div>
        <div class="hidden lg:flex items-center gap-10">
          ${data.layout.filter(l => l.visible).map(l => `<a href="#${l.id}" data-target="${l.id}" class="nav-link text-sm font-black uppercase tracking-widest transition-all duration-300 relative py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">${data[l.id]?.title?.split(' ')[0] || (l.id.startsWith('custom_') ? 'SECTION' : l.id.toUpperCase())}</a>`).join('')}
          <button onclick="document.getElementById('hireMeModal').classList.remove('hidden')" class="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-2xl font-black text-sm tracking-widest uppercase hover:scale-105 transition-all shadow-xl">
             Let's Talk
          </button>
        </div>
      </div>
    </nav>
  `;

  const htmlContent = `<!DOCTYPE html>
<html lang="en" class="${themeChoice}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.hero.name} ${data.hero.lastName} - Premium Portfolio</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <style type="text/tailwindcss">
      @theme {
        --font-outfit: "Outfit", sans-serif;
        --font-inter: "Inter", sans-serif;
      }
      @custom-variant dark (&:is(.dark *));
      @layer base {
        html { scroll-behavior: smooth; }
        body { @apply antialiased overflow-x-hidden font-inter bg-white text-gray-900 selection:bg-indigo-500/30; }
        .dark body { @apply bg-gray-900 text-white selection:bg-indigo-500/50; }
        h1, h2, h3, h4, h5, h6 { @apply font-outfit tracking-tight; }
      }
      .nav-link.active { @apply text-indigo-600 dark:text-indigo-400; }
    </style>
</head>
<body class="relative min-h-screen pb-20">
    <div class="fixed inset-0 -z-50 bg-white dark:bg-gray-900"></div>
    <div class="fixed inset-0 -z-40 overflow-hidden pointer-events-none opacity-40">
       <div class="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-indigo-500/10 blur-[120px] animate-pulse"></div>
       <div class="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-purple-500/10 blur-[120px] animate-pulse delay-700"></div>
    </div>
    ${navbarContent}
    <main>${dynamicSections}</main>
    ${data.layout.find(l => l.id === 'contact' && l.visible) ? `
    <div id="hireMeModal" class="hidden fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-2xl z-[1000] flex items-center justify-center p-6" onclick="this.classList.add('hidden')">
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[3rem] p-10 md:p-16 w-full max-w-4xl relative shadow-2xl max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <button class="absolute top-8 right-8 p-3 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500" onclick="document.getElementById('hireMeModal').classList.add('hidden')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <h3 class="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter uppercase italic">Let's Create Excellence</h3>
        <p class="text-lg text-gray-500 dark:text-gray-400 mb-12 font-medium">I am currently available for new projects and collaborations.</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${links.map(social => `
            <a href="${social.id === 'email' ? `mailto:${data.contact.email}` : social.id === 'phone' ? `tel:${data.contact.phone}` : ensureProtocol(data.contact[social.id].includes('http') ? data.contact[social.id] : `${social.pre}${data.contact[social.id]}`)}" target="_blank" rel="noreferrer" class="group p-8 rounded-[2rem] bg-gray-50 dark:bg-white/5 border border-transparent hover:border-indigo-500/50 transition-all flex flex-col items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 text-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all text-xl font-bold">
                ${social.id === 'phone' ? '&#9742;' : social.icon}
              </div>
              <div class="text-center">
                <span class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">${social.label}</span>
                <span class="font-bold text-gray-900 dark:text-white break-all">${data.contact[social.id].includes('http') ? 'Profile' : data.contact[social.id]}</span>
              </div>
            </a>`).join('')}
        </div>
      </div>
    </div>` : ''}
    <script src="script.js"></script>
</body>
</html>`;

  const jsContent = `document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll('.section, .hero-section');
    const navLinks = document.querySelectorAll('.nav-link');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.dataset.target === entry.target.id) link.classList.add('active');
                });
            }
        });
    }, { threshold: 0.2 });
    sections.forEach(sec => {
      sec.style.opacity = '0';
      sec.style.transform = 'translateY(24px)';
      sec.style.transition = 'all 0.8s ease-out';
      observer.observe(sec);
    });
  });`;

  zip.file("index.html", htmlContent);
  zip.file("script.js", jsContent);
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "portfolio.zip");
};
