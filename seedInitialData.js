const mongoose = require('mongoose');
require('dotenv').config({ override: true });

const Event = require('./models/Event');
const Notice = require('./models/Notice');
const Project = require('./models/Project');
const Contest = require('./models/Contest');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for initial seeding.');

  // 1. Events: No mock/seed events generated automatically.
  // Events are managed dynamically exclusively via the Admin Portal.


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
