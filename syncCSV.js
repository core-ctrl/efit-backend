const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ override: true });
const Member = require('./models/Member');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB.");

  const csvPath = path.join(__dirname, '../public/data/EFIT-Team.csv');
  const text = fs.readFileSync(csvPath, 'utf8');
  const lines = text.split('\n');

  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith(',,')) break;
    const cols = line.split(',');
    if (cols.length >= 5) {
      const csvId = cols[0].trim();
      const name = cols[2].trim();
      const universityId = cols[3].trim();
      const email = cols[4].trim();

      // Update the member in DB where id == csvId
      const res = await Member.updateOne(
        { id: csvId },
        { $set: { universityId: universityId, email: email } }
      );
      if (res.modifiedCount > 0) {
        console.log(`Updated ${name} with Roll Number ${universityId}`);
      }
    }
  }

  console.log("Done.");
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
