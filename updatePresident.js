const mongoose = require('mongoose');
require('dotenv').config({ override: true });
const Member = require('./models/Member');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB.");

  // Update Rupesh Sai's image
  const result = await Member.updateOne(
    { name: { $regex: /rupesh/i } },
    { $set: { image: "https://res.cloudinary.com/jjwsbsaj/image/upload/v1793739936/RUPESH.jpg" } }
  );

  // Update Sakyath's image
  const sakyathResult = await Member.updateOne(
    { name: { $regex: /sakyath/i } },
    { $set: { image: "https://res.cloudinary.com/jjwsbsaj/image/upload/v1793739937/SAKYATH.jpg" } }
  );

  // Update Khushi's image
  const khushiResult = await Member.updateOne(
    { $or: [{ name: { $regex: /khushi/i } }, { universityId: "2400090169" }] },
    { $set: { image: "https://res.cloudinary.com/jjwsbsaj/image/upload/v1793740413/IMG-20260227-WA0135_-_Khushi_Singh.jpg.jpg" } }
  );

  // Update Satyavani's image
  const satyavaniResult = await Member.updateOne(
    { $or: [{ name: { $regex: /satyavani/i } }, { universityId: "2400090077" }] },
    { $set: { image: "https://res.cloudinary.com/jjwsbsaj/image/upload/v1793740413/_-_Satyavanimacha.jpg" } }
  );

  // Update Teja's image
  const tejaResult = await Member.updateOne(
    { $or: [{ name: { $regex: /teja/i } }, { universityId: "2400090134" }] },
    { $set: { image: "https://res.cloudinary.com/jjwsbsaj/image/upload/v1793740416/IMG_1529_-_Teja_Palvai.jpg" } }
  );

  // Update Yohana Preethi's image
  const yohanaResult = await Member.updateOne(
    { $or: [{ name: { $regex: /yohana/i } }, { universityId: "2500090272" }] },
    { $set: { image: "https://res.cloudinary.com/jjwsbsaj/image/upload/v1793740422/IMG_0028.JPG_-_Yohana_preethi_Tadanki.jpg" } }
  );

  // Update Yashwanth Nag's image
  const yashwanthResult = await Member.updateOne(
    { $or: [{ name: { $regex: /yashwanth/i } }, { universityId: "2600090112" }] },
    { $set: { image: "https://res.cloudinary.com/jjwsbsaj/image/upload/v1793740416/IMG_20260428_225252_-_Yashwanth_Nag.jpg.jpg" } }
  );

  // Update Harshith's image (Chavva Sai Venkata Harshith - Coordinator)
  const harshithResult = await Member.updateOne(
    { $or: [{ universityId: "2600090080" }, { name: { $regex: /chavva|venkata harshith/i } }] },
    { $set: { image: "https://res.cloudinary.com/jjwsbsaj/image/upload/v1793740414/IMG_20260919_103122_-_Harshith.jpg.jpg" } }
  );

  // Update Mohan Madhav Krishna (MMK - Coordinator)
  const mmkResult = await Member.updateOne(
    { $or: [{ universityId: "2600090078" }, { name: { $regex: /mohan|madhav|mmk/i } }] },
    { 
      $set: { 
        name: "G. Mohan Madhav Krishna (MMK)",
        image: "https://res.cloudinary.com/jjwsbsaj/image/upload/v1793740414/file_00000000532c8230bdfc69fa9832aba6_-_Mmk_Mmk.png",
        role: "Coordinator",
        category: "COORDINATORS",
        universityId: "2600090078",
        email: "2600090078@kluniversity.in"
      } 
    },
    { upsert: true }
  );

  // Update Rajeswararao Karumuri's image (Social Media Lead - Smart Face Centered)
  const rajeswararaoResult = await Member.updateOne(
    { $or: [{ universityId: "2400090008" }, { name: { $regex: /rajeswararao|karumuri/i } }] },
    { 
      $set: { 
        name: "Karumuri P. R. N. S. Rajeswararao",
        image: "https://res.cloudinary.com/jjwsbsaj/image/upload/c_fill,g_face,w_700,h_900/v1793740419/20260215_144833_-_P_R_N_S_RAJESWARARAO_KARUMURI.jpg",
        role: "Social Media - Lead",
        category: "SOCIAL_MEDIA",
        universityId: "2400090008",
        email: "2400090008@kluniversity.in"
      } 
    },
    { upsert: true }
  );

  // Update Lalithya Amrutanand Yarasi's image (Logistics Lead)
  const lalithyaResult = await Member.updateOne(
    { $or: [{ universityId: "2400090018" }, { name: { $regex: /lalithya|amrutanand|yarasi/i } }] },
    { 
      $set: { 
        name: "Yarasi Lalithya Amrutanand",
        image: "https://res.cloudinary.com/jjwsbsaj/image/upload/v1793740413/Screenshot_2026-11-04_023941.png",
        role: "Logistics Lead",
        category: "LOGISTICS",
        universityId: "2400090018",
        email: "2400090018@kluniversity.in"
      } 
    },
    { upsert: true }
  );

  // Update Parupalli Sai Harshitha's image (Lead Developer & Social Media Director)
  const saiHarshithaResult = await Member.updateOne(
    { $or: [{ universityId: "2400090281" }, { name: { $regex: /parupalli|sai\s*harshitha/i } }] },
    { 
      $set: { 
        name: "Parupalli Sai Harshitha",
        image: "https://res.cloudinary.com/dkrvtfbor/image/upload/c_thumb,g_face,w_700,h_900,z_0.35/v1775338145/IMG_20260405_025506_s0ne5r.jpg",
        role: "Social Media - Director",
        category: "SOCIAL_MEDIA",
        universityId: "2400090281",
        email: "2400090281@kluniversity.in"
      } 
    },
    { upsert: true }
  );

  console.log("Update result Rupesh:", result);
  console.log("Update result Sakyath:", sakyathResult);
  console.log("Update result Khushi:", khushiResult);
  console.log("Update result Satyavani:", satyavaniResult);
  console.log("Update result Teja:", tejaResult);
  console.log("Update result Yohana:", yohanaResult);
  console.log("Update result Yashwanth:", yashwanthResult);
  console.log("Update result Harshith:", harshithResult);
  console.log("Update result MMK:", mmkResult);
  console.log("Update result Rajeswararao:", rajeswararaoResult);
  console.log("Update result Lalithya:", lalithyaResult);
  console.log("Update result Sai Harshitha:", saiHarshithaResult);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
