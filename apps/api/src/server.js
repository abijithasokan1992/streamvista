"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var path_1 = require("path");
var cors_1 = require("cors");
var vite_1 = require("vite");
var oracledb_1 = require("oracledb");
var bcryptjs_1 = require("bcryptjs");
var jsonwebtoken_1 = require("jsonwebtoken");
var multer_1 = require("multer");
var os = require("oci-objectstorage");
var common = require("oci-common");
var QCService_1 = require("./services/QCService");
var GoogleDriveService_1 = require("./services/GoogleDriveService");
var PublicIntelligenceService_1 = require("./services/PublicIntelligenceService");
var EmailService_1 = require("./services/EmailService");
var paymentService_1 = require("./services/paymentService");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
// Identity connection parameters provided by StreamVista OCI specification
var OCI_IDENTITY_APP_ID = "42584711378649c7a8751f00a425878a";
var OCI_DB_CONNECTION_STRING = process.env.OCI_DB_CONNECTION_STRING || "adb.ap-mumbai-1.oraclecloud.com:1522/g1234567_yourdb_high.adb.oraclecloud.com";
var emailService = new EmailService_1.EmailService();
var qcService = new QCService_1.QCService();
var driveService = new GoogleDriveService_1.GoogleDriveService(path_1.default.join(process.cwd(), "google-service-account.json"), process.env.GOOGLE_DRIVE_API_KEY);
var intelligenceService = new PublicIntelligenceService_1.PublicIntelligenceService();
var oracleFailed = false;
function getDbConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var dbPassword, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dbPassword = process.env.ORACLE_DB_PASSWORD;
                    if (!dbPassword) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, oracledb_1.default.getConnection({
                            user: process.env.ORACLE_DB_USER || "abijithasokan@crayonspictures.com",
                            password: dbPassword,
                            connectString: OCI_DB_CONNECTION_STRING,
                        })];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    err_1 = _a.sent();
                    console.error("Oracle DB connection failed:", err_1);
                    return [3 /*break*/, 4];
                case 4: return [3 /*break*/, 6];
                case 5:
                    console.info("Oracle DB credentials not provided.");
                    _a.label = 6;
                case 6: 
                // Return a mock connection object with a safe execute method
                return [2 /*return*/, {
                        execute: function (query, params) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    console.warn("Mocking DB execute: ", query);
                                    return [2 /*return*/, { rows: [] }];
                                });
                            });
                        },
                        close: function () {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/];
                                });
                            });
                        }
                    }];
            }
        });
    });
}
var JWT_SECRET = process.env.JWT_SECRET || "streamvista_super_secret_key_2026";
// In-Memory mock DB for when Oracle DB credentials aren't provided
var memoryUsers = [];
var payloadIdCounter = 1;
// Kerala Police Investigation Schema
var memorySuspects = [
    { id: 1, name: 'Sample Suspect', mobileNumbers: ['9412345678'], socialProfiles: { instagram: '@suspect_sample' }, status: 'Under Surveillance' }
];
var suspectCounter = 2;
var memoryInvestigativeLogs = [];
var logCounter = 1;
var memoryProjects = [
    { id: 1, userId: 1, title: 'Crimson Horizon', type: 'Feature Film', status: 'Post-Production', progress: 75, date: 'Oct 2026', banner: 'crayons-pictures' },
    { id: 2, userId: 1, title: 'The Silent Valley', type: 'Web Series', status: 'Principal Photography', progress: 30, date: 'Mar 2027', banner: 'abhijith-asokan-productions' },
];
var projectCounter = 3;
var memoryVouchers = [];
var voucherCounter = 1;
var fileMetadataCounter = 1;
var memoryFileMetadata = [];
// Delivery mock data
var deliveryCounter = 1;
var memoryDeliveryPackages = [];
var deliveryLogCounter = 1;
var memoryDeliveryLogs = [];
// Bridge mock data
var bridgeSubmissionCounter = 1;
var memoryBridgeSubmissions = [];
var memoryLicensingTerms = [];
var metricCounter = 1;
var memoryPerformanceMetrics = [];
// Extended MediaTech Service Catalog
var serviceCatalog = [
    { id: 'SVC-QC-01', name: 'Content QC Clearance Certificate', category: 'LEGAL', price: 4999, description: 'OTT Standard Quality Check' },
    { id: 'SVC-DL-01', name: 'OTT Digital Rights Sub-License', category: 'RIGHTS', price: 50000, description: 'Master Licensing Deed' },
    { id: 'SVC-AI-01', name: 'AI Audio Noise Reduction', category: 'AI_POST', price: 2999, description: 'Studio Grade Vocal Enhancement' },
    { id: 'SVC-AI-02', name: 'AI 4K Upscaling & HDR Enhancement', category: 'AI_POST', price: 7500, description: 'HD to 4K Master Conversion' },
    { id: 'SVC-LOC-01', name: 'AI Multi-Language Dubbing', category: 'LOCALISATION', price: 15000, description: 'Regional Tone Matching' },
    { id: 'SVC-DEL-01', name: 'Encrypted Master Delivery (DCP)', category: 'MEDIATECH', price: 9999, description: 'Secure Studio-to-OTT Transfer' },
    { id: 'SVC-LEG-01', name: 'Rights Clearance Engine Access', category: 'LEGAL', price: 14999, description: 'Automated Territory Tracking' }
];
// Studio Booking mock data
var reservationCounter = 1;
var memoryReservations = [];
var RESOURCES = [
    { id: 'vfx-1', name: 'VFX Suite A - Heavy Compute', category: 'studio' },
    { id: 'di-1', name: 'DI & Color Grading Suite', category: 'studio' },
    { id: 'sound-1', name: 'Atmos Mixing Stage', category: 'studio' },
    { id: 'cam-1', name: 'ARRI Alexa LF 1', category: 'equipment' },
    { id: 'lens-1', name: 'Signature Prime 47mm', category: 'equipment' }
];
// Object Storage mock data
var fileCounter = 3;
var memoryFiles = [
    { id: 1, name: "RAW_A_CAM_TAKE1.braw", size: 543000000, type: "video/braw", banner: "crayons-pictures", uploadedAt: new Date().toISOString() },
    { id: 2, name: "AUDIO_MIX_STEMS.wav", size: 120000000, type: "audio/wav", banner: "abhijith-asokan-productions", uploadedAt: new Date().toISOString() }
];
var upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// OCI Configuration
var objectStorageClient = null;
try {
    var provider = new common.ConfigFileAuthenticationDetailsProvider();
    objectStorageClient = new os.ObjectStorageClient({ authenticationDetailsProvider: provider });
}
catch (e) {
    console.warn("OCI Creds not found, continuing without OCI client");
}
// Middleware to verify JWT token
var authenticateToken = function (req, res, next) {
    var authHeader = req.headers['authorization'];
    var token = authHeader && authHeader.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: "Access token missing" });
    jsonwebtoken_1.default.verify(token, JWT_SECRET, function (err, user) {
        if (err)
            return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
};
function startServer() {
    return __awaiter(this, void 0, void 0, function () {
        var app, PORT, gatewayLogger, getOciClient, generateToken, memorySubscriptions, vite, distPath_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = (0, express_1.default)();
                    PORT = 3000;
                    app.use((0, cors_1.default)());
                    app.use(express_1.default.json());
                    // Catalog Endpoint
                    app.get("/api/catalog/services", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            res.json({ success: true, services: serviceCatalog });
                            return [2 /*return*/];
                        });
                    }); });
                    // Payment Endpoints
                    app.post("/api/payments/create-order", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, amount, assetId, receipt, order, err_2;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = req.body, amount = _a.amount, assetId = _a.assetId;
                                    if (!amount || !assetId)
                                        return [2 /*return*/, res.status(400).json({ error: "Amount and Asset ID are required." })];
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 3, , 4]);
                                    receipt = "rcpt_".concat(assetId, "_").concat(Date.now());
                                    return [4 /*yield*/, paymentService_1.paymentService.createOrder(amount, 'INR', receipt)];
                                case 2:
                                    order = _b.sent();
                                    res.json({ success: true, order: order });
                                    return [3 /*break*/, 4];
                                case 3:
                                    err_2 = _b.sent();
                                    console.error(err_2);
                                    res.status(500).json({ error: "Failed to create payment order." });
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/payments/verify", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, orderId, paymentId, signature, assetId, isValid;
                        return __generator(this, function (_b) {
                            _a = req.body, orderId = _a.orderId, paymentId = _a.paymentId, signature = _a.signature, assetId = _a.assetId;
                            if (!orderId || !paymentId || !signature) {
                                return [2 /*return*/, res.status(400).json({ error: "Missing verification parameters." })];
                            }
                            isValid = paymentService_1.paymentService.verifySignature(orderId, paymentId, signature);
                            if (isValid) {
                                // In production, update the DB to reflect the licensed status
                                // memoryBridgeSubmissions.push({ assetId, licensedTo: req.user.email, date: new Date() });
                                res.json({
                                    success: true,
                                    message: "Payment verified successfully.",
                                    certificateUrl: "/api/assets/".concat(assetId, "/clearance-certificate")
                                });
                            }
                            else {
                                res.status(400).json({ success: false, error: "Invalid payment signature." });
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    app.post("/api/qc/trigger", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, assetId, filePath, result, err_3;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = req.body, assetId = _a.assetId, filePath = _a.filePath;
                                    if (!assetId)
                                        return [2 /*return*/, res.status(400).json({ error: "Asset ID required" })];
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, qcService.runFullScan(assetId, filePath || "default_path.mp4")];
                                case 2:
                                    result = _b.sent();
                                    res.json({ success: true, result: result });
                                    return [3 /*break*/, 4];
                                case 3:
                                    err_3 = _b.sent();
                                    console.error(err_3);
                                    res.status(500).json({ error: "QC Scan execution failed" });
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Registration Endpoint
                    app.post("/api/signup", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, fullName, email, password, targetWorkspace, connection, hashedPassword, dbUser, existingUser, newUser, result, token, err_4, err_5;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = req.body, fullName = _a.fullName, email = _a.email, password = _a.password, targetWorkspace = _a.targetWorkspace;
                                    if (!fullName || !email || !password || !targetWorkspace) {
                                        return [2 /*return*/, res.status(400).json({ error: "Missing required security parameters." })];
                                    }
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 5, 6, 11]);
                                    return [4 /*yield*/, bcryptjs_1.default.hash(password, 10)];
                                case 2:
                                    hashedPassword = _b.sent();
                                    dbUser = process.env.ORACLE_DB_USER || "abijithasokan@crayonspictures.com";
                                    return [4 /*yield*/, getDbConnection()];
                                case 3:
                                    connection = _b.sent();
                                    if (!connection) {
                                        existingUser = memoryUsers.find(function (u) { return u.email === email; });
                                        if (existingUser)
                                            return [2 /*return*/, res.status(400).json({ error: "Email already exists in the system." })];
                                        newUser = {
                                            userId: Date.now(),
                                            fullName: fullName,
                                            email: email,
                                            passwordHash: hashedPassword,
                                            workspace: targetWorkspace,
                                            role: 'user',
                                            isActive: 1
                                        };
                                        memoryUsers.push(newUser);
                                        return [2 /*return*/, res.json({
                                                success: true,
                                                message: "Workspace allocation node initialized.",
                                                metadata: { identityAppId: OCI_IDENTITY_APP_ID, targetWorkspace: targetWorkspace, proxyStatus: "SIMULATED_DB_COMMIT" }
                                            })];
                                    }
                                    return [4 /*yield*/, connection.execute("INSERT INTO CRAYONS_USERS \n          (FULL_NAME, EMAIL, PASSWORD_HASH, WORKSPACE)\n         VALUES \n          (:name, :email, :password, :workspace)", {
                                            name: fullName,
                                            email: email,
                                            password: hashedPassword,
                                            workspace: targetWorkspace
                                        }, { autoCommit: true })];
                                case 4:
                                    result = _b.sent();
                                    token = jsonwebtoken_1.default.sign({ fullName: fullName, email: email, workspace: targetWorkspace }, JWT_SECRET, { expiresIn: '8h' });
                                    res.json({ success: true, message: "Profile provisioned securely via Oracle backend.", token: token });
                                    return [3 /*break*/, 11];
                                case 5:
                                    err_4 = _b.sent();
                                    if (err_4.errorNum === 1) { // Oracle Unique Constraint error code
                                        return [2 /*return*/, res.status(400).json({ error: "Email already exists in the system." })];
                                    }
                                    console.error("OCI Integration Error Database:", err_4);
                                    res.status(500).json({ error: "Oracle Cloud Service Execution Failed", details: err_4.message });
                                    return [3 /*break*/, 11];
                                case 6:
                                    if (!connection) return [3 /*break*/, 10];
                                    _b.label = 7;
                                case 7:
                                    _b.trys.push([7, 9, , 10]);
                                    return [4 /*yield*/, connection.close()];
                                case 8:
                                    _b.sent();
                                    return [3 /*break*/, 10];
                                case 9:
                                    err_5 = _b.sent();
                                    return [3 /*break*/, 10];
                                case 10: return [7 /*endfinally*/];
                                case 11: return [2 /*return*/];
                            }
                        });
                    }); });
                    gatewayLogger = function (req, res, next) {
                        var timestamp = new Date().toISOString();
                        var sourceIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
                        console.log("[SecureGateway] ".concat(timestamp, " | INCOMING: ").concat(req.method, " ").concat(req.url, " | SOURCE: ").concat(sourceIp));
                        next();
                    };
                    app.use('/api/police', gatewayLogger);
                    app.get("/api/police/intelligence", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var news;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, intelligenceService.getLatestIntelligence()];
                                case 1:
                                    news = _a.sent();
                                    res.json({ success: true, intelligence: news });
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/api/police/cases/public", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var cases;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, intelligenceService.getPublicCases()];
                                case 1:
                                    cases = _a.sent();
                                    res.json({ success: true, cases: cases });
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    // Simulation Mode: Populates the dashboard with investigative data for testing
                    app.post("/api/police/investigation/simulate", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var suspectId, finLogs, locLogs, suspect;
                        return __generator(this, function (_a) {
                            suspectId = req.body.suspectId;
                            if (req.user.role !== 'admin')
                                return [2 /*return*/, res.status(403).json({ error: "Unauthorized" })];
                            // 1. Add Simulated Contacts & Conversations
                            memoryInvestigativeLogs.push({ id: logCounter++, timestamp: new Date(), action: 'DATA_EXTRACTED', user: 'SYSTEM', fileName: 'contacts.txt', suspectId: suspectId, remarks: 'Simulated Extraction' }, { id: logCounter++, timestamp: new Date(), action: 'DATA_EXTRACTED', user: 'SYSTEM', fileName: 'sms_logs.txt', suspectId: suspectId, remarks: 'Simulated Extraction' });
                            finLogs = [
                                { date: '2026-06-25', amount: '₹5,000', type: 'UPI_OUT', recipient: 'Unknown_Merchant', remark: 'High Priority' },
                                { date: '2026-06-28', amount: '₹1,50,000', type: 'ATM_WITHDRAWAL', recipient: 'Kochi_ATM_04', remark: 'Suspicious Volume' }
                            ];
                            locLogs = [
                                { timestamp: '2026-07-01 10:00', lat: 9.9312, lng: 76.2673, towerId: 'KOCHI_NORTH_01', accuracy: '50m' },
                                { timestamp: '2026-07-01 12:30', lat: 10.0159, lng: 76.3419, towerId: 'ALUVA_SOUTH_04', accuracy: '120m' }
                            ];
                            suspect = memorySuspects.find(function (s) { return s.name === suspectId || s.id.toString() === suspectId; });
                            if (suspect) {
                                suspect.financialActivity = finLogs;
                                suspect.locationHistory = locLogs;
                            }
                            res.json({ success: true, message: "Simulation Complete. Dashboard populated with evidence." });
                            return [2 /*return*/];
                        });
                    }); });
                    app.get("/api/police/suspects/:id/dashboard", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var suspectId, logs, suspect, intelligence, publicCases, timeline, dashboardData;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    suspectId = req.params.id;
                                    // Authorization check
                                    if (req.user.role !== 'admin')
                                        return [2 /*return*/, res.status(403).json({ error: "Unauthorized" })];
                                    logs = memoryInvestigativeLogs.filter(function (l) { return l.suspectId === suspectId; });
                                    suspect = memorySuspects.find(function (s) { return s.name === suspectId || s.id.toString() === suspectId; });
                                    return [4 /*yield*/, intelligenceService.getLatestIntelligence()];
                                case 1:
                                    intelligence = _a.sent();
                                    return [4 /*yield*/, intelligenceService.getPublicCases()];
                                case 2:
                                    publicCases = _a.sent();
                                    timeline = __spreadArray(__spreadArray(__spreadArray([], ((suspect === null || suspect === void 0 ? void 0 : suspect.locationHistory) || []).map(function (l) { return (__assign(__assign({}, l), { type: 'LOCATION', description: "Tower: ".concat(l.towerId) })); }), true), ((suspect === null || suspect === void 0 ? void 0 : suspect.financialActivity) || []).map(function (f) { return (__assign(__assign({}, f), { timestamp: f.date, type: 'FINANCIAL', description: "".concat(f.type, ": ").concat(f.amount, " to ").concat(f.recipient) })); }), true), logs.map(function (l) { return (__assign(__assign({}, l), { type: 'HUB_ACTION', description: l.action })); }), true).sort(function (a, b) { return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); });
                                    dashboardData = {
                                        suspect: suspect || { id: suspectId, name: 'External Identity' },
                                        activitySummary: {
                                            totalTransfers: logs.length,
                                            lastActive: logs.length > 0 ? logs[0].timestamp : 'No Activity',
                                            fileTypes: logs.reduce(function (acc, curr) {
                                                var ext = curr.fileName.split('.').pop();
                                                acc[ext] = (acc[ext] || 0) + 1;
                                                return acc;
                                            }, {})
                                        },
                                        investigativeData: {
                                            financialActivity: (suspect === null || suspect === void 0 ? void 0 : suspect.financialActivity) || [],
                                            locationHistory: (suspect === null || suspect === void 0 ? void 0 : suspect.locationHistory) || [],
                                            masterTimeline: timeline
                                        },
                                        publicContext: {
                                            relatedNews: intelligence.slice(0, 3),
                                            registryMatches: publicCases.filter(function (c) { return c.suspect.includes((suspect === null || suspect === void 0 ? void 0 : suspect.name) || ''); })
                                        },
                                        auditLogs: logs.slice(0, 50) // Last 50 actions
                                    };
                                    res.json({ success: true, dashboard: dashboardData });
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/api/police/suspects", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            // Restrict access to authorized police personnel
                            if (req.user.role !== 'admin' && req.user.workspace !== 'studio') {
                                return [2 /*return*/, res.status(403).json({ error: "Unauthorized access to investigative data." })];
                            }
                            res.json({ success: true, suspects: memorySuspects });
                            return [2 /*return*/];
                        });
                    }); });
                    app.post("/api/police/suspects", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, name, mobileNumbers, socialProfiles, remarks, newSuspect;
                        return __generator(this, function (_b) {
                            _a = req.body, name = _a.name, mobileNumbers = _a.mobileNumbers, socialProfiles = _a.socialProfiles, remarks = _a.remarks;
                            newSuspect = {
                                id: suspectCounter++,
                                name: name,
                                mobileNumbers: mobileNumbers || [],
                                socialProfiles: socialProfiles || {},
                                remarks: remarks,
                                status: 'Active Investigation',
                                createdAt: new Date()
                            };
                            memorySuspects.push(newSuspect);
                            res.json({ success: true, suspect: newSuspect });
                            return [2 /*return*/];
                        });
                    }); });
                    app.get("/api/police/audit-logs", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (req.user.role !== 'admin') {
                                return [2 /*return*/, res.status(403).json({ error: "Audit logs restricted to administrators." })];
                            }
                            res.json({ success: true, logs: memoryInvestigativeLogs });
                            return [2 /*return*/];
                        });
                    }); });
                    // Case Sealing and Secure Disposal Protocol
                    app.post("/api/police/investigation/seal", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var suspectId, suspect, sealedLogs;
                        return __generator(this, function (_a) {
                            suspectId = req.body.suspectId;
                            if (req.user.role !== 'admin')
                                return [2 /*return*/, res.status(403).json({ error: "Unauthorized" })];
                            suspect = memorySuspects.find(function (s) { return s.name === suspectId || s.id.toString() === suspectId; });
                            if (!suspect)
                                return [2 /*return*/, res.status(404).json({ error: "Suspect not found" })];
                            // 1. Mark suspect as 'Sealed'
                            suspect.status = 'Investigation Sealed - Case Closed';
                            suspect.sealedAt = new Date();
                            sealedLogs = memoryInvestigativeLogs.filter(function (l) { return l.suspectId === suspectId; });
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
                            return [2 /*return*/];
                        });
                    }); });
                    // Updated Ingest with Metadata Linking
                    app.post("/api/ingest", authenticateToken, upload.single("file"), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var workspace, useDataBox, suspectId, driveResult, e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!req.file)
                                        return [2 /*return*/, res.status(400).json({ error: "File required" })];
                                    workspace = req.user.workspace || "default";
                                    useDataBox = req.body.useDataBox === "true";
                                    suspectId = req.body.suspectId;
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 4, , 5]);
                                    if (!useDataBox) return [3 /*break*/, 3];
                                    return [4 /*yield*/, driveService.uploadFile(req.file.originalname, req.file.mimetype, req.file.buffer, process.env.GOOGLE_DRIVE_FOLDER_ID)];
                                case 2:
                                    driveResult = _a.sent();
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
                                    _a.label = 3;
                                case 3:
                                    res.json({ success: true, message: useDataBox ? "Asset securely transferred to Police Data Box and logged." : "File ingested successfully." });
                                    return [3 /*break*/, 5];
                                case 4:
                                    e_1 = _a.sent();
                                    console.error(e_1);
                                    res.status(500).json({ error: "Upload process failed" });
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    // File Management
                    app.get("/api/files", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var workspace;
                        return __generator(this, function (_a) {
                            workspace = req.user.workspace || "default";
                            // In production, list from OCI bucket/DB
                            res.json({ success: true, files: [{ id: 1, name: 'Sample_Video.mp4', uploadedAt: new Date() }] });
                            return [2 /*return*/];
                        });
                    }); });
                    app.delete("/api/files/:filename", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var filename, workspace;
                        return __generator(this, function (_a) {
                            filename = req.params.filename;
                            workspace = req.user.workspace || "default";
                            // In production, delete from OCI and database
                            console.log("Deleting ".concat(filename, " from workspace ").concat(workspace));
                            res.json({ success: true, message: "File deleted" });
                            return [2 /*return*/];
                        });
                    }); });
                    app.post("/api/ai-sort", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var workspace;
                        return __generator(this, function (_a) {
                            workspace = req.user.workspace;
                            if (workspace !== 'studio') {
                                return [2 /*return*/, res.status(403).json({ error: "AI sorting restricted to Paid users. Please upgrade." })];
                            }
                            // Logic for AI sorting...
                            res.json({ success: true, message: "AI sorting initiated" });
                            return [2 /*return*/];
                        });
                    }); });
                    // Subscription Endpoints
                    // Phase A: Platform Stability - Razorpay Revenue Integration
                    app.post("/api/subscribe", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var Razorpay, rzp, options, order, err_6;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    Razorpay = require('razorpay');
                                    rzp = new Razorpay({
                                        key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock",
                                        key_secret: process.env.RAZORPAY_KEY_SECRET
                                    });
                                    options = {
                                        amount: req.body.amount || 50000, // amount in the smallest currency unit
                                        currency: "INR",
                                        receipt: "receipt_user_".concat(req.user.userId),
                                    };
                                    return [4 /*yield*/, rzp.orders.create(options)];
                                case 1:
                                    order = _a.sent();
                                    res.json({ orderId: order.id, key: process.env.RAZORPAY_KEY_ID || "rzp_test_mock" });
                                    return [3 /*break*/, 3];
                                case 2:
                                    err_6 = _a.sent();
                                    console.error("Razorpay order creation failed:", err_6);
                                    res.status(500).json({ error: "Failed to initiate payment." });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/webhooks/razorpay", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var crypto, secret, event, userId, plan, limits, limit, connection, err_7, err_8;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    crypto = require('crypto');
                                    secret = process.env.RAZORPAY_WEBHOOK_SECRET || "streamvista_secret";
                                    event = req.body;
                                    if (!(event.event === 'payment.captured')) return [3 /*break*/, 11];
                                    userId = event.payload.payment.entity.notes.userId;
                                    plan = event.payload.payment.entity.notes.plan || 'Creator';
                                    limits = { 'Free': 1024, 'Creator': 10240, 'Studio': 102400 };
                                    limit = limits[plan] || 1024;
                                    connection = void 0;
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 5, 6, 11]);
                                    return [4 /*yield*/, getDbConnection()];
                                case 2:
                                    connection = _a.sent();
                                    if (!connection) return [3 /*break*/, 4];
                                    // Aligning with users table in schema.sql
                                    return [4 /*yield*/, connection.execute("UPDATE users SET storage_limit = :limit WHERE user_id = :userId", { limit: limit, userId: userId }, { autoCommit: true })];
                                case 3:
                                    // Aligning with users table in schema.sql
                                    _a.sent();
                                    console.log("Revenue Confirmed: Storage limit updated for user ".concat(userId, " to ").concat(plan));
                                    _a.label = 4;
                                case 4: return [3 /*break*/, 11];
                                case 5:
                                    err_7 = _a.sent();
                                    console.error("Failed to update storage in Oracle:", err_7);
                                    return [3 /*break*/, 11];
                                case 6:
                                    if (!connection) return [3 /*break*/, 10];
                                    _a.label = 7;
                                case 7:
                                    _a.trys.push([7, 9, , 10]);
                                    return [4 /*yield*/, connection.close()];
                                case 8:
                                    _a.sent();
                                    return [3 /*break*/, 10];
                                case 9:
                                    err_8 = _a.sent();
                                    return [3 /*break*/, 10];
                                case 10: return [7 /*endfinally*/];
                                case 11:
                                    res.status(200).send("OK");
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    // Activity Logs Endpoint
                    app.get("/api/activity-logs", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var connection, workspace, uploadsRes, loginsRes, logs, err_9, e_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, 5, 10]);
                                    workspace = req.user.workspace;
                                    return [4 /*yield*/, getDbConnection()];
                                case 1:
                                    connection = _a.sent();
                                    if (!connection) {
                                        return [2 /*return*/, res.json({ success: true, logs: [] })];
                                    }
                                    return [4 /*yield*/, connection.execute("SELECT 'File Upload' as ACTION, FILE_NAME as DETAILS, UPLOADED_AT as LOG_TIME \n             FROM RECENT_UPLOADS WHERE WORKSPACE_ID = :workspace", { workspace: workspace })];
                                case 2:
                                    uploadsRes = _a.sent();
                                    return [4 /*yield*/, connection.execute("SELECT 'Login' as ACTION, 'User accessed workspace' as DETAILS, S.CREATED_AT as LOG_TIME\n             FROM CRAYONS_ACTIVE_SESSIONS S\n             JOIN CRAYONS_USERS U ON S.USER_ID = U.USER_ID\n             WHERE U.WORKSPACE = :workspace", { workspace: workspace })];
                                case 3:
                                    loginsRes = _a.sent();
                                    logs = __spreadArray(__spreadArray([], (uploadsRes.rows || []), true), (loginsRes.rows || []), true).sort(function (a, b) { return new Date(b.LOG_TIME).getTime() - new Date(a.LOG_TIME).getTime(); })
                                        .slice(0, 10);
                                    res.json({ success: true, logs: logs });
                                    return [3 /*break*/, 10];
                                case 4:
                                    err_9 = _a.sent();
                                    console.error(err_9);
                                    res.status(500).json({ error: "Failed to fetch activity logs" });
                                    return [3 /*break*/, 10];
                                case 5:
                                    if (!connection) return [3 /*break*/, 9];
                                    _a.label = 6;
                                case 6:
                                    _a.trys.push([6, 8, , 9]);
                                    return [4 /*yield*/, connection.close()];
                                case 7:
                                    _a.sent();
                                    return [3 /*break*/, 9];
                                case 8:
                                    e_2 = _a.sent();
                                    return [3 /*break*/, 9];
                                case 9: return [7 /*endfinally*/];
                                case 10: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Admin: Send Invite (Generate Voucher)
                    app.post("/api/admin/send-invite", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, email, perks, voucherCode, newVoucher;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = req.body, email = _a.email, perks = _a.perks;
                                    voucherCode = "VOUCHER-" + Math.random().toString(36).substring(7).toUpperCase();
                                    newVoucher = { id: voucherCounter++, code: voucherCode, email: email, perks: perks, redeemed: false };
                                    memoryVouchers.push(newVoucher);
                                    // Phase A: Platform Stability - Reliable Email Notification
                                    return [4 /*yield*/, emailService.sendEmail(email, "Your StreamVista Perks", "Use code ".concat(voucherCode, " for perks: ").concat(perks.join(', ')))];
                                case 1:
                                    // Phase A: Platform Stability - Reliable Email Notification
                                    _b.sent();
                                    res.json({ success: true, code: voucherCode });
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    // Redemption Flow
                    app.post("/api/redeem-voucher", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var code, voucher;
                        return __generator(this, function (_a) {
                            code = req.body.code;
                            voucher = memoryVouchers.find(function (v) { return v.code === code && !v.redeemed; });
                            if (!voucher)
                                return [2 /*return*/, res.status(404).json({ error: "Invalid or already redeemed voucher" })];
                            // Apply perks (mock logic)
                            voucher.redeemed = true;
                            console.log("Voucher ".concat(code, " redeemed by ").concat(req.user.userId));
                            res.json({ success: true, perks: voucher.perks });
                            return [2 /*return*/];
                        });
                    }); });
                    // Login Endpoint
                    app.post("/api/login", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, email, password, connection, dbUser, tempUser, validPassword, workspace, userObj, token, result, _b, userId, fullName, dbEmail, passwordHash, workspace, validPassword, token, err_10, err_11;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = req.body, email = _a.email, password = _a.password;
                                    if (!email || !password) {
                                        return [2 /*return*/, res.status(400).json({ error: "Missing required security parameters." })];
                                    }
                                    _c.label = 1;
                                case 1:
                                    _c.trys.push([1, 11, 12, 17]);
                                    dbUser = process.env.ORACLE_DB_USER || "abijithasokan@crayonspictures.com";
                                    return [4 /*yield*/, getDbConnection()];
                                case 2:
                                    connection = _c.sent();
                                    if (!!connection) return [3 /*break*/, 6];
                                    tempUser = memoryUsers.find(function (u) { return u.email === email; });
                                    if (!tempUser && email !== 'abijithasokan@crayonspictures.com') {
                                        return [2 /*return*/, res.status(401).json({ error: "Invalid credentials or unauthorized access." })];
                                    }
                                    validPassword = false;
                                    workspace = "creator-studio";
                                    userObj = { userId: 1, email: "abijithasokan@crayonspictures.com", fullName: "A. Asokan" };
                                    if (!tempUser) return [3 /*break*/, 4];
                                    return [4 /*yield*/, bcryptjs_1.default.compare(password, tempUser.passwordHash)];
                                case 3:
                                    validPassword = _c.sent();
                                    workspace = tempUser.workspace;
                                    userObj = { userId: tempUser.userId, email: tempUser.email, fullName: tempUser.fullName };
                                    return [3 /*break*/, 5];
                                case 4:
                                    if (password === "admin" || email === "abijithasokan@crayonspictures.com") {
                                        // allow bypass for the default credential on mock db
                                        validPassword = true;
                                    }
                                    _c.label = 5;
                                case 5:
                                    if (!validPassword) {
                                        return [2 /*return*/, res.status(401).json({ error: "Invalid credentials or unauthorized access." })];
                                    }
                                    token = jsonwebtoken_1.default.sign(userObj, JWT_SECRET, { expiresIn: '8h' });
                                    return [2 /*return*/, res.json({
                                            success: true,
                                            workspace: workspace,
                                            token: token,
                                            message: "Authentication successful. Access granted to target workspace.",
                                            metadata: { proxyStatus: "SIMULATED_DB_AUTH" }
                                        })];
                                case 6: return [4 /*yield*/, connection.execute("SELECT USER_ID, FULL_NAME, EMAIL, PASSWORD_HASH, WORKSPACE FROM CRAYONS_USERS \n         WHERE EMAIL = :email AND IS_ACTIVE = 1", { email: email })];
                                case 7:
                                    result = _c.sent();
                                    if (!(result.rows && result.rows.length > 0)) return [3 /*break*/, 9];
                                    _b = result.rows[0], userId = _b[0], fullName = _b[1], dbEmail = _b[2], passwordHash = _b[3], workspace = _b[4];
                                    return [4 /*yield*/, bcryptjs_1.default.compare(password, passwordHash)];
                                case 8:
                                    validPassword = _c.sent();
                                    if (!validPassword) {
                                        return [2 /*return*/, res.status(401).json({ error: "Invalid credentials or unauthorized access." })];
                                    }
                                    token = jsonwebtoken_1.default.sign({ userId: userId, email: dbEmail, fullName: fullName, workspace: workspace }, JWT_SECRET, { expiresIn: '8h' });
                                    // Optionally insert into CRAYONS_ACTIVE_SESSIONS here
                                    res.json({
                                        success: true,
                                        message: "Authentication successful. Routing to workspace...",
                                        workspace: workspace,
                                        token: token
                                    });
                                    return [3 /*break*/, 10];
                                case 9:
                                    res.status(401).json({ error: "Invalid credentials or unauthorized access." });
                                    _c.label = 10;
                                case 10: return [3 /*break*/, 17];
                                case 11:
                                    err_10 = _c.sent();
                                    console.error("OCI Integration Error Database:", err_10);
                                    res.status(500).json({ error: "Oracle Cloud Service Execution Failed", details: err_10.message });
                                    return [3 /*break*/, 17];
                                case 12:
                                    if (!connection) return [3 /*break*/, 16];
                                    _c.label = 13;
                                case 13:
                                    _c.trys.push([13, 15, , 16]);
                                    return [4 /*yield*/, connection.close()];
                                case 14:
                                    _c.sent();
                                    return [3 /*break*/, 16];
                                case 15:
                                    err_11 = _c.sent();
                                    return [3 /*break*/, 16];
                                case 16: return [7 /*endfinally*/];
                                case 17: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Logout Endpoint
                    app.post("/api/logout", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            // In a real system, you might invalidate the token in CRAYONS_ACTIVE_SESSIONS
                            res.json({ success: true, message: "Securely logged out form Oracle cloud services." });
                            return [2 /*return*/];
                        });
                    }); });
                    // Profile Endpoint
                    app.get("/api/profile", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
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
                            return [2 /*return*/];
                        });
                    }); });
                    // User Storage Endpoint
                    // Phase A: Platform Stability - Real-time Storage Tracking
                    app.get("/api/user/storage", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var connection, userId_1, usage, limit, usageRes, limitRes, userFiles, err_12;
                        var _a, _b, _c, _d;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    _e.trys.push([0, 6, 7, 10]);
                                    userId_1 = req.user.userId;
                                    return [4 /*yield*/, getDbConnection()];
                                case 1:
                                    connection = _e.sent();
                                    usage = 0;
                                    limit = 1024;
                                    if (!connection) return [3 /*break*/, 4];
                                    return [4 /*yield*/, connection.execute("SELECT SUM(file_size) as total_size FROM file_metadata WHERE user_id = :userId", { userId: userId_1 })];
                                case 2:
                                    usageRes = _e.sent();
                                    usage = (((_b = (_a = usageRes.rows) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b[0]) || 0) / (1024 * 1024); // Convert to MB
                                    return [4 /*yield*/, connection.execute("SELECT storage_limit FROM users WHERE user_id = :userId", { userId: userId_1 })];
                                case 3:
                                    limitRes = _e.sent();
                                    limit = ((_d = (_c = limitRes.rows) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d[0]) || 1024;
                                    return [3 /*break*/, 5];
                                case 4:
                                    userFiles = memoryFiles.filter(function (f) { return f.userId === userId_1; });
                                    usage = userFiles.reduce(function (acc, f) { return acc + (f.size || 0); }, 0) / (1024 * 1024);
                                    _e.label = 5;
                                case 5:
                                    res.json({
                                        success: true,
                                        used: Math.round(usage * 100) / 100,
                                        limit: limit,
                                        workspace: req.user.workspace
                                    });
                                    return [3 /*break*/, 10];
                                case 6:
                                    err_12 = _e.sent();
                                    console.error("Storage fetch failed:", err_12);
                                    res.status(500).json({ error: "Failed to fetch storage usage." });
                                    return [3 /*break*/, 10];
                                case 7:
                                    if (!connection) return [3 /*break*/, 9];
                                    return [4 /*yield*/, connection.close()];
                                case 8:
                                    _e.sent();
                                    _e.label = 9;
                                case 9: return [7 /*endfinally*/];
                                case 10: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Reset Password Endpoint (Simulated)
                    app.post("/api/reset-password", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var email;
                        return __generator(this, function (_a) {
                            email = req.body.email;
                            if (!email)
                                return [2 /*return*/, res.status(400).json({ error: "Email is required to request rest." })];
                            // In reality, this would generate a random token, store it in CRAYONS_PASSWORD_RESETS, 
                            // and send an email or OTP.
                            res.json({
                                success: true,
                                message: "If an account exists, a secure link will be dispatched."
                            });
                            return [2 /*return*/];
                        });
                    }); });
                    // --- Phase B: Marketplace Revenue Workflow ---
                    app.post("/api/marketplace/submit", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, fileId, banner, userId, file, qcResult;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = req.body, fileId = _a.fileId, banner = _a.banner;
                                    userId = req.user.userId;
                                    file = memoryFiles.find(function (f) { return f.id === fileId; });
                                    if (!file)
                                        return [2 /*return*/, res.status(404).json({ error: "File not found." })];
                                    // 2. Trigger Phase B Workflow: Creator Upload -> QC
                                    console.log("[Phase B] Initiating Workflow for Asset ".concat(fileId));
                                    return [4 /*yield*/, qcService.runFullScan(fileId.toString(), file.name)];
                                case 1:
                                    qcResult = _b.sent();
                                    if (!qcResult.passed) {
                                        return [2 /*return*/, res.status(422).json({
                                                success: false,
                                                status: "QC_FAILED",
                                                message: "Asset did not meet technical standards (45Mbps+ Bitrate, 0 Frame Drops)."
                                            })];
                                    }
                                    // 3. QC Passed -> Legal Intake
                                    console.log("[Phase B] Asset ".concat(fileId, " Passed QC. Moving to Legal Review."));
                                    // In production, update Oracle: UPDATE marketplace_assets SET status = 'LEGAL_PENDING'
                                    file.marketplaceStatus = "LEGAL_PENDING";
                                    file.qcVerified = true;
                                    res.json({
                                        success: true,
                                        status: "LEGAL_PENDING",
                                        message: "QC Verified. Asset submitted for Legal Clearance."
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/api/marketplace/catalog", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var catalog;
                        return __generator(this, function (_a) {
                            catalog = memoryFiles.filter(function (f) { return f.marketplaceStatus === "APPROVED"; });
                            res.json({ success: true, catalog: catalog });
                            return [2 /*return*/];
                        });
                    }); });
                    app.post("/api/marketplace/offer", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, fileId, offerAmount, buyerId, offer;
                        return __generator(this, function (_b) {
                            _a = req.body, fileId = _a.fileId, offerAmount = _a.offerAmount;
                            buyerId = req.user.userId;
                            offer = {
                                id: Math.floor(Math.random() * 1000),
                                fileId: fileId,
                                buyerId: buyerId,
                                amount: offerAmount,
                                status: "OFFER_PENDING",
                                createdAt: new Date().toISOString()
                            };
                            console.log("[Revenue] New Offer received for Asset ".concat(fileId, ": \u20B9").concat(offerAmount));
                            res.json({ success: true, offer: offer });
                            return [2 /*return*/];
                        });
                    }); });
                    app.get("/api/projects", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var connection, workspace_1, userProjects, result, projects, err_13, err_14;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 3, 4, 9]);
                                    workspace_1 = req.user.workspace;
                                    return [4 /*yield*/, getDbConnection()];
                                case 1:
                                    connection = _b.sent();
                                    if (!connection) {
                                        userProjects = memoryProjects.filter(function (p) { return (req.user.userId === 1 || p.userId === req.user.userId) && p.banner === workspace_1; });
                                        return [2 /*return*/, res.json({ success: true, projects: userProjects })];
                                    }
                                    return [4 /*yield*/, connection.execute("SELECT PROJECT_ID, TITLE, PROJECT_TYPE, STATUS, PROGRESS, DELIVERY_DATE, BANNER FROM CRAYONS_PROJECTS \n         WHERE USER_ID = :userId AND BANNER = :workspace ORDER BY CREATED_AT DESC", { userId: req.user.userId, workspace: workspace_1 })];
                                case 2:
                                    result = _b.sent();
                                    projects = ((_a = result.rows) === null || _a === void 0 ? void 0 : _a.map(function (row) { return ({
                                        id: row[0], title: row[1], type: row[2], status: row[3], progress: row[4], date: row[5], banner: row[6]
                                    }); })) || [];
                                    res.json({ success: true, projects: projects });
                                    return [3 /*break*/, 9];
                                case 3:
                                    err_13 = _b.sent();
                                    console.error(err_13);
                                    res.status(500).json({ error: "Failed to fetch projects" });
                                    return [3 /*break*/, 9];
                                case 4:
                                    if (!connection) return [3 /*break*/, 8];
                                    _b.label = 5;
                                case 5:
                                    _b.trys.push([5, 7, , 8]);
                                    return [4 /*yield*/, connection.close()];
                                case 6:
                                    _b.sent();
                                    return [3 /*break*/, 8];
                                case 7:
                                    err_14 = _b.sent();
                                    return [3 /*break*/, 8];
                                case 8: return [7 /*endfinally*/];
                                case 9: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/projects", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, title, description, language, genre, releaseYear, duration, rightsOwner, producer, director, keywords, status, progress, date, banner, connection, projectBanner, newProject, result, newId, err_15, err_16;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = req.body, title = _a.title, description = _a.description, language = _a.language, genre = _a.genre, releaseYear = _a.releaseYear, duration = _a.duration, rightsOwner = _a.rightsOwner, producer = _a.producer, director = _a.director, keywords = _a.keywords, status = _a.status, progress = _a.progress, date = _a.date, banner = _a.banner;
                                    if (!title)
                                        return [2 /*return*/, res.status(400).json({ error: "Project Title is required" })];
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 4, 5, 10]);
                                    projectBanner = banner || "crayons-pictures";
                                    return [4 /*yield*/, getDbConnection()];
                                case 2:
                                    connection = _b.sent();
                                    if (!connection) {
                                        newProject = {
                                            id: projectCounter++,
                                            userId: req.user.userId || 1,
                                            title: title,
                                            description: description,
                                            language: language,
                                            genre: genre,
                                            releaseYear: releaseYear,
                                            duration: duration,
                                            rightsOwner: rightsOwner,
                                            producer: producer,
                                            director: director,
                                            keywords: keywords,
                                            status: status || 'Pre-Production', progress: progress || 0,
                                            date: date,
                                            banner: projectBanner
                                        };
                                        memoryProjects.unshift(newProject);
                                        return [2 /*return*/, res.json({ success: true, project: newProject })];
                                    }
                                    return [4 /*yield*/, connection.execute("INSERT INTO CRAYONS_PROJECTS (USER_ID, TITLE, DESCRIPTION, LANGUAGE, GENRE, RELEASE_YEAR, DURATION, RIGHTS_OWNER, PRODUCER, DIRECTOR, KEYWORDS, STATUS, PROGRESS, DELIVERY_DATE, BANNER)\n         VALUES (:userId, :title, :description, :language, :genre, :releaseYear, :duration, :rightsOwner, :producer, :director, :keywords, :status, :progress, :date, :banner) RETURNING PROJECT_ID INTO :new_id", {
                                            userId: req.user.userId,
                                            title: title,
                                            description: description,
                                            language: language,
                                            genre: genre,
                                            releaseYear: releaseYear,
                                            duration: duration,
                                            rightsOwner: rightsOwner,
                                            producer: producer,
                                            director: director,
                                            keywords: keywords,
                                            status: status || 'Pre-Production', progress: progress || 0,
                                            date: date,
                                            banner: projectBanner,
                                            new_id: { type: oracledb_1.default.NUMBER, dir: oracledb_1.default.BIND_OUT }
                                        }, { autoCommit: true })];
                                case 3:
                                    result = _b.sent();
                                    newId = result.outBinds.new_id[0];
                                    res.json({ success: true, project: { id: newId, title: title, description: description, language: language, genre: genre, releaseYear: releaseYear, duration: duration, rightsOwner: rightsOwner, producer: producer, director: director, keywords: keywords, status: status || 'Pre-Production', progress: progress || 0, date: date, banner: projectBanner } });
                                    return [3 /*break*/, 10];
                                case 4:
                                    err_15 = _b.sent();
                                    console.error(err_15);
                                    res.status(500).json({ error: "Failed to create project" });
                                    return [3 /*break*/, 10];
                                case 5:
                                    if (!connection) return [3 /*break*/, 9];
                                    _b.label = 6;
                                case 6:
                                    _b.trys.push([6, 8, , 9]);
                                    return [4 /*yield*/, connection.close()];
                                case 7:
                                    _b.sent();
                                    return [3 /*break*/, 9];
                                case 8:
                                    err_16 = _b.sent();
                                    return [3 /*break*/, 9];
                                case 9: return [7 /*endfinally*/];
                                case 10: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.put("/api/projects/:id", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var projectId, _a, title, description, language, genre, releaseYear, duration, rightsOwner, producer, director, keywords, status, progress, date, connection, index, result, err_17, err_18;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    projectId = req.params.id;
                                    _a = req.body, title = _a.title, description = _a.description, language = _a.language, genre = _a.genre, releaseYear = _a.releaseYear, duration = _a.duration, rightsOwner = _a.rightsOwner, producer = _a.producer, director = _a.director, keywords = _a.keywords, status = _a.status, progress = _a.progress, date = _a.date;
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 4, 5, 10]);
                                    return [4 /*yield*/, getDbConnection()];
                                case 2:
                                    connection = _b.sent();
                                    if (!connection) {
                                        index = memoryProjects.findIndex(function (p) { return p.id == projectId && (req.user.userId === 1 || p.userId === req.user.userId); });
                                        if (index === -1)
                                            return [2 /*return*/, res.status(404).json({ error: "Project not found" })];
                                        memoryProjects[index] = __assign(__assign({}, memoryProjects[index]), { title: title, description: description, language: language, genre: genre, releaseYear: releaseYear, duration: duration, rightsOwner: rightsOwner, producer: producer, director: director, keywords: keywords, status: status, progress: progress, date: date });
                                        return [2 /*return*/, res.json({ success: true, project: memoryProjects[index] })];
                                    }
                                    return [4 /*yield*/, connection.execute("UPDATE CRAYONS_PROJECTS SET TITLE = :title, DESCRIPTION = :description, LANGUAGE = :language, GENRE = :genre, RELEASE_YEAR = :releaseYear, DURATION = :duration, RIGHTS_OWNER = :rightsOwner, PRODUCER = :producer, DIRECTOR = :director, KEYWORDS = :keywords, STATUS = :status, PROGRESS = :progress, DELIVERY_DATE = :date\n         WHERE PROJECT_ID = :id AND USER_ID = :userId", { title: title, description: description, language: language, genre: genre, releaseYear: releaseYear, duration: duration, rightsOwner: rightsOwner, producer: producer, director: director, keywords: keywords, status: status, progress: progress, date: date, id: projectId, userId: req.user.userId }, { autoCommit: true })];
                                case 3:
                                    result = _b.sent();
                                    if (result.rowsAffected === 0)
                                        return [2 /*return*/, res.status(404).json({ error: "Project not found or unauthorized" })];
                                    res.json({ success: true, message: "Project updated" });
                                    return [3 /*break*/, 10];
                                case 4:
                                    err_17 = _b.sent();
                                    console.error(err_17);
                                    res.status(500).json({ error: "Failed to update project" });
                                    return [3 /*break*/, 10];
                                case 5:
                                    if (!connection) return [3 /*break*/, 9];
                                    _b.label = 6;
                                case 6:
                                    _b.trys.push([6, 8, , 9]);
                                    return [4 /*yield*/, connection.close()];
                                case 7:
                                    _b.sent();
                                    return [3 /*break*/, 9];
                                case 8:
                                    err_18 = _b.sent();
                                    return [3 /*break*/, 9];
                                case 9: return [7 /*endfinally*/];
                                case 10: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.delete("/api/projects/:id", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var projectId, connection, index, result, err_19, err_20;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    projectId = req.params.id;
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 4, 5, 10]);
                                    return [4 /*yield*/, getDbConnection()];
                                case 2:
                                    connection = _a.sent();
                                    if (!connection) {
                                        index = memoryProjects.findIndex(function (p) { return p.id == projectId && (req.user.userId === 1 || p.userId === req.user.userId); });
                                        if (index === -1)
                                            return [2 /*return*/, res.status(404).json({ error: "Project not found" })];
                                        memoryProjects.splice(index, 1);
                                        return [2 /*return*/, res.json({ success: true, message: "Project deleted" })];
                                    }
                                    return [4 /*yield*/, connection.execute("DELETE FROM CRAYONS_PROJECTS WHERE PROJECT_ID = :id AND USER_ID = :userId", { id: projectId, userId: req.user.userId }, { autoCommit: true })];
                                case 3:
                                    result = _a.sent();
                                    if (result.rowsAffected === 0)
                                        return [2 /*return*/, res.status(404).json({ error: "Project not found or unauthorized" })];
                                    res.json({ success: true, message: "Project deleted" });
                                    return [3 /*break*/, 10];
                                case 4:
                                    err_19 = _a.sent();
                                    console.error(err_19);
                                    res.status(500).json({ error: "Failed to delete project" });
                                    return [3 /*break*/, 10];
                                case 5:
                                    if (!connection) return [3 /*break*/, 9];
                                    _a.label = 6;
                                case 6:
                                    _a.trys.push([6, 8, , 9]);
                                    return [4 /*yield*/, connection.close()];
                                case 7:
                                    _a.sent();
                                    return [3 /*break*/, 9];
                                case 8:
                                    err_20 = _a.sent();
                                    return [3 /*break*/, 9];
                                case 9: return [7 /*endfinally*/];
                                case 10: return [2 /*return*/];
                            }
                        });
                    }); });
                    getOciClient = function () {
                        try {
                            if (process.env.OCI_CONFIG_FILE) {
                                var provider = new common.ConfigFileAuthenticationDetailsProvider(process.env.OCI_CONFIG_FILE);
                                return new os.ObjectStorageClient({ authenticationDetailsProvider: provider });
                            }
                        }
                        catch (e) {
                            console.warn("OCI Provider not configured, using memory fallback.");
                        }
                        return null;
                    };
                    app.get("/api/storage/files", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var banner, connection, files, dbPassword, result, metaMap_1, e_3, e_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    banner = req.query.banner;
                                    files = memoryFiles.filter(function (f) { return !banner || f.banner === banner; });
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 7, 8, 13]);
                                    dbPassword = process.env.ORACLE_DB_PASSWORD;
                                    if (!dbPassword) return [3 /*break*/, 5];
                                    return [4 /*yield*/, getDbConnection()];
                                case 2:
                                    // Enrichen files with Database metadata
                                    connection = _a.sent();
                                    if (!connection) return [3 /*break*/, 4];
                                    return [4 /*yield*/, connection.execute("SELECT M.FILE_ID, M.PROJECT_ID, P.TITLE \n             FROM CRAYONS_FILE_METADATA M \n             LEFT JOIN CRAYONS_PROJECTS P ON M.PROJECT_ID = P.PROJECT_ID")];
                                case 3:
                                    result = _a.sent();
                                    if (result.rows) {
                                        metaMap_1 = new Map();
                                        result.rows.forEach(function (row) { return metaMap_1.set(row[0], { projectId: row[1], projectTitle: row[2] }); });
                                        files = files.map(function (f) {
                                            var meta = metaMap_1.get(f.id);
                                            return meta ? __assign(__assign({}, f), { linkedProjectId: meta.projectId, linkedProjectTitle: meta.projectTitle }) : f;
                                        });
                                    }
                                    _a.label = 4;
                                case 4: return [3 /*break*/, 6];
                                case 5:
                                    // Memory fallback enrichment
                                    files = files.map(function (f) {
                                        var meta = memoryFileMetadata.find(function (m) { return m.fileId === f.id; });
                                        if (meta && meta.projectId) {
                                            var p = memoryProjects.find(function (pr) { return pr.id === meta.projectId; });
                                            return __assign(__assign({}, f), { linkedProjectId: meta.projectId, linkedProjectTitle: p === null || p === void 0 ? void 0 : p.title });
                                        }
                                        return f;
                                    });
                                    _a.label = 6;
                                case 6: return [3 /*break*/, 13];
                                case 7:
                                    e_3 = _a.sent();
                                    console.error(e_3);
                                    return [3 /*break*/, 13];
                                case 8:
                                    if (!connection) return [3 /*break*/, 12];
                                    _a.label = 9;
                                case 9:
                                    _a.trys.push([9, 11, , 12]);
                                    return [4 /*yield*/, connection.close()];
                                case 10:
                                    _a.sent();
                                    return [3 /*break*/, 12];
                                case 11:
                                    e_4 = _a.sent();
                                    console.error("Error closing connection", e_4);
                                    return [3 /*break*/, 12];
                                case 12: return [7 /*endfinally*/];
                                case 13:
                                    res.json({ success: true, files: files });
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/storage/upload", authenticateToken, upload.single("file"), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var banner, newFile;
                        return __generator(this, function (_a) {
                            if (!req.file)
                                return [2 /*return*/, res.status(400).json({ error: "No file uploaded" })];
                            banner = req.body.banner || "crayons-pictures";
                            newFile = {
                                id: fileCounter++,
                                name: req.file.originalname,
                                size: req.body.originalSize ? parseInt(req.body.originalSize, 10) : req.file.size,
                                type: req.file.mimetype,
                                banner: banner,
                                uploadedAt: new Date().toISOString()
                            };
                            memoryFiles.unshift(newFile);
                            res.json({ success: true, file: newFile, message: "File uploaded successfully to CRAYONS-CREATOR-RAW" });
                            return [2 /*return*/];
                        });
                    }); });
                    app.delete("/api/storage/files/:id", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var fileId, index;
                        return __generator(this, function (_a) {
                            fileId = parseInt(req.params.id);
                            index = memoryFiles.findIndex(function (f) { return f.id === fileId; });
                            if (index === -1)
                                return [2 /*return*/, res.status(404).json({ error: "File not found" })];
                            // In actual OCI, we would do:
                            // const client = getOciClient();
                            // if (client) { ... client.deleteObject({...}) }
                            memoryFiles.splice(index, 1);
                            res.json({ success: true, message: "File deleted securely" });
                            return [2 /*return*/];
                        });
                    }); });
                    app.get("/api/storage/files/:id/download", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var fileId, file;
                        return __generator(this, function (_a) {
                            fileId = parseInt(req.params.id);
                            file = memoryFiles.find(function (f) { return f.id === fileId; });
                            if (!file)
                                return [2 /*return*/, res.status(404).json({ error: "File not found" })];
                            // In actual OCI, we would do:
                            // const client = getOciClient();
                            // if (client) { const response = await client.getObject({...}); response.value.pipe(res); }
                            res.setHeader('Content-disposition', "attachment; filename=".concat(file.name));
                            res.setHeader('Content-type', file.type);
                            res.send("Mock file content for " + file.name);
                            return [2 /*return*/];
                        });
                    }); });
                    app.put("/api/storage/files/:id/rename", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var fileId, newName, file;
                        return __generator(this, function (_a) {
                            fileId = parseInt(req.params.id);
                            newName = req.body.newName;
                            if (!newName)
                                return [2 /*return*/, res.status(400).json({ error: "New name required" })];
                            file = memoryFiles.find(function (f) { return f.id === fileId; });
                            if (!file)
                                return [2 /*return*/, res.status(404).json({ error: "File not found" })];
                            // In actual OCI, we would do:
                            // const client = getOciClient();
                            // if (client) { ... client.renameObject({...}) }
                            file.name = newName;
                            res.json({ success: true, file: file, message: "File renamed successfully" });
                            return [2 /*return*/];
                        });
                    }); });
                    app.get("/api/storage/files/:id/metadata", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var connection, fileId_1, metadata_1, result, metadata, row, err_21, err_22;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, 4, 9]);
                                    fileId_1 = parseInt(req.params.id);
                                    return [4 /*yield*/, getDbConnection()];
                                case 1:
                                    connection = _a.sent();
                                    if (!connection) {
                                        metadata_1 = memoryFileMetadata.find(function (m) { return m.fileId === fileId_1; }) || { fileId: fileId_1 };
                                        return [2 /*return*/, res.json({ success: true, metadata: metadata_1 })];
                                    }
                                    return [4 /*yield*/, connection.execute("SELECT FILE_METADATA_ID, PROJECT_ID, TITLE, DESCRIPTION, LANGUAGE, GENRE, RELEASE_YEAR, DURATION, KEYWORDS, DIRECTOR \n         FROM CRAYONS_FILE_METADATA WHERE FILE_ID = :fileId", { fileId: fileId_1 })];
                                case 2:
                                    result = _a.sent();
                                    metadata = { fileId: fileId_1 };
                                    if (result.rows && result.rows.length > 0) {
                                        row = result.rows[0];
                                        metadata = {
                                            fileId: fileId_1,
                                            // @ts-ignore
                                            projectId: row[1], title: row[2], description: row[3], language: row[4], genre: row[5], releaseYear: row[6], duration: row[7], keywords: row[8], director: row[9]
                                        };
                                    }
                                    res.json({ success: true, metadata: metadata });
                                    return [3 /*break*/, 9];
                                case 3:
                                    err_21 = _a.sent();
                                    console.error(err_21);
                                    res.status(500).json({ error: "Failed to fetch metadata" });
                                    return [3 /*break*/, 9];
                                case 4:
                                    if (!connection) return [3 /*break*/, 8];
                                    _a.label = 5;
                                case 5:
                                    _a.trys.push([5, 7, , 8]);
                                    return [4 /*yield*/, connection.close()];
                                case 6:
                                    _a.sent();
                                    return [3 /*break*/, 8];
                                case 7:
                                    err_22 = _a.sent();
                                    return [3 /*break*/, 8];
                                case 8: return [7 /*endfinally*/];
                                case 9: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/storage/files/:id/metadata", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var fileId, _a, projectId, title, description, language, genre, releaseYear, duration, keywords, director, connection, meta, check, err_23, err_24;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    fileId = parseInt(req.params.id);
                                    _a = req.body, projectId = _a.projectId, title = _a.title, description = _a.description, language = _a.language, genre = _a.genre, releaseYear = _a.releaseYear, duration = _a.duration, keywords = _a.keywords, director = _a.director;
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 8, 9, 14]);
                                    return [4 /*yield*/, getDbConnection()];
                                case 2:
                                    connection = _b.sent();
                                    if (!connection) {
                                        meta = memoryFileMetadata.find(function (m) { return m.fileId === fileId; });
                                        if (!meta) {
                                            meta = { id: fileMetadataCounter++, fileId: fileId };
                                            memoryFileMetadata.push(meta);
                                        }
                                        Object.assign(meta, { projectId: projectId, title: title, description: description, language: language, genre: genre, releaseYear: releaseYear, duration: duration, keywords: keywords, director: director });
                                        return [2 /*return*/, res.json({ success: true, message: "Metadata updated securely", metadata: meta })];
                                    }
                                    return [4 /*yield*/, connection.execute("SELECT FILE_METADATA_ID FROM CRAYONS_FILE_METADATA WHERE FILE_ID = :fileId", { fileId: fileId })];
                                case 3:
                                    check = _b.sent();
                                    if (!(check.rows && check.rows.length > 0)) return [3 /*break*/, 5];
                                    return [4 /*yield*/, connection.execute("UPDATE CRAYONS_FILE_METADATA SET PROJECT_ID = :projectId, TITLE = :title, DESCRIPTION = :desc, \n           LANGUAGE = :lang, GENRE = :genre, RELEASE_YEAR = :year, DURATION = :duration, KEYWORDS = :keywords, DIRECTOR = :director \n           WHERE FILE_ID = :fileId", {
                                            projectId: projectId || null,
                                            title: title,
                                            desc: description, lang: language,
                                            genre: genre,
                                            year: releaseYear,
                                            duration: duration,
                                            keywords: keywords,
                                            director: director,
                                            fileId: fileId
                                        }, { autoCommit: true })];
                                case 4:
                                    _b.sent();
                                    return [3 /*break*/, 7];
                                case 5: return [4 /*yield*/, connection.execute("INSERT INTO CRAYONS_FILE_METADATA (FILE_ID, PROJECT_ID, TITLE, DESCRIPTION, LANGUAGE, GENRE, RELEASE_YEAR, DURATION, KEYWORDS, DIRECTOR)\n           VALUES (:fileId, :projectId, :title, :desc, :lang, :genre, :year, :duration, :keywords, :director)", {
                                        fileId: fileId,
                                        projectId: projectId || null,
                                        title: title,
                                        desc: description, lang: language,
                                        genre: genre,
                                        year: releaseYear,
                                        duration: duration,
                                        keywords: keywords,
                                        director: director
                                    }, { autoCommit: true })];
                                case 6:
                                    _b.sent();
                                    _b.label = 7;
                                case 7:
                                    res.json({ success: true, message: "Metadata updated securely" });
                                    return [3 /*break*/, 14];
                                case 8:
                                    err_23 = _b.sent();
                                    console.error(err_23);
                                    res.status(500).json({ error: "Failed to update metadata" });
                                    return [3 /*break*/, 14];
                                case 9:
                                    if (!connection) return [3 /*break*/, 13];
                                    _b.label = 10;
                                case 10:
                                    _b.trys.push([10, 12, , 13]);
                                    return [4 /*yield*/, connection.close()];
                                case 11:
                                    _b.sent();
                                    return [3 /*break*/, 13];
                                case 12:
                                    err_24 = _b.sent();
                                    return [3 /*break*/, 13];
                                case 13: return [7 /*endfinally*/];
                                case 14: return [2 /*return*/];
                            }
                        });
                    }); });
                    generateToken = function () { return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2); };
                    app.get("/api/delivery/packages", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var connection, banner_1, userProjectIds_1, packages_1, result, packages, err_25, err_26;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 3, 4, 9]);
                                    banner_1 = req.query.banner || "crayons-pictures";
                                    return [4 /*yield*/, getDbConnection()];
                                case 1:
                                    connection = _b.sent();
                                    if (!connection) {
                                        userProjectIds_1 = memoryProjects.filter(function (p) { return p.banner === banner_1 && (req.user.userId === 1 || p.userId === req.user.userId); }).map(function (p) { return p.id; });
                                        packages_1 = memoryDeliveryPackages.filter(function (p) { return userProjectIds_1.includes(p.projectId); });
                                        return [2 /*return*/, res.json({ success: true, packages: packages_1 })];
                                    }
                                    return [4 /*yield*/, connection.execute("SELECT D.PACKAGE_ID, D.PROJECT_ID, P.TITLE AS PROJECT_TITLE, D.PACKAGE_NAME, D.MASTER_FILE_URL, D.SUBTITLES_URL, D.METADATA_INCLUDED, D.SECURE_LINK_TOKEN, D.EXPIRY_DATE, D.CREATED_AT\n         FROM CRAYONS_DELIVERY_PACKAGES D\n         JOIN CRAYONS_PROJECTS P ON D.PROJECT_ID = P.PROJECT_ID\n         WHERE P.BANNER = :banner AND P.USER_ID = :userId ORDER BY D.CREATED_AT DESC", { userId: req.user.userId, banner: banner_1 })];
                                case 2:
                                    result = _b.sent();
                                    packages = ((_a = result.rows) === null || _a === void 0 ? void 0 : _a.map(function (row) { return ({
                                        id: row[0], projectId: row[1], projectTitle: row[2], packageName: row[3], masterFileUrl: row[4], subtitlesUrl: row[5], metadataIncluded: row[6], secureLinkToken: row[7], expiryDate: row[8], createdAt: row[9]
                                    }); })) || [];
                                    res.json({ success: true, packages: packages });
                                    return [3 /*break*/, 9];
                                case 3:
                                    err_25 = _b.sent();
                                    console.error(err_25);
                                    res.status(500).json({ error: "Failed to fetch delivery packages" });
                                    return [3 /*break*/, 9];
                                case 4:
                                    if (!connection) return [3 /*break*/, 8];
                                    _b.label = 5;
                                case 5:
                                    _b.trys.push([5, 7, , 8]);
                                    return [4 /*yield*/, connection.close()];
                                case 6:
                                    _b.sent();
                                    return [3 /*break*/, 8];
                                case 7:
                                    err_26 = _b.sent();
                                    return [3 /*break*/, 8];
                                case 8: return [7 /*endfinally*/];
                                case 9: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/delivery/packages", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, projectId, packageName, masterFileUrl, subtitlesUrl, metadataIncluded, daysToExpiry, connection, token, expiryDate, pkg, result, newId, err_27, err_28;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = req.body, projectId = _a.projectId, packageName = _a.packageName, masterFileUrl = _a.masterFileUrl, subtitlesUrl = _a.subtitlesUrl, metadataIncluded = _a.metadataIncluded, daysToExpiry = _a.daysToExpiry;
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 4, 5, 10]);
                                    token = generateToken();
                                    expiryDate = new Date();
                                    expiryDate.setDate(expiryDate.getDate() + (daysToExpiry || 7));
                                    return [4 /*yield*/, getDbConnection()];
                                case 2:
                                    connection = _b.sent();
                                    if (!connection) {
                                        pkg = { id: deliveryCounter++, projectId: projectId, userId: req.user.userId, packageName: packageName, masterFileUrl: masterFileUrl, subtitlesUrl: subtitlesUrl, metadataIncluded: metadataIncluded, secureLinkToken: token, expiryDate: expiryDate, createdAt: new Date() };
                                        memoryDeliveryPackages.unshift(pkg);
                                        return [2 /*return*/, res.json({ success: true, package: pkg })];
                                    }
                                    return [4 /*yield*/, connection.execute("INSERT INTO CRAYONS_DELIVERY_PACKAGES (PROJECT_ID, USER_ID, PACKAGE_NAME, MASTER_FILE_URL, SUBTITLES_URL, METADATA_INCLUDED, SECURE_LINK_TOKEN, EXPIRY_DATE)\n         VALUES (:projectId, :userId, :packageName, :masterFileUrl, :subtitlesUrl, :metadataIncluded, :secureLinkToken, :expiryDate)\n         RETURNING PACKAGE_ID INTO :new_id", {
                                            projectId: projectId,
                                            userId: req.user.userId,
                                            packageName: packageName,
                                            masterFileUrl: masterFileUrl,
                                            subtitlesUrl: subtitlesUrl,
                                            metadataIncluded: metadataIncluded ? 1 : 0, secureLinkToken: token,
                                            expiryDate: expiryDate,
                                            new_id: { type: oracledb_1.default.NUMBER, dir: oracledb_1.default.BIND_OUT }
                                        }, { autoCommit: true })];
                                case 3:
                                    result = _b.sent();
                                    newId = result.outBinds.new_id[0];
                                    res.json({ success: true, package: { id: newId, projectId: projectId, packageName: packageName, secureLinkToken: token, expiryDate: expiryDate } });
                                    return [3 /*break*/, 10];
                                case 4:
                                    err_27 = _b.sent();
                                    console.error(err_27);
                                    res.status(500).json({ error: "Failed to create delivery package" });
                                    return [3 /*break*/, 10];
                                case 5:
                                    if (!connection) return [3 /*break*/, 9];
                                    _b.label = 6;
                                case 6:
                                    _b.trys.push([6, 8, , 9]);
                                    return [4 /*yield*/, connection.close()];
                                case 7:
                                    _b.sent();
                                    return [3 /*break*/, 9];
                                case 8:
                                    err_28 = _b.sent();
                                    return [3 /*break*/, 9];
                                case 9: return [7 /*endfinally*/];
                                case 10: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/api/delivery/packages/:id/logs", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var packageId, connection, result, logs, err_29, err_30;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    packageId = parseInt(req.params.id);
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 4, 5, 10]);
                                    return [4 /*yield*/, getDbConnection()];
                                case 2:
                                    connection = _b.sent();
                                    if (!connection) {
                                        return [2 /*return*/, res.json({ success: true, logs: memoryDeliveryLogs.filter(function (l) { return l.packageId === packageId; }) })];
                                    }
                                    return [4 /*yield*/, connection.execute("SELECT LOG_ID, DOWNLOADED_BY_IP, DOWNLOAD_TIME FROM CRAYONS_DELIVERY_LOGS WHERE PACKAGE_ID = :packageId ORDER BY DOWNLOAD_TIME DESC", { packageId: packageId })];
                                case 3:
                                    result = _b.sent();
                                    logs = ((_a = result.rows) === null || _a === void 0 ? void 0 : _a.map(function (row) { return ({
                                        id: row[0], ip: row[1], downloadTime: row[2]
                                    }); })) || [];
                                    res.json({ success: true, logs: logs });
                                    return [3 /*break*/, 10];
                                case 4:
                                    err_29 = _b.sent();
                                    console.error(err_29);
                                    res.status(500).json({ error: "Failed to fetch logs" });
                                    return [3 /*break*/, 10];
                                case 5:
                                    if (!connection) return [3 /*break*/, 9];
                                    _b.label = 6;
                                case 6:
                                    _b.trys.push([6, 8, , 9]);
                                    return [4 /*yield*/, connection.close()];
                                case 7:
                                    _b.sent();
                                    return [3 /*break*/, 9];
                                case 8:
                                    err_30 = _b.sent();
                                    return [3 /*break*/, 9];
                                case 9: return [7 /*endfinally*/];
                                case 10: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/api/delivery/download/:token", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var token, ip, connection, pkg_1, result, pkg, pId, expiry, err_31, err_32;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    token = req.params.token;
                                    ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 5, 6, 11]);
                                    return [4 /*yield*/, getDbConnection()];
                                case 2:
                                    connection = _a.sent();
                                    if (!connection) {
                                        pkg_1 = memoryDeliveryPackages.find(function (p) { return p.secureLinkToken === token; });
                                        if (!pkg_1)
                                            return [2 /*return*/, res.status(404).json({ error: "Invalid link" })];
                                        if (new Date(pkg_1.expiryDate) < new Date())
                                            return [2 /*return*/, res.status(403).json({ error: "Link expired" })];
                                        memoryDeliveryLogs.push({ id: deliveryLogCounter++, packageId: pkg_1.id, ip: ip, downloadTime: new Date() });
                                        return [2 /*return*/, res.json({ success: true, message: "Mock download started for ".concat(pkg_1.packageName) })];
                                    }
                                    return [4 /*yield*/, connection.execute("SELECT PACKAGE_ID, PACKAGE_NAME, MASTER_FILE_URL, EXPIRY_DATE FROM CRAYONS_DELIVERY_PACKAGES WHERE SECURE_LINK_TOKEN = :token", { token: token })];
                                case 3:
                                    result = _a.sent();
                                    if (!result.rows || result.rows.length === 0)
                                        return [2 /*return*/, res.status(404).json({ error: "Invalid link" })];
                                    pkg = result.rows[0];
                                    pId = pkg[0];
                                    expiry = new Date(pkg[3]);
                                    if (expiry < new Date()) {
                                        return [2 /*return*/, res.status(403).json({ error: "Link expired" })];
                                    }
                                    return [4 /*yield*/, connection.execute("INSERT INTO CRAYONS_DELIVERY_LOGS (PACKAGE_ID, DOWNLOADED_BY_IP) VALUES (:pId, :ip)", { pId: pId, ip: ip || 'unknown' }, { autoCommit: true })];
                                case 4:
                                    _a.sent();
                                    res.json({ success: true, message: "Download started for ".concat(pkg[1]) });
                                    return [3 /*break*/, 11];
                                case 5:
                                    err_31 = _a.sent();
                                    console.error(err_31);
                                    res.status(500).json({ error: "Download failed" });
                                    return [3 /*break*/, 11];
                                case 6:
                                    if (!connection) return [3 /*break*/, 10];
                                    _a.label = 7;
                                case 7:
                                    _a.trys.push([7, 9, , 10]);
                                    return [4 /*yield*/, connection.close()];
                                case 8:
                                    _a.sent();
                                    return [3 /*break*/, 10];
                                case 9:
                                    err_32 = _a.sent();
                                    return [3 /*break*/, 10];
                                case 10: return [7 /*endfinally*/];
                                case 11: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Crayons Bridge Endpoints
                    app.get("/api/bridge/submissions", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var connection, dbPassword, isAdmin, subs, query, params, result, submissions, err_33, err_34;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 3, 4, 9]);
                                    dbPassword = process.env.ORACLE_DB_PASSWORD;
                                    isAdmin = req.user.email === 'abijithasokan@crayonspictures.com' || req.user.userId === 1;
                                    if (!dbPassword) {
                                        subs = memoryBridgeSubmissions;
                                        if (!isAdmin) {
                                            subs = subs.filter(function (s) { return s.userId === req.user.userId; });
                                        }
                                        return [2 /*return*/, res.json({ success: true, submissions: subs })];
                                    }
                                    query = "SELECT SUBMISSION_ID, USER_ID, TITLE, MASTER_LINK, TERRITORIES, EXCLUSIVITY, TARGET_PLATFORMS, STATUS, REVIEW_NOTES, CREATED_AT FROM CRAYONS_BRIDGE_SUBMISSIONS ORDER BY CREATED_AT DESC";
                                    params = {};
                                    if (!isAdmin) {
                                        query = "SELECT SUBMISSION_ID, USER_ID, TITLE, MASTER_LINK, TERRITORIES, EXCLUSIVITY, TARGET_PLATFORMS, STATUS, REVIEW_NOTES, CREATED_AT FROM CRAYONS_BRIDGE_SUBMISSIONS WHERE USER_ID = :userId ORDER BY CREATED_AT DESC";
                                        params.userId = req.user.userId;
                                    }
                                    return [4 /*yield*/, getDbConnection()];
                                case 1:
                                    connection = _b.sent();
                                    return [4 /*yield*/, connection.execute(query, params)];
                                case 2:
                                    result = _b.sent();
                                    submissions = ((_a = result.rows) === null || _a === void 0 ? void 0 : _a.map(function (row) { return ({
                                        id: row[0], userId: row[1], title: row[2], masterLink: row[3], territories: row[4], exclusivity: row[5], targetPlatforms: row[6], status: row[7], reviewNotes: row[8], createdAt: row[9]
                                    }); })) || [];
                                    res.json({ success: true, submissions: submissions });
                                    return [3 /*break*/, 9];
                                case 3:
                                    err_33 = _b.sent();
                                    console.error(err_33);
                                    res.status(500).json({ error: "Failed to fetch submissions" });
                                    return [3 /*break*/, 9];
                                case 4:
                                    if (!connection) return [3 /*break*/, 8];
                                    _b.label = 5;
                                case 5:
                                    _b.trys.push([5, 7, , 8]);
                                    return [4 /*yield*/, connection.close()];
                                case 6:
                                    _b.sent();
                                    return [3 /*break*/, 8];
                                case 7:
                                    err_34 = _b.sent();
                                    return [3 /*break*/, 8];
                                case 8: return [7 /*endfinally*/];
                                case 9: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/bridge/submissions", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, title, masterLink, territories, exclusivity, targetPlatforms, connection, sub, result, newId, err_35, err_36;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = req.body, title = _a.title, masterLink = _a.masterLink, territories = _a.territories, exclusivity = _a.exclusivity, targetPlatforms = _a.targetPlatforms;
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 4, 5, 10]);
                                    return [4 /*yield*/, getDbConnection()];
                                case 2:
                                    connection = _b.sent();
                                    if (!connection) {
                                        sub = {
                                            id: bridgeSubmissionCounter++,
                                            userId: req.user.userId,
                                            title: title,
                                            masterLink: masterLink,
                                            territories: territories,
                                            exclusivity: exclusivity,
                                            targetPlatforms: targetPlatforms,
                                            status: 'Pending Review',
                                            reviewNotes: null,
                                            createdAt: new Date().toISOString()
                                        };
                                        memoryBridgeSubmissions.unshift(sub);
                                        return [2 /*return*/, res.json({ success: true, submission: sub })];
                                    }
                                    return [4 /*yield*/, connection.execute("INSERT INTO CRAYONS_BRIDGE_SUBMISSIONS (USER_ID, TITLE, MASTER_LINK, TERRITORIES, EXCLUSIVITY, TARGET_PLATFORMS)\n         VALUES (:userId, :title, :masterLink, :territories, :exclusivity, :targetPlatforms)\n         RETURNING SUBMISSION_ID INTO :new_id", {
                                            userId: req.user.userId,
                                            title: title,
                                            masterLink: masterLink,
                                            territories: territories,
                                            exclusivity: exclusivity,
                                            targetPlatforms: targetPlatforms,
                                            new_id: { type: oracledb_1.default.NUMBER, dir: oracledb_1.default.BIND_OUT }
                                        }, { autoCommit: true })];
                                case 3:
                                    result = _b.sent();
                                    newId = result.outBinds.new_id[0];
                                    res.json({ success: true, submission: { id: newId, title: title, status: 'Pending Review' } });
                                    return [3 /*break*/, 10];
                                case 4:
                                    err_35 = _b.sent();
                                    console.error(err_35);
                                    res.status(500).json({ error: "Failed to submit" });
                                    return [3 /*break*/, 10];
                                case 5:
                                    if (!connection) return [3 /*break*/, 9];
                                    _b.label = 6;
                                case 6:
                                    _b.trys.push([6, 8, , 9]);
                                    return [4 /*yield*/, connection.close()];
                                case 7:
                                    _b.sent();
                                    return [3 /*break*/, 9];
                                case 8:
                                    err_36 = _b.sent();
                                    return [3 /*break*/, 9];
                                case 9: return [7 /*endfinally*/];
                                case 10: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.put("/api/bridge/submissions/:id/status", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var isAdmin, submissionId, _a, status, reviewNotes, connection, sub, err_37, err_38;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    isAdmin = req.user.email === 'abijithasokan@crayonspictures.com' || req.user.userId === 1;
                                    if (!isAdmin)
                                        return [2 /*return*/, res.status(403).json({ error: "Unauthorized" })];
                                    submissionId = parseInt(req.params.id);
                                    _a = req.body, status = _a.status, reviewNotes = _a.reviewNotes;
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 4, 5, 10]);
                                    return [4 /*yield*/, getDbConnection()];
                                case 2:
                                    connection = _b.sent();
                                    if (!connection) {
                                        sub = memoryBridgeSubmissions.find(function (s) { return s.id === submissionId; });
                                        if (!sub)
                                            return [2 /*return*/, res.status(404).json({ error: "Not found" })];
                                        sub.status = status;
                                        if (reviewNotes !== undefined)
                                            sub.reviewNotes = reviewNotes;
                                        return [2 /*return*/, res.json({ success: true, submission: sub })];
                                    }
                                    return [4 /*yield*/, connection.execute("UPDATE CRAYONS_BRIDGE_SUBMISSIONS SET STATUS = :status, REVIEW_NOTES = COALESCE(:reviewNotes, REVIEW_NOTES) WHERE SUBMISSION_ID = :id", { status: status, reviewNotes: reviewNotes || null, id: submissionId }, { autoCommit: true })];
                                case 3:
                                    _b.sent();
                                    res.json({ success: true, message: "Status updated" });
                                    return [3 /*break*/, 10];
                                case 4:
                                    err_37 = _b.sent();
                                    console.error(err_37);
                                    res.status(500).json({ error: "Failed to update status" });
                                    return [3 /*break*/, 10];
                                case 5:
                                    if (!connection) return [3 /*break*/, 9];
                                    _b.label = 6;
                                case 6:
                                    _b.trys.push([6, 8, , 9]);
                                    return [4 /*yield*/, connection.close()];
                                case 7:
                                    _b.sent();
                                    return [3 /*break*/, 9];
                                case 8:
                                    err_38 = _b.sent();
                                    return [3 /*break*/, 9];
                                case 9: return [7 /*endfinally*/];
                                case 10: return [2 /*return*/];
                            }
                        });
                    }); });
                    // --- Revenue & Licensing Endpoints ---
                    app.get("/api/revenue/metrics", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var connection, mySubs, subIds_1, myMetrics, query, params, isAdmin, result, metrics, err_39, err_40;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 4, 5, 10]);
                                    return [4 /*yield*/, getDbConnection()];
                                case 1:
                                    connection = _b.sent();
                                    if (!connection) {
                                        mySubs = memoryBridgeSubmissions.filter(function (s) { return req.user.userId === 1 || s.userId === req.user.userId; });
                                        subIds_1 = mySubs.map(function (s) { return s.id; });
                                        myMetrics = memoryPerformanceMetrics.filter(function (m) { return subIds_1.includes(m.submissionId); });
                                        return [2 /*return*/, res.json({ success: true, metrics: myMetrics, totalRevenue: myMetrics.reduce(function (sum, current) { return sum + current.generatedRevenue; }, 0) })];
                                    }
                                    query = "\n        SELECT M.METRIC_ID, M.SUBMISSION_ID, M.REPORT_MONTH, M.VIEWS, M.AD_IMPRESSIONS, M.GENERATED_REVENUE \n        FROM CRAYONS_PERFORMANCE_METRICS M \n        JOIN CRAYONS_BRIDGE_SUBMISSIONS S ON M.SUBMISSION_ID = S.SUBMISSION_ID \n        WHERE S.USER_ID = :userId";
                                    params = { userId: req.user.userId };
                                    isAdmin = req.user.email === 'abijithasokan@crayonspictures.com' || req.user.userId === 1;
                                    if (isAdmin) {
                                        query = "SELECT METRIC_ID, SUBMISSION_ID, REPORT_MONTH, VIEWS, AD_IMPRESSIONS, GENERATED_REVENUE FROM CRAYONS_PERFORMANCE_METRICS";
                                        delete params.userId;
                                    }
                                    return [4 /*yield*/, getDbConnection()];
                                case 2:
                                    connection = _b.sent();
                                    return [4 /*yield*/, connection.execute(query, params)];
                                case 3:
                                    result = _b.sent();
                                    metrics = ((_a = result.rows) === null || _a === void 0 ? void 0 : _a.map(function (row) { return ({
                                        id: row[0], submissionId: row[1], reportMonth: row[2], views: row[3], adImpressions: row[4], generatedRevenue: row[5]
                                    }); })) || [];
                                    res.json({ success: true, metrics: metrics, totalRevenue: metrics.reduce(function (sum, curr) { return sum + curr.generatedRevenue; }, 0) });
                                    return [3 /*break*/, 10];
                                case 4:
                                    err_39 = _b.sent();
                                    console.error(err_39);
                                    res.status(500).json({ error: "Failed to fetch metrics" });
                                    return [3 /*break*/, 10];
                                case 5:
                                    if (!connection) return [3 /*break*/, 9];
                                    _b.label = 6;
                                case 6:
                                    _b.trys.push([6, 8, , 9]);
                                    return [4 /*yield*/, connection.close()];
                                case 7:
                                    _b.sent();
                                    return [3 /*break*/, 9];
                                case 8:
                                    err_40 = _b.sent();
                                    return [3 /*break*/, 9];
                                case 9: return [7 /*endfinally*/];
                                case 10: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/api/revenue/terms/:submissionId", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var submissionId, connection, term, result, row, err_41, err_42;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    submissionId = parseInt(req.params.submissionId);
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 4, 5, 10]);
                                    return [4 /*yield*/, getDbConnection()];
                                case 2:
                                    connection = _a.sent();
                                    if (!connection) {
                                        term = memoryLicensingTerms.find(function (t) { return t.submissionId === submissionId; });
                                        return [2 /*return*/, res.json({ success: true, term: term || null })];
                                    }
                                    return [4 /*yield*/, connection.execute("SELECT TERM_ID, LICENSING_MODEL, MONETIZATION_TIERS, FEE_AMOUNT, REV_SHARE_PERCENTAGE, MIN_GUARANTEE_AMOUNT FROM CRAYONS_LICENSING_TERMS WHERE SUBMISSION_ID = :submissionId", { submissionId: submissionId })];
                                case 3:
                                    result = _a.sent();
                                    if (!result.rows || result.rows.length === 0) {
                                        return [2 /*return*/, res.json({ success: true, term: null })];
                                    }
                                    row = result.rows[0];
                                    res.json({ success: true, term: {
                                            id: row[0], licensingModel: row[1], monetizationTiers: row[2], feeAmount: row[3], revSharePercentage: row[4], minGuaranteeAmount: row[5]
                                        } });
                                    return [3 /*break*/, 10];
                                case 4:
                                    err_41 = _a.sent();
                                    console.error(err_41);
                                    res.status(500).json({ error: "Failed to fetch terms" });
                                    return [3 /*break*/, 10];
                                case 5:
                                    if (!connection) return [3 /*break*/, 9];
                                    _a.label = 6;
                                case 6:
                                    _a.trys.push([6, 8, , 9]);
                                    return [4 /*yield*/, connection.close()];
                                case 7:
                                    _a.sent();
                                    return [3 /*break*/, 9];
                                case 8:
                                    err_42 = _a.sent();
                                    return [3 /*break*/, 9];
                                case 9: return [7 /*endfinally*/];
                                case 10: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/revenue/terms", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, submissionId, licensingModel, monetizationTiers, feeAmount, revSharePercentage, minGuaranteeAmount, connection, existing, term, existingTerm, err_43, err_44;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = req.body, submissionId = _a.submissionId, licensingModel = _a.licensingModel, monetizationTiers = _a.monetizationTiers, feeAmount = _a.feeAmount, revSharePercentage = _a.revSharePercentage, minGuaranteeAmount = _a.minGuaranteeAmount;
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 9, 10, 15]);
                                    return [4 /*yield*/, getDbConnection()];
                                case 2:
                                    connection = _b.sent();
                                    if (!connection) {
                                        existing = memoryLicensingTerms.findIndex(function (t) { return t.submissionId === submissionId; });
                                        term = {
                                            id: existing !== -1 ? memoryLicensingTerms[existing].id : Math.floor(Math.random() * 10000),
                                            submissionId: submissionId,
                                            licensingModel: licensingModel,
                                            monetizationTiers: monetizationTiers,
                                            feeAmount: feeAmount,
                                            revSharePercentage: revSharePercentage,
                                            minGuaranteeAmount: minGuaranteeAmount
                                        };
                                        if (existing !== -1)
                                            memoryLicensingTerms[existing] = term;
                                        else
                                            memoryLicensingTerms.push(term);
                                        // mock add performance metric for display
                                        memoryPerformanceMetrics.push({
                                            id: metricCounter++,
                                            submissionId: submissionId,
                                            reportMonth: new Date().toISOString(),
                                            views: Math.floor(Math.random() * 5000) + 1000,
                                            adImpressions: Math.floor(Math.random() * 8000) + 2000,
                                            generatedRevenue: licensingModel === 'Revenue Sharing' ? Math.floor(Math.random() * 500) + 50 : feeAmount || 0
                                        });
                                        return [2 /*return*/, res.json({ success: true, term: term })];
                                    }
                                    return [4 /*yield*/, connection.execute("SELECT TERM_ID FROM CRAYONS_LICENSING_TERMS WHERE SUBMISSION_ID = :submissionId", { submissionId: submissionId })];
                                case 3:
                                    existingTerm = _b.sent();
                                    if (!(existingTerm.rows && existingTerm.rows.length > 0)) return [3 /*break*/, 5];
                                    return [4 /*yield*/, connection.execute("UPDATE CRAYONS_LICENSING_TERMS SET LICENSING_MODEL = :licensingModel, MONETIZATION_TIERS = :monetizationTiers, FEE_AMOUNT = :feeAmount, REV_SHARE_PERCENTAGE = :revSharePercentage, MIN_GUARANTEE_AMOUNT = :minGuaranteeAmount WHERE SUBMISSION_ID = :submissionId", { submissionId: submissionId, licensingModel: licensingModel, monetizationTiers: monetizationTiers, feeAmount: feeAmount || null, revSharePercentage: revSharePercentage || null, minGuaranteeAmount: minGuaranteeAmount || null }, { autoCommit: true })];
                                case 4:
                                    _b.sent();
                                    return [3 /*break*/, 8];
                                case 5: return [4 /*yield*/, connection.execute("INSERT INTO CRAYONS_LICENSING_TERMS (SUBMISSION_ID, LICENSING_MODEL, MONETIZATION_TIERS, FEE_AMOUNT, REV_SHARE_PERCENTAGE, MIN_GUARANTEE_AMOUNT)\n           VALUES (:submissionId, :licensingModel, :monetizationTiers, :feeAmount, :revSharePercentage, :minGuaranteeAmount)", { submissionId: submissionId, licensingModel: licensingModel, monetizationTiers: monetizationTiers, feeAmount: feeAmount || null, revSharePercentage: revSharePercentage || null, minGuaranteeAmount: minGuaranteeAmount || null }, { autoCommit: true })];
                                case 6:
                                    _b.sent();
                                    // Insert a mock metric when new terms added to see on dashboard out of box
                                    return [4 /*yield*/, connection.execute("INSERT INTO CRAYONS_PERFORMANCE_METRICS (SUBMISSION_ID, REPORT_MONTH, VIEWS, AD_IMPRESSIONS, GENERATED_REVENUE) VALUES (:submissionId, CURRENT_DATE, :views, :adImpressions, :generatedRevenue)", {
                                            submissionId: submissionId,
                                            views: Math.floor(Math.random() * 5000) + 1000,
                                            adImpressions: Math.floor(Math.random() * 8000) + 2000,
                                            generatedRevenue: licensingModel === 'Revenue Sharing' ? Math.floor(Math.random() * 500) + 50 : feeAmount || 0
                                        }, { autoCommit: true })];
                                case 7:
                                    // Insert a mock metric when new terms added to see on dashboard out of box
                                    _b.sent();
                                    _b.label = 8;
                                case 8:
                                    res.json({ success: true, message: "Terms saved successfully" });
                                    return [3 /*break*/, 15];
                                case 9:
                                    err_43 = _b.sent();
                                    console.error(err_43);
                                    res.status(500).json({ error: "Failed to save terms" });
                                    return [3 /*break*/, 15];
                                case 10:
                                    if (!connection) return [3 /*break*/, 14];
                                    _b.label = 11;
                                case 11:
                                    _b.trys.push([11, 13, , 14]);
                                    return [4 /*yield*/, connection.close()];
                                case 12:
                                    _b.sent();
                                    return [3 /*break*/, 14];
                                case 13:
                                    err_44 = _b.sent();
                                    return [3 /*break*/, 14];
                                case 14: return [7 /*endfinally*/];
                                case 15: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/api/booking/resources", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, res.json({ success: true, resources: RESOURCES })];
                        });
                    }); });
                    app.get("/api/booking/reservations", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var connection, userReservations, query, params, isAdmin, result, reservations, err_45, userReservations, err_46, err_47;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 7, 8, 13]);
                                    return [4 /*yield*/, getDbConnection()];
                                case 1:
                                    connection = _b.sent();
                                    if (!connection) {
                                        userReservations = memoryReservations.filter(function (r) { return r.userId === req.user.userId || req.user.userId === 1; });
                                        return [2 /*return*/, res.json({ success: true, reservations: userReservations })];
                                    }
                                    query = "SELECT RESERVATION_ID, USER_ID, RESOURCE_ID, START_DATE, END_DATE, TITLE FROM CRAYONS_RESERVATIONS WHERE USER_ID = :userId";
                                    params = { userId: req.user.userId };
                                    isAdmin = req.user.email === 'abijithasokan@crayonspictures.com' || req.user.userId === 1;
                                    if (isAdmin) {
                                        query = "SELECT RESERVATION_ID, USER_ID, RESOURCE_ID, START_DATE, END_DATE, TITLE FROM CRAYONS_RESERVATIONS";
                                        params = {};
                                    }
                                    _b.label = 2;
                                case 2:
                                    _b.trys.push([2, 5, , 6]);
                                    return [4 /*yield*/, getDbConnection()];
                                case 3:
                                    connection = _b.sent();
                                    return [4 /*yield*/, connection.execute(query, params)];
                                case 4:
                                    result = _b.sent();
                                    reservations = ((_a = result.rows) === null || _a === void 0 ? void 0 : _a.map(function (row) { return ({
                                        id: row[0], userId: row[1], resourceId: row[2], startDate: row[3], endDate: row[4], title: row[5]
                                    }); })) || [];
                                    res.json({ success: true, reservations: reservations });
                                    return [3 /*break*/, 6];
                                case 5:
                                    err_45 = _b.sent();
                                    console.warn("CRAYONS_RESERVATIONS table might not exist, falling back to memory");
                                    userReservations = memoryReservations.filter(function (r) { return r.userId === req.user.userId || req.user.userId === 1; });
                                    res.json({ success: true, reservations: userReservations });
                                    return [3 /*break*/, 6];
                                case 6: return [3 /*break*/, 13];
                                case 7:
                                    err_46 = _b.sent();
                                    console.error(err_46);
                                    res.status(500).json({ error: "Failed to fetch reservations" });
                                    return [3 /*break*/, 13];
                                case 8:
                                    if (!connection) return [3 /*break*/, 12];
                                    _b.label = 9;
                                case 9:
                                    _b.trys.push([9, 11, , 12]);
                                    return [4 /*yield*/, connection.close()];
                                case 10:
                                    _b.sent();
                                    return [3 /*break*/, 12];
                                case 11:
                                    err_47 = _b.sent();
                                    return [3 /*break*/, 12];
                                case 12: return [7 /*endfinally*/];
                                case 13: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/booking/reservations", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, resourceId, startDate, endDate, title, connection, conflict, newRes, conflictCheck, result, newId, err_48, newRes, err_49, err_50;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = req.body, resourceId = _a.resourceId, startDate = _a.startDate, endDate = _a.endDate, title = _a.title;
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 8, 9, 14]);
                                    return [4 /*yield*/, getDbConnection()];
                                case 2:
                                    connection = _b.sent();
                                    if (!connection) {
                                        conflict = memoryReservations.find(function (r) {
                                            return r.resourceId === resourceId &&
                                                ((new Date(startDate) >= new Date(r.startDate) && new Date(startDate) <= new Date(r.endDate)) ||
                                                    (new Date(endDate) >= new Date(r.startDate) && new Date(endDate) <= new Date(r.endDate)));
                                        });
                                        if (conflict) {
                                            return [2 /*return*/, res.status(409).json({ error: "Resource already booked for these dates." })];
                                        }
                                        newRes = {
                                            id: reservationCounter++,
                                            userId: req.user.userId,
                                            resourceId: resourceId,
                                            startDate: startDate,
                                            endDate: endDate,
                                            title: title
                                        };
                                        memoryReservations.push(newRes);
                                        return [2 /*return*/, res.json({ success: true, reservation: newRes })];
                                    }
                                    _b.label = 3;
                                case 3:
                                    _b.trys.push([3, 6, , 7]);
                                    return [4 /*yield*/, connection.execute("SELECT RESERVATION_ID FROM CRAYONS_RESERVATIONS \n           WHERE RESOURCE_ID = :resourceId AND \n           ((TO_DATE(:startDate, 'YYYY-MM-DD\"T\"HH24:MI:SS.FF3\"Z\"') BETWEEN START_DATE AND END_DATE) OR \n            (TO_DATE(:endDate, 'YYYY-MM-DD\"T\"HH24:MI:SS.FF3\"Z\"') BETWEEN START_DATE AND END_DATE))", { resourceId: resourceId, startDate: startDate, endDate: endDate })];
                                case 4:
                                    conflictCheck = _b.sent();
                                    if (conflictCheck.rows && conflictCheck.rows.length > 0) {
                                        return [2 /*return*/, res.status(409).json({ error: "Resource already booked for these dates." })];
                                    }
                                    return [4 /*yield*/, connection.execute("INSERT INTO CRAYONS_RESERVATIONS (USER_ID, RESOURCE_ID, START_DATE, END_DATE, TITLE)\n           VALUES (:userId, :resourceId, TO_DATE(:startDate, 'YYYY-MM-DD\"T\"HH24:MI:SS.FF3\"Z\"'), TO_DATE(:endDate, 'YYYY-MM-DD\"T\"HH24:MI:SS.FF3\"Z\"'), :title)\n           RETURNING RESERVATION_ID INTO :new_id", {
                                            userId: req.user.userId,
                                            resourceId: resourceId,
                                            startDate: startDate,
                                            endDate: endDate,
                                            title: title,
                                            new_id: { type: oracledb_1.default.NUMBER, dir: oracledb_1.default.BIND_OUT }
                                        }, { autoCommit: true })];
                                case 5:
                                    result = _b.sent();
                                    newId = result.outBinds.new_id[0];
                                    res.json({ success: true, reservation: { id: newId, userId: req.user.userId, resourceId: resourceId, startDate: startDate, endDate: endDate, title: title } });
                                    return [3 /*break*/, 7];
                                case 6:
                                    err_48 = _b.sent();
                                    console.warn("CRAYONS_RESERVATIONS table error, falling back to memory insert");
                                    newRes = {
                                        id: reservationCounter++,
                                        userId: req.user.userId,
                                        resourceId: resourceId,
                                        startDate: startDate,
                                        endDate: endDate,
                                        title: title
                                    };
                                    memoryReservations.push(newRes);
                                    res.json({ success: true, reservation: newRes });
                                    return [3 /*break*/, 7];
                                case 7: return [3 /*break*/, 14];
                                case 8:
                                    err_49 = _b.sent();
                                    console.error(err_49);
                                    res.status(500).json({ error: "Failed to create reservation" });
                                    return [3 /*break*/, 14];
                                case 9:
                                    if (!connection) return [3 /*break*/, 13];
                                    _b.label = 10;
                                case 10:
                                    _b.trys.push([10, 12, , 13]);
                                    return [4 /*yield*/, connection.close()];
                                case 11:
                                    _b.sent();
                                    return [3 /*break*/, 13];
                                case 12:
                                    err_50 = _b.sent();
                                    return [3 /*break*/, 13];
                                case 13: return [7 /*endfinally*/];
                                case 14: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.delete("/api/booking/reservations/:id", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var reservationId, connection, idx, err_51, idx, err_52, err_53;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    reservationId = parseInt(req.params.id);
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 7, 8, 13]);
                                    return [4 /*yield*/, getDbConnection()];
                                case 2:
                                    connection = _a.sent();
                                    if (!connection) {
                                        idx = memoryReservations.findIndex(function (r) { return r.id === reservationId; });
                                        if (idx !== -1)
                                            memoryReservations.splice(idx, 1);
                                        return [2 /*return*/, res.json({ success: true, message: "Reservation cancelled" })];
                                    }
                                    _a.label = 3;
                                case 3:
                                    _a.trys.push([3, 5, , 6]);
                                    return [4 /*yield*/, connection.execute("DELETE FROM CRAYONS_RESERVATIONS WHERE RESERVATION_ID = :id", { id: reservationId }, { autoCommit: true })];
                                case 4:
                                    _a.sent();
                                    res.json({ success: true, message: "Reservation cancelled" });
                                    return [3 /*break*/, 6];
                                case 5:
                                    err_51 = _a.sent();
                                    console.warn("CRAYONS_RESERVATIONS table error, mem fallback removal");
                                    idx = memoryReservations.findIndex(function (r) { return r.id === reservationId; });
                                    if (idx !== -1)
                                        memoryReservations.splice(idx, 1);
                                    res.json({ success: true, message: "Reservation cancelled" });
                                    return [3 /*break*/, 6];
                                case 6: return [3 /*break*/, 13];
                                case 7:
                                    err_52 = _a.sent();
                                    console.error(err_52);
                                    res.status(500).json({ error: "Failed to delete" });
                                    return [3 /*break*/, 13];
                                case 8:
                                    if (!connection) return [3 /*break*/, 12];
                                    _a.label = 9;
                                case 9:
                                    _a.trys.push([9, 11, , 12]);
                                    return [4 /*yield*/, connection.close()];
                                case 10:
                                    _a.sent();
                                    return [3 /*break*/, 12];
                                case 11:
                                    err_53 = _a.sent();
                                    return [3 /*break*/, 12];
                                case 12: return [7 /*endfinally*/];
                                case 13: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/api/loop/content", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var connection, approved, content, result, content, err_54, result, content, err_55, err_56;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _c.trys.push([0, 7, 8, 13]);
                                    return [4 /*yield*/, getDbConnection()];
                                case 1:
                                    connection = _c.sent();
                                    if (!connection) {
                                        approved = memoryBridgeSubmissions.filter(function (s) { return s.status === 'Approved'; });
                                        content = approved.map(function (sub) {
                                            var term = memoryLicensingTerms.find(function (t) { return t.submissionId === sub.id; }) || { monetizationTiers: 'SVOD', licensingModel: 'Revenue Sharing' };
                                            return __assign(__assign({}, sub), { monetizationTiers: term.monetizationTiers, licensingModel: term.licensingModel });
                                        });
                                        return [2 /*return*/, res.json({ success: true, content: content })];
                                    }
                                    _c.label = 2;
                                case 2:
                                    _c.trys.push([2, 4, , 6]);
                                    return [4 /*yield*/, connection.execute("\n          SELECT S.SUBMISSION_ID, S.TITLE, S.DESCRIPTION, S.DIRECTOR, S.CAST_GROUP, S.GENRES, S.RELEASE_YEAR, S.POSTER_URL, T.MONETIZATION_TIERS, T.LICENSING_MODEL\n          FROM CRAYONS_BRIDGE_SUBMISSIONS S\n          LEFT JOIN CRAYONS_LICENSING_TERMS T ON S.SUBMISSION_ID = T.SUBMISSION_ID\n          WHERE S.STATUS = 'Approved'\n        ")];
                                case 3:
                                    result = _c.sent();
                                    content = ((_a = result.rows) === null || _a === void 0 ? void 0 : _a.map(function (row) { return ({
                                        id: row[0], title: row[1], description: row[2], director: row[3], cast: row[4], genres: row[5], releaseYear: row[6], posterUrl: row[7],
                                        monetizationTiers: row[8] || 'SVOD', licensingModel: row[9] || 'Revenue Sharing'
                                    }); })) || [];
                                    res.json({ success: true, content: content });
                                    return [3 /*break*/, 6];
                                case 4:
                                    err_54 = _c.sent();
                                    console.warn("Table join error, falling back to basic submission query");
                                    return [4 /*yield*/, connection.execute("\n          SELECT SUBMISSION_ID, TITLE, DESCRIPTION, DIRECTOR, CAST_GROUP, GENRES, RELEASE_YEAR, POSTER_URL\n          FROM CRAYONS_BRIDGE_SUBMISSIONS WHERE STATUS = 'Approved'\n        ")];
                                case 5:
                                    result = _c.sent();
                                    content = ((_b = result.rows) === null || _b === void 0 ? void 0 : _b.map(function (row) { return ({
                                        id: row[0], title: row[1], description: row[2], director: row[3], cast: row[4], genres: row[5], releaseYear: row[6], posterUrl: row[7],
                                        monetizationTiers: 'SVOD', licensingModel: 'Revenue Sharing'
                                    }); })) || [];
                                    res.json({ success: true, content: content });
                                    return [3 /*break*/, 6];
                                case 6: return [3 /*break*/, 13];
                                case 7:
                                    err_55 = _c.sent();
                                    console.error(err_55);
                                    res.status(500).json({ error: "Failed to fetch loop content" });
                                    return [3 /*break*/, 13];
                                case 8:
                                    if (!connection) return [3 /*break*/, 12];
                                    _c.label = 9;
                                case 9:
                                    _c.trys.push([9, 11, , 12]);
                                    return [4 /*yield*/, connection.close()];
                                case 10:
                                    _c.sent();
                                    return [3 /*break*/, 12];
                                case 11:
                                    err_56 = _c.sent();
                                    return [3 /*break*/, 12];
                                case 12: return [7 /*endfinally*/];
                                case 13: return [2 /*return*/];
                            }
                        });
                    }); });
                    memorySubscriptions = [];
                    app.get("/api/loop/subscription", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var connection, sub, result, row, err_57, sub, err_58, err_59;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 6, 7, 12]);
                                    return [4 /*yield*/, getDbConnection()];
                                case 1:
                                    connection = _a.sent();
                                    if (!connection) {
                                        sub = memorySubscriptions.find(function (s) { return s.userId === req.user.userId; });
                                        return [2 /*return*/, res.json({ success: true, subscription: sub || { tier: 'Free', status: 'active' } })];
                                    }
                                    _a.label = 2;
                                case 2:
                                    _a.trys.push([2, 4, , 5]);
                                    return [4 /*yield*/, connection.execute("SELECT TIER, STATUS, END_DATE FROM CRAYONS_SUBSCRIPTIONS WHERE USER_ID = :userId ORDER BY CREATED_AT DESC FETCH FIRST 1 ROWS ONLY", { userId: req.user.userId })];
                                case 3:
                                    result = _a.sent();
                                    if (result.rows && result.rows.length > 0) {
                                        row = result.rows[0];
                                        res.json({ success: true, subscription: { tier: row[0], status: row[1], endDate: row[2] } });
                                    }
                                    else {
                                        res.json({ success: true, subscription: { tier: 'Free', status: 'active' } });
                                    }
                                    return [3 /*break*/, 5];
                                case 4:
                                    err_57 = _a.sent();
                                    console.warn("CRAYONS_SUBSCRIPTIONS table error, fallback to memory");
                                    sub = memorySubscriptions.find(function (s) { return s.userId === req.user.userId; });
                                    res.json({ success: true, subscription: sub || { tier: 'Free', status: 'active' } });
                                    return [3 /*break*/, 5];
                                case 5: return [3 /*break*/, 12];
                                case 6:
                                    err_58 = _a.sent();
                                    res.status(500).json({ error: "Failed to fetch subscription" });
                                    return [3 /*break*/, 12];
                                case 7:
                                    if (!connection) return [3 /*break*/, 11];
                                    _a.label = 8;
                                case 8:
                                    _a.trys.push([8, 10, , 11]);
                                    return [4 /*yield*/, connection.close()];
                                case 9:
                                    _a.sent();
                                    return [3 /*break*/, 11];
                                case 10:
                                    err_59 = _a.sent();
                                    return [3 /*break*/, 11];
                                case 11: return [7 /*endfinally*/];
                                case 12: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/loop/payment/create-order", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, amount, _b, currency;
                        return __generator(this, function (_c) {
                            _a = req.body, amount = _a.amount, _b = _a.currency, currency = _b === void 0 ? 'USD' : _b;
                            // Mocking Razorpay Order creation
                            res.json({
                                success: true,
                                orderId: 'order_' + Math.random().toString(36).substring(2, 10),
                                amount: amount,
                                currency: currency
                            });
                            return [2 /*return*/];
                        });
                    }); });
                    app.post("/api/loop/payment/verify", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, tier, paymentId, orderId, connection, sub, err_60, sub, err_61, err_62;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = req.body, tier = _a.tier, paymentId = _a.paymentId, orderId = _a.orderId;
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 7, 8, 13]);
                                    return [4 /*yield*/, getDbConnection()];
                                case 2:
                                    connection = _b.sent();
                                    if (!connection) {
                                        sub = { userId: req.user.userId, tier: tier, status: 'active', pyamentId: paymentId };
                                        memorySubscriptions = memorySubscriptions.filter(function (s) { return s.userId !== req.user.userId; });
                                        memorySubscriptions.push(sub);
                                        return [2 /*return*/, res.json({ success: true, subscription: sub })];
                                    }
                                    _b.label = 3;
                                case 3:
                                    _b.trys.push([3, 5, , 6]);
                                    return [4 /*yield*/, connection.execute("INSERT INTO CRAYONS_SUBSCRIPTIONS (USER_ID, TIER, STATUS, PAYMENT_ID, CREATED_AT)\n           VALUES (:userId, :tier, 'active', :paymentId, SYSDATE)", { userId: req.user.userId, tier: tier, paymentId: paymentId }, { autoCommit: true })];
                                case 4:
                                    _b.sent();
                                    res.json({ success: true, subscription: { tier: tier, status: 'active' } });
                                    return [3 /*break*/, 6];
                                case 5:
                                    err_60 = _b.sent();
                                    console.warn("CRAYONS_SUBSCRIPTIONS table insert error, fallback to memory");
                                    sub = { userId: req.user.userId, tier: tier, status: 'active', paymentId: paymentId };
                                    memorySubscriptions = memorySubscriptions.filter(function (s) { return s.userId !== req.user.userId; });
                                    memorySubscriptions.push(sub);
                                    res.json({ success: true, subscription: sub });
                                    return [3 /*break*/, 6];
                                case 6: return [3 /*break*/, 13];
                                case 7:
                                    err_61 = _b.sent();
                                    res.status(500).json({ error: "Failed to verify payment" });
                                    return [3 /*break*/, 13];
                                case 8:
                                    if (!connection) return [3 /*break*/, 12];
                                    _b.label = 9;
                                case 9:
                                    _b.trys.push([9, 11, , 12]);
                                    return [4 /*yield*/, connection.close()];
                                case 10:
                                    _b.sent();
                                    return [3 /*break*/, 12];
                                case 11:
                                    err_62 = _b.sent();
                                    return [3 /*break*/, 12];
                                case 12: return [7 /*endfinally*/];
                                case 13: return [2 /*return*/];
                            }
                        });
                    }); });
                    if (!(process.env.NODE_ENV !== "production")) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, vite_1.createServer)({
                            server: { middlewareMode: true },
                            appType: "spa",
                        })];
                case 1:
                    vite = _a.sent();
                    app.use(vite.middlewares);
                    return [3 /*break*/, 3];
                case 2:
                    distPath_1 = path_1.default.join(process.cwd(), "dist");
                    app.use(express_1.default.static(distPath_1));
                    app.get("*", function (req, res) {
                        res.sendFile(path_1.default.join(distPath_1, "index.html"));
                    });
                    _a.label = 3;
                case 3:
                    app.listen(PORT, "0.0.0.0", function () {
                        console.log("Server running on port ".concat(PORT));
                    });
                    return [2 /*return*/];
            }
        });
    });
}
startServer();
