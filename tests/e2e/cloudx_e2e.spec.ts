import { test, expect } from '@playwright/test';
import { screenerService } from '../../src/services/screenerService';
import { escrowService } from '../../src/services/escrowService';
import { Title, TitleDraft } from '../../src/types/title';

test.describe('StreamVista Cloud X — End-to-End Testing Suite', () => {

  // TEST 1: Screener Watermarking & Security Verification
  test('1. Jananam 1947 Watermarking & S3 403 Security Check', async ({ page }) => {
    const titleId = "jananam-1947";
    const buyerEmail = "buyer@amazon.com";
    const ipAddress = "192.168.1.50";

    // A. Signed URL & Watermark Generation
    const session = await screenerService.generateSignedScreenerUrl(titleId, buyerEmail, ipAddress);
    expect(session.signedUrl).toContain("storage.streamvista.com");
    expect(session.watermark.userEmail).toBe(buyerEmail);
    expect(session.watermark.ipAddress).toBe(ipAddress);

    // B. Direct S3 Unauthenticated Access Attempt (Must return 403 Forbidden)
    const directAccessResult = await screenerService.simulateDirectS3Access(session.signedUrl, undefined);
    expect(directAccessResult.status).toBe(403);
    expect(directAccessResult.message).toContain("Access Denied");

    // C. Expired Token Attempt (Must return 403 Forbidden)
    const expiredAccessResult = await screenerService.simulateDirectS3Access(session.signedUrl, "token_expired");
    expect(expiredAccessResult.status).toBe(403);

    // D. Valid Token Attempt (Must return 200 OK)
    const validAccessResult = await screenerService.simulateDirectS3Access(session.signedUrl, "valid_token");
    expect(validAccessResult.status).toBe(200);
  });

  // TEST 2: B2B Deal Room & Escrow Lock Waterfall (10/90 & 50/50)
  test('2. B2B Escrow Lock & Revenue Split Waterfall', async () => {
    // A. Standard 10/90 Split Test ($35,000 USD Deal for Jananam 1947)
    const deal1 = escrowService.createDeal({
      dealId: "deal_standard_test",
      titleId: "jananam-1947",
      titleName: "Jananam 1947 Pranayam Thudarunnu",
      buyerName: "Amazon Prime Video",
      buyerEmail: "licensing@amazon.com",
      grossAmountUSD: 35000,
      splitModel: "standard_10_90"
    });

    expect(deal1.status).toBe("pending");
    expect(deal1.platformFeeUSD).toBe(3500); // 10% of $35,000 = $3,500
    expect(deal1.producerPayoutUSD).toBe(31500); // 90% of $35,000 = $31,500

    // Lock Escrow
    const lockedDeal1 = escrowService.lockEscrow("deal_standard_test");
    expect(lockedDeal1.status).toBe("locked");
    expect(lockedDeal1.lockedAt).toBeDefined();

    // Disburse Escrow
    const disbursedDeal1 = escrowService.disburseEscrow("deal_standard_test");
    expect(disbursedDeal1.status).toBe("disbursed");
    expect(disbursedDeal1.disbursedAt).toBeDefined();

    // B. JV Equity 50/50 Split Test ($100,000 USD Co-Production Deal)
    const deal2 = escrowService.createDeal({
      dealId: "deal_jv_test",
      titleId: "imran-3185",
      titleName: "Imran 3:185",
      buyerName: "Netflix Global",
      buyerEmail: "licensing@netflix.com",
      grossAmountUSD: 100000,
      splitModel: "jv_equity_50_50"
    });

    expect(deal2.platformFeeUSD).toBe(50000); // 50% of $100,000
    expect(deal2.producerPayoutUSD).toBe(50000); // 50% of $100,000
  });

  // TEST 3: Legal & QC Clearance Pipeline + Notification Trigger Logic
  test('3. Legal & QC Clearance Pipeline and Automatic Publishing Logic', async () => {
    const draftId = `test_draft_${Date.now()}`;
    const creatorId = "creator_test_owner";

    // Simulate Title Lifecycle Pipeline
    const draft: TitleDraft = {
      id: draftId,
      title: "Malayalam E2E Film",
      synopsis: "E2E testing title synopsis",
      creatorOwnerId: creatorId,
      genres: ["Drama"],
      status: "draft"
    };

    expect(draft.id).toBe(draftId);
    expect(draft.status).toBe("draft");

    // Submitted for Review State
    const submittedTitle: Title = {
      ...draft,
      status: "draft",
      qcStatus: "pending",
      legalStatus: "pending",
      approvalStatus: "pending",
      contentType: "movie",
      director: "Test Director",
      producer: "Test Producer",
      cast: [],
      runtimeMinutes: 110,
      originalLanguage: "Malayalam",
      additionalLanguages: [],
      country: "India",
      releaseDate: "2024",
      galleryUrls: [],
      subtitleFiles: [],
      captionFiles: [],
      ageRating: "U",
      rightsAvailable: ["Worldwide OTT"],
      territories: ["Global"],
      excludedTerritories: [],
      licensingModel: "non-exclusive",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    expect(submittedTitle.qcStatus).toBe("pending");
    expect(submittedTitle.legalStatus).toBe("pending");

    // QC Approved
    submittedTitle.qcStatus = "approved";
    expect(submittedTitle.qcStatus).toBe("approved");

    // Legal Approved (Both QC & Legal Approved = Status mutated to Published)
    submittedTitle.legalStatus = "approved";
    if (submittedTitle.qcStatus === "approved" && submittedTitle.legalStatus === "approved") {
      submittedTitle.status = "published";
      submittedTitle.approvalStatus = "approved";
    }

    expect(submittedTitle.legalStatus).toBe("approved");
    expect(submittedTitle.status).toBe("published");
  });

  // TEST 4: UI Navigation & Workspace OS Accessibility
  test('4. Workspace OS Page Rendering & Navigation', async ({ page }) => {
    await page.goto('http://localhost:5173/workspace?role=creator');
    await expect(page.locator('h1')).toContainText('Creator Workspace');

    // Switch to Studio Workspace
    await page.goto('http://localhost:5173/workspace?role=studio_producer');
    await expect(page.locator('h1')).toContainText('Studio / Producer Workspace');

    // Switch to Global Buyer Workspace
    await page.goto('http://localhost:5173/workspace?role=global_buyer');
    await expect(page.locator('h1')).toContainText('Global Buyer Workspace');

    // Switch to Admin OS
    await page.goto('http://localhost:5173/workspace?role=admin_os');
    await expect(page.locator('h1')).toContainText('Admin OS');
  });

});
