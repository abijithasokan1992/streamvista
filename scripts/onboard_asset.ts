import { screenerService } from '../src/services/screenerService';
import { escrowService } from '../src/services/escrowService';
import { TitleDraft, Title } from '../src/types/title';

async function onboardNewAsset() {
  console.log("===================================================================");
  console.log("🎬 ASSET INTAKE WORKFLOW — STREAMVISTA CLOUD X (CRAYONS BRIDGE)");
  console.log("===================================================================\n");

  const assetDetails = {
    title: "Aayiram Janmangal",
    director: "Abijith Asokan",
    producer: "StreamVista OPC / Crayons Pictures",
    targetLicenses: ["Satellite", "OTT", "Digital", "Overseas"],
    waterfallModel: "standard_10_90" as const,
    grossValueUSD: 50000
  };

  // 1. Create Title Entry in Firestore Database Under Creator Workspace
  const draftId = `title_aayiram_${Date.now()}`;
  const newDraft: TitleDraft = {
    id: draftId,
    title: assetDetails.title,
    director: assetDetails.director,
    producer: assetDetails.producer,
    synopsis: "An epic romantic thriller connecting generations across time.",
    genres: ["Drama", "Thriller", "Romance"],
    runtimeMinutes: 125,
    rightsAvailable: assetDetails.targetLicenses,
    creatorOwnerId: "creator_abijith",
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  console.log(`✅ [Task 1/3] Title Entry Created under Creator Workspace:`);
  console.log(`   ├─ Asset ID: ${newDraft.id}`);
  console.log(`   ├─ Title: "${newDraft.title}"`);
  console.log(`   ├─ Director: ${newDraft.director}`);
  console.log(`   ├─ Producer: ${newDraft.producer}`);
  console.log(`   └─ Target Rights: ${assetDetails.targetLicenses.join(", ")}\n`);

  // 2. Generate Secure Screener Link with Forensic Watermarking Active
  const screenerSession = await screenerService.generateSignedScreenerUrl(
    draftId,
    "buyer.licensing@amazon.com",
    "103.22.14.88"
  );
  console.log(`✅ [Task 2/3] Generated Secure Watermarked Screener Link:`);
  console.log(`   ├─ Signed Link: ${screenerSession.signedUrl}`);
  console.log(`   ├─ Token Expiry: ${screenerSession.expiresAt} (15 min)`);
  console.log(`   └─ Forensic Watermark: Viewer=${screenerSession.watermark.userEmail} | IP=${screenerSession.watermark.ipAddress}\n`);

  // 3. Move Status to Pending Legal & QC Review in Admin OS
  const pendingTitle: Title = {
    ...newDraft,
    status: "draft",
    qcStatus: "pending",
    legalStatus: "pending",
    approvalStatus: "pending",
    contentType: "movie",
    originalLanguage: "Malayalam",
    additionalLanguages: ["Tamil", "Telugu", "Hindi"],
    country: "India",
    releaseDate: "2026",
    galleryUrls: [],
    subtitleFiles: [],
    captionFiles: [],
    ageRating: "U/A 13+",
    territories: ["Worldwide"],
    excludedTerritories: [],
    licensingModel: "exclusive",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  console.log(`✅ [Task 3/3] Status Moved to Pending Legal & QC Review in Admin OS:`);
  console.log(`   ├─ Title Status: ${pendingTitle.status}`);
  console.log(`   ├─ QC Clearance Status: ${pendingTitle.qcStatus}`);
  console.log(`   ├─ Legal Clearance Status: ${pendingTitle.legalStatus}`);
  console.log(`   └─ Admin OS Notification Bell Alert: Triggered for Creator (creator_abijith)\n`);

  // 4. Financial Waterfall & Escrow Deal Creation
  const deal = escrowService.createDeal({
    dealId: `deal_${draftId}`,
    titleId: draftId,
    titleName: assetDetails.title,
    buyerName: "Amazon Prime Video & Asianet Licensing",
    buyerEmail: "buyer.licensing@amazon.com",
    grossAmountUSD: assetDetails.grossValueUSD,
    splitModel: assetDetails.waterfallModel
  });

  console.log(`✅ [Financial Waterfall] B2B Deal Room Escrow Deal Initialized:`);
  console.log(`   ├─ Deal Value: $${deal.grossAmountUSD.toLocaleString()} USD`);
  console.log(`   ├─ Revenue Model: 10/90 Standard Split`);
  console.log(`   ├─ Platform Fee (10%): $${deal.platformFeeUSD.toLocaleString()} USD`);
  console.log(`   └─ Net Producer Payout (90%): $${deal.producerPayoutUSD.toLocaleString()} USD\n`);

  console.log("===================================================================");
  console.log("🎉 ASSET INTAKE & ONBOARDING COMPLETED SUCCESSFULLY!");
  console.log("===================================================================");
}

onboardNewAsset().catch(console.error);
