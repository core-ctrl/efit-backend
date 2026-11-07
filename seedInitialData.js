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

  // 3. Projects: Projects are managed dynamically via Admin Portal. No mock projects seeded.
  console.log('Projects configured for dynamic admin management.');

  // 4. Contests: Contests are managed dynamically via Admin Portal. No mock contests seeded.
  console.log('Contests configured for dynamic admin management.');

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
