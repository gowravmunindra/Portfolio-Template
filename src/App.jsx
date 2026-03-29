import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initialData } from './data';
import { exportPortfolio } from './exportApp';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Download, Edit2, Check, ExternalLink, Plus, Trash2,
  Github, Linkedin, Mail, Twitter, GripVertical, Eye, EyeOff, Upload,
  Sun, Moon, X, Sparkles, Phone, PlusSquare, ArrowRight, Layout,
  ArrowUpRight, Briefcase, Award, User, Code2, MessageSquare, Home,
  ChevronRight, Star, Zap, MousePointer2
} from 'lucide-react';

const ensureProtocol = (url) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:')) return url;
  return `https://${url}`;
};

const AVAILABLE_SECTIONS = ['about', 'experience', 'skills', 'projects', 'achievements', 'contact'];

const NAV_ICONS = { hero: Home, about: User, experience: Briefcase, skills: Code2, projects: Layout, achievements: Award, contact: MessageSquare };

/* ─── Reusable Input ─────────────────────────────────────────────────────── */
const InputField = ({ value, onChange, isTextArea = false, className = '', placeholder = '' }) => {
  const base = "w-full bg-violet-500/5 border border-dashed border-violet-400/40 rounded-xl p-3 outline-none focus:border-violet-500/60 focus:bg-violet-500/8 transition-all text-inherit font-inherit placeholder-slate-400 resize-y";
  if (isTextArea) return <textarea className={`${base} min-h-[100px] ${className}`} value={value || ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} />;
  return <input type="text" className={`${base} ${className}`} value={value || ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} />;
};

/* ─── Section Label ──────────────────────────────────────────────────────── */
const SectionLabel = ({ children }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
    <span className="text-xs font-bold tracking-widest uppercase text-violet-600 dark:text-violet-400">{children}</span>
  </div>
);

/* ─── Section Heading ────────────────────────────────────────────────────── */
const SectionHeader = ({ sectionObj, sectionKey, isEditing, handleChange }) => (
  <div className="text-center mb-16">
    <SectionLabel>{sectionObj.title}</SectionLabel>
    {isEditing ? (
      <div className="space-y-3 max-w-2xl mx-auto">
        <InputField value={sectionObj.title} onChange={v => handleChange(sectionKey, 'title', v)}
          className="text-3xl font-black text-center" placeholder="Section Title" />
        <InputField value={sectionObj.desc || ''} onChange={v => handleChange(sectionKey, 'desc', v)}
          className="text-base text-center" placeholder="Section subtitle / description (optional)" />
      </div>
    ) : (
      <>
        <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white">{sectionObj.title}</h2>
        {sectionObj.desc && <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">{sectionObj.desc}</p>}
      </>
    )}
  </div>
);

/* ─── Custom Cursor Hook (rAF-based smooth lerp) ────────────────────────── */
function useCursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const mouse   = useRef({ x: -200, y: -200 });
  const ring    = useRef({ x: -200, y: -200 });
  const rafId   = useRef(null);

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.documentElement.classList.add('custom-cursor');

    /* ── rAF loop: lerp ring toward mouse, dot follows instantly ── */
    const LERP = 0.13; // 0 = stuck, 1 = instant — 0.13 gives silky lag
    const tick = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * LERP;
      ring.current.y += (mouse.current.y - ring.current.y) * LERP;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(calc(${ring.current.x}px - 50%), calc(${ring.current.y}px - 50%))`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    /* ── Sparkle trail ── */
    const COLORS = ['#7c3aed', '#a855f7', '#ec4899', '#8b5cf6', '#c084fc'];
    let sparkleCounter = 0;
    const spawnSparkle = (x, y) => {
      const el = document.createElement('div');
      el.className = 'sparkle-particle';
      const size = 3 + Math.random() * 4;
      Object.assign(el.style, {
        left: `${x + (Math.random() - 0.5) * 18}px`,
        top:  `${y + (Math.random() - 0.5) * 18}px`,
        width: `${size}px`,
        height: `${size}px`,
        background: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 700);
    };

    /* ── Mouse move: dot snaps instantly, mouse ref updated for lerp ── */
    const onMove = (e) => {
      const { clientX: x, clientY: y } = e;
      mouse.current = { x, y };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
      }
      sparkleCounter++;
      if (sparkleCounter % 6 === 0) spawnSparkle(x, y);
    };

    /* ── Click state ── */
    const onDown = () => { dotRef.current?.classList.add('clicking'); ringRef.current?.classList.add('clicking'); };
    const onUp   = () => { dotRef.current?.classList.remove('clicking'); ringRef.current?.classList.remove('clicking'); };

    /* ── Hover state when over clickable elements ── */
    const addHov = () => { dotRef.current?.classList.add('hovering'); ringRef.current?.classList.add('hovering'); };
    const remHov = () => { dotRef.current?.classList.remove('hovering'); ringRef.current?.classList.remove('hovering'); };
    const SELECTORS = 'a, button, input, textarea, select, label, [role="button"]';
    const attachHover = () => {
      document.querySelectorAll(SELECTORS).forEach(el => {
        el.removeEventListener('mouseenter', addHov);
        el.removeEventListener('mouseleave', remHov);
        el.addEventListener('mouseenter', addHov);
        el.addEventListener('mouseleave', remHov);
      });
    };
    attachHover();
    const mo = new MutationObserver(() => setTimeout(attachHover, 100));
    mo.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup',   onUp);

    return () => {
      cancelAnimationFrame(rafId.current);
      document.documentElement.classList.remove('custom-cursor');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup',   onUp);
      mo.disconnect();
    };
  }, []);

  return { dotRef, ringRef };
}

/* ─── Nav Progress Bar Hook ──────────────────────────────────────────────── */
function useNavProgress() {
  const barRef = useRef(null);

  const flash = useCallback(() => {
    const bar = barRef.current;
    if (!bar) return;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    bar.style.opacity = '1';
    // Trigger reflow
    void bar.offsetWidth;
    bar.style.transition = 'width 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease';
    bar.style.width = '100%';
    setTimeout(() => { if (bar) bar.style.opacity = '0'; }, 450);
  }, []);

  return { barRef, flash };
}

/* ═══════════════════════════════════════════════════════════════════════════ */
function App() {
  const [data, setData] = useState(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [activeSection, setActiveSection] = useState('hero');

  const { dotRef, ringRef } = useCursor();
  const { barRef, flash }   = useNavProgress();
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportThemeChoice, setExportThemeChoice] = useState('dark');
  const [showContactModal, setShowContactModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    // visObs: marks which section is active (centered in viewport)
    const visObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id) setActiveSection(entry.target.id);
      });
    }, { rootMargin: '-48% 0px -48% 0px', threshold: 0 });

    // enterObs: trigger scroll-reveal animation on entrance
    const enterObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.06 });

    const sections = document.querySelectorAll('section[id]');
    sections.forEach(s => {
      s.classList.add('section-enter');
      visObs.observe(s);
      enterObs.observe(s);
      // Immediately reveal sections already in the viewport on mount
      const r = s.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.98 && r.bottom > 0) {
        requestAnimationFrame(() => s.classList.add('visible'));
      }
    });
    return () => { visObs.disconnect(); enterObs.disconnect(); };
  }, [data.layout]);

  const handleChange = (section, field, value) =>
    setData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));

  const handleArrayChange = (section, index, field, value) => {
    const items = [...data[section].items];
    items[index] = { ...items[index], [field]: value };
    setData(prev => ({ ...prev, [section]: { ...prev[section], items } }));
  };

  const addItem = (section, defaultItem) =>
    setData(prev => ({ ...prev, [section]: { ...prev[section], items: [...prev[section].items, { id: Date.now(), ...defaultItem }] } }));

  const removeItem = (section, id) =>
    setData(prev => ({ ...prev, [section]: { ...prev[section], items: prev[section].items.filter(i => i.id !== id) } }));

  const handleSkillsChange = e =>
    setData(prev => ({ ...prev, skills: { ...prev.skills, items: e.target.value.split(',').map(s => s.trim()) } }));

  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) { const r = new FileReader(); r.onloadend = () => handleChange('hero', 'profileImage', r.result); r.readAsDataURL(file); }
  };

  const handleProjectImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) { const r = new FileReader(); r.onloadend = () => handleArrayChange('projects', index, 'imageUrl', r.result); r.readAsDataURL(file); }
  };

  const toggleVisibility = id =>
    setData(prev => ({ ...prev, layout: prev.layout.map(l => l.id === id ? { ...l, visible: !l.visible } : l) }));

  const removeSection = id =>
    setData(prev => ({ ...prev, layout: prev.layout.filter(l => l.id !== id) }));

  const restoreSection = id => {
    if (!data.layout.find(l => l.id === id))
      setData(prev => ({ ...prev, layout: [...prev.layout, { id, visible: true, locked: false }] }));
  };

  const addCustomSection = () => {
    const newId = `custom_${Date.now()}`;
    setData(prev => ({ ...prev, [newId]: { title: 'New Section', content: 'Your content here...' }, layout: [...prev.layout, { id: newId, visible: true, locked: false }] }));
  };

  const handleDragEnd = result => {
    if (!result.destination) return;
    const items = [...data.layout];
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setData(prev => ({ ...prev, layout: items }));
  };

  const missingSections = AVAILABLE_SECTIONS.filter(s => !data.layout.find(l => l.id === s));

  /* ── Clean nav label map (avoids splitting raw titles) ─── */
  const SECTION_NAMES = {
    hero: 'Home', about: 'About', experience: 'Experience',
    skills: 'Skills', projects: 'Projects', achievements: 'Awards', contact: 'Contact',
  };

  /* ── Shared socials list ─── */
  const allSocials = [
    { id: 'email', icon: Mail, pre: 'mailto:', label: 'Email' },
    { id: 'phone', icon: Phone, pre: 'tel:', label: 'Phone' },
    { id: 'linkedin', icon: Linkedin, pre: 'https://linkedin.com/in/', label: 'LinkedIn' },
    { id: 'github', icon: Github, pre: 'https://github.com/', label: 'GitHub' },
    { id: 'twitter', icon: Twitter, pre: 'https://twitter.com/', label: 'Twitter' },
  ];

  /* ── Scroll helpers ─── */
  const scrollTo = id => {
    flash();
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
    setMobileMenuOpen(false);
  };

  /* ═══════════════════ RENDER HERO ═══════════════════════════════════════ */
  const renderHero = () => (
    <section className="hero-section min-h-screen flex items-center pt-28 pb-20 relative overflow-hidden" id="hero">
      {/* Ambient blobs only — no grid */}
      <div className="absolute top-[-20%] right-[-10%] w-[55%] aspect-square rounded-full bg-violet-500/15 dark:bg-violet-500/10 blur-[140px] animate-blob -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] aspect-square rounded-full bg-pink-500/12 dark:bg-pink-500/8 blur-[120px] animate-blob delay-700 -z-10" />
      <div className="absolute top-[30%] left-[40%] w-[30%] aspect-square rounded-full bg-indigo-400/8 dark:bg-indigo-500/5 blur-[100px] animate-blob delay-300 -z-10" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div className="text-center lg:text-left">
          {/* Greeting badge */}
          {isEditing ? (
            <InputField value={data.hero.greeting} onChange={v => handleChange('hero', 'greeting', v)} className="mb-6" placeholder="Greeting badge text" />
          ) : data.hero.greeting && (
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-violet-500/10 border border-violet-500/20">
              <Zap size={14} className="text-violet-500" />
              <span className="text-xs font-bold tracking-widest uppercase text-violet-600 dark:text-violet-400">{data.hero.greeting}</span>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-3 mb-8">
              <p className="text-2xl font-black text-slate-400">I'm</p>
              <InputField value={data.hero.name} onChange={v => handleChange('hero', 'name', v)} className="text-4xl font-black" placeholder="First Name" />
              <InputField value={data.hero.lastName} onChange={v => handleChange('hero', 'lastName', v)} className="text-4xl font-black" placeholder="Last Name" />
            </div>
          ) : (
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black mb-6 leading-[1.08] text-indigo-950 dark:text-white">
              I'm{' '}
              <span className="text-gradient">{data.hero.name}{' '}{data.hero.lastName}</span>
            </h1>
          )}

          {isEditing ? (
            <div className="space-y-2 mb-10">
              <InputField value={data.hero.rolePrefix} onChange={v => handleChange('hero', 'rolePrefix', v)} placeholder="Role prefix (e.g. A)" />
              <InputField value={data.hero.role} onChange={v => handleChange('hero', 'role', v)} placeholder="Primary Role" />
              <InputField value={data.hero.roleSuffix} onChange={v => handleChange('hero', 'roleSuffix', v)} placeholder="Role suffix" />
            </div>
          ) : (
            <p className="text-lg md:text-xl font-medium text-slate-500 dark:text-slate-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {data.hero.rolePrefix} <span className="text-slate-800 dark:text-slate-100 font-semibold">{data.hero.role}</span>{' '}{data.hero.roleSuffix}
            </p>
          )}

          {/* CTA Buttons — editable when in edit mode */}
          {isEditing ? (
            <div className="space-y-2 mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Button Labels</p>
              <InputField value={data.hero.ctaPrimary} onChange={v => handleChange('hero', 'ctaPrimary', v)} placeholder="Primary button text (e.g. View My Work)" />
              <InputField value={data.hero.ctaSecondary} onChange={v => handleChange('hero', 'ctaSecondary', v)} placeholder="Secondary button text (e.g. Get in Touch)" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              {data.layout.find(l => l.id === 'projects' && l.visible) && (
                <button onClick={() => scrollTo('projects')}
                  className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 hover:-translate-y-0.5">
                  {data.hero.ctaPrimary || 'View My Work'} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              {data.layout.find(l => l.id === 'contact' && l.visible) && (
                <button onClick={() => scrollTo('contact')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold text-sm transition-all duration-200 hover:-translate-y-0.5">
                  {data.hero.ctaSecondary || 'Get in Touch'}
                </button>
              )}
            </div>
          )}

          {/* Social quick links */}
          {!isEditing && (
            <div className="flex gap-3 mt-10 justify-center lg:justify-start">
              {allSocials.filter(s => data.contact[s.id]).map(s => (
                <a key={s.id}
                  href={s.id === 'email' ? `mailto:${data.contact.email}` : s.id === 'phone' ? `tel:${data.contact.phone}` : ensureProtocol(data.contact[s.id].includes('http') ? data.contact[s.id] : `${s.pre}${data.contact[s.id]}`)}
                  target="_blank" rel="noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-300 dark:hover:border-violet-500/30 transition-all duration-200 hover:scale-110">
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Right — Profile Image */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative group">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-violet-500/20 via-purple-500/15 to-pink-500/20 blur-2xl group-hover:blur-3xl transition-all duration-700 animate-float" />
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-[400px] lg:h-[400px] rounded-3xl overflow-hidden border border-white/20 dark:border-white/8 shadow-2xl">
              <img src={data.hero.profileImage} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              {isEditing && (
                <label className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity gap-3">
                  <Upload size={28} className="text-white" />
                  <span className="text-white font-bold text-sm">Change Photo</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );

  /* ════════════════════ RENDER ABOUT ════════════════════ */
  const renderAbout = () => (
    <section className="py-24 scroll-mt-20" id="about">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <div className="relative rounded-3xl overflow-hidden glass-card shadow-xl p-10 md:p-16 border border-white/40 dark:border-white/6">
          {/* Accent stripe + background glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-violet-500/5 blur-3xl" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-pink-500/5 blur-3xl" />

          <div className="relative text-center max-w-3xl mx-auto">
            <SectionLabel>{data.about.title || 'About Me'}</SectionLabel>

            {isEditing ? (
              <div className="space-y-4 mt-4">
                <InputField
                  value={data.about.title}
                  onChange={v => handleChange('about', 'title', v)}
                  className="text-lg font-bold text-center"
                  placeholder="Section label (e.g. About Me)"
                />
                <InputField
                  value={data.about.bio}
                  onChange={v => handleChange('about', 'bio', v)}
                  isTextArea
                  className="text-xl text-center leading-relaxed min-h-[140px]"
                  placeholder="Write your professional bio…"
                />
              </div>
            ) : (
              <>
                <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white">{data.about.title}</h2>
                <blockquote className="text-xl md:text-2xl font-medium leading-relaxed text-slate-600 dark:text-slate-300 italic border-l-4 border-violet-500 pl-6 text-left">
                  {data.about.bio}
                </blockquote>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  /* ═══════════════════ RENDER SKILLS ══════════════════════════════════════ */
  const renderSkills = () => (
    <section className="py-24 scroll-mt-20" id="skills">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <SectionHeader sectionObj={data.skills} sectionKey="skills" isEditing={isEditing} handleChange={handleChange} />
        {isEditing ? (
          <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8 border border-white/40 dark:border-white/6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Comma-separated list of skills</p>
            <textarea className="w-full h-36 bg-transparent text-base text-slate-700 dark:text-slate-200 outline-none resize-none" value={data.skills.items.join(', ')} onChange={handleSkillsChange} />
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-3">
            {data.skills.items.filter(Boolean).map((skill, i) => (
              <span
                key={i}
                className="skill-pill stagger-child"
                style={{ '--sd': `${i * 0.05}s` }}
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  /* ═══════════════════ RENDER PROJECTS ════════════════════════════════════ */
  const renderProjects = () => (
    <section className="py-24 scroll-mt-20" id="projects">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <SectionHeader sectionObj={data.projects} sectionKey="projects" isEditing={isEditing} handleChange={handleChange} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.projects.items.map((project, index) => (
            <div
              key={project.id}
              className="group relative flex flex-col rounded-3xl overflow-hidden glass-card border border-white/40 dark:border-white/6 shadow-lg card-hover hover:shadow-2xl hover:border-violet-200/50 dark:hover:border-violet-500/20 stagger-child"
              style={{ '--sd': `${index * 0.09}s` }}
            >
              {/* Media */}
              <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-zinc-900 flex items-center justify-center">
                {project.videoUrl ? (
                  <iframe className="w-full h-full" src={project.videoUrl} title={project.title} frameBorder="0" allowFullScreen />
                ) : project.imageUrl ? (
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <Layout size={48} className="text-slate-300 dark:text-zinc-700" />
                )}
                {!isEditing && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-start p-5 gap-3">
                    {project.link && (
                      <a href={ensureProtocol(project.link)} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-violet-50 transition-colors shadow-lg">
                        <ExternalLink size={13} /> Live Demo
                      </a>
                    )}
                    {project.codeLink && (
                      <a href={ensureProtocol(project.codeLink)} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-colors shadow-lg">
                        <Github size={13} /> Code
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col grow">
                {isEditing ? (
                  <div className="space-y-3">
                    <InputField value={project.title} onChange={v => handleArrayChange('projects', index, 'title', v)} className="font-bold text-lg" placeholder="Project Name" />
                    <InputField value={project.description} onChange={v => handleArrayChange('projects', index, 'description', v)} isTextArea className="text-sm" placeholder="Project description..." />
                    <div className="bg-violet-500/5 border border-violet-500/10 rounded-2xl p-4 space-y-3">
                      <label className="flex items-center gap-2 bg-violet-600 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer w-fit hover:bg-violet-700 transition-colors">
                        <Upload size={13} /> Upload Image
                        <input type="file" accept="image/*" onChange={e => handleProjectImageUpload(e, index)} className="hidden" />
                      </label>
                      <InputField value={project.imageUrl} onChange={v => handleArrayChange('projects', index, 'imageUrl', v)} className="text-xs" placeholder="Image URL" />
                      <InputField value={project.videoUrl} onChange={v => handleArrayChange('projects', index, 'videoUrl', v)} className="text-xs" placeholder="YouTube Embed URL" />
                      <div className="grid grid-cols-2 gap-2">
                        <InputField value={project.link} onChange={v => handleArrayChange('projects', index, 'link', v)} className="text-xs" placeholder="Live URL" />
                        <InputField value={project.codeLink} onChange={v => handleArrayChange('projects', index, 'codeLink', v)} className="text-xs" placeholder="GitHub URL" />
                      </div>
                    </div>
                    <button onClick={() => removeItem('projects', project.id)} className="flex items-center gap-2 text-rose-500 text-xs font-bold hover:text-rose-600 transition-colors">
                      <Trash2 size={13} /> Remove Project
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{project.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5 line-clamp-2 grow">{project.description}</p>
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-white/6 mt-auto">
                      {project.link && (
                        <a href={ensureProtocol(project.link)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 hover:gap-2.5 transition-all">
                          Live Demo <ArrowUpRight size={13} />
                        </a>
                      )}
                      {project.codeLink && (
                        <a href={ensureProtocol(project.codeLink)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors ml-auto">
                          <Github size={13} /> Source
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          {isEditing && (
            <button onClick={() => addItem('projects', { title: 'New Project', description: 'Describe your project...', link: '', codeLink: '', imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800', videoUrl: '' })}
              className="flex flex-col items-center justify-center gap-4 p-10 rounded-3xl border-2 border-dashed border-violet-300/50 dark:border-violet-500/20 bg-violet-500/[0.02] hover:bg-violet-500/5 transition-all text-violet-500 group min-h-[280px]">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={28} />
              </div>
              <span className="font-bold text-sm uppercase tracking-widest">Add Project</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );

  /* ═══════════════════ RENDER EXPERIENCE ══════════════════════════════════ */
  const renderExperience = () => (
    <section className="py-24 scroll-mt-20" id="experience">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <SectionHeader sectionObj={data.experience} sectionKey="experience" isEditing={isEditing} handleChange={handleChange} />
        <div className="space-y-4 relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/60 via-purple-500/40 to-transparent hidden md:block" />
          {data.experience.items.map((exp, index) => (
            <div key={exp.id} className="group relative md:pl-20 stagger-child" style={{ '--sd': `${index * 0.1}s` }}>
              {/* Timeline dot */}
              <div className="hidden md:flex absolute left-5 top-8 w-6 h-6 rounded-full border-2 border-violet-500 bg-white dark:bg-zinc-950 items-center justify-center group-hover:scale-125 transition-transform z-10">
                <div className="w-2 h-2 rounded-full bg-violet-500" />
              </div>
              <div className="glass-card rounded-2xl p-7 border border-white/40 dark:border-white/6 shadow-md card-hover hover:shadow-xl hover:border-violet-200/40 dark:hover:border-violet-500/15">
                {isEditing ? (
                  <div className="space-y-3">
                    <InputField value={exp.title} onChange={v => handleArrayChange('experience', index, 'title', v)} className="font-bold text-lg" placeholder="Job Title" />
                    <InputField value={exp.organization} onChange={v => handleArrayChange('experience', index, 'organization', v)} className="text-sm font-semibold text-violet-600" placeholder="Company" />
                    <InputField value={exp.duration} onChange={v => handleArrayChange('experience', index, 'duration', v)} className="text-xs" placeholder="Duration" />
                    <InputField value={exp.description} onChange={v => handleArrayChange('experience', index, 'description', v)} isTextArea className="text-sm" placeholder="Responsibilities..." />
                    <InputField value={exp.achievements} onChange={v => handleArrayChange('experience', index, 'achievements', v)} className="text-sm" placeholder="Key achievement" />
                    <button onClick={() => removeItem('experience', exp.id)} className="flex items-center gap-2 text-rose-500 text-xs font-bold hover:text-rose-600 transition-colors">
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{exp.title}</h3>
                      <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 mb-3">{exp.organization}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{exp.description}</p>
                      {exp.achievements && (
                        <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
                          <Star size={14} className="text-violet-500 mt-0.5 shrink-0" />
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{exp.achievements}</p>
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 self-start whitespace-nowrap">{exp.duration}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isEditing && (
            <button onClick={() => addItem('experience', { title: 'Role', organization: 'Company', duration: '20XX – Present', description: 'Key responsibilities...', achievements: 'Impact achieved.' })}
              className="w-full py-5 rounded-2xl border-2 border-dashed border-violet-300/50 dark:border-violet-500/20 bg-violet-500/[0.02] hover:bg-violet-500/5 transition-all text-violet-500 font-bold text-sm flex items-center justify-center gap-2">
              <PlusSquare size={18} /> Add Experience
            </button>
          )}
        </div>
      </div>
    </section>
  );

  /* ═══════════════════ RENDER ACHIEVEMENTS ════════════════════════════════ */
  const renderAchievements = () => (
    <section className="py-24 scroll-mt-20" id="achievements">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <SectionHeader sectionObj={data.achievements} sectionKey="achievements" isEditing={isEditing} handleChange={handleChange} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.achievements.items.map((ach, index) => (
            <div
              key={ach.id}
              className="group relative glass-card rounded-2xl p-8 border border-white/40 dark:border-white/6 shadow-md card-hover hover:shadow-xl hover:border-violet-200/40 dark:hover:border-violet-500/15 overflow-hidden stagger-child"
              style={{ '--sd': `${index * 0.1}s` }}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-purple-500 rounded-l-2xl" />
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-6">
                <Award size={22} />
              </div>
              {isEditing ? (
                <div className="space-y-3">
                  <InputField value={ach.title} onChange={v => handleArrayChange('achievements', index, 'title', v)} className="font-bold text-lg" placeholder="Achievement title" />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField value={ach.issuer} onChange={v => handleArrayChange('achievements', index, 'issuer', v)} placeholder="Issuer" />
                    <InputField value={ach.date} onChange={v => handleArrayChange('achievements', index, 'date', v)} placeholder="Year" />
                  </div>
                  <InputField value={ach.description} onChange={v => handleArrayChange('achievements', index, 'description', v)} isTextArea placeholder="Details..." />
                  <InputField value={ach.link} onChange={v => handleArrayChange('achievements', index, 'link', v)} placeholder="Credential URL" />
                  <button onClick={() => removeItem('achievements', ach.id)} className="flex items-center gap-2 text-rose-500 text-xs font-bold hover:text-rose-600 transition-colors">
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{ach.title}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400">{ach.issuer}</span>
                    {ach.date && <><span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" /><span className="text-xs text-slate-400">{ach.date}</span></>}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">{ach.description}</p>
                  {ach.link && (
                    <a href={ensureProtocol(ach.link)} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 hover:gap-2.5 transition-all">
                      View Credential <ArrowUpRight size={13} />
                    </a>
                  )}
                </>
              )}
            </div>
          ))}
          {isEditing && (
            <button onClick={() => addItem('achievements', { title: 'New Achievement', issuer: 'Issuing Body', date: 'Year', description: 'What you achieved and why it matters.', link: '' })}
              className="flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border-2 border-dashed border-violet-300/50 dark:border-violet-500/20 bg-violet-500/[0.02] hover:bg-violet-500/5 transition-all text-violet-500 group">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <span className="font-bold text-sm uppercase tracking-widest">Add Achievement</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );

  /* ═══════════════════ RENDER CONTACT ══════════════════════════════════════ */
  const renderContact = () => {
    const contactLinks = allSocials.filter(s => isEditing ? data.contact[s.id] != null : !!data.contact[s.id]);
    const availableToAdd = allSocials.filter(s => data.contact[s.id] == null);
    return (
      <section className="py-24 scroll-mt-20" id="contact">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <SectionHeader sectionObj={data.contact} sectionKey="contact" isEditing={isEditing} handleChange={handleChange} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {contactLinks.map((s, i) => (
              <div
                key={s.id}
                className="group glass-card rounded-2xl p-7 border border-white/40 dark:border-white/6 shadow-md card-hover hover:shadow-xl hover:border-violet-200/40 dark:hover:border-violet-500/15 relative stagger-child"
                style={{ '--sd': `${i * 0.07}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                    <s.icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                    {isEditing ? (
                      <InputField value={data.contact[s.id]} onChange={v => handleChange('contact', s.id, v)} placeholder={`Enter ${s.label}`} />
                    ) : (
                      <a href={s.id === 'email' ? `mailto:${data.contact.email}` : s.id === 'phone' ? `tel:${data.contact.phone}` : ensureProtocol(data.contact[s.id].includes('http') ? data.contact[s.id] : `${s.pre}${data.contact[s.id]}`)}
                        target="_blank" rel="noreferrer"
                        className="text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-violet-600 dark:hover:text-violet-400 transition-colors truncate block">
                        {s.id === 'email' ? data.contact.email : s.id === 'phone' ? data.contact.phone : (data.contact[s.id].includes('http') ? 'View Profile' : `@${data.contact[s.id].replace(/^@/, '')}`)}
                      </a>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <button onClick={() => handleChange('contact', s.id, null)} className="absolute top-4 right-4 text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {isEditing && availableToAdd.length > 0 && (
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {availableToAdd.map(s => (
                <button key={s.id} onClick={() => handleChange('contact', s.id, '')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-violet-400 dark:hover:border-violet-500/40 transition-all text-sm font-bold text-slate-400 hover:text-violet-600 dark:hover:text-violet-400">
                  <s.icon size={16} /> Add {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  /* ═══════════════════ RENDER CUSTOM ══════════════════════════════════════ */
  const renderCustom = (item) => (
    <section className="py-24 scroll-mt-20" id={item.id} key={item.id}>
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <div className="glass-card rounded-3xl p-12 border border-white/40 dark:border-white/6 shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
          {isEditing ? (
            <div className="space-y-5">
              <InputField value={data[item.id].title} onChange={v => handleChange(item.id, 'title', v)} className="text-2xl font-black text-center" placeholder="Section Title" />
              <InputField value={data[item.id].content} onChange={v => handleChange(item.id, 'content', v)} isTextArea className="text-base text-center" placeholder="Content..." />
            </div>
          ) : (
            <>
              {data[item.id].title && <h2 className="text-3xl md:text-4xl font-black mb-6 text-slate-900 dark:text-white">{data[item.id].title}</h2>}
              <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{data[item.id].content}</p>
            </>
          )}
        </div>
      </div>
    </section>
  );

  const sectionMap = { hero: renderHero, about: renderAbout, skills: renderSkills, projects: renderProjects, experience: renderExperience, achievements: renderAchievements, contact: renderContact };

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white transition-colors duration-500 selection:bg-violet-500/20">
      {/* ── Custom cursor elements ─────────────────────────────────────── */}
      <div ref={dotRef}  className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />

      {/* ── Nav progress bar ──────────────────────────────────────────── */}
      <div ref={barRef} className="nav-progress-bar" style={{ width: '0%', opacity: 0 }} />

      {/* Page background — layered ambient blobs, no grid */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Light: vivid violet top-right */}
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full bg-violet-400/20 dark:bg-violet-600/12 blur-[200px] animate-blob" />
        {/* Light: rose bottom-left */}
        <div className="absolute -bottom-40 -left-40 w-[700px] h-[700px] rounded-full bg-pink-400/16 dark:bg-pink-600/10 blur-[180px] animate-blob delay-300" />
        {/* Center indigo mid-page */}
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-400/10 dark:bg-indigo-600/8 blur-[150px] animate-blob delay-700" />
        {/* Dark only: deep purple overlay for richness */}
        <div className="hidden dark:block absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-950/30 via-transparent to-indigo-950/20" />
      </div>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-200/80 dark:border-white/6 glass">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xl font-black tracking-tight text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            {data.hero.name}<span className="text-gradient">.{data.hero.lastName?.charAt(0)}</span>
          </button>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {data.layout.filter(l => l.visible).map(l => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className={`nav-link group relative px-1 py-1 text-sm font-semibold transition-all duration-200 ${
                  activeSection === l.id
                    ? 'text-violet-600 dark:text-violet-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {SECTION_NAMES[l.id] || l.id}
                <span className={`absolute -bottom-0.5 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-300 ${
                  activeSection === l.id ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-300 dark:hover:border-violet-500/30 transition-all">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {data.layout.find(l => l.id === 'contact' && l.visible) && (
              <button onClick={() => setShowContactModal(true)}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition-all shadow-lg shadow-violet-600/20 hover:shadow-violet-600/35 hover:-translate-y-px">
                Let's Talk
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── FLOATING CONTROL BAR ─────────────────────────────────────────── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-2xl glass border border-white/30 dark:border-white/8 shadow-2xl">
        <button onClick={() => setIsEditing(e => !e)}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${isEditing ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25' : 'text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/8'}`}>
          {isEditing ? <><Check size={16} className="animate-bounce" /> Save</> : <><Edit2 size={16} /> Customize</>}
        </button>
        <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />
        <button onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
          <Download size={16} /> Export
        </button>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="pb-32">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="portfolio">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {data.layout.map((item, index) => {
                  if (!item.visible && !isEditing) return null;
                  return (
                    <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={!isEditing || item.locked}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.draggableProps}
                          className={`relative ${isEditing ? 'border-2 border-dashed border-violet-400/15 rounded-3xl my-6 py-4 mx-4 bg-violet-500/[0.01]' : ''} ${!item.visible ? 'opacity-40' : ''} ${snapshot.isDragging ? 'z-50 shadow-2xl scale-[1.01]' : 'transition-transform duration-300'}`}>
                          {isEditing && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2 glass rounded-full border border-white/30 dark:border-white/10 z-40 shadow-xl">
                              {!item.locked && <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-violet-500"><GripVertical size={16} /></div>}
                              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">{item.id.replace('custom_', 'Block ')}</span>
                              {!item.locked && (
                                <>
                                  <button onClick={() => toggleVisibility(item.id)} className="text-slate-400 hover:text-violet-500 transition-colors">{item.visible ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                                  <button onClick={() => removeSection(item.id)} className="text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={15} /></button>
                                </>
                              )}
                            </div>
                          )}
                          {item.id.startsWith('custom_') ? renderCustom(item) : (sectionMap[item.id] ? sectionMap[item.id]() : null)}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {isEditing && (
          <div className="max-w-3xl mx-auto mt-16 p-10 border-2 border-dashed border-violet-400/20 rounded-3xl text-center bg-violet-500/[0.01]">
            <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-6">Manage Sections</h4>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={addCustomSection} className="px-6 py-3 bg-violet-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-violet-700 transition-colors shadow-lg shadow-violet-600/20">
                <PlusSquare size={16} /> Custom Block
              </button>
              {missingSections.map(s => (
                <button key={s} onClick={() => restoreSection(s)} className="px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm flex items-center gap-2 hover:border-violet-400 dark:hover:border-violet-500/40 transition-all text-xs uppercase tracking-widest">
                  <Plus size={16} /> Restore {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      {!isEditing && (
        <footer className="border-t border-slate-200 dark:border-white/6 py-8">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <p>© {new Date().getFullYear()} All rights reserved.</p>
            <p className="flex items-center gap-1.5">Built with <span className="text-rose-400">♥</span> using React & Tailwind</p>
          </div>
        </footer>
      )}

      {/* ── EXPORT MODAL ─────────────────────────────────────────────────── */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[1000] flex items-center justify-center p-6" onClick={() => setShowExportModal(false)}>
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-3xl p-10 w-full max-w-lg relative shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowExportModal(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"><X size={18} /></button>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Export Portfolio</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Choose a theme for your standalone site.</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {['light', 'dark'].map(t => (
                <button key={t} onClick={() => setExportThemeChoice(t)}
                  className={`flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all ${exportThemeChoice === t ? 'border-violet-500 bg-violet-500/8' : 'border-slate-200 dark:border-white/10 opacity-60 hover:opacity-90'}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${exportThemeChoice === t ? 'bg-violet-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                    {t === 'light' ? <Sun size={28} /> : <Moon size={28} />}
                  </div>
                  <span className="font-bold text-sm capitalize text-slate-800 dark:text-white">{t === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              ))}
            </div>
            <button onClick={() => { exportPortfolio(data, exportThemeChoice); setShowExportModal(false); }}
              className="w-full flex items-center justify-center gap-3 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40">
              <Download size={18} /> Download ZIP
            </button>
          </div>
        </div>
      )}

      {/* ── CONTACT MODAL ────────────────────────────────────────────────── */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[1000] flex items-center justify-center p-6" onClick={() => setShowContactModal(false)}>
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-3xl p-10 w-full max-w-2xl relative shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowContactModal(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"><X size={18} /></button>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Let's Work Together</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Currently open to new projects and collaborations.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allSocials.filter(s => data.contact[s.id]).map(s => (
                <a key={s.id} href={s.id === 'email' ? `mailto:${data.contact.email}` : s.id === 'phone' ? `tel:${data.contact.phone}` : ensureProtocol(data.contact[s.id].includes('http') ? data.contact[s.id] : `${s.pre}${data.contact[s.id]}`)}
                  target="_blank" rel="noreferrer"
                  className="group flex items-center gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-violet-400 dark:hover:border-violet-500/40 transition-all">
                  <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all">
                    <s.icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">{s.label}</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                      {s.id === 'email' ? data.contact.email : s.id === 'phone' ? data.contact.phone : (data.contact[s.id].includes('http') ? 'View Profile' : `@${data.contact[s.id].replace(/^@/, '')}`)}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
