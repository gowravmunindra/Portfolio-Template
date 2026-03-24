export const initialData = {
  hero: {
    title: "Home",
    greeting: "HELLO THERE, WELCOME TO MY SITE",
    name: "Alex",
    lastName: "Stark",
    rolePrefix: "A",
    role: "Full Stack Developer",
    roleSuffix: "& UI/UX Designer",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=800&q=80"
  },
  about: {
    title: "About Me",
    bio: "I am a versatile professional with a passion for continuous learning and adapting across multiple disciplines. My career journey is defined by delivering high-quality results, leading complex projects, and driving meaningful change in dynamic environments."
  },
  skills: {
    title: "Key Skills",
    items: [
      "Strategic Planning", "Project Management", "Problem Solving", "Cross-functional Leadership", 
      "Technical Analysis", "Design Thinking", "Client Relations", "Data-Driven Decisions"
    ]
  },
  projects: {
    title: "Selected Work",
    items: [
      {
        id: 1,
        title: "Digital Transformation Initiative",
        description: "Led a cross-functional team to overhaul internal legacy systems, increasing overall operational efficiency by 40% within 6 months.",
        link: "https://example.com/project1"
      },
      {
        id: 2,
        title: "Brand Strategy overhaul",
        description: "Developed and executed a comprehensive brand identity system and launch campaign for a disruptive emerging startup.",
        link: "https://example.com/project2"
      }
    ]
  },
  experience: {
    title: "Experience & Journey",
    items: [
      {
        id: 1,
        title: "Senior Consultant",
        organization: "Global Solutions Inc.",
        duration: "2020 - Present",
        description: "Spearheaded strategic execution for enterprise-level clients, managing budgets exceeding $2M.",
        achievements: "Awarded Consultant of the Year 2022 for outstanding client retention."
      },
      {
        id: 2,
        title: "Independent Specialist",
        organization: "Freelance",
        duration: "2017 - 2020",
        description: "Provided specialized consulting services and end-to-end project delivery across multiple industries.",
        achievements: "Grew personal client base by 150% in two years through referrals."
      }
    ]
  },
  achievements: {
    title: "Certifications & Achievements",
    items: [
      {
        id: 1,
        title: "Advanced Agile Certification",
        issuer: "Agile Leadership Institute",
        date: "2023",
        description: "Completed rigorous training program covering advanced team management and scaling frameworks.",
        link: "https://example.com/cert"
      },
      {
        id: 2,
        title: "Industry Excellence Award",
        issuer: "Annual Professional Summit",
        date: "2021",
        description: "Recognized for outstanding contribution to community building and emerging technologies.",
        link: ""
      }
    ]
  },
  contact: {
    title: "Get In Touch",
    email: "alex@example.com",
    phone: "+1 (555) 123-4567",
    github: "alexcross",
    linkedin: "alex-cross-890",
    twitter: "cross_alex"
  },
  layout: [
    { id: 'hero', visible: true, locked: true },
    { id: 'about', visible: true, locked: false },
    { id: 'experience', visible: true, locked: false },
    { id: 'skills', visible: true, locked: false },
    { id: 'projects', visible: true, locked: false },
    { id: 'achievements', visible: true, locked: false },
    { id: 'contact', visible: true, locked: false }
  ]
};
