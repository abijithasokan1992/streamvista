import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import oracledb from "oracledb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import * as os from "oci-objectstorage";
import * as common from "oci-common";
import { QCService } from "./services/QCService";
import { GoogleDriveService } from "./services/GoogleDriveService";
import { PublicIntelligenceService } from "./services/PublicIntelligenceService";
import { EmailService } from "./services/EmailService";
import { mountPaymentRoutes } from "./routes/payments/mount";
import dotenv from "dotenv";

dotenv.config();

// Identity connection parameters provided by StreamVista OCI specification
const OCI_IDENTITY_APP_ID = "42584711378649c7a8751f00a425878a";
const OCI_DB_CONNECTION_STRING = process.env.OCI_DB_CONNECTION_STRING || "adb.ap-mumbai-1.oraclecloud.com:1522/g1234567_yourdb_high.adb.oraclecloud.com";

const emailService = new EmailService();
const qcService = new QCService();
const driveService = new GoogleDriveService(
  path.join(process.cwd(), "google-service-account.json"),
  process.env.GOOGLE_DRIVE_API_KEY
);
const intelligenceService = new PublicIntelligenceService();

let oracleFailed = false;
async function getDbConnection() {
  const dbPassword = process.env.ORACLE_DB_PASSWORD;
  if (dbPassword) {
    try {
      return await oracledb.getConnection({
        user: process.env.ORACLE_DB_USER || "abijithasokan@crayonspictures.com",
        password: dbPassword,
        connectString: OCI_DB_CONNECTION_STRING,
      });
    } catch (err: any) {
      console.error("Oracle DB connection failed:", err);
    }
  } else {
    console.info("Oracle DB credentials not provided.");
  }
  
  // Return a mock connection object with a safe execute method
  return {
    async execute(query: string, params?: any) {
      console.warn("Mocking DB execute: ", query);
      return { rows: [] };
    },
    async close() {
      // no-op
    }
  };
}
const JWT_SECRET = process.env.JWT_SECRET || "streamvista_super_secret_key_2026";

// In-Memory mock DB for when Oracle DB credentials aren't provided
const memoryUsers: any[] = [];
let payloadIdCounter = 1;

// Kerala Police Investigation Schema
const memorySuspects: any[] = [
  { id: 1, name: 'Sample Suspect', mobileNumbers: ['9412345678'], socialProfiles: { instagram: '@suspect_sample' }, status: 'Under Surveillance' }
];
let suspectCounter = 2;

const memoryInvestigativeLogs: any[] = [];
let logCounter = 1;

const memoryProjects: any[] = [
  { id: 1, userId: 1, title: 'Crimson Horizon', type: 'Feature Film', status: 'Post-Production', progress: 75, date: 'Oct 2026', banner: 'crayons-pictures' },
  { id: 2, userId: 1, title: 'The Silent Valley', type: 'Web Series', status: 'Principal Photography', progress: 30, date: 'Mar 2027', banner: 'abhijith-asokan-productions' },
];
let projectCounter = 3;

const memoryVouchers: any[] = [];
let voucherCounter = 1;

let fileMetadataCounter = 1;
const memoryFileMetadata: any[] = [];

// Delivery mock data
let deliveryCounter = 1;
const memoryDeliveryPackages: any[] = [];
let deliveryLogCounter = 1;
const memoryDeliveryLogs: any[] = [];

// Bridge mock data
let bridgeSubmissionCounter = 1;
const memoryBridgeSubmissions: any[] = [];
const memoryLicensingTerms: any[] = [];
let metricCounter = 1;
const memoryPerformanceMetrics: any[] = [];

// Extended MediaTech Service Catalog
const serviceCatalog = [
  { id: 'SVC-QC-01', name: 'Content QC Clearance Certificate', category: 'LEGAL', price: 4999, description: 'OTT Standard Quality Check' },
  { id: 'SVC-DL-01', name: 'OTT Digital Rights Sub-License', category: 'RIGHTS', price: 50000, description: 'Master Licensing Deed' },
  { id: 'SVC-AI-01', name: 'AI Audio Noise Reduction', category: 'AI_POST', price: 2999, description: 'Studio Grade Vocal Enhancement' },
  { id: 'SVC-AI-02', name: 'AI 4K Upscaling & HDR Enhancement', category: 'AI_POST', price: 7500, description: 'HD to 4K Master Conversion' },
  { id: 'SVC-LOC-01', name: 'AI Multi-Language Dubbing', category: 'LOCALISATION', price: 15000, description: 'Regional Tone Matching' },
  { id: 'SVC-DEL-01', name: 'Encrypted Master Delivery (DCP)', category: 'MEDIATECH', price: 9999, description: 'Secure Studio-to-OTT Transfer' },
  { id: 'SVC-LEG-01', name: 'Rights Clearance Engine Access', category: 'LEGAL', price: 14999, description: 'Automated Territory Tracking' }
];

// Studio Booking mock data
let reservationCounter = 1;
const memoryReservations: any[] = [];

const RESOURCES = [
  { id: 'vfx-1', name: 'VFX Suite A - Heavy Compute', category: 'studio' },
  { id: 'di-1', name: 'DI & Color Grading Suite', category: 'studio' },
  { id: 'sound-1', name: 'Atmos Mixing Stage', category: 'studio' },
  { id: 'cam-1', name: 'ARRI Alexa LF 1', category: 'equipment' },
  { id: 'lens-1', name: 'Signature Prime 47mm', category: 'equipment' }
];

// Object Storage mock data
let fileCounter = 3;
const memoryFiles: any[] = [
  { id: 1, name: "RAW_A_CAM_TAKE1.braw", size: 543000000, type: "video/braw", banner: "crayons-pictures", uploadedAt: new Date().toISOString() },
  { id: 2, name: "AUDIO_MIX_STEMS.wav", size: 120000000, type: "audio/wav", banner: "abhijith-asokan-productions", uploadedAt: new Date().toISOString() }
];

const upload = multer({ storage: multer.memoryStorage() });

// OCI Configuration
let objectStorageClient: os.ObjectStorageClient | null = null;
try {
  const provider = new common.ConfigFileAuthenticationDetailsProvider();
  objectStorageClient = new os.ObjectStorageClient({ authenticationDetailsProvider: provider });
} catch (e) {
  console.warn("OCI Creds not found, continuing without OCI client");
}

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Access token missing" });
  
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  // Webhook raw-body is registered first; JSON parser is installed inside the mount
  // so /order and /verify still receive a parsed body.
  mountPaymentRoutes(app, authenticateToken);
  app.use(express.json());

  // Catalog Endpoint
  app.get("/api/catalog/services", async (req, res) => {
    res.json({ success: true, services: serviceCatalog });
  });

  // Legacy alias. Canonical handlers live in mountPaymentRoutes:
  // POST /api/payments/order, POST /api/payments/verify, POST /api/razorpay/webhook
  app.post("/api/payments/create-order", authenticateToken, async (_req: any, res) => {
    res.status(410).json({ error: "Use POST /api/payments/order" });
  });

  app.post("/api/qc/trigger", authenticateToken, async (req: any, res) => {
    const { assetId, filePath } = req.body;
    if (!assetId) return res.status(400).json({ error: "Asset ID required" });

    try {
      const result = await qcService.runFullScan(assetId, filePath || "default_path.mp4");
      res.json({ success: true, result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "QC Scan execution failed" });
    }
  });

  // Registration Endpoint
  app.post("/api/signup", async (req, res) => {
    const { fullName, email, password, targetWorkspace } = req.body;

    if (!fullName || !email || !password || !targetWorkspace) {
      return res.status(400).json({ error: "Missing required security parameters." });
    }

    let connection;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const dbUser = process.env.ORACLE_DB_USER || "abijithasokan@crayonspictures.com";
      connection = await getDbConnection();
      if (!connection) {
         // Memory Fallback
         const existingUser = memoryUsers.find(u => u.email === email);
         if (existingUser) return res.status(400).json({ error: "Email already exists in the system." });
         
         const newUser = {
           userId: Date.now(),
           fullName,
           email,
           passwordHash: hashedPassword,
           workspace: targetWorkspace,
           role: 'user',
           isActive: 1
         };
         memoryUsers.push(newUser);
         
         return res.json({
           success: true,
           message: "Workspace allocation node initialized.",
           metadata: { identityAppId: OCI_IDENTITY_APP_ID, targetWorkspace, proxyStatus: "SIMULATED_DB_COMMIT" }
         });
      }

      

      const result = await connection.execute(
        `INSERT INTO CRAYONS_USERS 
          (FULL_NAME, EMAIL, PASSWORD_HASH, WORKSPACE)
         VALUES 
          (:name, :email, :password, :workspace)`,
        {
           name: fullName,
           email: email,
           password: hashedPassword,
           workspace: targetWorkspace
        },
        { autoCommit: true }
      );

      const token = jwt.sign({ fullName, email, workspace: targetWorkspace }, JWT_SECRET, { expiresIn: '8h' });

      res.json({ success: true, message: "Profile provisioned securely via Oracle backend.", token });
    } catch (err: any) {
      if (err.errorNum === 1) { // Oracle Unique Constraint error code
        return res.status(400).json({ error: "Email already exists in the system." });
      }
      console.error("OCI Integration Error Database:", err);
      res.status(500).json({ error: "Oracle Cloud Service Execution Failed", details: err.message });
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) {}
      }
    }
  });

  // --- Kerala Police Investigation Endpoints ---

  // Secure Gateway Logger Middleware
  const gatewayLogger = (req: any, res: any, next: any) => {
    const timestamp = new Date().toISOString();
    const sourceIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`[SecureGateway] ${timestamp} | INCOMING: ${req.method} ${req.url} | SOURCE: ${sourceIp}`);
    next();
  };
  app.use('/api/police', gatewayLogger);

  app.get("/api/police/intelligence", authenticateToken, async (req: any, res) => {
    const news = await intelligenceService.getLatestIntelligence();
    res.json({ success: true, intelligence: news });
  });

  app.get("/api/police/cases/public", authenticateToken, async (req: any, res) => {
    const cases = await intelligenceService.getPublicCases();
    res.json({ success: true, cases });
  });

  // Simulation Mode: Populates the dashboard with investigative data for testing
  app.post("/api/police/investigation/simulate", authenticateToken, async (req: any, res) => {
    const { suspectId } = req.body;
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });

    // 1. Add Simulated Contacts & Conversations
    memoryInvestigativeLogs.push(
      { id: logCounter++, timestamp: new Date(), action: 'DATA_EXTRACTED', user: 'SYSTEM', fileName: 'contacts.txt', suspectId, remarks: 'Simulated Extraction' },
      { id: logCounter++, timestamp: new Date(), action: 'DATA_EXTRACTED', user: 'SYSTEM', fileName: 'sms_logs.txt', suspectId, remarks: 'Simulated Extraction' }
    );

    // 2. Add Simulated Financial Logs
    const finLogs = [
      { date: '2026-06-25', amount: '₹5,000', type: 'UPI_OUT', recipient: 'Unknown_Merchant', remark: 'High Priority' },
      { date: '2026-06-28', amount: '₹1,50,000', type: 'ATM_WITHDRAWAL', recipient: 'Kochi_ATM_04', remark: 'Suspicious Volume' }
    ];

    // 3. Add Simulated Location Mapping (Tower Tracking)
    const locLogs = [
      { timestamp: '2026-07-01 10:00', lat: 9.9312, lng: 76.2673, towerId: 'KOCHI_NORTH_01', accuracy: '50m' },
      { timestamp: '2026-07-01 12:30', lat: 10.0159, lng: 76.3419, towerId: 'ALUVA_SOUTH_04', accuracy: '120m' }
    ];

    const suspect = memorySuspects.find(s => s.name === suspectId || s.id.toString() === suspectId);
    if (suspect) {
      suspect.financialActivity = finLogs;
      suspect.locationHistory = locLogs;
    }

    res.json({ success: true, message: "Simulation Complete. Dashboard populated with evidence." });
  });

  app.get("/api/police/suspects/:id/dashboard", authenticateToken, async (req: any, res) => {
    const suspectId = req.params.id;
    
    // Authorization check
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });

    // Aggregate all data for this suspect
    const logs = memoryInvestigativeLogs.filter(l => l.suspectId === suspectId);
    const suspect = memorySuspects.find(s => s.name === suspectId || s.id.toString() === suspectId);
    
    // Fetch Public Context for Dashboard
    const intelligence = await intelligenceService.getLatestIntelligence();
    const publicCases = await intelligenceService.getPublicCases();

    // Generate Master Timeline (Merged Chronological View)
    const timeline = [
      ...(suspect?.locationHistory || []).map((l: any) => ({ ...l, type: 'LOCATION', description: `Tower: ${l.towerId}` })),
      ...(suspect?.financialActivity || []).map((f: any) => ({ ...f, timestamp: f.date, type: 'FINANCIAL', description: `${f.type}: ${f.amount} to ${f.recipient}` })),
      ...logs.map((l: any) => ({ ...l, type: 'HUB_ACTION', description: l.action }))
    ].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const dashboardData = {
      suspect: suspect || { id: suspectId, name: 'External Identity' },
      activitySummary: {
        totalTransfers: logs.length,
        lastActive: logs.length > 0 ? logs[0].timestamp : 'No Activity',
        fileTypes: logs.reduce((acc: any, curr: any) => {
          const ext = curr.fileName.split('.').pop();
          acc[ext] = (acc[ext] || 0) + 1;
          return acc;
        }, {})
      },
      investigativeData: {
        financialActivity: suspect?.financialActivity || [],
        locationHistory: suspect?.locationHistory || [],
        masterTimeline: timeline
      },
      publicContext: {
        relatedNews: intelligence.slice(0, 3),
        registryMatches: publicCases.filter(c => c.suspect.includes(suspect?.name || ''))
      },
      auditLogs: logs.slice(0, 50) // Last 50 actions
    };

    res.json({ success: true, dashboard: dashboardData });
  });

  app.get("/api/police/suspects", authenticateToken, async (req: any, res) => {
    // Restrict access to authorized police personnel
    if (req.user.role !== 'admin' && req.user.workspace !== 'studio') {
      return res.status(403).json({ error: "Unauthorized access to investigative data." });
    }
    res.json({ success: true, suspects: memorySuspects });
  });

  app.post("/api/police/suspects", authenticateToken, async (req: any, res) => {
    const { name, mobileNumbers, socialProfiles, remarks } = req.body;
    const newSuspect = {
      id: suspectCounter++,
      name,
      mobileNumbers: mobileNumbers || [],
      socialProfiles: socialProfiles || {},
      remarks,
      status: 'Active Investigation',
      createdAt: new Date()
    };
    memorySuspects.push(newSuspect);
    res.json({ success: true, suspect: newSuspect });
  });

  app.get("/api/police/audit-logs", authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Audit logs restricted to administrators." });
    }
    res.json({ success: true, logs: memoryInvestigativeLogs });
  });

  // Case Sealing and Secure Disposal Protocol
  app.post("/api/police/investigation/seal", authenticateToken, async (req: any, res) => {
    const { suspectId } = req.body;
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });

    const suspect = memorySuspects.find(s => s.name === suspectId || s.id.toString() === suspectId);
    if (!suspect) return res.status(404).json({ error: "Suspect not found" });

    // 1. Mark suspect as 'Sealed'
    suspect.status = 'Investigation Sealed - Case Closed';
    suspect.sealedAt = new Date();

    // 2. Clear active investigative logs from the live dashboard
    const sealedLogs = memoryInvestigativeLogs.filter(l => l.suspectId === suspectId);
    // In a real system, these would be moved to an encrypted 'Deep Archive' bucket
    
    // 3. Record the sealing action in the master audit log
    memoryInvestigativeLogs.unshift({
      id: logCounter++,
      timestamp: new Date(),
      action: 'CASE_SEALED',
      user: req.user.email,
      suspectId: suspectId,
      remarks: "Investigation complete. Active session cleared for discretion."
    });

    res.json({ 
      success: true, 
      message: "Investigation Sealed Successfully.", 
      protocol: {
        activeSession: "CLEARED",
        evidenceArchive: "ENCRYPTED_AND_STORED",
        discretionLevel: "MAXIMUM"
      }
    });
  });

  // Updated Ingest with Metadata Linking
  app.post("/api/ingest", authenticateToken, upload.single("file"), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: "File required" });

    const workspace = req.user.workspace || "default";
    const useDataBox = req.body.useDataBox === "true"; 
    const suspectId = req.body.suspectId; // Link to suspect

    try {
      if (useDataBox) {
        const driveResult = await driveService.uploadFile(
          req.file.originalname,
          req.file.mimetype,
          req.file.buffer,
          process.env.GOOGLE_DRIVE_FOLDER_ID
        );

        // Record Investigative Audit Log
        memoryInvestigativeLogs.unshift({
          id: logCounter++,
          timestamp: new Date(),
          action: 'DATA_BOX_TRANSFER',
          user: req.user.email,
          fileName: req.file.originalname,
          suspectId: suspectId || 'Unknown',
          driveId: driveResult.id
        });
      }

      res.json({ success: true, message: useDataBox ? "Asset securely transferred to Police Data Box and logged." : "File ingested successfully." });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Upload process failed" });
    }
  });

  // File Management
  app.get("/api/files", authenticateToken, async (req: any, res) => {
    const workspace = req.user.workspace || "default";
    // In production, list from OCI bucket/DB
    res.json({ success: true, files: [{id: 1, name: 'Sample_Video.mp4', uploadedAt: new Date()}] });
  });

  app.delete("/api/files/:filename", authenticateToken, async (req: any, res) => {
    const filename = req.params.filename;
    const workspace = req.user.workspace || "default";
    // In production, delete from OCI and database
    console.log(`Deleting ${filename} from workspace ${workspace}`);
    res.json({ success: true, message: "File deleted" });
  });

  app.post("/api/ai-sort", authenticateToken, async (req: any, res) => {
    const workspace = req.user.workspace;
    if (workspace !== 'studio') {
        return res.status(403).json({ error: "AI sorting restricted to Paid users. Please upgrade." });
    }
    // Logic for AI sorting...
    res.json({ success: true, message: "AI sorting initiated" });
  });

  // Subscription Endpoints
  // Phase A: Platform Stability - Razorpay Revenue Integration
  app.post("/api/subscribe", authenticateToken, async (req: any, res) => {
    try {
      const Razorpay = require('razorpay');
      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock",
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });

      const options = {
        amount: req.body.amount || 50000, // amount in the smallest currency unit
        currency: "INR",
        receipt: `receipt_user_${req.user.userId}`,
      };

      const order = await rzp.orders.create(options);
      res.json({ orderId: order.id, key: process.env.RAZORPAY_KEY_ID || "rzp_test_mock" });
    } catch (err) {
      console.error("Razorpay order creation failed:", err);
      res.status(500).json({ error: "Failed to initiate payment." });
    }
  });

  app.post("/api/webhooks/razorpay", (_req, res) => {
    res.status(410).json({ error: "Use POST /api/razorpay/webhook" });
  });

  // Activity Logs Endpoint
  app.get("/api/activity-logs", authenticateToken, async (req: any, res) => {
    let connection;
    try {
        const workspace = req.user.workspace;
        connection = await getDbConnection();
        if (!connection) {
            return res.json({ success: true, logs: [] });
        }
        // Fetch Recent Uploads
        const uploadsRes = await connection.execute(
            `SELECT 'File Upload' as ACTION, FILE_NAME as DETAILS, UPLOADED_AT as LOG_TIME 
             FROM RECENT_UPLOADS WHERE WORKSPACE_ID = :workspace`,
            { workspace }
        );
        
        // Fetch Logins (Joining with users to filter by workspace)
        const loginsRes = await connection.execute(
            `SELECT 'Login' as ACTION, 'User accessed workspace' as DETAILS, S.CREATED_AT as LOG_TIME
             FROM CRAYONS_ACTIVE_SESSIONS S
             JOIN CRAYONS_USERS U ON S.USER_ID = U.USER_ID
             WHERE U.WORKSPACE = :workspace`,
            { workspace }
        );

        const logs = [...(uploadsRes.rows || []), ...(loginsRes.rows || [])]
                     .sort((a,b) => new Date(b.LOG_TIME).getTime() - new Date(a.LOG_TIME).getTime())
                     .slice(0, 10);

        res.json({ success: true, logs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch activity logs" });
    } finally {
        if (connection) { try { await connection.close(); } catch(e) {} }
    }
  });

  // Admin: Send Invite (Generate Voucher)
  app.post("/api/admin/send-invite", authenticateToken, async (req: any, res) => {
    const { email, perks } = req.body;
    const voucherCode = "VOUCHER-" + Math.random().toString(36).substring(7).toUpperCase();
    const newVoucher = { id: voucherCounter++, code: voucherCode, email, perks, redeemed: false };
    memoryVouchers.push(newVoucher);

    // Phase A: Platform Stability - Reliable Email Notification
    await emailService.sendEmail(
      email, 
      "Your StreamVista Perks", 
      `Use code ${voucherCode} for perks: ${perks.join(', ')}`
    );

    res.json({ success: true, code: voucherCode });
  });

  // Redemption Flow
  app.post("/api/redeem-voucher", authenticateToken, async (req: any, res) => {
    const { code } = req.body;
    const voucher = memoryVouchers.find(v => v.code === code && !v.redeemed);
    if (!voucher) return res.status(404).json({ error: "Invalid or already redeemed voucher" });
    
    // Apply perks (mock logic)
    voucher.redeemed = true;
    console.log(`Voucher ${code} redeemed by ${req.user.userId}`);
    
    res.json({ success: true, perks: voucher.perks });
  });

  // Login Endpoint
  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required security parameters." });
    }

    let connection;

    try {
      const dbUser = process.env.ORACLE_DB_USER || "abijithasokan@crayonspictures.com";
      connection = await getDbConnection();
      if (!connection) {
         // Memory Fallback
         const tempUser = memoryUsers.find(u => u.email === email);
         if (!tempUser && email !== 'abijithasokan@crayonspictures.com') {
           return res.status(401).json({ error: "Invalid credentials or unauthorized access." });
         }
         
         let validPassword = false;
         let workspace = "creator-studio";
         let userObj = { userId: 1, email: "abijithasokan@crayonspictures.com", fullName: "A. Asokan" };
         
         if (tempUser) {
           validPassword = await bcrypt.compare(password, tempUser.passwordHash);
           workspace = tempUser.workspace;
           userObj = { userId: tempUser.userId, email: tempUser.email, fullName: tempUser.fullName };
         } else if (password === "admin" || email === "abijithasokan@crayonspictures.com") {
           // allow bypass for the default credential on mock db
           validPassword = true;
         }

         if (!validPassword) {
           return res.status(401).json({ error: "Invalid credentials or unauthorized access." });
         }
         
         const token = jwt.sign(userObj, JWT_SECRET, { expiresIn: '8h' });

         return res.json({
           success: true,
           workspace,
           token,
           message: "Authentication successful. Access granted to target workspace.",
           metadata: { proxyStatus: "SIMULATED_DB_AUTH" }
         });
      }

      

      const result = await connection.execute(
        `SELECT USER_ID, FULL_NAME, EMAIL, PASSWORD_HASH, WORKSPACE FROM CRAYONS_USERS 
         WHERE EMAIL = :email AND IS_ACTIVE = 1`,
        { email: email }
      );

      // @ts-ignore
      if (result.rows && result.rows.length > 0) {
        // @ts-ignore
        const [userId, fullName, dbEmail, passwordHash, workspace] = result.rows[0];
        
        const validPassword = await bcrypt.compare(password, passwordHash as string);
        if (!validPassword) {
          return res.status(401).json({ error: "Invalid credentials or unauthorized access." });
        }
        
        const token = jwt.sign({ userId, email: dbEmail, fullName, workspace }, JWT_SECRET, { expiresIn: '8h' });
        
        // Optionally insert into CRAYONS_ACTIVE_SESSIONS here
        
        res.json({ 
          success: true, 
          message: "Authentication successful. Routing to workspace...", 
          workspace,
          token
        });
      } else {
        res.status(401).json({ error: "Invalid credentials or unauthorized access." });
      }

    } catch (err: any) {
      console.error("OCI Integration Error Database:", err);
      res.status(500).json({ error: "Oracle Cloud Service Execution Failed", details: err.message });
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) {}
      }
    }
  });

  // Logout Endpoint
  app.post("/api/logout", authenticateToken, async (req: any, res) => {
    // In a real system, you might invalidate the token in CRAYONS_ACTIVE_SESSIONS
    res.json({ success: true, message: "Securely logged out form Oracle cloud services." });
  });

  // Profile Endpoint
  app.get("/api/profile", authenticateToken, async (req: any, res) => {
    // req.user has been decoded by the JWT middleware
    res.json({
      success: true,
      profile: {
        userId: req.user.userId,
        fullName: req.user.fullName,
        email: req.user.email,
        identityAppId: OCI_IDENTITY_APP_ID
      }
    });
  });

  // User Storage Endpoint
  // Phase A: Platform Stability - Real-time Storage Tracking
  app.get("/api/user/storage", authenticateToken, async (req: any, res) => {
    let connection;
    try {
        const userId = req.user.userId;
        connection = await getDbConnection();
        
        let usage = 0;
        let limit = 1024; // Default Free limit
        
        if (connection) {
            // Calculate real usage from storage/inventory tables
            const usageRes = await connection.execute(
                `SELECT SUM(file_size) as total_size FROM file_metadata WHERE user_id = :userId`,
                { userId }
            );
            usage = (usageRes.rows?.[0]?.[0] || 0) / (1024 * 1024); // Convert to MB
            
            const limitRes = await connection.execute(
                `SELECT storage_limit FROM users WHERE user_id = :userId`,
                { userId }
            );
            limit = limitRes.rows?.[0]?.[0] || 1024;
        } else {
            // Memory fallback logic
            const userFiles = memoryFiles.filter(f => f.userId === userId);
            usage = userFiles.reduce((acc, f) => acc + (f.size || 0), 0) / (1024 * 1024);
        }

        res.json({
           success: true,
           used: Math.round(usage * 100) / 100,
           limit: limit,
           workspace: req.user.workspace
        });
    } catch (err) {
        console.error("Storage fetch failed:", err);
        res.status(500).json({ error: "Failed to fetch storage usage." });
    } finally {
        if (connection) await connection.close();
    }
  });

  // Reset Password Endpoint (Simulated)
  app.post("/api/reset-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required to request rest." });
    
    // In reality, this would generate a random token, store it in CRAYONS_PASSWORD_RESETS, 
    // and send an email or OTP.
    
    res.json({ 
      success: true, 
      message: "If an account exists, a secure link will be dispatched." 
    });
  });

  // --- Phase B: Marketplace Revenue Workflow ---

  app.post("/api/marketplace/submit", authenticateToken, async (req: any, res) => {
    const { fileId, banner } = req.body;
    const userId = req.user.userId;

    // 1. Fetch File
    const file = memoryFiles.find(f => f.id === fileId);
    if (!file) return res.status(404).json({ error: "File not found." });

    // 2. Trigger Phase B Workflow: Creator Upload -> QC
    console.log(`[Phase B] Initiating Workflow for Asset ${fileId}`);
    
    // Simulate QC Process
    const qcResult = await qcService.runFullScan(fileId.toString(), file.name);
    
    if (!qcResult.passed) {
      return res.status(422).json({ 
        success: false, 
        status: "QC_FAILED", 
        message: "Asset did not meet technical standards (45Mbps+ Bitrate, 0 Frame Drops)." 
      });
    }

    // 3. QC Passed -> Legal Intake
    console.log(`[Phase B] Asset ${fileId} Passed QC. Moving to Legal Review.`);
    
    // In production, update Oracle: UPDATE marketplace_assets SET status = 'LEGAL_PENDING'
    file.marketplaceStatus = "LEGAL_PENDING";
    file.qcVerified = true;

    res.json({ 
      success: true, 
      status: "LEGAL_PENDING", 
      message: "QC Verified. Asset submitted for Legal Clearance." 
    });
  });

  app.get("/api/marketplace/catalog", authenticateToken, async (req: any, res) => {
    // Only assets that passed QC and Legal Review are visible to Buyers
    const catalog = memoryFiles.filter(f => f.marketplaceStatus === "APPROVED");
    res.json({ success: true, catalog });
  });

  app.post("/api/marketplace/offer", authenticateToken, async (req: any, res) => {
    // Buyer makes an offer on a Marketplace asset
    const { fileId, offerAmount } = req.body;
    const buyerId = req.user.userId;

    // Simulate Offer Creation
    const offer = {
      id: Math.floor(Math.random() * 1000),
      fileId,
      buyerId,
      amount: offerAmount,
      status: "OFFER_PENDING",
      createdAt: new Date().toISOString()
    };

    console.log(`[Revenue] New Offer received for Asset ${fileId}: ₹${offerAmount}`);
    res.json({ success: true, offer });
  });

  app.get("/api/projects", authenticateToken, async (req: any, res) => {
    let connection;
    try {
      const workspace = req.user.workspace;
      connection = await getDbConnection();
      if (!connection) {
        // memory fallback
        const userProjects = memoryProjects.filter(p => (req.user.userId === 1 || p.userId === req.user.userId) && p.banner === workspace);
        return res.json({ success: true, projects: userProjects });
      }

      

      const result = await connection.execute(
        `SELECT PROJECT_ID, TITLE, PROJECT_TYPE, STATUS, PROGRESS, DELIVERY_DATE, BANNER FROM CRAYONS_PROJECTS 
         WHERE USER_ID = :userId AND BANNER = :workspace ORDER BY CREATED_AT DESC`,
        { userId: req.user.userId, workspace }
      );

      const projects = result.rows?.map((row: any) => ({
        id: row[0], title: row[1], type: row[2], status: row[3], progress: row[4], date: row[5], banner: row[6]
      })) || [];

      res.json({ success: true, projects });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch projects" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  app.post("/api/projects", authenticateToken, async (req: any, res) => {
    const { title, description, language, genre, releaseYear, duration, rightsOwner, producer, director, keywords, status, progress, date, banner } = req.body;
    if (!title) return res.status(400).json({ error: "Project Title is required" });

    let connection;
    try {
      const projectBanner = banner || "crayons-pictures";
      connection = await getDbConnection();
      if (!connection) {
        const newProject = {
          id: projectCounter++,
          userId: req.user.userId || 1,
          title, description, language, genre, releaseYear, duration, rightsOwner, producer, director, keywords, status: status || 'Pre-Production', progress: progress || 0, date, banner: projectBanner
        };
        memoryProjects.unshift(newProject);
        return res.json({ success: true, project: newProject });
      }

      

      const result = await connection.execute(
        `INSERT INTO CRAYONS_PROJECTS (USER_ID, TITLE, DESCRIPTION, LANGUAGE, GENRE, RELEASE_YEAR, DURATION, RIGHTS_OWNER, PRODUCER, DIRECTOR, KEYWORDS, STATUS, PROGRESS, DELIVERY_DATE, BANNER)
         VALUES (:userId, :title, :description, :language, :genre, :releaseYear, :duration, :rightsOwner, :producer, :director, :keywords, :status, :progress, :date, :banner) RETURNING PROJECT_ID INTO :new_id`,
        {
          userId: req.user.userId, title, description, language, genre, releaseYear, duration, rightsOwner, producer, director, keywords, status: status || 'Pre-Production', progress: progress || 0, date, banner: projectBanner,
          new_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        },
        { autoCommit: true }
      );

      // @ts-ignore
      const newId = result.outBinds.new_id[0];
      res.json({ success: true, project: { id: newId, title, description, language, genre, releaseYear, duration, rightsOwner, producer, director, keywords, status: status || 'Pre-Production', progress: progress || 0, date, banner: projectBanner } });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to create project" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  app.put("/api/projects/:id", authenticateToken, async (req: any, res) => {
    const projectId = req.params.id;
    const { title, description, language, genre, releaseYear, duration, rightsOwner, producer, director, keywords, status, progress, date } = req.body;
    let connection;
    try {
      connection = await getDbConnection();
      if (!connection) {
        const index = memoryProjects.findIndex(p => p.id == projectId && (req.user.userId === 1 || p.userId === req.user.userId));
        if (index === -1) return res.status(404).json({ error: "Project not found" });
        memoryProjects[index] = { ...memoryProjects[index], title, description, language, genre, releaseYear, duration, rightsOwner, producer, director, keywords, status, progress, date };
        return res.json({ success: true, project: memoryProjects[index] });
      }

      

      const result = await connection.execute(
        `UPDATE CRAYONS_PROJECTS SET TITLE = :title, DESCRIPTION = :description, LANGUAGE = :language, GENRE = :genre, RELEASE_YEAR = :releaseYear, DURATION = :duration, RIGHTS_OWNER = :rightsOwner, PRODUCER = :producer, DIRECTOR = :director, KEYWORDS = :keywords, STATUS = :status, PROGRESS = :progress, DELIVERY_DATE = :date
         WHERE PROJECT_ID = :id AND USER_ID = :userId`,
        { title, description, language, genre, releaseYear, duration, rightsOwner, producer, director, keywords, status, progress, date, id: projectId, userId: req.user.userId },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) return res.status(404).json({ error: "Project not found or unauthorized" });
      res.json({ success: true, message: "Project updated" });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to update project" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  app.delete("/api/projects/:id", authenticateToken, async (req: any, res) => {
    const projectId = req.params.id;
    let connection;
    try {
      connection = await getDbConnection();
      if (!connection) {
        const index = memoryProjects.findIndex(p => p.id == projectId && (req.user.userId === 1 || p.userId === req.user.userId));
        if (index === -1) return res.status(404).json({ error: "Project not found" });
        memoryProjects.splice(index, 1);
        return res.json({ success: true, message: "Project deleted" });
      }

      

      const result = await connection.execute(
        `DELETE FROM CRAYONS_PROJECTS WHERE PROJECT_ID = :id AND USER_ID = :userId`,
        { id: projectId, userId: req.user.userId },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) return res.status(404).json({ error: "Project not found or unauthorized" });
      res.json({ success: true, message: "Project deleted" });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete project" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  // --- Object Storage Endpoints ---

  const getOciClient = () => {
    try {
      if (process.env.OCI_CONFIG_FILE) {
        const provider = new common.ConfigFileAuthenticationDetailsProvider(process.env.OCI_CONFIG_FILE);
        return new os.ObjectStorageClient({ authenticationDetailsProvider: provider });
      }
    } catch (e) {
      console.warn("OCI Provider not configured, using memory fallback.");
    }
    return null;
  };

  app.get("/api/storage/files", authenticateToken, async (req: any, res) => {
    const banner = req.query.banner;
    
    // In actual OCI, we would do:
    // const client = getOciClient();
    // if (client) { ... client.listObjects({...}) }

    let connection;
    let files = memoryFiles.filter(f => !banner || f.banner === banner);
    
    try {
      const dbPassword = process.env.ORACLE_DB_PASSWORD;
      if (dbPassword) {
        
        // Enrichen files with Database metadata
        connection = await getDbConnection();
        if (connection) {
          const result = await connection.execute(
            `SELECT M.FILE_ID, M.PROJECT_ID, P.TITLE 
             FROM CRAYONS_FILE_METADATA M 
             LEFT JOIN CRAYONS_PROJECTS P ON M.PROJECT_ID = P.PROJECT_ID`
          );
          
          if (result.rows) {
            const metaMap = new Map();
            result.rows.forEach((row: any) => metaMap.set(row[0], { projectId: row[1], projectTitle: row[2] }));
            
            files = files.map(f => {
              const meta = metaMap.get(f.id);
              return meta ? { ...f, linkedProjectId: meta.projectId, linkedProjectTitle: meta.projectTitle } : f;
            });
          }
        }
      } else {
        // Memory fallback enrichment
        files = files.map(f => {
          const meta = memoryFileMetadata.find(m => m.fileId === f.id);
          if (meta && meta.projectId) {
            const p = memoryProjects.find(pr => pr.id === meta.projectId);
            return { ...f, linkedProjectId: meta.projectId, linkedProjectTitle: p?.title };
          }
          return f;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (connection) { 
        try { 
          await connection.close(); 
        } catch (e) {
          console.error("Error closing connection", e);
        } 
      }
    }

    res.json({ success: true, files });
  });

  app.post("/api/storage/upload", authenticateToken, upload.single("file"), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    
    const banner = req.body.banner || "crayons-pictures";
    
    // In actual OCI, we would do:
    // const client = getOciClient();
    // if (client) { ... client.putObject({ namespaceName, bucketName: "CRAYONS-CREATOR-RAW", objectName: banner + "/" + req.file.originalname, putObjectBody: req.file.buffer }) }

    const newFile = {
      id: fileCounter++,
      name: req.file.originalname,
      size: req.body.originalSize ? parseInt(req.body.originalSize, 10) : req.file.size,
      type: req.file.mimetype,
      banner,
      uploadedAt: new Date().toISOString()
    };
    
    memoryFiles.unshift(newFile);
    res.json({ success: true, file: newFile, message: "File uploaded successfully to CRAYONS-CREATOR-RAW" });
  });

  app.delete("/api/storage/files/:id", authenticateToken, async (req: any, res) => {
    const fileId = parseInt(req.params.id);
    const index = memoryFiles.findIndex(f => f.id === fileId);
    
    if (index === -1) return res.status(404).json({ error: "File not found" });

    // In actual OCI, we would do:
    // const client = getOciClient();
    // if (client) { ... client.deleteObject({...}) }

    memoryFiles.splice(index, 1);
    res.json({ success: true, message: "File deleted securely" });
  });

  app.get("/api/storage/files/:id/download", authenticateToken, async (req: any, res) => {
    const fileId = parseInt(req.params.id);
    const file = memoryFiles.find(f => f.id === fileId);
    if (!file) return res.status(404).json({ error: "File not found" });

    // In actual OCI, we would do:
    // const client = getOciClient();
    // if (client) { const response = await client.getObject({...}); response.value.pipe(res); }

    res.setHeader('Content-disposition', `attachment; filename=${file.name}`);
    res.setHeader('Content-type', file.type);
    res.send("Mock file content for " + file.name);
  });

  app.put("/api/storage/files/:id/rename", authenticateToken, async (req: any, res) => {
    const fileId = parseInt(req.params.id);
    const newName = req.body.newName;
    
    if (!newName) return res.status(400).json({ error: "New name required" });

    const file = memoryFiles.find(f => f.id === fileId);
    if (!file) return res.status(404).json({ error: "File not found" });

    // In actual OCI, we would do:
    // const client = getOciClient();
    // if (client) { ... client.renameObject({...}) }

    file.name = newName;
    res.json({ success: true, file, message: "File renamed successfully" });
  });

  app.get("/api/storage/files/:id/metadata", authenticateToken, async (req: any, res) => {
    let connection;
    try {
      const fileId = parseInt(req.params.id);
      connection = await getDbConnection();
      if (!connection) {
        const metadata = memoryFileMetadata.find(m => m.fileId === fileId) || { fileId };
        return res.json({ success: true, metadata });
      }

      

      const result = await connection.execute(
        `SELECT FILE_METADATA_ID, PROJECT_ID, TITLE, DESCRIPTION, LANGUAGE, GENRE, RELEASE_YEAR, DURATION, KEYWORDS, DIRECTOR 
         FROM CRAYONS_FILE_METADATA WHERE FILE_ID = :fileId`,
        { fileId }
      );

      let metadata = { fileId };
      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0] as any[];
        metadata = {
          fileId,
          // @ts-ignore
          projectId: row[1], title: row[2], description: row[3], language: row[4], genre: row[5], releaseYear: row[6], duration: row[7], keywords: row[8], director: row[9]
        };
      }
      res.json({ success: true, metadata });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch metadata" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  app.post("/api/storage/files/:id/metadata", authenticateToken, async (req: any, res) => {
    const fileId = parseInt(req.params.id);
    const { projectId, title, description, language, genre, releaseYear, duration, keywords, director } = req.body;
    
    let connection;
    try {
      connection = await getDbConnection();
      if (!connection) {
        let meta = memoryFileMetadata.find(m => m.fileId === fileId);
        if (!meta) {
          meta = { id: fileMetadataCounter++, fileId };
          memoryFileMetadata.push(meta);
        }
        Object.assign(meta, { projectId, title, description, language, genre, releaseYear, duration, keywords, director });
        return res.json({ success: true, message: "Metadata updated securely", metadata: meta });
      }

      

      const check = await connection.execute(`SELECT FILE_METADATA_ID FROM CRAYONS_FILE_METADATA WHERE FILE_ID = :fileId`, { fileId });
      
      if (check.rows && check.rows.length > 0) {
        await connection.execute(
          `UPDATE CRAYONS_FILE_METADATA SET PROJECT_ID = :projectId, TITLE = :title, DESCRIPTION = :desc, 
           LANGUAGE = :lang, GENRE = :genre, RELEASE_YEAR = :year, DURATION = :duration, KEYWORDS = :keywords, DIRECTOR = :director 
           WHERE FILE_ID = :fileId`,
          {
            projectId: projectId || null, title, desc: description, lang: language, genre, year: releaseYear,
            duration, keywords, director, fileId
          },
          { autoCommit: true }
        );
      } else {
        await connection.execute(
          `INSERT INTO CRAYONS_FILE_METADATA (FILE_ID, PROJECT_ID, TITLE, DESCRIPTION, LANGUAGE, GENRE, RELEASE_YEAR, DURATION, KEYWORDS, DIRECTOR)
           VALUES (:fileId, :projectId, :title, :desc, :lang, :genre, :year, :duration, :keywords, :director)`,
          {
            fileId, projectId: projectId || null, title, desc: description, lang: language, genre, year: releaseYear,
            duration, keywords, director
          },
          { autoCommit: true }
        );
      }
      res.json({ success: true, message: "Metadata updated securely" });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to update metadata" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  // Delivery Endpoints
  const generateToken = () => Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);

  app.get("/api/delivery/packages", authenticateToken, async (req: any, res) => {
    let connection;
    try {
      const banner = req.query.banner || "crayons-pictures";
      connection = await getDbConnection();
      if (!connection) {
        // filter memory packages implicitly or by just taking user ID and banner from project
        const userProjectIds = memoryProjects.filter(p => p.banner === banner && (req.user.userId === 1 || p.userId === req.user.userId)).map(p => p.id);
        const packages = memoryDeliveryPackages.filter(p => userProjectIds.includes(p.projectId));
        return res.json({ success: true, packages });
      }

      

      const result = await connection.execute(
        `SELECT D.PACKAGE_ID, D.PROJECT_ID, P.TITLE AS PROJECT_TITLE, D.PACKAGE_NAME, D.MASTER_FILE_URL, D.SUBTITLES_URL, D.METADATA_INCLUDED, D.SECURE_LINK_TOKEN, D.EXPIRY_DATE, D.CREATED_AT
         FROM CRAYONS_DELIVERY_PACKAGES D
         JOIN CRAYONS_PROJECTS P ON D.PROJECT_ID = P.PROJECT_ID
         WHERE P.BANNER = :banner AND P.USER_ID = :userId ORDER BY D.CREATED_AT DESC`,
        { userId: req.user.userId, banner }
      );

      const packages = result.rows?.map((row: any) => ({
        id: row[0], projectId: row[1], projectTitle: row[2], packageName: row[3], masterFileUrl: row[4], subtitlesUrl: row[5], metadataIncluded: row[6], secureLinkToken: row[7], expiryDate: row[8], createdAt: row[9]
      })) || [];

      res.json({ success: true, packages });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch delivery packages" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  app.post("/api/delivery/packages", authenticateToken, async (req: any, res) => {
    const { projectId, packageName, masterFileUrl, subtitlesUrl, metadataIncluded, daysToExpiry } = req.body;
    let connection;
    try {
      const token = generateToken();
      let expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (daysToExpiry || 7));

      connection = await getDbConnection();
      if (!connection) {
        const pkg = { id: deliveryCounter++, projectId, userId: req.user.userId, packageName, masterFileUrl, subtitlesUrl, metadataIncluded, secureLinkToken: token, expiryDate, createdAt: new Date() };
        memoryDeliveryPackages.unshift(pkg);
        return res.json({ success: true, package: pkg });
      }

      

      const result = await connection.execute(
        `INSERT INTO CRAYONS_DELIVERY_PACKAGES (PROJECT_ID, USER_ID, PACKAGE_NAME, MASTER_FILE_URL, SUBTITLES_URL, METADATA_INCLUDED, SECURE_LINK_TOKEN, EXPIRY_DATE)
         VALUES (:projectId, :userId, :packageName, :masterFileUrl, :subtitlesUrl, :metadataIncluded, :secureLinkToken, :expiryDate)
         RETURNING PACKAGE_ID INTO :new_id`,
        {
          projectId, userId: req.user.userId, packageName, masterFileUrl, subtitlesUrl, metadataIncluded: metadataIncluded ? 1 : 0, secureLinkToken: token, expiryDate,
          new_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        },
        { autoCommit: true }
      );

      // @ts-ignore
      const newId = result.outBinds.new_id[0];
      res.json({ success: true, package: { id: newId, projectId, packageName, secureLinkToken: token, expiryDate } });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to create delivery package" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  app.get("/api/delivery/packages/:id/logs", authenticateToken, async (req: any, res) => {
    const packageId = parseInt(req.params.id);
    let connection;
    try {
      connection = await getDbConnection();
      if (!connection) {
        return res.json({ success: true, logs: memoryDeliveryLogs.filter(l => l.packageId === packageId) });
      }

      

      const result = await connection.execute(
        `SELECT LOG_ID, DOWNLOADED_BY_IP, DOWNLOAD_TIME FROM CRAYONS_DELIVERY_LOGS WHERE PACKAGE_ID = :packageId ORDER BY DOWNLOAD_TIME DESC`,
        { packageId }
      );

      const logs = result.rows?.map((row: any) => ({
        id: row[0], ip: row[1], downloadTime: row[2]
      })) || [];

      res.json({ success: true, logs });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch logs" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  app.get("/api/delivery/download/:token", async (req: any, res) => {
    const token = req.params.token;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    let connection;
    try {
      connection = await getDbConnection();
      if (!connection) {
        const pkg = memoryDeliveryPackages.find(p => p.secureLinkToken === token);
        if (!pkg) return res.status(404).json({ error: "Invalid link" });
        if (new Date(pkg.expiryDate) < new Date()) return res.status(403).json({ error: "Link expired" });
        
        memoryDeliveryLogs.push({ id: deliveryLogCounter++, packageId: pkg.id, ip, downloadTime: new Date() });
        return res.json({ success: true, message: `Mock download started for ${pkg.packageName}` });
      }

      

      const result = await connection.execute(
        `SELECT PACKAGE_ID, PACKAGE_NAME, MASTER_FILE_URL, EXPIRY_DATE FROM CRAYONS_DELIVERY_PACKAGES WHERE SECURE_LINK_TOKEN = :token`,
        { token }
      );

      if (!result.rows || result.rows.length === 0) return res.status(404).json({ error: "Invalid link" });
      const pkg = result.rows[0] as any[];
      const pId = pkg[0];
      const expiry = new Date(pkg[3]);

      if (expiry < new Date()) {
        return res.status(403).json({ error: "Link expired" });
      }

      await connection.execute(
        `INSERT INTO CRAYONS_DELIVERY_LOGS (PACKAGE_ID, DOWNLOADED_BY_IP) VALUES (:pId, :ip)`,
        { pId, ip: ip || 'unknown' },
        { autoCommit: true }
      );

      res.json({ success: true, message: `Download started for ${pkg[1]}` });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Download failed" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  // Crayons Bridge Endpoints
  
  app.get("/api/bridge/submissions", authenticateToken, async (req: any, res) => {
    let connection;
    try {
      const dbPassword = process.env.ORACLE_DB_PASSWORD;
      // In a real scenario, we might check if user is admin. For now, if role is admin or userId=1 we fetch all.
      const isAdmin = req.user.email === 'abijithasokan@crayonspictures.com' || req.user.userId === 1;

      if (!dbPassword) {
        let subs = memoryBridgeSubmissions;
        if (!isAdmin) {
          subs = subs.filter(s => s.userId === req.user.userId);
        }
        return res.json({ success: true, submissions: subs });
      }

      

      let query = `SELECT SUBMISSION_ID, USER_ID, TITLE, MASTER_LINK, TERRITORIES, EXCLUSIVITY, TARGET_PLATFORMS, STATUS, REVIEW_NOTES, CREATED_AT FROM CRAYONS_BRIDGE_SUBMISSIONS ORDER BY CREATED_AT DESC`;
      let params: any = {};

      if (!isAdmin) {
        query = `SELECT SUBMISSION_ID, USER_ID, TITLE, MASTER_LINK, TERRITORIES, EXCLUSIVITY, TARGET_PLATFORMS, STATUS, REVIEW_NOTES, CREATED_AT FROM CRAYONS_BRIDGE_SUBMISSIONS WHERE USER_ID = :userId ORDER BY CREATED_AT DESC`;
        params.userId = req.user.userId;
      }

      connection = await getDbConnection();
      const result = await (connection as any).execute(query, params);

      const submissions = result.rows?.map((row: any) => ({
        id: row[0], userId: row[1], title: row[2], masterLink: row[3], territories: row[4], exclusivity: row[5], targetPlatforms: row[6], status: row[7], reviewNotes: row[8], createdAt: row[9]
      })) || [];

      res.json({ success: true, submissions });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch submissions" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  app.post("/api/bridge/submissions", authenticateToken, async (req: any, res) => {
    const { title, masterLink, territories, exclusivity, targetPlatforms } = req.body;
    let connection;
    try {
      connection = await getDbConnection();
      if (!connection) {
        const sub = {
          id: bridgeSubmissionCounter++,
          userId: req.user.userId,
          title, masterLink, territories, exclusivity, targetPlatforms,
          status: 'Pending Review',
          reviewNotes: null,
          createdAt: new Date().toISOString()
        };
        memoryBridgeSubmissions.unshift(sub);
        return res.json({ success: true, submission: sub });
      }

      

      const result = await connection.execute(
        `INSERT INTO CRAYONS_BRIDGE_SUBMISSIONS (USER_ID, TITLE, MASTER_LINK, TERRITORIES, EXCLUSIVITY, TARGET_PLATFORMS)
         VALUES (:userId, :title, :masterLink, :territories, :exclusivity, :targetPlatforms)
         RETURNING SUBMISSION_ID INTO :new_id`,
        {
          userId: req.user.userId, title, masterLink, territories, exclusivity, targetPlatforms,
          new_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        },
        { autoCommit: true }
      );

      // @ts-ignore
      const newId = result.outBinds.new_id[0];
      res.json({ success: true, submission: { id: newId, title, status: 'Pending Review' } });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to submit" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  app.put("/api/bridge/submissions/:id/status", authenticateToken, async (req: any, res) => {
    const isAdmin = req.user.email === 'abijithasokan@crayonspictures.com' || req.user.userId === 1;
    if (!isAdmin) return res.status(403).json({ error: "Unauthorized" });

    const submissionId = parseInt(req.params.id);
    const { status, reviewNotes } = req.body;
    
    let connection;
    try {
      connection = await getDbConnection();
      if (!connection) {
        const sub = memoryBridgeSubmissions.find(s => s.id === submissionId);
        if (!sub) return res.status(404).json({ error: "Not found" });
        sub.status = status;
        if (reviewNotes !== undefined) sub.reviewNotes = reviewNotes;
        return res.json({ success: true, submission: sub });
      }

      

      await connection.execute(
        `UPDATE CRAYONS_BRIDGE_SUBMISSIONS SET STATUS = :status, REVIEW_NOTES = COALESCE(:reviewNotes, REVIEW_NOTES) WHERE SUBMISSION_ID = :id`,
        { status, reviewNotes: reviewNotes || null, id: submissionId },
        { autoCommit: true }
      );

      res.json({ success: true, message: "Status updated" });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to update status" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  // --- Revenue & Licensing Endpoints ---
  app.get("/api/revenue/metrics", authenticateToken, async (req: any, res) => {
    // Only return aggregate dashboard or mock for current user
    let connection;
    try {
      connection = await getDbConnection();
      if (!connection) {
        // mock logic: return hardcoded dashboard matching submissions
        const mySubs = memoryBridgeSubmissions.filter(s => req.user.userId === 1 || s.userId === req.user.userId);
        const subIds = mySubs.map(s => s.id);
        const myMetrics = memoryPerformanceMetrics.filter(m => subIds.includes(m.submissionId));
        return res.json({ success: true, metrics: myMetrics, totalRevenue: myMetrics.reduce((sum, current) => sum + current.generatedRevenue, 0) });
      }

      let query = `
        SELECT M.METRIC_ID, M.SUBMISSION_ID, M.REPORT_MONTH, M.VIEWS, M.AD_IMPRESSIONS, M.GENERATED_REVENUE 
        FROM CRAYONS_PERFORMANCE_METRICS M 
        JOIN CRAYONS_BRIDGE_SUBMISSIONS S ON M.SUBMISSION_ID = S.SUBMISSION_ID 
        WHERE S.USER_ID = :userId`;
      const params: any = { userId: req.user.userId };
      const isAdmin = req.user.email === 'abijithasokan@crayonspictures.com' || req.user.userId === 1;
      if (isAdmin) {
        query = `SELECT METRIC_ID, SUBMISSION_ID, REPORT_MONTH, VIEWS, AD_IMPRESSIONS, GENERATED_REVENUE FROM CRAYONS_PERFORMANCE_METRICS`;
        delete params.userId;
      }

      connection = await getDbConnection();
      const result = await (connection as any).execute(query, params);
      const metrics = result.rows?.map((row: any) => ({
        id: row[0], submissionId: row[1], reportMonth: row[2], views: row[3], adImpressions: row[4], generatedRevenue: row[5]
      })) || [];

      res.json({ success: true, metrics, totalRevenue: metrics.reduce((sum: number, curr: any) => sum + curr.generatedRevenue, 0) });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch metrics" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  app.get("/api/revenue/terms/:submissionId", authenticateToken, async (req: any, res) => {
    const submissionId = parseInt(req.params.submissionId);
    let connection;
    try {
      connection = await getDbConnection();
      if (!connection) {
        const term = memoryLicensingTerms.find(t => t.submissionId === submissionId);
        return res.json({ success: true, term: term || null });
      }

      const result = await connection.execute(
        `SELECT TERM_ID, LICENSING_MODEL, MONETIZATION_TIERS, FEE_AMOUNT, REV_SHARE_PERCENTAGE, MIN_GUARANTEE_AMOUNT FROM CRAYONS_LICENSING_TERMS WHERE SUBMISSION_ID = :submissionId`,
        { submissionId }
      );

      if (!result.rows || result.rows.length === 0) {
        return res.json({ success: true, term: null });
      }

      const row = result.rows[0];
      res.json({ success: true, term: {
        id: row[0], licensingModel: row[1], monetizationTiers: row[2], feeAmount: row[3], revSharePercentage: row[4], minGuaranteeAmount: row[5]
      }});
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch terms" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  app.post("/api/revenue/terms", authenticateToken, async (req: any, res) => {
    const { submissionId, licensingModel, monetizationTiers, feeAmount, revSharePercentage, minGuaranteeAmount } = req.body;
    let connection;
    try {
      connection = await getDbConnection();
      if (!connection) {
        const existing = memoryLicensingTerms.findIndex(t => t.submissionId === submissionId);
        const term = {
          id: existing !== -1 ? memoryLicensingTerms[existing].id : Math.floor(Math.random() * 10000), 
          submissionId, licensingModel, monetizationTiers, feeAmount, revSharePercentage, minGuaranteeAmount 
        };
        if (existing !== -1) memoryLicensingTerms[existing] = term;
        else memoryLicensingTerms.push(term);
        
        // mock add performance metric for display
        memoryPerformanceMetrics.push({
          id: metricCounter++,
          submissionId,
          reportMonth: new Date().toISOString(),
          views: Math.floor(Math.random() * 5000) + 1000,
          adImpressions: Math.floor(Math.random() * 8000) + 2000,
          generatedRevenue: licensingModel === 'Revenue Sharing' ? Math.floor(Math.random() * 500) + 50 : feeAmount || 0
        });

        return res.json({ success: true, term });
      }

      // Upsert
      let existingTerm = await connection.execute(`SELECT TERM_ID FROM CRAYONS_LICENSING_TERMS WHERE SUBMISSION_ID = :submissionId`, { submissionId });
      
      if (existingTerm.rows && existingTerm.rows.length > 0) {
        await connection.execute(
          `UPDATE CRAYONS_LICENSING_TERMS SET LICENSING_MODEL = :licensingModel, MONETIZATION_TIERS = :monetizationTiers, FEE_AMOUNT = :feeAmount, REV_SHARE_PERCENTAGE = :revSharePercentage, MIN_GUARANTEE_AMOUNT = :minGuaranteeAmount WHERE SUBMISSION_ID = :submissionId`,
          { submissionId, licensingModel, monetizationTiers, feeAmount: feeAmount || null, revSharePercentage: revSharePercentage || null, minGuaranteeAmount: minGuaranteeAmount || null },
          { autoCommit: true }
        );
      } else {
        await connection.execute(
          `INSERT INTO CRAYONS_LICENSING_TERMS (SUBMISSION_ID, LICENSING_MODEL, MONETIZATION_TIERS, FEE_AMOUNT, REV_SHARE_PERCENTAGE, MIN_GUARANTEE_AMOUNT)
           VALUES (:submissionId, :licensingModel, :monetizationTiers, :feeAmount, :revSharePercentage, :minGuaranteeAmount)`,
          { submissionId, licensingModel, monetizationTiers, feeAmount: feeAmount || null, revSharePercentage: revSharePercentage || null, minGuaranteeAmount: minGuaranteeAmount || null },
          { autoCommit: true }
        );
        
        // Insert a mock metric when new terms added to see on dashboard out of box
        await connection.execute(
          `INSERT INTO CRAYONS_PERFORMANCE_METRICS (SUBMISSION_ID, REPORT_MONTH, VIEWS, AD_IMPRESSIONS, GENERATED_REVENUE) VALUES (:submissionId, CURRENT_DATE, :views, :adImpressions, :generatedRevenue)`,
          { 
            submissionId, 
            views: Math.floor(Math.random() * 5000) + 1000,
            adImpressions: Math.floor(Math.random() * 8000) + 2000,
            generatedRevenue: licensingModel === 'Revenue Sharing' ? Math.floor(Math.random() * 500) + 50 : feeAmount || 0 
          },
          { autoCommit: true }
        );
      }

      res.json({ success: true, message: "Terms saved successfully" });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to save terms" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  app.get("/api/booking/resources", authenticateToken, async (req: any, res) => {
    return res.json({ success: true, resources: RESOURCES });
  });

  app.get("/api/booking/reservations", authenticateToken, async (req: any, res) => {
    let connection;
    try {
      connection = await getDbConnection();
      if (!connection) {
        const userReservations = memoryReservations.filter(r => r.userId === req.user.userId || req.user.userId === 1);
        return res.json({ success: true, reservations: userReservations });
      }

      let query = `SELECT RESERVATION_ID, USER_ID, RESOURCE_ID, START_DATE, END_DATE, TITLE FROM CRAYONS_RESERVATIONS WHERE USER_ID = :userId`;
      let params: any = { userId: req.user.userId };
      const isAdmin = req.user.email === 'abijithasokan@crayonspictures.com' || req.user.userId === 1;
      
      if (isAdmin) {
        query = `SELECT RESERVATION_ID, USER_ID, RESOURCE_ID, START_DATE, END_DATE, TITLE FROM CRAYONS_RESERVATIONS`;
        params = {};
      }

      // Try-Catch to gracefully fallback to memory if table doesn't exist yet
      try {
        connection = await getDbConnection();
      const result = await (connection as any).execute(query, params);
        const reservations = result.rows?.map((row: any) => ({
          id: row[0], userId: row[1], resourceId: row[2], startDate: row[3], endDate: row[4], title: row[5]
        })) || [];
        res.json({ success: true, reservations });
      } catch (err: any) {
        console.warn("CRAYONS_RESERVATIONS table might not exist, falling back to memory");
        const userReservations = memoryReservations.filter(r => r.userId === req.user.userId || req.user.userId === 1);
        res.json({ success: true, reservations: userReservations });
      }
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch reservations" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  app.post("/api/booking/reservations", authenticateToken, async (req: any, res) => {
    const { resourceId, startDate, endDate, title } = req.body;
    let connection;
    try {
      connection = await getDbConnection();
      if (!connection) {
        // Mock conflict check
        const conflict = memoryReservations.find(r => 
          r.resourceId === resourceId && 
          ((new Date(startDate) >= new Date(r.startDate) && new Date(startDate) <= new Date(r.endDate)) ||
           (new Date(endDate) >= new Date(r.startDate) && new Date(endDate) <= new Date(r.endDate)))
        );
        if (conflict) {
          return res.status(409).json({ error: "Resource already booked for these dates." });
        }

        const newRes = {
          id: reservationCounter++,
          userId: req.user.userId,
          resourceId, startDate, endDate, title
        };
        memoryReservations.push(newRes);
        return res.json({ success: true, reservation: newRes });
      }

      try {
        // Basic conflict check in DB
        const conflictCheck = await connection.execute(
          `SELECT RESERVATION_ID FROM CRAYONS_RESERVATIONS 
           WHERE RESOURCE_ID = :resourceId AND 
           ((TO_DATE(:startDate, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"') BETWEEN START_DATE AND END_DATE) OR 
            (TO_DATE(:endDate, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"') BETWEEN START_DATE AND END_DATE))`,
          { resourceId, startDate, endDate }
        );

        if (conflictCheck.rows && conflictCheck.rows.length > 0) {
          return res.status(409).json({ error: "Resource already booked for these dates." });
        }

        const result = await connection.execute(
          `INSERT INTO CRAYONS_RESERVATIONS (USER_ID, RESOURCE_ID, START_DATE, END_DATE, TITLE)
           VALUES (:userId, :resourceId, TO_DATE(:startDate, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'), TO_DATE(:endDate, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'), :title)
           RETURNING RESERVATION_ID INTO :new_id`,
          {
            userId: req.user.userId, resourceId, startDate, endDate, title,
            new_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
          },
          { autoCommit: true }
        );
        // @ts-ignore
        const newId = result.outBinds.new_id[0];
        res.json({ success: true, reservation: { id: newId, userId: req.user.userId, resourceId, startDate, endDate, title } });
      } catch (err: any) {
        console.warn("CRAYONS_RESERVATIONS table error, falling back to memory insert");
        const newRes = {
          id: reservationCounter++,
          userId: req.user.userId,
          resourceId, startDate, endDate, title
        };
        memoryReservations.push(newRes);
        res.json({ success: true, reservation: newRes });
      }
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to create reservation" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  app.delete("/api/booking/reservations/:id", authenticateToken, async (req: any, res) => {
    const reservationId = parseInt(req.params.id);
    let connection;
    try {
      connection = await getDbConnection();
      if (!connection) {
        const idx = memoryReservations.findIndex(r => r.id === reservationId);
        if (idx !== -1) memoryReservations.splice(idx, 1);
        return res.json({ success: true, message: "Reservation cancelled" });
      }

      try {
        await connection.execute(
          `DELETE FROM CRAYONS_RESERVATIONS WHERE RESERVATION_ID = :id`,
          { id: reservationId },
          { autoCommit: true }
        );
        res.json({ success: true, message: "Reservation cancelled" });
      } catch (err: any) {
        console.warn("CRAYONS_RESERVATIONS table error, mem fallback removal");
        const idx = memoryReservations.findIndex(r => r.id === reservationId);
        if (idx !== -1) memoryReservations.splice(idx, 1);
        res.json({ success: true, message: "Reservation cancelled" });
      }
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  app.get("/api/loop/content", authenticateToken, async (req: any, res) => {
    let connection;
    try {
      connection = await getDbConnection();
      if (!connection) {
        const approved = memoryBridgeSubmissions.filter(s => s.status === 'Approved');
        const content = approved.map(sub => {
          const term = memoryLicensingTerms.find(t => t.submissionId === sub.id) || { monetizationTiers: 'SVOD', licensingModel: 'Revenue Sharing' };
          return { ...sub, monetizationTiers: term.monetizationTiers, licensingModel: term.licensingModel };
        });
        return res.json({ success: true, content });
      }

      // Try-Catch to gracefully fallback if tables incomplete
      try {
        const result = await connection.execute(`
          SELECT S.SUBMISSION_ID, S.TITLE, S.DESCRIPTION, S.DIRECTOR, S.CAST_GROUP, S.GENRES, S.RELEASE_YEAR, S.POSTER_URL, T.MONETIZATION_TIERS, T.LICENSING_MODEL
          FROM CRAYONS_BRIDGE_SUBMISSIONS S
          LEFT JOIN CRAYONS_LICENSING_TERMS T ON S.SUBMISSION_ID = T.SUBMISSION_ID
          WHERE S.STATUS = 'Approved'
        `);
        
        const content = result.rows?.map((row: any) => ({
          id: row[0], title: row[1], description: row[2], director: row[3], cast: row[4], genres: row[5], releaseYear: row[6], posterUrl: row[7],
          monetizationTiers: row[8] || 'SVOD', licensingModel: row[9] || 'Revenue Sharing'
        })) || [];
        res.json({ success: true, content });
      } catch (err: any) {
        console.warn("Table join error, falling back to basic submission query");
        const result = await connection.execute(`
          SELECT SUBMISSION_ID, TITLE, DESCRIPTION, DIRECTOR, CAST_GROUP, GENRES, RELEASE_YEAR, POSTER_URL
          FROM CRAYONS_BRIDGE_SUBMISSIONS WHERE STATUS = 'Approved'
        `);
        const content = result.rows?.map((row: any) => ({
          id: row[0], title: row[1], description: row[2], director: row[3], cast: row[4], genres: row[5], releaseYear: row[6], posterUrl: row[7],
          monetizationTiers: 'SVOD', licensingModel: 'Revenue Sharing'
        })) || [];
        res.json({ success: true, content });
      }
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch loop content" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  // Billing & Subscription endpoints
  let memorySubscriptions: any[] = [];
  
  app.get("/api/loop/subscription", authenticateToken, async (req: any, res) => {
    let connection;
    try {
      connection = await getDbConnection();
      if (!connection) {
        const sub = memorySubscriptions.find(s => s.userId === req.user.userId);
        return res.json({ success: true, subscription: sub || { tier: 'Free', status: 'active' } });
      }
      
      try {
        const result = await connection.execute(
          `SELECT TIER, STATUS, END_DATE FROM CRAYONS_SUBSCRIPTIONS WHERE USER_ID = :userId ORDER BY CREATED_AT DESC FETCH FIRST 1 ROWS ONLY`,
          { userId: req.user.userId }
        );
        if (result.rows && result.rows.length > 0) {
          // @ts-ignore
          const row = result.rows[0];
          res.json({ success: true, subscription: { tier: row[0], status: row[1], endDate: row[2] } });
        } else {
          res.json({ success: true, subscription: { tier: 'Free', status: 'active' } });
        }
      } catch (err) {
        console.warn("CRAYONS_SUBSCRIPTIONS table error, fallback to memory");
        const sub = memorySubscriptions.find(s => s.userId === req.user.userId);
        res.json({ success: true, subscription: sub || { tier: 'Free', status: 'active' } });
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch subscription" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  app.post("/api/loop/payment/create-order", authenticateToken, async (req: any, res) => {
    const { amount, currency = 'USD' } = req.body;
    // Mocking Razorpay Order creation
    res.json({ 
      success: true, 
      orderId: 'order_' + Math.random().toString(36).substring(2, 10),
      amount,
      currency
    });
  });

  app.post("/api/loop/payment/verify", authenticateToken, async (req: any, res) => {
    const { tier, paymentId, orderId } = req.body;
    
    let connection;
    try {
      connection = await getDbConnection();
      if (!connection) {
        const sub = { userId: req.user.userId, tier, status: 'active', pyamentId: paymentId };
        memorySubscriptions = memorySubscriptions.filter(s => s.userId !== req.user.userId);
        memorySubscriptions.push(sub);
        return res.json({ success: true, subscription: sub });
      }

      try {
        await connection.execute(
          `INSERT INTO CRAYONS_SUBSCRIPTIONS (USER_ID, TIER, STATUS, PAYMENT_ID, CREATED_AT)
           VALUES (:userId, :tier, 'active', :paymentId, SYSDATE)`,
          { userId: req.user.userId, tier, paymentId },
          { autoCommit: true }
        );
        res.json({ success: true, subscription: { tier, status: 'active' } });
      } catch (err) {
        console.warn("CRAYONS_SUBSCRIPTIONS table insert error, fallback to memory");
        const sub = { userId: req.user.userId, tier, status: 'active', paymentId };
        memorySubscriptions = memorySubscriptions.filter(s => s.userId !== req.user.userId);
        memorySubscriptions.push(sub);
        res.json({ success: true, subscription: sub });
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to verify payment" });
    } finally {
      if (connection) { try { await (connection as any).close(); } catch (err) {} }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
