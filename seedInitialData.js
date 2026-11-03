const mongoose = require('mongoose');
require('dotenv').config({ override: true });

const Event = require('./models/Event');
const Notice = require('./models/Notice');
const Project = require('./models/Project');
const Contest = require('./models/Contest');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for initial seeding.');

  // 1. Events
  const eventCount = await Event.countDocuments();
  if (eventCount === 0) {
    console.log('Seeding initial events...');
    await Event.insertMany([
      {
        title: 'EFIT CodeSprint 2026',
        slug: 'efit-codesprint-2026',
        description: 'Annual competitive programming contest challenging problem-solving and algorithmic thinking.',
        longDescription: 'Join hundreds of talented developers across KL University in our flagship competitive coding championship.',
        category: 'Hackathon',
        date: '2026-11-15',
        time: '10:00 AM',
        venue: 'Jasmine Hall, KL University',
        mode: 'Offline',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
        organizedBy: 'Technical Wing',
        registrationOpen: true,
        maxParticipants: 200,
      },
      {
        title: 'Full-Stack Web3 & Cloud Summit',
        slug: 'web3-cloud-summit',
        description: 'Deep dive into decentralized infrastructure, modern microservices, and Kubernetes orchestration.',
        longDescription: 'A practical, hands-on masterclass conducted by industry leads and senior EFIT alumni.',
        category: 'Workshop',
        date: '2026-11-28',
        time: '02:00 PM',
        venue: 'New Seminar Hall / Online Stream',
        mode: 'Hybrid',
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
        organizedBy: 'Technical & Research Wing',
        registrationOpen: true,
        maxParticipants: 150,
      },
      {
        title: 'Git, DevOps & Modern Toolchains',
        slug: 'git-devops-toolchains',
        description: 'Hands-on practical session covering Git workflows, Docker, CI/CD pipelines, and cloud deployment.',
        longDescription: 'Get production-ready with best practices for team collaboration, version control, and containerization.',
        category: 'Workshop',
        date: '2026-12-05',
        time: '11:00 AM',
        venue: 'CS&IT Computer Lab 304',
        mode: 'Offline',
        image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&auto=format&fit=crop&q=80',
        organizedBy: 'Rubix Wing',
        registrationOpen: true,
        maxParticipants: 100,
      }
    ]);
    console.log('Events seeded.');
  } else {
    console.log(`Events already exist (${eventCount} records). Skipping.`);
  }

  // 2. Notices
  const noticeCount = await Notice.countDocuments();
  if (noticeCount === 0) {
    console.log('Seeding initial notices...');
    await Notice.insertMany([
      {
        title: 'EFIT Recruitment 2026-27 Applications Open',
        content: 'Applications are now open for core coordinator roles across Technical, Design, Logistics, and Social Media wings.',
        category: 'IMPORTANT',
        priority: 'High',
        author: 'President Office',
      },
      {
        title: 'CodeSprint 2026 Problem Statements Released',
        content: 'Check the portal for preliminary round guidelines and contest environment rules for CodeSprint 2026.',
        category: 'EVENT',
        priority: 'Normal',
        author: 'Technical Wing',
      },
      {
        title: 'Weekly Community Meetup & Tech Showcase',
        content: 'Join us this Friday at 4:30 PM for lightning talks and project demos by junior and senior members.',
        category: 'GENERAL',
        priority: 'Normal',
        author: 'Community Lead',
      }
    ]);
    console.log('Notices seeded.');
  } else {
    console.log(`Notices already exist (${noticeCount} records). Skipping.`);
  }

  // 3. Projects
  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    console.log('Seeding initial projects...');
    await Project.insertMany([
      {
        title: 'Rubix Core API Gateway',
        description: 'Centralized backend microservices architecture and auth gateway for EFIT digital operations.',
        category: 'rubix',
        technologies: ['Node.js', 'Express', 'MongoDB', 'Docker', 'Kubernetes'],
        githubUrl: 'https://github.com/core-ctrl/KLEFIT',
        status: 'Active',
      },
      {
        title: 'Event Pulse Real-Time Checkin',
        description: 'Fast QR-code attendee verification and real-time synchronization dashboard for event coordinators.',
        category: 'rubix',
        technologies: ['React', 'Next.js', 'WebSocket', 'Tailwind CSS'],
        githubUrl: 'https://github.com/core-ctrl/KLEFIT',
        status: 'Active',
      },
      {
        title: 'Cyber Sentinel Scanner',
        description: 'Automated vulnerability scanning and security audit tool for campus student applications.',
        category: 'forensic',
        technologies: ['Python', 'Docker', 'Nmap', 'Bash'],
        status: 'Active',
      },
      {
        title: 'Forensic Log Analysis Engine',
        description: 'Deep-dive analytical engine for audit trails and intrusion detection in institutional networks.',
        category: 'forensic',
        technologies: ['Rust', 'ELK Stack', 'TypeScript'],
        status: 'Active',
      }
    ]);
    console.log('Projects seeded.');
  } else {
    console.log(`Projects already exist (${projectCount} records). Skipping.`);
  }

  // 4. Contests
  const contestCount = await Contest.countDocuments();
  if (contestCount === 0) {
    console.log('Seeding initial contests...');
    await Contest.insertMany([
      {
        title: 'EFIT CodeSprint 2026',
        description: 'Competitive programming contest featuring dynamic programming, graph algorithms, and data structures challenges.',
        status: 'Upcoming',
        deadline: '2026-11-14T23:59:59.000Z',
        prizePool: '₹25,000 + Certificates',
        teamSize: 'Individual / 2 Members',
        rules: ['Original solutions only', 'No external LLM assistance during live rounds', 'Time and memory limits enforced'],
        prizes: ['1st: ₹15,000 + Trophy', '2nd: ₹7,000', '3rd: ₹3,000'],
        registrationOpen: true,
      },
      {
        title: 'HackMatrix 4.0 Hackathon',
        description: '36-hour hackathon to build solutions addressing Education, Cybersecurity, and AI for Social Good.',
        status: 'Upcoming',
        deadline: '2026-12-10T18:00:00.000Z',
        prizePool: '₹50,000',
        teamSize: '2 to 4 Members',
        rules: ['All code must be written during the hackathon', 'Open source libraries allowed', 'Demo required for jury evaluation'],
        prizes: ['Winner: ₹30,000', 'Runner-up: ₹15,000', 'Best Freshers Team: ₹5,000'],
        registrationOpen: true,
      }
    ]);
    console.log('Contests seeded.');
  } else {
    console.log(`Contests already exist (${contestCount} records). Skipping.`);
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
