import React, { useState, useEffect } from 'react';
import { initialData } from './data';
import { exportPortfolio } from './exportApp';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Download, Edit2, Check, ExternalLink, Plus, Trash2, 
  Github, Linkedin, Mail, Twitter, GripVertical, Eye, EyeOff, Upload,
  Sun, Moon, X, ChevronRight, Sparkles, Phone, PlusSquare
} from 'lucide-react';

const ensureProtocol = (url) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) return url;
  return `https://${url}`;
};

const InputField = ({ value, onChange, isTextArea = false, className = '', placeholder = '' }) => {
  const baseClasses = "bg-black/5 dark:bg-white/5 border border-dashed border-indigo-500 rounded-xl p-3 outline-none focus:bg-black/10 dark:focus:bg-white/10 transition-colors w-full font-inter";
  if (isTextArea) {
    return (
      <textarea
        className={`${baseClasses} min-h-[120px] resize-y ${className}`}
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <input
      type="text"
      className={`${baseClasses} ${className}`}
      value={value || ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

// Available sections that might be removed and added back
const AVAILABLE_SECTIONS = ['about', 'experience', 'skills', 'projects', 'achievements', 'contact'];

function App() {
  const [data, setData] = useState(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [activeSection, setActiveSection] = useState('hero');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportThemeChoice, setExportThemeChoice] = useState('dark');
  const [showHireMeModal, setShowHireMeModal] = useState(false);

  // Bulletproof Theme Toggle
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Handle Scroll Spy
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
          entry.target.classList.add('opacity-100', 'translate-y-0');
        }
      });
    }, { threshold: 0.25 });

    const sections = document.querySelectorAll('section, .hero-section');
    sections.forEach(sec => {
      sec.classList.add('transition-all', 'duration-1000', 'ease-out', 'opacity-0', 'translate-y-12');
      observer.observe(sec);
    });

    return () => observer.disconnect();
  }, [data.layout]);

  /* Generic Modifiers */
  const handleChange = (section, field, value) => {
    setData((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const handleArrayChange = (section, index, field, value) => {
    const newItems = [...data[section].items];
    newItems[index] = { ...newItems[index], [field]: value };
    setData(prev => ({ ...prev, [section]: { ...prev[section], items: newItems } }));
  };

  const addItem = (section, defaultItem) => {
    setData(prev => ({ ...prev, [section]: { ...prev[section], items: [...prev[section].items, { id: Date.now(), ...defaultItem }] } }));
  };

  const removeItemSectionItem = (section, id) => {
    setData(prev => ({ ...prev, [section]: { ...prev[section], items: prev[section].items.filter(item => item.id !== id) } }));
  };

  const handleSkillsChange = (e) => {
    const skillsArray = e.target.value.split(',').map(s => s.trim());
    setData(prev => ({ ...prev, skills: { ...prev.skills, items: skillsArray } }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { handleChange('hero', 'profileImage', reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const toggleSectionVisibility = (id) => {
    setData(prev => ({ ...prev, layout: prev.layout.map(item => item.id === id ? { ...item, visible: !item.visible } : item) }));
  };

  const performRemoveSection = (id) => {
    setData(prev => ({ ...prev, layout: prev.layout.filter(item => item.id !== id) }));
  };

  const addCustomSection = () => {
    const newId = `custom_${Date.now()}`;
    setData(prev => ({
      ...prev,
      [newId]: { title: "New Custom Section", content: "Write any text, markdown-like paragraphs, or thoughts here..." },
      layout: [...prev.layout, { id: newId, visible: true, locked: false }]
    }));
  };

  const restoreBuiltInSection = (id) => {
    if(!data.layout.find(l => l.id === id)) {
      setData(prev => ({
        ...prev,
        layout: [...prev.layout, { id, visible: true, locked: false }]
      }));
    }
  };

  const missingSections = AVAILABLE_SECTIONS.filter(s => !data.layout.find(l => l.id === s));

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(data.layout);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setData(prev => ({ ...prev, layout: items }));
  };

  const performExport = () => {
    exportPortfolio(data, exportThemeChoice);
    setShowExportModal(false);
  };

  // Sections Renderers
  const SectionHeader = ({ sectionObj, sectionKey, desc }) => (
    <div className="text-center mb-20">
      {!isEditing ? (
        <h3 className="text-5xl md:text-6xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">{sectionObj.title}</h3>
      ) : (
        <InputField value={sectionObj.title} onChange={(v) => handleChange(sectionKey, 'title', v)} className="text-3xl font-black text-center max-w-md mx-auto mb-6" />
      )}
      {desc && <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">{desc}</p>}
    </div>
  );

  const renderHero = () => (
    <section className="hero-section min-h-screen flex items-center pt-24 pb-12 relative overflow-hidden" id="hero">
      {/* Decorative Floating Elements */}
      <div className="absolute top-1/4 left-10 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute top-1/3 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>
      <Sparkles className="absolute top-32 left-1/4 text-indigo-400/30 animate-pulse" size={40} />
      <Sparkles className="absolute bottom-32 right-1/4 text-teal-400/30 animate-pulse delay-500" size={32} />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
        <div className="flex flex-col text-center lg:text-left">
          {(!isEditing && !data.hero.greeting) ? null : isEditing ? (
            <InputField value={data.hero.greeting} onChange={(v) => handleChange('hero', 'greeting', v)} className="mb-8 max-w-sm" placeholder="e.g. HELLO THERE" />
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card w-fit mx-auto lg:mx-0 mb-8 border-indigo-500/20">
              <Sparkles size={16} className="text-indigo-500" />
              <p className="text-sm font-semibold tracking-widest uppercase text-slate-700 dark:text-slate-300">
                {data.hero.greeting}
              </p>
            </div>
          )}

          {!isEditing ? (
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-6 text-slate-900 dark:text-white leading-[1.1]">
              I'm <span className="text-gradient block mt-2">{data.hero.name} {data.hero.lastName}</span>
            </h1>
          ) : (
            <div className="flex flex-wrap gap-4 mb-8">
              <span className="text-6xl font-black text-slate-900 dark:text-white">I'm </span>
              <InputField value={data.hero.name} onChange={(v) => handleChange('hero', 'name', v)} className="w-full text-4xl font-bold" />
              <InputField value={data.hero.lastName} onChange={(v) => handleChange('hero', 'lastName', v)} className="w-full text-4xl font-bold" />
            </div>
          )}

          {(!isEditing && !data.hero.role) ? null : isEditing ? (
            <div className="flex flex-col gap-3 max-w-lg mb-12 w-full mx-auto lg:mx-0">
              <InputField value={data.hero.rolePrefix} onChange={(v) => handleChange('hero', 'rolePrefix', v)} placeholder="e.g. A" />
              <InputField value={data.hero.role} onChange={(v) => handleChange('hero', 'role', v)} className="text-indigo-500" placeholder="e.g. Full Stack Developer" />
              <InputField value={data.hero.roleSuffix} onChange={(v) => handleChange('hero', 'roleSuffix', v)} placeholder="e.g. & UI/UX Designer" />
            </div>
          ) : (
            <h2 className="text-2xl sm:text-3xl font-medium leading-relaxed mb-12 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0">
              {data.hero.rolePrefix} <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{data.hero.role}</span> {data.hero.roleSuffix}
            </h2>
          )}

          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            {data.layout.find(l => l.id === 'projects' && l.visible) && (
              <button className="btn-primary px-8 py-4 rounded-full font-bold flex items-center justify-center gap-3" onClick={() => document.getElementById('projects')?.scrollIntoView({behavior: 'smooth'})}>
                View My Work <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            )}
            {data.layout.find(l => l.id === 'contact' && l.visible) && (
              <button className="glass-card px-8 py-4 rounded-full font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:border-indigo-500/50" onClick={() => document.getElementById('contact')?.scrollIntoView({behavior: 'smooth'})}>
                Contact Me <Mail size={18} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex justify-center relative lg:justify-end">
          <div className="relative w-full max-w-[480px] aspect-square">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[3rem] blur-3xl opacity-20 dark:opacity-40 -z-10 animate-pulse"></div>
            <div className="w-full h-full hero-img-glow relative group">
              <div className="w-full h-full rounded-[calc(3rem-8px)] overflow-hidden relative">
                <img src={data.hero.profileImage} alt="Profile" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {isEditing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <label className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-2xl flex flex-col items-center gap-3 cursor-pointer font-bold hover:bg-white/20 transition-all hover:scale-105">
                      <Upload size={28} />
                      <span>Upload Photo</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderCustom = (item) => (
    <section className="py-24 scroll-mt-24" id={item.id} key={item.id}>
      <div className="max-w-5xl mx-auto px-6 sm:px-12">
        <div className="glass-card rounded-[3rem] p-12 md:p-20 relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full point-events-none -z-10"></div>
          {isEditing ? (
            <div className="flex flex-col gap-6 w-full">
              <InputField value={data[item.id].title} onChange={(v) => handleChange(item.id, 'title', v)} className="text-3xl font-black text-slate-900 dark:text-white bg-transparent border-b-2" placeholder="Custom Section Header" />
              <InputField value={data[item.id].content} onChange={(v) => handleChange(item.id, 'content', v)} isTextArea className="text-xl" placeholder="Write anything you want here..." />
            </div>
          ) : (
            <div className="flex flex-col text-center">
              {data[item.id].title && <h3 className="text-4xl md:text-5xl font-black mb-8 tracking-tight text-slate-900 dark:text-white">{data[item.id].title}</h3>}
              <p className="text-xl font-medium text-slate-600 dark:text-slate-300 leading-relaxed mx-auto max-w-4xl whitespace-pre-wrap">{data[item.id].content}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const renderAbout = () => (
    <section className="py-32 scroll-mt-24 relative" id="about">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-12">
        <div className="glass-card rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full point-events-none -z-10"></div>
          {!isEditing ? (
            data.about.title && <h3 className="text-2xl font-bold mb-8 tracking-[0.2em] uppercase text-indigo-500">{data.about.title}</h3>
          ) : (
            <InputField value={data.about.title} onChange={(v) => handleChange('about', 'title', v)} className="text-xl font-bold text-center max-w-sm mx-auto mb-8 text-indigo-500" placeholder="Optional Pre-title" />
          )}
          {!isEditing ? (
            <p className="text-3xl md:text-5xl font-medium text-slate-800 dark:text-slate-200 leading-[1.4] tracking-tight">"{data.about.bio}"</p>
          ) : (
            <InputField value={data.about.bio} onChange={(v) => handleChange('about', 'bio', v)} isTextArea className="w-full text-2xl font-medium text-center" placeholder="Write your massive quote or bio here" />
          )}
        </div>
      </div>
    </section>
  );

  const renderSkills = () => (
    <section className="py-24 scroll-mt-24 relative" id="skills">
      <div className="absolute top-1/2 right-10 w-48 h-48 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 relative">
        <SectionHeader sectionObj={data.skills} sectionKey="skills" desc="Technologies, frameworks, and tools I master to build exceptional digital experiences." />
        {isEditing ? (
          <div className="max-w-4xl mx-auto glass-card p-10 rounded-3xl">
            <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-widest">Comma separated skills</label>
            <textarea className="bg-black/5 dark:bg-white/5 border border-dashed border-indigo-500/50 rounded-xl p-6 w-full min-h-[150px] outline-none text-xl font-medium text-slate-900 dark:text-white focus:border-indigo-500 transition-colors" value={data.skills.items.join(', ')} onChange={handleSkillsChange} />
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
            {data.skills.items.filter(Boolean).map((skill, index) => (
              <div key={index} className="glass-card px-8 py-4 rounded-full font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 hover:border-indigo-500/30 cursor-default">
                {skill}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  const renderProjects = () => (
    <section className="py-24 scroll-mt-24 relative" id="projects">
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-teal-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 relative">
        <SectionHeader sectionObj={data.projects} sectionKey="projects" desc="A curated selection of my most recent and impactful work." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {data.projects.items.map((project, index) => (
            <div key={project.id} className="glass-card rounded-[2.5rem] p-10 flex flex-col relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]"></div>
              
              {isEditing && <button className="absolute top-6 right-6 bg-red-100 dark:bg-red-900/30 text-red-500 hover:text-white hover:bg-red-500 p-3 rounded-full transition-colors z-20" onClick={() => removeItemSectionItem('projects', project.id)}><Trash2 size={18} /></button>}
              
              <div className="relative z-10 flex flex-col h-full">
                {!isEditing ? <h4 className="text-3xl font-black mb-4 text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">{project.title}</h4> : <InputField value={project.title} onChange={(v) => handleArrayChange('projects', index, 'title', v)} className="mb-4 font-bold text-2xl" placeholder="Project Title" />}
                {!isEditing ? <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 flex-grow leading-relaxed font-medium">{project.description}</p> : <InputField value={project.description} onChange={(v) => handleArrayChange('projects', index, 'description', v)} isTextArea className="mb-6 flex-grow" placeholder="Project Details" />}
                {(!isEditing && project.link) ? (
                  <a href={ensureProtocol(project.link)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-6 py-3 rounded-full font-bold w-fit hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-500 transition-all shadow-sm">
                    View Project <ExternalLink size={16}/>
                  </a>
                ) : isEditing ? (
                  <InputField value={project.link} onChange={(v) => handleArrayChange('projects', index, 'link', v)} placeholder="https://" />
                ) : null}
              </div>
            </div>
          ))}
          {isEditing && (
            <div className="glass-card border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[2.5rem] min-h-[300px] flex flex-col items-center justify-center gap-4 text-slate-500 cursor-pointer hover:border-indigo-500 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-indigo-500/10 transition-colors" onClick={() => addItem('projects', { title: "New Project", description: "Brief description...", link: "https://" })}>
              <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full"><Plus size={40} /></div>
              <span className="font-bold text-xl">Add Project Case</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const renderExperience = () => (
    <section className="py-24 scroll-mt-24 relative" id="experience">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none -z-10"></div>
      <div className="max-w-[1200px] mx-auto px-6 sm:px-12 relative">
        <SectionHeader sectionObj={data.experience} sectionKey="experience" desc="My professional trajectory and leadership roles." />
        <div className="flex flex-col gap-8 relative before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-gradient-to-b before:from-indigo-500 before:to-purple-500 md:before:left-[8.5rem] lg:before:left-[10.5rem] before:rounded-full">
          {data.experience.items.map((exp, index) => (
            <div key={exp.id} className="glass-card p-8 md:p-12 rounded-[2.5rem] relative ml-8 md:ml-[11rem] lg:ml-[14rem] lg:hover:translate-x-4">
              <div className="absolute top-1/2 -translate-y-1/2 -left-[2.4rem] md:-left-[2.9rem] lg:-left-[3.9rem] w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-900 border-4 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10 transition-transform duration-300 hover:scale-125"></div>
              {isEditing && <button className="absolute top-6 right-6 bg-red-100 dark:bg-red-900/30 text-red-500 hover:text-white hover:bg-red-500 p-3 rounded-full transition-colors z-20" onClick={() => removeItemSectionItem('experience', exp.id)}><Trash2 size={18} /></button>}

              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="space-y-2">
                  {!isEditing ? <h4 className="text-3xl font-black text-slate-900 dark:text-white">{exp.title}</h4> : <InputField value={exp.title} onChange={(v) => handleArrayChange('experience', index, 'title', v)} className="mb-2 font-bold text-2xl" placeholder="Role Title" />}
                  {(!isEditing && !exp.organization) ? null : isEditing ? <InputField value={exp.organization} onChange={(v) => handleArrayChange('experience', index, 'organization', v)} placeholder="Company" /> : <h5 className="text-lg text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wide">{exp.organization}</h5>}
                </div>
                {(!isEditing && !exp.duration) ? null : isEditing ? <InputField value={exp.duration} onChange={(v) => handleArrayChange('experience', index, 'duration', v)} placeholder="Duration" className="w-auto" /> : <span className="inline-flex bg-slate-100 dark:bg-white/10 px-4 py-2 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap border border-slate-200 dark:border-white/10">{exp.duration}</span>}
              </div>

              {(!isEditing && !exp.description) ? null : isEditing ? <InputField value={exp.description} onChange={(v) => handleArrayChange('experience', index, 'description', v)} isTextArea className="mb-6 font-medium" placeholder="Role description" /> : <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">{exp.description}</p>}
              
              {(!isEditing && !exp.achievements) ? null : isEditing ? (
                <InputField value={exp.achievements} onChange={(v) => handleArrayChange('experience', index, 'achievements', v)} className="text-sm font-semibold mt-4" placeholder="Highlight/Achievement (Optional)" />
              ) : (
                <div className="bg-gradient-to-r from-indigo-500/10 to-transparent p-6 rounded-2xl border-l-4 border-indigo-500 mt-4">
                  <p className="text-slate-800 dark:text-slate-200 font-semibold flex items-start gap-3">
                    <Sparkles className="text-indigo-500 shrink-0" size={20} />
                    {exp.achievements}
                  </p>
                </div>
              )}
            </div>
          ))}
          {isEditing && (
            <div className="glass-card border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[2.5rem] min-h-[150px] ml-8 md:ml-[11rem] lg:ml-[14rem] flex items-center justify-center gap-4 text-slate-500 cursor-pointer hover:border-indigo-500 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-indigo-500/10 transition-colors" onClick={() => addItem('experience', { title: "Role", organization: "Company", duration: "Year - Year", description: "Responsibilities", achievements: "" })}>
              <Plus size={32} /><span className="font-bold text-xl">Add New Role</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const renderAchievements = () => (
    <section className="py-24 scroll-mt-24 relative" id="achievements">
      <div className="absolute top-1/2 left-10 w-48 h-48 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 relative">
        <SectionHeader sectionObj={data.achievements} sectionKey="achievements" desc="A record of continuous growth, awards, and certifications." />
        <div className="flex flex-wrap justify-center items-stretch gap-8">
          {data.achievements.items.map((ach, index) => (
            <div key={ach.id} className="glass-card rounded-[2.5rem] p-10 flex flex-col group hover:-translate-y-3 flex-grow basis-[300px] max-w-lg">
              {isEditing && <button className="absolute top-6 right-6 bg-red-100 dark:bg-red-900/30 text-red-500 hover:text-white hover:bg-red-500 p-3 rounded-full transition-colors z-20" onClick={() => removeItemSectionItem('achievements', ach.id)}><Trash2 size={18} /></button>}
              
              <div className="w-16 h-16 bg-slate-100 dark:bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-slate-200 dark:border-white/10 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-transparent transition-colors text-indigo-500">
                <Sparkles size={28} />
              </div>

              {!isEditing ? <h4 className="text-2xl font-black mb-3 text-slate-900 dark:text-white">{ach.title}</h4> : <InputField value={ach.title} onChange={(v) => handleArrayChange('achievements', index, 'title', v)} className="mb-3 font-bold text-xl" placeholder="Award Title" />}
              
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {(!isEditing && !ach.issuer) ? null : isEditing ? <InputField value={ach.issuer} onChange={(v) => handleArrayChange('achievements', index, 'issuer', v)} placeholder="Issuer (Optional)" className="text-sm" /> : <span className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{ach.issuer}</span>}
                {(!isEditing && ach.issuer && ach.date) && <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>}
                {(!isEditing && !ach.date) ? null : isEditing ? <InputField value={ach.date} onChange={(v) => handleArrayChange('achievements', index, 'date', v)} placeholder="Date (Optional)" className="text-sm w-auto" /> : <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{ach.date}</span>}
              </div>

              {(!isEditing && !ach.description) ? null : isEditing ? <InputField value={ach.description} onChange={(v) => handleArrayChange('achievements', index, 'description', v)} isTextArea className="mb-6" placeholder="Brief description (Optional)" /> : <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed flex-grow mb-8 font-medium">{ach.description}</p>}
              
              {(!isEditing && ach.link) ? (
                <a href={ensureProtocol(ach.link)} target="_blank" rel="noopener noreferrer" className="mt-auto font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 hover:gap-3 transition-all border-b-2 border-transparent hover:border-indigo-500 w-fit pb-1">
                  Verify Credential <ChevronRight size={18} />
                </a>
              ) : isEditing ? (
                <InputField value={ach.link} onChange={(v) => handleArrayChange('achievements', index, 'link', v)} placeholder="Credential Link (Optional)" />
              ) : null}
            </div>
          ))}
          {isEditing && (
            <div className="glass-card border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[2.5rem] min-h-[350px] flex flex-col items-center justify-center gap-4 text-slate-500 cursor-pointer hover:border-indigo-500 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-indigo-500/10 transition-colors flex-grow basis-[300px] max-w-lg" onClick={() => addItem('achievements', { title: "Award Name", issuer: "Issuer", date: "Year", description: "Details", link: "" })}>
              <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full"><Plus size={40} /></div>
              <span className="font-bold text-xl">Add Certification</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const renderContact = () => {
    const allSocials = [
      { id: 'email', icon: Mail, pre: 'mailto:', label: 'Email' },
      { id: 'phone', icon: Phone, pre: 'tel:', label: 'Phone' },
      { id: 'linkedin', icon: Linkedin, pre: 'https://linkedin.com/in/', label: 'LinkedIn' },
      { id: 'github', icon: Github, pre: 'https://github.com/', label: 'GitHub' },
      { id: 'twitter', icon: Twitter, pre: 'https://twitter.com/', label: 'Twitter' }
    ];

    const contactLinks = allSocials.filter(social => isEditing ? (data.contact[social.id] !== null && data.contact[social.id] !== undefined) : !!data.contact[social.id]);
    const availableToAdd = allSocials.filter(social => data.contact[social.id] == null);

    return (
      <section className="py-32 scroll-mt-24 relative" id="contact">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-500/5 dark:to-indigo-500/10 pointer-events-none -z-10"></div>
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
            <SectionHeader sectionObj={data.contact} sectionKey="contact" desc="Ready to create something magnificent? Send me a message." />
            {contactLinks.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
              {contactLinks.map(social => (
                <div key={social.id} className="glass-card p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-6 group hover:-translate-y-2 hover:border-indigo-500/50 transition-all flex-grow basis-[240px] max-w-sm relative">
                  {isEditing && <button className="absolute top-6 right-6 bg-red-100 dark:bg-red-900/30 text-red-500 hover:text-white hover:bg-red-500 p-3 rounded-full transition-colors z-20" onClick={() => handleChange('contact', social.id, null)}><Trash2 size={18} /></button>}
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner">
                    <social.icon size={32} />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <span className="text-xs font-black tracking-widest text-slate-400 uppercase">{social.label}</span>
                    {!isEditing ? (
                      <a href={social.id === 'email' ? `mailto:${data.contact.email}` : social.id === 'phone' ? `tel:${data.contact.phone}` : ensureProtocol(data.contact[social.id].includes('http') ? data.contact[social.id] : `${social.pre}${data.contact[social.id]}`)} target="_blank" rel="noreferrer" className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-500 truncate w-full px-2">
                        {social.id === 'email' ? data.contact.email : social.id === 'phone' ? data.contact.phone : (data.contact[social.id].includes('http') ? 'Profile' : `@${data.contact[social.id].replace(/^@/, '')}`)}
                      </a>
                    ) : (
                      <InputField value={data.contact[social.id]} onChange={(v) => handleChange('contact', social.id, v)} placeholder="Leave blank to hide" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <div className="text-center text-slate-500 font-medium p-10 mt-4 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700">No contact methods configured.</div>
            )}

            {isEditing && availableToAdd.length > 0 && (
              <div className="mt-12">
                <p className="text-center text-slate-500 font-medium mb-6 uppercase tracking-wider text-sm">Add Connection Methods</p>
                <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                  {availableToAdd.map(social => (
                    <button key={social.id} className="glass-card px-6 py-4 rounded-[1.5rem] flex items-center gap-3 font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-500 hover:border-indigo-500/50 transition-all" onClick={() => handleChange('contact', social.id, '')}>
                      <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full"><social.icon size={18} /></div> Add {social.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>
      </section>
    );
  };

  const renderSectionMap = {
    hero: renderHero, about: renderAbout, skills: renderSkills, projects: renderProjects, experience: renderExperience, achievements: renderAchievements, contact: renderContact
  };

  return (
    <>
      {/* Background Base */}
      <div className="fixed inset-0 bg-[#fafafa] dark:bg-[#050505] -z-30 transition-colors duration-1000"></div>
      
      {/* Light Theme Linear Grid Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20 transition-opacity duration-1000 dark:opacity-0 opacity-100 text-slate-900">
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute left-0 right-0 top-0 m-auto h-[500px] w-[800px] rounded-full bg-indigo-500/10 blur-[100px] translate-y-[-200px]"></div>
      </div>

      {/* Dark Theme Linear Grid Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20 transition-opacity duration-1000 dark:opacity-100 opacity-0 text-white">
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute left-0 right-0 top-[-10%] m-auto h-[400px] w-[600px] rounded-full bg-indigo-500/20 blur-[120px]"></div>
      </div>
      
      <div className="min-h-screen relative pb-32">
        <nav className="fixed top-0 left-0 right-0 z-50 nav-glass">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-12 py-5">
            <div className="text-2xl font-black font-outfit text-slate-900 dark:text-white tracking-tighter">
              {data.hero.name} <span className="text-gradient">{data.hero.lastName}</span>
            </div>
            <div className="hidden lg:flex items-center gap-8 text-sm font-bold tracking-wider uppercase font-outfit">
              {data.layout.filter(l => l.visible).map(l => (
                <a key={l.id} href={`#${l.id}`} className={`nav-link relative py-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors before:absolute before:bottom-0 before:left-0 before:h-[3px] before:rounded-t-full before:bg-indigo-500 before:transition-all before:duration-300 ${activeSection === l.id ? 'text-slate-900 dark:!text-white before:w-full' : 'before:w-0 hover:before:w-1/2'}`}>
                  {data[l.id]?.title || l.id}
                </a>
              ))}
              {data.layout.find(l => l.id === 'contact' && l.visible) && (
              <button onClick={(e) => { e.preventDefault(); setShowHireMeModal(true); }} className="ml-4 btn-primary px-7 py-3 rounded-full font-bold tracking-wider uppercase text-sm font-outfit">
                HIRE ME
              </button>
              )}
              <button className="ml-2 w-12 h-12 rounded-full glass-card hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all border-none" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Toggle Theme">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </nav>

        <div className="fixed bottom-8 right-8 flex gap-4 z-[9999] bg-white/90 dark:bg-[#111111]/90 backdrop-blur-xl p-3 rounded-full shadow-2xl border border-slate-200 dark:border-white/10">
          <button className={`flex items-center gap-2 px-6 py-4 rounded-full font-bold text-sm transition-all ${isEditing ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'}`} onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? <Check size={18} /> : <Edit2 size={18} />}
            <span className="hidden sm:inline">{isEditing ? 'Save Design' : 'Customize Portfolio'}</span>
          </button>
          <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-full font-bold text-sm shadow-md hover:scale-105 transition-all" onClick={() => setShowExportModal(true)}>
            <Download size={18} /> <span className="hidden sm:inline">Export Zip</span>
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="portfolio">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {data.layout.map((item, index) => {
                  if (!item.visible && !isEditing) return null;
                  return (
                    <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={!isEditing || item.locked}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`relative rounded-[3rem] ${isEditing ? 'border-4 border-dashed border-transparent hover:border-indigo-500/50 mt-12 py-10 bg-slate-50/80 dark:bg-slate-900/40 backdrop-blur-xl' : ''} ${!item.visible ? 'opacity-30 grayscale' : ''} ${snapshot.isDragging ? 'z-50 shadow-2xl scale-[1.02] bg-white dark:bg-[#050505]' : 'transition-transform'}`}
                          style={{ ...provided.draggableProps.style }}
                        >
                          {isEditing && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full z-40 shadow-xl opacity-0 hover:opacity-100 transition-opacity" style={{opacity: snapshot.isDragging ? 1 : undefined}}>
                              {!item.locked && <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-indigo-500"><GripVertical size={20} /></div>}
                              <span className="text-xs font-black tracking-widest text-indigo-500 uppercase">{item.id.replace('custom_', 'Custom ')}</span>
                              {!item.locked && (
                                <>
                                  <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" title="Toggle Visibility" onClick={() => toggleSectionVisibility(item.id)}>{item.visible ? <Eye size={18} /> : <EyeOff size={18} />}</button>
                                  <button className="text-slate-400 hover:text-red-500 transition-colors ml-2 border-l border-slate-200 dark:border-slate-700 pl-4" title="Delete Section" onClick={() => performRemoveSection(item.id)}><Trash2 size={18} /></button>
                                </>
                              )}
                            </div>
                          )}
                          {item.id.startsWith('custom_') ? renderCustom(item) : renderSectionMap[item.id]()}
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

        {/* Editing Tools Bottom Bar */}
        {isEditing && (
          <div className="max-w-4xl mx-auto mt-16 p-8 glass-card border-dashed border-2 border-indigo-500 rounded-[2.5rem] flex flex-col items-center gap-6">
             <h4 className="text-2xl font-black text-slate-900 dark:text-white">Add New Section</h4>
             <div className="flex flex-wrap justify-center gap-4">
               <button className="px-6 py-3 bg-indigo-500 text-white rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]" onClick={addCustomSection}>
                 <PlusSquare size={18} /> Standard Custom Block
               </button>
               {missingSections.map(s => (
                 <button key={s} className="px-6 py-3 glass-card rounded-full font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:border-indigo-500 transition-all uppercase text-sm tracking-wider" onClick={() => restoreBuiltInSection(s)}>
                   <Plus size={16} /> Restore {s}
                 </button>
               ))}
             </div>
          </div>
        )}

        {showExportModal && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xl z-[999] flex items-center justify-center animate-in fade-in" onClick={() => setShowExportModal(false)}>
            <div className="bg-white dark:bg-[#080808] border border-slate-200 dark:border-white/10 rounded-[3rem] p-12 w-[90%] max-w-2xl relative text-center shadow-[0_0_100px_rgba(0,0,0,0.5)]" onClick={e => e.stopPropagation()}>
              <button className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-white/5 p-3 rounded-full" onClick={() => setShowExportModal(false)}><X size={24} /></button>
              <h3 className="text-4xl font-black font-outfit text-slate-900 dark:text-white mb-4 tracking-tight">Finalize Export</h3>
              <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 font-medium">Select a permanent theme for your generated standalone site.</p>
              
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className={`border-2 rounded-[2rem] p-8 cursor-pointer flex flex-col items-center gap-6 transition-all ${exportThemeChoice === 'light' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-xl shadow-indigo-500/20 scale-105' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-[#050505]'}`} onClick={() => setExportThemeChoice('light')}>
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${exportThemeChoice === 'light' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}><Sun size={36} /></div>
                  <div className="font-extrabold text-xl text-slate-900 dark:text-white uppercase tracking-wider">Light Edition</div>
                </div>
                <div className={`border-2 rounded-[2rem] p-8 cursor-pointer flex flex-col items-center gap-6 transition-all ${exportThemeChoice === 'dark' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-xl shadow-indigo-500/20 scale-105' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-[#050505]'}`} onClick={() => setExportThemeChoice('dark')}>
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${exportThemeChoice === 'dark' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}><Moon size={36} /></div>
                  <div className="font-extrabold text-xl text-slate-900 dark:text-white uppercase tracking-wider">Dark Edition</div>
                </div>
              </div>

              <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-6 rounded-2xl font-black text-xl flex justify-center items-center gap-3 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-1 transition-all" onClick={performExport}>
                GENERATE ZIP BUNDLE <Download size={24} />
              </button>
            </div>
          </div>
        )}

        {showHireMeModal && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xl z-[999] flex items-center justify-center animate-in fade-in" onClick={() => setShowHireMeModal(false)}>
            <div className="bg-white dark:bg-[#080808] border border-slate-200 dark:border-white/10 rounded-[3rem] p-8 md:p-12 w-[95%] max-w-4xl relative text-center shadow-[0_0_100px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <button className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-white/5 p-3 rounded-full" onClick={() => setShowHireMeModal(false)}><X size={24} /></button>
              <h3 className="text-3xl md:text-4xl font-black font-outfit text-slate-900 dark:text-white mb-4 tracking-tight">Let's Work Together</h3>
              <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 font-medium">Reach out via any of the platforms below.</p>
              
              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                {[
                  { id: 'email', icon: Mail, pre: 'mailto:', label: 'Email' },
                  { id: 'phone', icon: Phone, pre: 'tel:', label: 'Phone' },
                  { id: 'linkedin', icon: Linkedin, pre: 'https://linkedin.com/in/', label: 'LinkedIn' },
                  { id: 'github', icon: Github, pre: 'https://github.com/', label: 'GitHub' },
                  { id: 'twitter', icon: Twitter, pre: 'https://twitter.com/', label: 'Twitter' }
                ].filter(social => data.contact[social.id]).map(social => (
                  <a key={social.id} href={social.id === 'email' ? `mailto:${data.contact.email}` : social.id === 'phone' ? `tel:${data.contact.phone}` : ensureProtocol(data.contact[social.id].includes('http') ? data.contact[social.id] : `${social.pre}${data.contact[social.id]}`)} target="_blank" rel="noreferrer" className="glass-card p-6 md:p-8 rounded-[2rem] flex flex-col items-center justify-center text-center gap-4 group hover:-translate-y-2 hover:border-indigo-500/50 transition-all flex-grow basis-[180px] max-w-[240px]">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner">
                      <social.icon size={28} />
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <span className="text-[10px] md:text-xs font-black tracking-widest text-slate-400 uppercase">{social.label}</span>
                      <span className="font-bold text-sm md:text-base text-slate-900 dark:text-white group-hover:text-indigo-500 truncate w-full block">
                        {social.id === 'email' || social.id === 'phone' ? data.contact[social.id] : (data.contact[social.id].includes('http') ? 'Profile' : `@${data.contact[social.id].replace(/^@/, '')}`)}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
