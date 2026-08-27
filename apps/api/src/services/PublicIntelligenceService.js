"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicIntelligenceService = void 0;
var axios_1 = require("axios");
var xml2js_1 = require("xml2js");
var PublicIntelligenceService = /** @class */ (function () {
    function PublicIntelligenceService() {
        // Using a sample RSS feed or news API. For production, replace with Kerala Police official press RSS.
        this.newsFeedUrl = "https://news.google.com/rss/search?q=Kerala+Police+crime+drugs&hl=en-IN&gl=IN&ceid=IN:en";
    }
    PublicIntelligenceService.prototype.getLatestIntelligence = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, result, items, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.get(this.newsFeedUrl)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, (0, xml2js_1.parseStringPromise)(response.data)];
                    case 2:
                        result = _a.sent();
                        items = result.rss.channel[0].item;
                        return [2 /*return*/, items.map(function (item) { return ({
                                title: item.title[0],
                                link: item.link[0],
                                pubDate: item.pubDate[0],
                                source: item.source[0]._
                            }); }).slice(0, 10)];
                    case 3:
                        error_1 = _a.sent();
                        console.error('[IntelligenceService] Error fetching news:', error_1.message);
                        return [2 /*return*/, [
                                { title: "Special Drive against Drug Trafficking initiated in Ernakulam", pubDate: new Date().toISOString(), source: "Mock News" },
                                { title: "Cyber Cell issues advisory on Financial Frauds", pubDate: new Date().toISOString(), source: "Mock News" }
                            ]];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PublicIntelligenceService.prototype.getPublicCases = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would typically interface with the CCTNS or a public court registry
                return [2 /*return*/, [
                        { id: "FIR-102/2026", court: "First Class Judicial Magistrate", status: "Ongoing", suspect: "Arjun Ajith (Alias)", offense: "NDPS Act Section 21" },
                        { id: "FIR-45/2026", court: "District Sessions Court", status: "Charge-sheet Filed", suspect: "Under Identification", offense: "IPC Section 379" }
                    ]];
            });
        });
    };
    return PublicIntelligenceService;
}());
exports.PublicIntelligenceService = PublicIntelligenceService;
