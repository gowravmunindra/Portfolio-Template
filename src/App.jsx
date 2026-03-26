import React, { useState, useEffect } from 'react';
import { initialData } from './data';
import { exportPortfolio } from './exportApp';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Download, Edit2, Check, ExternalLink, Plus, Trash2, 
  Github, Linkedin, Mail, Twitter, GripVertical, Eye, EyeOff, Upload,
  Sun, Moon, X, ChevronRight, Sparkles, Phone, PlusSquare, ArrowRight, Layout
} from 'lucide-react';

const ensureProtocol = (url) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) return url;
  return `https://${url}`;
};

const InputField = ({ value, onChange, isTextArea = false, className = '', placeholder = '' }) => {
  const baseClasses = "bg-white/5 dark:bg-white/5 border border-dashed border-indigo-400/50 rounded-xl p-3 outline-none focus:bg-white/10 dark:focus:bg-white/10 transition-all w-full font-inter placeholder-gray-400";
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

  // Theme Sync
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Handle Scroll Spy and Animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
          entry.target.classList.add('opacity-100', 'translate-y-0');
        }
      });
    }, { threshold: 0.2 });

    const sections = document.querySelectorAll('section, .hero-section');
    sections.forEach(sec => {
      sec.classList.add('transition-all', 'duration-700', 'ease-out', 'opacity-0', 'translate-y-8');
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

  const handleProjectImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { handleArrayChange('projects', index, 'imageUrl', reader.result); };
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

  // Section Header Component
  const SectionHeader = ({ sectionObj, sectionKey, desc }) => (
    <div className="max-w-4xl mx-auto text-center mb-16 px-4">
      {isEditing ? (
        <InputField 
          value={sectionObj.title} 
          onChange={(v) => handleChange(sectionKey, 'title', v)} 
          className="text-4xl font-extrabold text-center mb-4 bg-transparent border-none focus:ring-0 placeholder:opacity-50" 
          placeholder="Section Title"
        />
      ) : (
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
          {sectionObj.title}
        </h2>
      )}
      {desc && <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">{desc}</p>}
      <div className="mt-4 w-24 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full opacity-50"></div>
    </div>
  );

  const renderHero = () => (
    <section className="hero-section min-h-screen flex items-center pt-32 pb-20 relative overflow-hidden" id="hero">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] -z-10 animate-pulse delay-1000"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <div className="text-center lg:text-left">
          {(!isEditing && !data.hero.greeting) ? null : isEditing ? (
            <InputField value={data.hero.greeting} onChange={(v) => handleChange('hero', 'greeting', v)} className="mb-6 max-w-sm mx-auto lg:mx-0" placeholder="e.g. HELLO THERE" />
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 backdrop-blur-sm">
              <Sparkles size={16} className="text-indigo-500" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">
                {data.hero.greeting}
              </span>
            </div>
          )}

          {!isEditing ? (
            <h1 className="text-5xl sm:text-7xl xl:text-8xl font-black mb-8 leading-[1.1] tracking-tight text-gray-900 dark:text-white">
              I'm <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent block mt-4">{data.hero.name} {data.hero.lastName}</span>
            </h1>
          ) : (
            <div className="flex flex-col gap-4 mb-8">
              <h1 className="text-4xl font-black text-gray-900 dark:text-gray-400">I'm</h1>
              <InputField value={data.hero.name} onChange={(v) => handleChange('hero', 'name', v)} className="text-4xl md:text-6xl font-black" placeholder="First Name" />
              <InputField value={data.hero.lastName} onChange={(v) => handleChange('hero', 'lastName', v)} className="text-4xl md:text-6xl font-black" placeholder="Last Name" />
            </div>
          )}

          {(!isEditing && !data.hero.role) ? null : isEditing ? (
            <div className="space-y-3 max-w-lg mb-12">
              <InputField value={data.hero.rolePrefix} onChange={(v) => handleChange('hero', 'rolePrefix', v)} placeholder="Role Prefix (e.g. I am a)" />
              <InputField value={data.hero.role} onChange={(v) => handleChange('hero', 'role', v)} className="text-indigo-500 font-bold" placeholder="Primary Role" />
              <InputField value={data.hero.roleSuffix} onChange={(v) => handleChange('hero', 'roleSuffix', v)} placeholder="Role Suffix" />
            </div>
          ) : (
            <p className="text-xl md:text-2xl font-medium text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {data.hero.rolePrefix} <span className="text-gray-900 dark:text-white font-bold">{data.hero.role}</span> {data.hero.roleSuffix}
            </p>
          )}

          <div className="flex flex-wrap justify-center lg:justify-start gap-5">
            {data.layout.find(l => l.id === 'projects' && l.visible) && (
              <button 
                onClick={() => document.getElementById('projects')?.scrollIntoView({behavior: 'smooth'})}
                className="group bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300 hover:scale-105 shadow-xl shadow-indigo-600/20"
              >
                View My Projects <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            {data.layout.find(l => l.id === 'contact' && l.visible) && (
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({behavior: 'smooth'})}
                className="bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 backdrop-blur-md px-8 py-4 rounded-2xl font-bold text-gray-900 dark:text-white transition-all duration-300 hover:scale-105"
              >
                Get in Touch
              </button>
            )}
          </div>
        </div>
        
        <div className="relative group mx-auto lg:ml-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative aspect-square w-full max-w-[450px] rounded-[2.5rem] overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl transition hover:rotate-1">
            <img 
              src={data.hero.profileImage} 
              alt="Profile" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {isEditing && (
              <label className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload size={32} className="text-white mb-2" />
                <span className="text-white font-bold">Change Image</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  const renderAbout = () => (
    <section className="py-24 scroll-mt-24" id="about">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="relative group">
          <div className="absolute -inset-px bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-[2px] opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl p-10 md:p-16 border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Sparkles size={120} className="text-indigo-500" />
            </div>
            
            <div className="relative z-10 text-center max-w-4xl mx-auto">
              {isEditing ? (
                <div className="space-y-6">
                  <InputField value={data.about.title} onChange={(v) => handleChange('about', 'title', v)} className="text-xl font-bold text-center text-indigo-500 uppercase tracking-widest" placeholder="Section Subtitle" />
                  <InputField value={data.about.bio} onChange={(v) => handleChange('about', 'bio', v)} isTextArea className="text-3xl text-center leading-relaxed font-medium" placeholder="Write your professional bio..." />
                </div>
              ) : (
                <>
                  <span className="text-xs font-black tracking-[0.3em] uppercase text-indigo-500 inline-block mb-6">{data.about.title || 'About Me'}</span>
                  <p className="text-2xl md:text-4xl text-gray-800 dark:text-gray-200 font-medium leading-[1.6] tracking-tight">
                    "{data.about.bio}"
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderSkills = () => (
    <section className="py-24 scroll-mt-24" id="skills">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeader sectionObj={data.skills} sectionKey="skills" desc="A curated list of my specialized skills and technology stack." />
        {isEditing ? (
          <div className="max-w-3xl mx-auto bg-white/5 p-8 rounded-2xl border border-dashed border-indigo-400">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-widest">List skills separated by commas</p>
            <textarea className="w-full h-40 bg-transparent text-xl font-medium text-white p-4 outline-none resize-none" value={data.skills.items.join(', ')} onChange={handleSkillsChange} />
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
            {data.skills.items.filter(Boolean).map((skill, index) => (
              <div 
                key={index} 
                className="px-8 py-4 rounded-2xl font-bold text-gray-700 dark:text-gray-300 bg-white/5 hover:bg-indigo-500 hover:text-white border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20 cursor-default"
              >
                {skill}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  const renderProjects = () => (
    <section className="py-24 scroll-mt-24" id="projects">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeader sectionObj={data.projects} sectionKey="projects" desc="A curated gallery of my latest work, bridging innovation with impact through media-rich showcases." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.projects.items.map((project, index) => (
            <div key={project.id} className="group relative bg-white dark:bg-gray-800/40 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col">
              
              {/* Media Preview Section */}
              <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                {project.videoUrl ? (
                  <iframe
                    className="w-full h-full"
                    src={project.videoUrl}
                    title={project.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : project.imageUrl ? (
                  <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <Layout size={64} className="text-gray-300 dark:text-gray-700" />
                )}

                {/* Hover Overlay with Quick Links */}
                {!isEditing && (
                  <div className="absolute inset-0 bg-indigo-900/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    {project.link && (
                      <a href={ensureProtocol(project.link)} target="_blank" rel="noopener noreferrer" className="p-3 bg-white text-indigo-600 rounded-full hover:scale-110 transition-transform shadow-xl" title="Live Preview">
                        <ExternalLink size={24} />
                      </a>
                    )}
                    {project.codeLink && (
                      <a href={ensureProtocol(project.codeLink)} target="_blank" rel="noopener noreferrer" className="p-3 bg-white text-gray-900 rounded-full hover:scale-110 transition-transform shadow-xl" title="Source Code">
                        <Github size={24} />
                      </a>
                    )}
                  </div>
                )}
              </div>
              
              <div className="p-8 grow">
                {isEditing ? (
                  <div className="space-y-4">
                    <InputField value={project.title} onChange={(v) => handleArrayChange('projects', index, 'title', v)} className="text-xl font-bold" placeholder="Project Name" />
                    <InputField value={project.description} onChange={(v) => handleArrayChange('projects', index, 'description', v)} isTextArea className="text-sm" placeholder="Detailed project impact..." />
                    
                    <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10 space-y-4">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-indigo-700 transition-colors">
                          <Upload size={14} /> Upload Screenshot
                          <input type="file" accept="image/*" onChange={(e) => handleProjectImageUpload(e, index)} className="hidden" />
                        </label>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">OR PASTE URL</span>
                      </div>
                      <InputField value={project.imageUrl} onChange={(v) => handleArrayChange('projects', index, 'imageUrl', v)} className="text-xs" placeholder="Image URL (Alternative)" />
                      <InputField value={project.videoUrl} onChange={(v) => handleArrayChange('projects', index, 'videoUrl', v)} className="text-xs" placeholder="YouTube Embed URL (Optional)" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <InputField value={project.link} onChange={(v) => handleArrayChange('projects', index, 'link', v)} className="text-xs" placeholder="Live Site" />
                      <InputField value={project.codeLink} onChange={(v) => handleArrayChange('projects', index, 'codeLink', v)} className="text-xs" placeholder="GitHub Link" />
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-black mb-3 text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors uppercase tracking-tight line-clamp-1">{project.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-6 line-clamp-3 text-sm italic">"{project.description}"</p>
                    
                    <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/30">
                      {project.link && (
                        <a href={ensureProtocol(project.link)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:gap-3 transition-all">
                          Live Demo <ArrowRight size={16} />
                        </a>
                      )}
                      {project.codeLink && (
                        <a href={ensureProtocol(project.codeLink)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all ml-auto">
                          <Github size={16} /> Code
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>

              {isEditing && (
                <button className="absolute top-4 right-4 bg-rose-500 text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-transform" onClick={() => removeItemSectionItem('projects', project.id)}>
                   <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}

          {isEditing && (
            <button 
              onClick={() => addItem('projects', { title: "Next Innovation", description: "Seamless user experiences.", link: "", codeLink: "", imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800", videoUrl: "" })}
              className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-indigo-400 rounded-3xl bg-indigo-500/[0.03] hover:bg-indigo-500/[0.08] transition-all text-indigo-500 shadow-inner group"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus size={32} />
              </div>
              <span className="font-black uppercase tracking-widest text-sm">Add Portfolio Media Case</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );

  const renderExperience = () => (
    <section className="py-24 scroll-mt-24" id="experience">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <SectionHeader sectionObj={data.experience} sectionKey="experience" desc="My professional journey and key achievements in the industry." />
        <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-0 md:before:left-1/2 md:before:-translate-x-px before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-purple-500 before:to-pink-500 before:opacity-30">
          {data.experience.items.map((exp, index) => (
            <div key={exp.id} className="relative group perspective">
              <div className={`md:flex items-center justify-between ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="hidden md:block w-1/2"></div>
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-0 md:top-1/2 md:-translate-y-1/2 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white dark:border-gray-900 shadow-[0_0_15px_rgba(79,70,229,0.5)] group-hover:scale-150 transition-transform duration-300 z-10"></div>
                <div className="md:w-[45%] ml-8 md:ml-0">
                  <div className="bg-white dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl group-hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group-hover:border-indigo-500/50">
                    <div className="flex flex-col gap-4">
                      {isEditing ? (
                        <div className="space-y-3">
                          <InputField value={exp.title} onChange={(v) => handleArrayChange('experience', index, 'title', v)} className="text-xl font-bold" placeholder="Job Title" />
                          <InputField value={exp.organization} onChange={(v) => handleArrayChange('experience', index, 'organization', v)} className="text-sm font-bold text-indigo-500" placeholder="Company/Organization" />
                          <InputField value={exp.duration} onChange={(v) => handleArrayChange('experience', index, 'duration', v)} className="text-xs" placeholder="Time Frame" />
                          <InputField value={exp.description} onChange={(v) => handleArrayChange('experience', index, 'description', v)} isTextArea className="text-sm" placeholder="Key responsibilities..." />
                          <InputField value={exp.achievements} onChange={(v) => handleArrayChange('experience', index, 'achievements', v)} className="text-xs font-semibold" placeholder="Core accomplishment" />
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-1">{exp.title}</h4>
                              <p className="text-indigo-500 font-bold uppercase tracking-widest text-sm">{exp.organization}</p>
                            </div>
                            <span className="text-xs font-black px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full text-gray-500 dark:text-gray-400 whitespace-nowrap uppercase tracking-tighter">
                              {exp.duration}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic">{exp.description}</p>
                          {exp.achievements && (
                            <div className="mt-2 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                              <p className="text-gray-900 dark:text-gray-200 font-bold text-sm flex items-center gap-2 tracking-tight">
                                <Sparkles className="text-indigo-500" size={16} />
                                {exp.achievements}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {isEditing && (
                <button className="absolute -top-3 -right-3 bg-rose-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20" onClick={() => removeItemSectionItem('experience', exp.id)}>
                   <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          {isEditing && (
            <button 
              onClick={() => addItem('experience', { title: "Role", organization: "Organization", duration: "20XX - 20XX", description: "Elevating the standards of production...", achievements: "Directly increased workflow efficiency." })}
              className="w-full py-6 border-2 border-dashed border-indigo-400 rounded-3xl bg-indigo-500/5 hover:bg-indigo-500/10 transition-all text-indigo-500 font-bold flex items-center justify-center gap-3"
            >
              <PlusSquare size={20} /> Append New Experience
            </button>
          )}
        </div>
      </div>
    </section>
  );

  const renderAchievements = () => (
    <section className="py-24 scroll-mt-24" id="achievements">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeader sectionObj={data.achievements} sectionKey="achievements" desc="Milestones and professional accolades earned through dedication." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {data.achievements.items.map((ach, index) => (
            <div key={ach.id} className="group flex flex-col p-10 bg-white dark:bg-gray-800/40 rounded-[2rem] border border-gray-200 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform group-hover:opacity-20">
                <Sparkles size={100} className="text-purple-500" />
              </div>
              
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-500 mb-8 border border-indigo-500/20">
                <Sparkles size={24} />
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <InputField value={ach.title} onChange={(v) => handleArrayChange('achievements', index, 'title', v)} className="text-xl font-bold" placeholder="Achievement Name" />
                  <div className="flex gap-4">
                    <InputField value={ach.issuer} onChange={(v) => handleArrayChange('achievements', index, 'issuer', v)} placeholder="Issuer" />
                    <InputField value={ach.date} onChange={(v) => handleArrayChange('achievements', index, 'date', v)} placeholder="Date" />
                  </div>
                  <InputField value={ach.description} onChange={(v) => handleArrayChange('achievements', index, 'description', v)} isTextArea placeholder="Context and details..." />
                  <InputField value={ach.link} onChange={(v) => handleArrayChange('achievements', index, 'link', v)} placeholder="Credential Link" />
                </div>
              ) : (
                <>
                  <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight leading-snug">{ach.title}</h4>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-500">{ach.issuer}</span>
                    {ach.date && <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>}
                    <span className="text-xs font-bold text-gray-500">{ach.date}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic mb-8 grow">"{ach.description}"</p>
                  {ach.link && (
                    <a href={ensureProtocol(ach.link)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-500 font-bold hover:gap-3 transition-all border-b border-transparent hover:border-indigo-500 pb-0.5 w-fit">
                      Verify Achievement <ArrowRight size={16} />
                    </a>
                  )}
                </>
              )}
              {isEditing && (
                <button className="absolute top-4 right-4 bg-rose-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeItemSectionItem('achievements', ach.id)}>
                   <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          {isEditing && (
            <button 
              onClick={() => addItem('achievements', { title: "New Distinction", issuer: "Authority", date: "Year", description: "A testament to professional growth.", link: "" })}
              className="flex items-center justify-center p-12 border-2 border-dashed border-indigo-400 rounded-[2rem] bg-indigo-500/5 hover:bg-indigo-500/10 transition-all text-indigo-500 font-bold gap-3"
            >
              <Plus size={24} /> New Certification
            </button>
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
      <section className="py-24 scroll-mt-24" id="contact">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <SectionHeader sectionObj={data.contact} sectionKey="contact" desc="Interested in collaboration or have a project in mind? Let's connect." />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {contactLinks.map(social => (
                <div key={social.id} className="group relative bg-white dark:bg-gray-800/60 p-10 rounded-3xl border border-gray-200 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex flex-col items-center gap-6 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-indigo-500 group-hover:rotate-6 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-all duration-300">
                      <social.icon size={36} />
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-2 block">{social.label}</span>
                      {isEditing ? (
                        <InputField value={data.contact[social.id]} onChange={(v) => handleChange('contact', social.id, v)} className="text-center" placeholder={`Enter ${social.label}...`} />
                      ) : (
                        <a href={social.id === 'email' ? `mailto:${data.contact.email}` : social.id === 'phone' ? `tel:${data.contact.phone}` : ensureProtocol(data.contact[social.id].includes('http') ? data.contact[social.id] : `${social.pre}${data.contact[social.id]}`)} target="_blank" rel="noreferrer" className="text-xl font-bold text-gray-900 dark:text-white hover:text-indigo-500 transition-colors break-all">
                          {social.id === 'email' ? data.contact.email : social.id === 'phone' ? data.contact.phone : (data.contact[social.id].includes('http') ? 'View Profile' : `@${data.contact[social.id].replace(/^@/, '')}`)}
                        </a>
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <button className="absolute top-4 right-4 text-rose-500 p-2 hover:bg-rose-50 rounded-lg transition-colors" onClick={() => handleChange('contact', social.id, null)}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isEditing && availableToAdd.length > 0 && (
              <div className="mt-16 text-center">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-8 italic invisible md:visible">Expand Your Reach</p>
                <div className="flex flex-wrap justify-center gap-4">
                  {availableToAdd.map(social => (
                    <button key={social.id} onClick={() => handleChange('contact', social.id, '')} className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all font-bold text-gray-500 hover:text-indigo-500">
                      <social.icon size={20} /> Add {social.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>
      </section>
    );
  };

  const renderCustom = (item) => (
    <section className="py-24 scroll-mt-24" id={item.id} key={item.id}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800/40 p-12 md:p-20 rounded-[3rem] border border-gray-200 dark:border-gray-700 shadow-xl relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          {isEditing ? (
            <div className="space-y-8">
              <InputField value={data[item.id].title} onChange={(v) => handleChange(item.id, 'title', v)} className="text-3xl font-black text-center" placeholder="Section Header" />
              <InputField value={data[item.id].content} onChange={(v) => handleChange(item.id, 'content', v)} isTextArea className="text-xl text-center" placeholder="Content details..." />
            </div>
          ) : (
            <>
              {data[item.id].title && <h3 className="text-4xl md:text-5xl font-black mb-10 text-gray-900 dark:text-white tracking-tight">{data[item.id].title}</h3>}
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed whitespace-pre-wrap">{data[item.id].content}</p>
            </>
          )}
        </div>
      </div>
    </section>
  );

  const renderSectionMap = {
    hero: renderHero, about: renderAbout, skills: renderSkills, projects: renderProjects, experience: renderExperience, achievements: renderAchievements, contact: renderContact
  };

  return (
    <div className="selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-50 bg-white dark:bg-gray-900 transition-colors duration-700"></div>
      <div className="fixed inset-0 -z-40 overflow-hidden pointer-events-none opacity-40">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-indigo-500/10 blur-[120px] animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-purple-500/10 blur-[120px] animate-pulse delay-700"></div>
      </div>
      
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-12 py-5">
          <div className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            {data.hero.name} <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent group-hover:to-pink-500 transition-all duration-500">{data.hero.lastName}</span>
          </div>
          <div className="hidden lg:flex items-center gap-10">
            {data.layout.filter(l => l.visible).map(l => (
              <a 
                key={l.id} 
                href={`#${l.id}`} 
                className={`text-sm font-black uppercase tracking-widest transition-all duration-300 relative py-2 ${activeSection === l.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
              >
                {data[l.id]?.title?.split(' ')[0] || l.id}
                {activeSection === l.id && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-full"></span>}
              </a>
            ))}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-3 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:scale-110 transition-all"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {data.layout.find(l => l.id === 'contact' && l.visible) && (
              <button 
                onClick={() => setShowHireMeModal(true)}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-2xl font-black text-sm tracking-widest uppercase hover:scale-105 transition-all shadow-xl"
              >
                Let's Talk
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Control Panel Floating */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex gap-4 p-4 rounded-[2.5rem] bg-gray-900/90 dark:bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/10 dark:border-black/10 items-center">
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`group flex items-center gap-3 px-8 py-4 rounded-[1.8rem] font-black text-sm uppercase tracking-widest transition-all ${isEditing ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-white dark:text-gray-900 hover:bg-white/10 dark:hover:bg-black/5'}`}
        >
          {isEditing ? <Check size={18} className="animate-bounce" /> : <Edit2 size={18} />}
          <span className="hidden sm:inline">{isEditing ? 'Save Changes' : 'Design Mode'}</span>
        </button>
        <div className="w-px h-8 bg-white/20 dark:bg-black/10"></div>
        <button 
          onClick={() => setShowExportModal(true)}
          className="group flex items-center gap-3 text-white dark:text-gray-900 hover:scale-110 transition-all px-4"
          title="Export Project"
        >
          <Download size={24} />
          <span className="hidden lg:inline text-xs font-black uppercase tracking-tighter">Export Zip</span>
        </button>
      </div>

      <main className="min-h-screen pb-40">
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
                          className={`relative ${isEditing ? 'border-4 border-dashed border-indigo-400/20 rounded-[4rem] my-16 py-12 bg-indigo-500/[0.02] dark:bg-indigo-500/[0.01]' : ''} ${!item.visible ? 'opacity-30' : ''} ${snapshot.isDragging ? 'z-50 shadow-2xl scale-[1.02] bg-white dark:bg-gray-800' : 'transition-transform duration-500'}`}
                        >
                          {isEditing && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full z-40 shadow-2xl">
                              {!item.locked && <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-indigo-500"><GripVertical size={20} /></div>}
                              <span className="text-[10px] font-black tracking-[0.3em] text-gray-500 dark:text-gray-400 uppercase">{item.id.replace('custom_', 'Global ')}</span>
                              {!item.locked && (
                                <>
                                  <button className="text-gray-400 hover:text-indigo-500 transition-colors" title="Visibility" onClick={() => toggleSectionVisibility(item.id)}>{item.visible ? <Eye size={18} /> : <EyeOff size={18} />}</button>
                                  <button className="text-gray-400 hover:text-rose-500 transition-colors" title="Delete" onClick={() => performRemoveSection(item.id)}><Trash2 size={18} /></button>
                                </>
                              )}
                            </div>
                          )}
                          {item.id.startsWith('custom_') ? renderCustom(item) : (renderSectionMap[item.id] ? renderSectionMap[item.id]() : null)}
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
          <div className="max-w-4xl mx-auto mt-20 p-12 border-4 border-dashed border-indigo-500/30 rounded-[3rem] text-center bg-white/5">
             <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter italic">Build Your Narrative</h4>
             <div className="flex flex-wrap justify-center gap-4">
               <button onClick={addCustomSection} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-indigo-600/20">
                 <PlusSquare size={20} /> New Custom Block
               </button>
               {missingSections.map(s => (
                 <button key={s} onClick={() => restoreBuiltInSection(s)} className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-bold flex items-center gap-3 hover:border-indigo-500/50 border border-transparent transition-all uppercase text-xs tracking-widest">
                   <Plus size={18} /> Restore {s}
                 </button>
               ))}
             </div>
          </div>
        )}
      </main>

      {/* Modals with Premium Blur */}
      {showExportModal && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/90 backdrop-blur-2xl z-[1000] flex items-center justify-center p-6" onClick={() => setShowExportModal(false)}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[3rem] p-10 md:p-16 w-full max-w-2xl relative shadow-[0_0_100px_rgba(0,0,0,0.3)]" onClick={e => e.stopPropagation()}>
            <button className="absolute top-8 right-8 p-3 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" onClick={() => setShowExportModal(false)}><X size={24} /></button>
            <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">Ready for the world?</h3>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 font-medium">Select the permanent aesthetic for your standalone site.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <button 
                onClick={() => setExportThemeChoice('light')}
                className={`flex flex-col items-center gap-6 p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${exportThemeChoice === 'light' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-2xl scale-105' : 'border-gray-100 dark:border-gray-800 opacity-60 hover:opacity-100'}`}
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${exportThemeChoice === 'light' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}><Sun size={40} /></div>
                <span className="font-black uppercase tracking-widest text-lg text-gray-900 dark:text-white">Pristine Light</span>
              </button>
              <button 
                onClick={() => setExportThemeChoice('dark')}
                className={`flex flex-col items-center gap-6 p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${exportThemeChoice === 'dark' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-2xl scale-105' : 'border-gray-100 dark:border-gray-800 opacity-60 hover:opacity-100'}`}
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${exportThemeChoice === 'dark' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}><Moon size={40} /></div>
                <span className="font-black uppercase tracking-widest text-lg text-gray-900 dark:text-white">Premium Dark</span>
              </button>
            </div>

            <button onClick={performExport} className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl shadow-indigo-600/30 flex justify-center items-center gap-4">
              GENERATE PRODUCTION BUNDLE <Download size={24} />
            </button>
          </div>
        </div>
      )}

      {showHireMeModal && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/90 backdrop-blur-2xl z-[1000] flex items-center justify-center p-6" onClick={() => setShowHireMeModal(false)}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[3rem] p-10 md:p-16 w-full max-w-4xl relative shadow-[0_0_100px_rgba(0,0,0,0.3)] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button className="absolute top-8 right-8 p-3 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" onClick={() => setShowHireMeModal(false)}><X size={24} /></button>
            <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter uppercase italic">Let's Create Excellence</h3>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 font-medium">I am currently available for new projects and collaborations.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allSocials.filter(social => data.contact[social.id]).map(social => (
                <a key={social.id} href={social.id === 'email' ? `mailto:${data.contact.email}` : social.id === 'phone' ? `tel:${data.contact.phone}` : ensureProtocol(data.contact[social.id].includes('http') ? data.contact[social.id] : `${social.pre}${data.contact[social.id]}`)} target="_blank" rel="noreferrer" className="group p-8 rounded-[2rem] bg-gray-50 dark:bg-white/5 border border-transparent hover:border-indigo-500/50 transition-all flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 text-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <social.icon size={28} />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">{social.label}</span>
                    <span className="font-bold text-gray-900 dark:text-white break-all">{data.contact[social.id].includes('http') ? 'Profile' : data.contact[social.id]}</span>
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
