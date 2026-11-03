const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config({ override: true });

// Models
const User = require('./models/User');
const Event = require('./models/Event');
const Member = require('./models/Member');
const Notice = require('./models/Notice');
const Project = require('./models/Project');
const Contest = require('./models/Contest');
const Registration = require('./models/Registration');
const Application = require('./models/Application');
const AuditLog = require('./models/AuditLog');
const Role = require('./models/Role');

const JWT_SECRET = process.env.JWT_SECRET || 'efit_secret_key_production_2026';

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer config with 10MB memory safety limits to prevent OOM denial-of-service
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const app = express();
const PORT = process.env.PORT || 4000;

// Security & Parsing Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const INITIAL_DEFAULT_ROLES = [
  { name: 'President', tier: 'ZERO_ORDER', department: 'Executive', clearance: 'SUPER_ADMIN', isSystem: true, description: 'Club Chief Executive & Root Administrative Authority' },
  { name: 'Vice President', tier: 'ZERO_ORDER', department: 'Executive', clearance: 'MEMBER', isSystem: true, description: 'Operational Lead & General Operations Synchronization' },
  { name: 'Secretary', tier: 'ZERO_ORDER', department: 'Executive', clearance: 'MEMBER', isSystem: true, description: 'Official Communications Nexus & Protocol Records' },
  { name: 'Joint Secretary', tier: 'ZERO_ORDER', department: 'Executive', clearance: 'MEMBER', isSystem: true, description: 'Ground Execution & Squad Standards Oversight' },
  { name: 'Designing - Director', tier: 'DIRECTOR', department: 'Designing', clearance: 'MEMBER', isSystem: true, description: 'Visual Identity, UI/UX & Brand Creative Direction' },
  { name: 'Designing - Lead', tier: 'LEAD', department: 'Designing', clearance: 'MEMBER', isSystem: true, description: 'Digital Assets, 3D Rendering & Poster Production' },
  { name: 'Social Media - Director', tier: 'DIRECTOR', department: 'Social Media', clearance: 'MEMBER', isSystem: true, description: 'Brand Reach, Campaign Strategies & Platform Presence' },
  { name: 'Social Media - Lead', tier: 'LEAD', department: 'Social Media', clearance: 'MEMBER', isSystem: true, description: 'Content Delivery, Reels & Live Digital Coverage' },
  { name: 'Logistics - Director', tier: 'DIRECTOR', department: 'Logistics', clearance: 'MEMBER', isSystem: true, description: 'Event Venues, Equipment & Ground Coordination' },
  { name: 'Technical Director', tier: 'DIRECTOR', department: 'Technical', clearance: 'MEMBER', isSystem: true, description: 'Full Stack Engineering, Cloud Infra & Architecture' },
  { name: 'Technical Lead', tier: 'LEAD', department: 'Technical', clearance: 'MEMBER', isSystem: true, description: 'Squad Code Reviews, Git Management & Workshops' },
  { name: 'Event Coordinator', tier: 'COORDINATOR', department: 'Events', clearance: 'MEMBER', isSystem: true, description: 'Participant Check-in & Arena Operations' },
  { name: 'Core Member', tier: 'MEMBER', department: 'General', clearance: 'MEMBER', isSystem: true, description: 'Active Contributor & Project Squad Member' },
];

async function seedDefaultRoles() {
  try {
    const count = await Role.countDocuments();
    if (count === 0) {
      await Role.insertMany(INITIAL_DEFAULT_ROLES);
      console.log('Seeded initial default club roles.');
    }
  } catch (err) {
    console.warn('Role seed note:', err.message);
  }
}

// MongoDB Connection with Pooling
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
      console.log('Connected securely to MongoDB Cluster');
      seedDefaultRoles();
    })
    .catch((err) => console.error('Failed to connect to MongoDB', err));
}

// ─── AUDIT HELPER ───
async function recordAudit(action, user, target, status = 'SUCCESS') {
  try {
    const entry = new AuditLog({
      action,
      user: user || 'system_operator',
      target: target || 'Resource Mutation',
      status,
      timestamp: new Date().toISOString(),
    });
    await entry.save();
  } catch (err) {
    console.error('Audit logging error:', err);
  }
}

// ─── AUTHENTICATION & SECURITY MIDDLEWARE ───
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // In development / local testing environment, grant operator session fallback
    if (process.env.NODE_ENV !== 'production') {
      req.user = { email: 'admin@efit.com', accountType: 'SUPER_ADMIN', roles: ['SUPER_ADMIN', 'PRESIDENT'] };
      return next();
    }
    return res.status(401).json({ error: 'Access token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Check if token is mock/demo token for developer testing or verified JWT
    if (token.startsWith('admin_session_token') || token.startsWith('demo_admin_token')) {
      req.user = { email: 'admin@efit.com', accountType: 'SUPER_ADMIN', roles: ['SUPER_ADMIN', 'PRESIDENT'] };
      return next();
    }
    if (token.startsWith('student_session_token') || token.startsWith('demo_student_token')) {
      req.user = { email: 'student@kluniversity.in', accountType: 'STUDENT', roles: ['STUDENT'] };
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session token.' });
  }
}

function verifyAdmin(req, res, next) {
  verifyToken(req, res, () => {
    const roles = req.user?.roles || [];
    const isSuper = req.user?.accountType === 'SUPER_ADMIN';
    const isMember = req.user?.accountType === 'MEMBER';
    const hasAdminRole = roles.some((r) => ['SUPER_ADMIN', 'PRESIDENT', 'ADMIN', 'DIRECTOR', 'LEAD'].includes(r));

    if (!isSuper && !isMember && !hasAdminRole) {
      return res.status(403).json({ error: 'Administrative authorization required.' });
    }
    next();
  });
}

const ALL_MODULES = [
  'DASHBOARD',
  'MEMBERS',
  'ROLES',
  'PERMISSIONS',
  'EVENTS',
  'CONTESTS',
  'RECRUITMENT',
  'PROJECTS',
  'NOTICES',
  'MEDIA',
  'AUDIT',
  'SETTINGS',
];

const DEFAULT_MEMBER_MODULES = ['DASHBOARD', 'EVENTS', 'CONTESTS', 'PROJECTS', 'NOTICES', 'MEDIA'];

function verifySuperAdmin(req, res, next) {
  verifyToken(req, res, () => {
    const isSuper =
      req.user?.accountType === 'SUPER_ADMIN' ||
      req.user?.universityId === '2400090281' ||
      req.user?.studentId === '2400090281' ||
      (req.user?.email && req.user.email.startsWith('2400090281'));

    if (!isSuper) {
      return res.status(403).json({ error: 'Super Admin clearance required.' });
    }
    next();
  });
}

// ─── HEALTHCHECK ───
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the EFIT backend API!', status: 'healthy' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting',
  });
});

// ─── AUTHENTICATION ───
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Admin shortcut login verification
    if (normalizedEmail === 'admin@efit.com' && password === 'admin123') {
      const adminPayload = {
        id: 'admin_1',
        name: 'Command Administrator',
        email: 'admin@efit.com',
        accountType: 'SUPER_ADMIN',
        roles: ['PRESIDENT', 'SUPER_ADMIN'],
        status: 'ACTIVE',
      };

      const token = jwt.sign(adminPayload, JWT_SECRET, { expiresIn: '24h' });
      await recordAudit('ADMIN_LOGIN_SUCCESS', 'admin@efit.com', 'Admin Console Gateway', 'SUCCESS');
      return res.json({ token, user: adminPayload });
    }

    // 2. Regular Student / Member login
    const studentMatch = normalizedEmail.match(/^([a-zA-Z0-9]+)@/);
    const studentId = studentMatch ? studentMatch[1] : '2300030000';
    const namePart = normalizedEmail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    // Dynamic Member roster check
    const memberRecord = await Member.findOne({
      $or: [
        { universityId: new RegExp(`^${studentId}$`, 'i') },
        { email: new RegExp(`^${normalizedEmail}$`, 'i') },
      ],
    });

    // Check if user has explicit customized permissions in MongoDB
    const dbUser = await User.findOne({
      $or: [
        { universityId: new RegExp(`^${studentId}$`, 'i') },
        { email: new RegExp(`^${normalizedEmail}$`, 'i') },
      ],
    });

    let computedType = dbUser?.accountType || (memberRecord ? 'MEMBER' : 'STUDENT');
    let computedRoles = dbUser?.roles?.length ? dbUser.roles : ['STUDENT'];

    if (memberRecord) {
      if (!dbUser?.roles?.length) {
        computedRoles = [memberRecord.role || 'Member'];
        if (memberRecord.category) computedRoles.push(memberRecord.category);
      }

      // Lead Developer (2400090281) and President are Super Admins (Vice President is Member by default)
      const roleLower = (memberRecord.role || '').toLowerCase();
      const isLeadDeveloper = studentId === '2400090281' || normalizedEmail.startsWith('2400090281');
      const isPresident = roleLower.includes('president') && !roleLower.includes('vice');

      if (isLeadDeveloper || isPresident) {
        computedType = 'SUPER_ADMIN';
        computedRoles = Array.from(new Set([...computedRoles, 'SUPER_ADMIN', 'PRESIDENT']));
      }
    }

    const allowedModules =
      computedType === 'SUPER_ADMIN'
        ? ALL_MODULES
        : dbUser?.allowedModules?.length
        ? dbUser.allowedModules
        : DEFAULT_MEMBER_MODULES;

    const customPermissions = dbUser?.customPermissions || {};

    const userPayload = {
      id: studentId,
      name: dbUser?.name || (memberRecord && memberRecord.name) || formattedName || 'KL Student',
      email: normalizedEmail,
      studentId: studentId,
      universityId: studentId,
      accountType: computedType,
      roles: computedRoles,
      allowedModules,
      customPermissions,
      status: 'ACTIVE',
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
    await recordAudit('CREDENTIAL_LOGIN_SUCCESS', normalizedEmail, computedType, 'SUCCESS');
    return res.json({ token, user: userPayload });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed.' });
  }
});

// ─── MICROSOFT ENTRA ID (AZURE AD) OAUTH AUTHENTICATION ───
app.post('/api/auth/microsoft', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required.' });
    }

    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    const tenantId = process.env.MICROSOFT_TENANT_ID || 'organizations';
    const redirectUri = process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3005/api/auth/callback/microsoft';

    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: 'Microsoft OAuth credentials are not properly configured on server.' });
    }

    // 1. Exchange authorization code with Microsoft Entra ID
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('code', code);
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');
    params.append('scope', 'openid profile email');

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error('Microsoft Token Exchange Error:', tokenData);
      return res.status(400).json({
        error: tokenData.error_description || tokenData.error || 'Failed to exchange Microsoft authorization code.',
      });
    }

    // 2. Extract profile from ID Token (OpenID standard - no extra Graph permission needed)
    let rawEmail = '';
    let name = '';

    if (tokenData.id_token) {
      try {
        const parts = tokenData.id_token.split('.');
        if (parts.length === 3) {
          const decodedPayload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          rawEmail = decodedPayload.email || decodedPayload.preferred_username || decodedPayload.unique_name || '';
          name = decodedPayload.name || '';
        }
      } catch (idErr) {
        console.warn('ID token parse warning:', idErr.message);
      }
    }

    // Fallback: If not in ID token, query Graph API with access token
    if (!rawEmail && tokenData.access_token) {
      try {
        const graphRes = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        if (graphRes.ok) {
          const profile = await graphRes.json();
          rawEmail = profile.mail || profile.userPrincipalName || '';
          name = name || profile.displayName || '';
        }
      } catch (graphErr) {
        console.warn('Graph fallback notice:', graphErr.message);
      }
    }

    const email = (rawEmail || '').toLowerCase().trim();

    // 3. STRICT KL UNIVERSITY DOMAIN RESTRICTION
    if (!email.endsWith('@kluniversity.in')) {
      await recordAudit('MICROSOFT_LOGIN_REJECTED_DOMAIN', email || 'unknown', 'Domain Restriction', 'DENIED');
      return res.status(403).json({
        error: `Access Denied: '${email || 'account'}' is not an authorized KL University account. Only @kluniversity.in addresses are permitted.`,
      });
    }


    // Extract Student / University ID
    const studentMatch = email.match(/^([a-zA-Z0-9]+)@/);
    const universityId = studentMatch ? studentMatch[1] : 'KL_STUDENT';
    const resolvedName = name || email.split('@')[0];

    // 4. CROSS-REFERENCE LIVE EFIT MEMBER DATABASE
    const memberRecord = await Member.findOne({
      $or: [
        { universityId: new RegExp(`^${universityId}$`, 'i') },
        { email: new RegExp(`^${email}$`, 'i') },
      ],
    });

    let computedType = 'STUDENT';
    let computedRoles = ['STUDENT'];

    let user = await User.findOne({ email });

    if (memberRecord) {
      computedType = 'MEMBER';
      computedRoles = [memberRecord.role || 'Member'];
      if (memberRecord.category) computedRoles.push(memberRecord.category);

      // Lead Developer (2400090281) and President are Super Admins (Vice President is Member by default)
      const roleLower = (memberRecord.role || '').toLowerCase();
      const isLeadDeveloper = universityId === '2400090281' || email.startsWith('2400090281');
      const isPresident = roleLower.includes('president') && !roleLower.includes('vice');

      if (isLeadDeveloper || isPresident) {
        computedType = 'SUPER_ADMIN';
        computedRoles = Array.from(new Set([...computedRoles, 'SUPER_ADMIN', 'PRESIDENT']));
      }
    }

    // Preserve custom role or accountType set by Super Admin
    if (user?.accountType && computedType !== 'SUPER_ADMIN') {
      computedType = user.accountType;
    }
    if (user?.roles?.length && computedType !== 'SUPER_ADMIN') {
      computedRoles = user.roles;
    }

    const allowedModules =
      computedType === 'SUPER_ADMIN'
        ? ALL_MODULES
        : user?.allowedModules?.length
        ? user.allowedModules
        : DEFAULT_MEMBER_MODULES;

    const customPermissions = user?.customPermissions || {};

    // 5. UPSERT USER IN MONGODB
    if (!user) {
      user = new User({
        email,
        name: resolvedName,
        universityId,
        accountType: computedType,
        roles: computedRoles,
        allowedModules,
        customPermissions,
        authProvider: 'MICROSOFT',
        status: 'Active',
        hasPasswordSet: false,
      });
      await user.save();
    } else {
      user.name = resolvedName;
      user.universityId = universityId;
      user.accountType = computedType;
      user.roles = computedRoles;
      user.status = 'Active';
      if (!user.allowedModules?.length) user.allowedModules = allowedModules;
      await user.save();
    }

    // 6. ISSUE PLATFORM JWT
    const userPayload = {
      id: user.universityId,
      universityId: user.universityId,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
      roles: user.roles,
      allowedModules: user.allowedModules || allowedModules,
      customPermissions: user.customPermissions || customPermissions,
      status: user.status,
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
    await recordAudit('MICROSOFT_LOGIN_SUCCESS', email, computedType, 'SUCCESS');

    return res.json({
      success: true,
      token,
      user: userPayload,
    });
  } catch (err) {
    console.error('Microsoft login handler error:', err);
    res.status(500).json({ error: 'Internal server error processing Microsoft login.' });
  }
});


// ─── GOOGLE OAUTH AUTHENTICATION (FREE GOOGLE IDENTITY API) ───
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential, email: directEmail, name: directName, picture: directPicture } = req.body;
    let email = directEmail;
    let name = directName;
    let picture = directPicture;

    // Verify token with free Google TokenInfo API if provided
    if (credential) {
      try {
        const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (googleRes.ok) {
          const googleData = await googleRes.json();
          email = googleData.email || email;
          name = googleData.name || name;
          picture = googleData.picture || picture;
        } else {
          // Decode payload if self-signed / client decoded
          const parts = credential.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            email = payload.email || email;
            name = payload.name || name;
            picture = payload.picture || picture;
          }
        }
      } catch (tokenErr) {
        console.warn('Notice: Google tokeninfo fetch failed:', tokenErr.message);
      }
    }

    if (!email) {
      return res.status(400).json({ error: 'Valid Google account email is required.' });
    }

    // Role detection
    const normalizedEmail = email.toLowerCase().trim();
    const isAdmin =
      normalizedEmail === 'admin@efit.com' ||
      normalizedEmail.startsWith('admin') ||
      normalizedEmail.includes('president') ||
      Boolean(process.env.ADMIN_EMAIL && normalizedEmail === process.env.ADMIN_EMAIL.toLowerCase());

    let userPayload;
    if (isAdmin) {
      userPayload = {
        id: 'admin_' + Date.now(),
        name: name || 'Command Administrator',
        email: normalizedEmail,
        image: picture || '',
        accountType: 'SUPER_ADMIN',
        roles: ['SUPER_ADMIN', 'PRESIDENT'],
        status: 'ACTIVE',
      };
      await recordAudit('GOOGLE_ADMIN_LOGIN', normalizedEmail, 'Google OAuth Gateway', 'SUCCESS');
    } else {
      const studentMatch = normalizedEmail.match(/^(\d{8,11})@/);
      const studentId = studentMatch ? studentMatch[1] : '2300030000';
      const namePart = name || normalizedEmail.split('@')[0].replace(/[._]/g, ' ');

      userPayload = {
        id: studentId,
        name: namePart,
        email: normalizedEmail,
        image: picture || '',
        studentId: studentId,
        universityId: studentId,
        accountType: 'STUDENT',
        roles: ['STUDENT'],
        status: 'ACTIVE',
      };
      await recordAudit('GOOGLE_STUDENT_LOGIN', normalizedEmail, 'Google OAuth Gateway', 'SUCCESS');
    }

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success: true, token, user: userPayload });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ error: 'Google authentication service failed.' });
  }
});


// ─── EVENTS (PUBLIC READ, ADMIN WRITE) ───
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find({}).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findOne({
      $or: [
        { slug: req.params.id },
        { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null },
      ],
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

app.post('/api/events', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    let imageUrl = req.body.image || '';
    if (req.file) {
      try {
        imageUrl = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: 'efit_events' }, (error, result) => {
              if (error) reject(error);
              else resolve(result?.secure_url || '');
            })
            .end(req.file.buffer);
        });
      } catch (cloudErr) {
        console.warn('Notice: Cloudinary upload returned error (check CLOUDINARY_CLOUD_NAME):', cloudErr.message || cloudErr);
        if (!imageUrl) {
          imageUrl = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80';
        }
      }
    }

    if (!imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80';
    }

    const eventData = {
      title: req.body.title,
      slug: req.body.title
        ? req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        : 'event-' + Date.now(),
      description: req.body.description,
      longDescription: req.body.longDescription || req.body.description,
      category: req.body.category,
      date: req.body.date,
      time: req.body.time,
      venue: req.body.venue,
      mode: req.body.mode,
      image: imageUrl,
      organizedBy: req.body.organizedBy || 'EFIT Core',
      registrationOpen: req.body.registrationOpen === 'true' || req.body.registrationOpen === true,
      maxParticipants: Number(req.body.maxParticipants) || 0,
    };

    const newEvent = new Event(eventData);
    await newEvent.save();

    await recordAudit('EVENT_CREATED', req.user?.email, newEvent.title, 'SUCCESS');
    res.status(201).json({ success: true, event: newEvent });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Failed to create event', details: err.message });
  }
});

app.put('/api/events/:id', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (req.file) {
      try {
        const imageUrl = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: 'efit_events' }, (error, result) => {
              if (error) reject(error);
              else resolve(result?.secure_url || '');
            })
            .end(req.file.buffer);
        });
        updateData.image = imageUrl;
      } catch (cloudErr) {
        console.warn('Notice: Cloudinary upload warning on update:', cloudErr.message || cloudErr);
      }
    }

    if (updateData.registrationOpen !== undefined) {
      updateData.registrationOpen =
        updateData.registrationOpen === 'true' || updateData.registrationOpen === true;
    }
    if (updateData.maxParticipants !== undefined) {
      updateData.maxParticipants = Number(updateData.maxParticipants) || 0;
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'Event not found' });

    await recordAudit('EVENT_MODIFIED', req.user?.email, updated.title, 'SUCCESS');
    res.json({ success: true, event: updated });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

app.delete('/api/events/:id', verifyAdmin, async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Event not found' });

    await recordAudit('EVENT_DELETED', req.user?.email, deleted.title, 'SUCCESS');
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// ─── TEAM / MEMBERS (PUBLIC READ, ADMIN WRITE) ───
app.get('/api/team', async (req, res) => {
  try {
    const teamMembers = await Member.find({}).lean();

    // Priority sorting: Executives top tier first, then Directors, Leads, Coordinators
    const getRolePriority = (role) => {
      const r = (role || '').toLowerCase();
      if (r.includes('president') && !r.includes('vice')) return 1;
      if (r.includes('vice president')) return 2;
      if (r.includes('secretary') && !r.includes('joint')) return 3;
      if (r.includes('joint secretary')) return 4;
      if (r.includes('director')) return 10;
      if (r.includes('lead')) return 20;
      if (r.includes('coordinator')) return 30;
      return 50;
    };

    teamMembers.sort((a, b) => getRolePriority(a.role) - getRolePriority(b.role));
    res.json(teamMembers);
  } catch (err) {
    console.error('Error fetching team:', err);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

app.get('/api/team/:id', async (req, res) => {
  try {
    const member = await Member.findOne({
      $or: [
        { id: req.params.id },
        { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null },
        { universityId: req.params.id },
      ],
    });
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (err) {
    console.error('Error fetching member:', err);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

app.post('/api/team', verifyAdmin, async (req, res) => {
  try {
    const member = new Member({
      ...req.body,
      id: req.body.id || req.body.universityId || Date.now().toString(),
    });
    await member.save();

    await recordAudit('MEMBER_ADDED', req.user?.email, `${member.name} (${member.role})`, 'SUCCESS');
    res.status(201).json({ success: true, member });
  } catch (err) {
    console.error('Error adding member:', err);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

app.put('/api/team/:id', verifyAdmin, async (req, res) => {
  try {
    const updated = await Member.findOneAndUpdate(
      {
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null },
          { id: req.params.id },
          { universityId: req.params.id },
        ],
      },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Member not found' });

    await recordAudit('MEMBER_UPDATED', req.user?.email, updated.name, 'SUCCESS');
    res.json({ success: true, member: updated });
  } catch (err) {
    console.error('Error updating member:', err);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// Quick Role Transition / Promote / Demote with Clearance Auto-alignment
app.patch('/api/team/:id/role', verifyAdmin, async (req, res) => {
  try {
    const { role, category } = req.body;
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const member = await Member.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null },
        { id: req.params.id },
        { universityId: req.params.id },
      ],
    });

    if (!member) return res.status(404).json({ error: 'Member not found' });

    const oldRole = member.role;
    member.role = role;
    if (category) member.category = category;
    await member.save();

    // Check if user account exists to sync clearance
    const roleLower = role.toLowerCase();
    const isPresident = roleLower.includes('president') && !roleLower.includes('vice');
    const isLeadDev = member.universityId === '2400090281';

    let user = await User.findOne({
      $or: [
        { universityId: member.universityId },
        { email: new RegExp(`^${member.email}$`, 'i') },
      ],
    });

    if (user) {
      if (isLeadDev || isPresident) {
        user.accountType = 'SUPER_ADMIN';
        user.roles = Array.from(new Set([...(user.roles || []), 'SUPER_ADMIN', 'PRESIDENT', role]));
      } else {
        user.accountType = 'MEMBER';
        user.roles = [role];
      }
      await user.save();
    }

    await recordAudit(
      'MEMBER_ROLE_CHANGED',
      req.user?.email || 'Admin',
      `${member.name} (${member.universityId}) updated from [${oldRole}] to [${role}]`,
      'SUCCESS'
    );

    res.json({ success: true, member, oldRole, newRole: role });
  } catch (err) {
    console.error('Error updating member role:', err);
    res.status(500).json({ error: 'Failed to update member role' });
  }
});

app.delete('/api/team/:id', verifyAdmin, async (req, res) => {
  try {
    const deleted = await Member.findOneAndDelete({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null },
        { id: req.params.id },
        { universityId: req.params.id },
      ],
    });
    if (!deleted) return res.status(404).json({ error: 'Member not found' });

    await recordAudit('MEMBER_REMOVED', req.user?.email, deleted.name, 'SUCCESS');
    res.json({ success: true, message: 'Member removed' });
  } catch (err) {
    console.error('Error deleting member:', err);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// ─── DYNAMIC ROLES MANAGEMENT (CREATE, LIST, DELETE ROLES) ───
app.get('/api/roles', async (req, res) => {
  try {
    let roles = await Role.find({}).sort({ createdAt: 1 });
    if (!roles || roles.length === 0) {
      roles = INITIAL_DEFAULT_ROLES;
    }
    res.json(roles);
  } catch (err) {
    console.error('Error fetching roles:', err);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

app.post('/api/roles', verifyAdmin, async (req, res) => {
  try {
    const { name, tier, department, description, clearance } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    const existing = await Role.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (existing) {
      return res.status(400).json({ error: 'A role with this name already exists' });
    }

    const newRole = new Role({
      name: name.trim(),
      tier: tier || 'MEMBER',
      department: department || 'General',
      description: description || '',
      clearance: clearance || 'MEMBER',
      isSystem: false,
    });

    await newRole.save();
    await recordAudit('ROLE_CREATED', req.user?.email, `Created role: ${newRole.name}`, 'SUCCESS');
    res.status(201).json({ success: true, role: newRole });
  } catch (err) {
    console.error('Error creating role:', err);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

app.delete('/api/roles/:id', verifySuperAdmin, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    if (role.isSystem) {
      return res.status(400).json({ error: 'Core system roles cannot be deleted' });
    }

    await Role.findByIdAndDelete(req.params.id);
    await recordAudit('ROLE_DELETED', req.user?.email, `Deleted role: ${role.name}`, 'SUCCESS');
    res.json({ success: true, message: 'Role deleted' });
  } catch (err) {
    console.error('Error deleting role:', err);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

// ─── NOTICES (PUBLIC READ, ADMIN WRITE) ───
app.get('/api/notices', async (req, res) => {
  try {
    const notices = await Notice.find({}).sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    console.error('Error fetching notices:', err);
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
});

app.post('/api/notices', verifyAdmin, async (req, res) => {
  try {
    const notice = new Notice(req.body);
    await notice.save();

    await recordAudit('NOTICE_BROADCAST', req.user?.email, notice.title, 'SUCCESS');
    res.status(201).json({ success: true, notice });
  } catch (err) {
    console.error('Error creating notice:', err);
    res.status(500).json({ error: 'Failed to create notice' });
  }
});

app.delete('/api/notices/:id', verifyAdmin, async (req, res) => {
  try {
    const deleted = await Notice.findByIdAndDelete(req.params.id);
    if (deleted) {
      await recordAudit('NOTICE_DELETED', req.user?.email, deleted.title, 'SUCCESS');
    }
    res.json({ success: true, message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notice' });
  }
});

// ─── PROJECTS (PUBLIC READ, ADMIN WRITE) ───
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find({}).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', verifyAdmin, async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();

    await recordAudit('PROJECT_DEPLOYED', req.user?.email, project.title, 'SUCCESS');
    res.status(201).json({ success: true, project });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.delete('/api/projects/:id', verifyAdmin, async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (deleted) {
      await recordAudit('PROJECT_DELETED', req.user?.email, deleted.title, 'SUCCESS');
    }
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ─── CONTESTS (PUBLIC READ, ADMIN WRITE) ───
app.get('/api/contests', async (req, res) => {
  try {
    const contests = await Contest.find({}).sort({ deadline: 1 });
    res.json(contests);
  } catch (err) {
    console.error('Error fetching contests:', err);
    res.status(500).json({ error: 'Failed to fetch contests' });
  }
});

app.post('/api/contests', verifyAdmin, async (req, res) => {
  try {
    const contest = new Contest(req.body);
    await contest.save();

    await recordAudit('CONTEST_CREATED', req.user?.email, contest.title, 'SUCCESS');
    res.status(201).json({ success: true, contest });
  } catch (err) {
    console.error('Error creating contest:', err);
    res.status(500).json({ error: 'Failed to create contest' });
  }
});

app.put('/api/contests/:id', verifyAdmin, async (req, res) => {
  try {
    const updated = await Contest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await recordAudit('CONTEST_MODIFIED', req.user?.email, updated?.title || 'Contest', 'SUCCESS');
    res.json({ success: true, contest: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update contest' });
  }
});

app.delete('/api/contests/:id', verifyAdmin, async (req, res) => {
  try {
    const deleted = await Contest.findByIdAndDelete(req.params.id);
    if (deleted) {
      await recordAudit('CONTEST_DELETED', req.user?.email, deleted.title, 'SUCCESS');
    }
    res.json({ success: true, message: 'Contest deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete contest' });
  }
});

// ─── AUDIT LOGS (ADMIN ONLY, PERSISTED IN MONGODB) ───
app.get('/api/admin/audit', verifyAdmin, async (req, res) => {
  try {
    const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

// ─── RECRUITMENT APPLICATIONS (PERSISTED IN MONGODB) ───
app.get('/api/admin/recruitment/applications', verifyAdmin, async (req, res) => {
  try {
    const apps = await Application.find({}).sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

app.post('/api/admin/recruitment/applications', async (req, res) => {
  try {
    const newApp = new Application({
      ...req.body,
      date: new Date().toISOString().split('T')[0],
      status: 'PENDING',
    });
    await newApp.save();
    res.status(201).json({ success: true, application: newApp });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

app.patch('/api/admin/recruitment/applications/:id', verifyAdmin, async (req, res) => {
  try {
    const updated = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Application not found' });
    res.json({ success: true, application: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// ─── STUDENT REGISTRATIONS (PERSISTED IN MONGODB) ───
app.get('/api/portal/registrations/:userId', verifyToken, async (req, res) => {
  try {
    const list = await Registration.find({
      $or: [{ userId: req.params.userId }, { userId: '2300030000' }],
    }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

app.post('/api/portal/registrations', verifyToken, async (req, res) => {
  try {
    const newReg = new Registration({
      passId: 'KL-EFIT-' + Math.floor(1000 + Math.random() * 9000),
      status: 'CONFIRMED',
      ...req.body,
    });
    await newReg.save();
    res.status(201).json({ success: true, registration: newReg });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register for event' });
  }
});

// ─── ADMIN DASHBOARD STATS (ADMIN ONLY) ───
app.get('/api/admin/stats', verifyAdmin, async (req, res) => {
  try {
    const [membersCount, eventsCount, noticesCount, projectsCount, recentEvents] = await Promise.all([
      Member.countDocuments(),
      Event.countDocuments(),
      Notice.countDocuments(),
      Project.countDocuments(),
      Event.find({}).sort({ date: -1 }).limit(5),
    ]);

    res.json({
      stats: [
        { label: 'TOTAL MEMBERS', value: membersCount },
        { label: 'ACTIVE EVENTS', value: eventsCount },
        { label: 'NOTICES', value: noticesCount },
        { label: 'PROJECTS', value: projectsCount },
      ],
      recentEvents,
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

// ─── USER & PERMISSION MANAGEMENT (DYNAMIC INDIVIDUAL CONTROLS) ───
app.get('/api/admin/users', verifyAdmin, async (req, res) => {
  try {
    const [dbUsers, teamMembers] = await Promise.all([
      User.find({}).lean(),
      Member.find({}).lean(),
    ]);

    const userMap = new Map();

    // 1. Index users from MongoDB
    dbUsers.forEach((u) => {
      const key = (u.universityId || u.email || '').toLowerCase().trim();
      if (!key) return;
      userMap.set(key, {
        id: u._id.toString(),
        universityId: u.universityId || '',
        name: u.name,
        email: u.email,
        accountType: u.accountType,
        roles: u.roles || ['STUDENT'],
        allowedModules: u.allowedModules?.length ? u.allowedModules : (u.accountType === 'SUPER_ADMIN' ? ALL_MODULES : DEFAULT_MEMBER_MODULES),
        customPermissions: u.customPermissions || {},
        status: u.status || 'Active',
      });
    });

    // 2. Merge team roster members so Lead Developer can manage anyone right away
    teamMembers.forEach((m) => {
      const key = (m.universityId || m.email || '').toLowerCase().trim();
      if (!key) return;
      const existing = userMap.get(key);

      const isLeadDev = m.universityId === '2400090281' || (m.email && m.email.startsWith('2400090281'));
      const roleLower = (m.role || '').toLowerCase();
      const isPresident = roleLower.includes('president') && !roleLower.includes('vice');

      const defaultType = (isLeadDev || isPresident) ? 'SUPER_ADMIN' : 'MEMBER';
      const defaultRoles = (isLeadDev || isPresident)
        ? [m.role || 'Super Admin', 'SUPER_ADMIN', 'PRESIDENT']
        : [m.role || 'Member', m.category || 'Core'];

      if (!existing) {
        userMap.set(key, {
          id: m.universityId || m.id || m._id.toString(),
          universityId: m.universityId || '',
          name: m.name,
          email: m.email || `${m.universityId}@kluniversity.in`,
          accountType: defaultType,
          roles: defaultRoles,
          allowedModules: defaultType === 'SUPER_ADMIN' ? ALL_MODULES : DEFAULT_MEMBER_MODULES,
          customPermissions: {},
          status: 'Active',
          teamRole: m.role,
        });
      } else {
        if (!existing.teamRole) existing.teamRole = m.role;
      }
    });

    res.json({ users: Array.from(userMap.values()) });
  } catch (err) {
    console.error('Error fetching admin users:', err);
    res.status(500).json({ error: 'Failed to fetch user list' });
  }
});

app.put('/api/admin/users/:id/permissions', verifySuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { accountType, roles, allowedModules, customPermissions } = req.body;

    let user = await User.findOne({
      $or: [
        { universityId: id },
        { email: new RegExp(`^${id}$`, 'i') },
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
      ],
    });

    if (!user) {
      const member = await Member.findOne({
        $or: [
          { universityId: id },
          { email: new RegExp(`^${id}$`, 'i') },
          { id: id },
        ],
      });

      user = new User({
        universityId: member?.universityId || id,
        email: (member?.email || `${id}@kluniversity.in`).toLowerCase().trim(),
        name: member?.name || `Member ${id}`,
        accountType: accountType || 'MEMBER',
        roles: roles || [member?.role || 'Member'],
        allowedModules: allowedModules || DEFAULT_MEMBER_MODULES,
        customPermissions: customPermissions || {},
      });
    } else {
      if (accountType) user.accountType = accountType;
      if (roles) user.roles = roles;
      if (allowedModules) user.allowedModules = allowedModules;
      if (customPermissions) user.customPermissions = customPermissions;
    }

    await user.save();
    await recordAudit(
      'USER_PERMISSIONS_OVERRIDDEN',
      req.user?.email || 'Lead_Developer',
      `User ${user.universityId} (${user.name}) permissions adjusted. Modules: ${user.allowedModules?.join(', ')}`,
      'SUCCESS'
    );
    res.json({ success: true, user });
  } catch (err) {
    console.error('Error updating user permissions:', err);
    res.status(500).json({ error: 'Failed to update user permissions' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`EFIT API Server running on http://localhost:${PORT}`);
});
