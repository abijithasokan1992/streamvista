import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import { resolve } from "path";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  // Load rules from the root firestore.rules
  const rules = readFileSync(resolve(__dirname, "../../firestore.rules"), "utf8");
  testEnv = await initializeTestEnvironment({
    projectId: "streamvista-test",
    firestore: { rules },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

function getContext(uid: string, role: string) {
  // We need to pre-populate the /users/{uid} document with the role
  // But wait, the client cannot write their own role directly if we test it properly.
  // We'll use an admin context to setup the user profile first.
  return testEnv.authenticatedContext(uid);
}

describe("Firestore Security Rules", () => {
  it("should prevent buyer from creating a title", async () => {
    const adminDb = testEnv.unauthenticatedContext().firestore(); // Admin not available easily here, let's use withSecurityRulesDisabled
    
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("users").doc("buyer1").set({ role: "buyer" });
    });

    const buyerDb = testEnv.authenticatedContext("buyer1").firestore();
    const titleRef = buyerDb.collection("titles").doc("title1");

    await assertFails(titleRef.set({
      title: "My Movie",
      creatorOwnerId: "buyer1",
    }));
  });

  it("should allow creator_partner to create a title", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("users").doc("creator1").set({ role: "creator_partner" });
    });

    const creatorDb = testEnv.authenticatedContext("creator1").firestore();
    const titleRef = creatorDb.collection("titles").doc("title1");

    await assertSucceeds(titleRef.set({
      title: "My Movie",
      creatorOwnerId: "creator1",
    }));
  });

  it("should prevent creator_partner from elevating qcStatus", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("users").doc("creator1").set({ role: "creator_partner" });
      await context.firestore().collection("titles").doc("title1").set({
        title: "My Movie",
        creatorOwnerId: "creator1",
        qcStatus: "pending"
      });
    });

    const creatorDb = testEnv.authenticatedContext("creator1").firestore();
    const titleRef = creatorDb.collection("titles").doc("title1");

    await assertFails(titleRef.update({
      qcStatus: "approved"
    }));
  });

  it("should prevent creator_partner from writing to ledgers", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("users").doc("creator1").set({ role: "creator_partner" });
    });

    const creatorDb = testEnv.authenticatedContext("creator1").firestore();
    const ledgerRef = creatorDb.collection("ledgers").doc("ledger1");

    await assertFails(ledgerRef.set({
      amount: 1000
    }));
  });

  it("should prevent cross-user wallet reads", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("users").doc("creator1").set({ role: "creator_partner" });
      await context.firestore().collection("wallets").doc("creator2").set({ availableBalance: 100 });
    });

    const creatorDb = testEnv.authenticatedContext("creator1").firestore();
    const walletRef = creatorDb.collection("wallets").doc("creator2");

    await assertFails(walletRef.get());
  });
});
