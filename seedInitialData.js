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
    console.log('Seeding initial notice...');
    await Notice.insertMany([
      {
        title: 'Student Portal Access: Microsoft SSO & Direct Password Login Guide',
        content: 'Attention KL University Students: For your first visit to the EFIT Student Portal, please authenticate using your official college Microsoft account (@kluniversity.in) by clicking Continue with Microsoft. Once authenticated, open your Portal Profile and configure a personal password. You can then sign in directly on any device using your Student ID / Email and password without needing Microsoft SSO verification every time.',
        category: 'IMPORTANT',
        priority: 'High',
        author: 'Lead Developer & Admin',
      }
    ]);
    console.log('Initial notice seeded.');
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

  // 4. Contests: Contests are managed dynamically via Admin Portal. No mock contests seeded.
  console.log('Contests configured for dynamic admin management.');

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
