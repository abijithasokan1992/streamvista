import * as fs from "fs";
import * as path from "path";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import type {
  LegacyUser,
  LegacyFilm,
  LegacyDraft,
  LegacyBuyerMapping,
  LegacyPayment,
  MigrationReport,
} from "./schemas";

if (!process.env.FIRESTORE_EMULATOR_HOST && !process.env.STREAMVISTA_MIGRATION_FORCE) {
    process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
}

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error(
    "Migration aborted: FIRESTORE_EMULATOR_HOST is required. Production access is forbidden.",
  );
}

process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
process.env.GCLOUD_PROJECT ??= "demo-streamvista";

const app = initializeApp({
  projectId: process.env.GCLOUD_PROJECT,
});

const db = getFirestore(app);

export class MigrationEngine {
  private dryRun: boolean;
  private rollbackLog: string[] = [];

  constructor(
    dryRun: boolean = true,
    private readonly dataDirectory: string = path.resolve(
      process.cwd(),
      "scripts/legacy_data",
    ),
  ) {
    this.dryRun = dryRun;
  }

  private createReport(): MigrationReport {
    return { totalProcessed: 0, imported: 0, skipped: 0, failed: 0, errors: [] };
  }

  async migrateUsers(filePath: string): Promise<MigrationReport> {
    const report = this.createReport();
    if (!fs.existsSync(filePath)) {
      report.errors.push(`File not found: ${filePath}`);
      return report;
    }

    const data: LegacyUser[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    for (const user of data) {
      report.totalProcessed++;
      try {
        if (!user.email || !user.email.includes('@')) {
          report.skipped++;
          report.errors.push(`Invalid email for user ${user.id}`);
          continue;
        }

        const normalizedEmail = user.email.toLowerCase().trim();
        
        // Never grant superadmin automatically from legacy
        const role = (user.is_superuser || user.is_staff) ? 'admin' : (user.profile_type || 'buyer');
        
        const docRef = db.collection('users').doc(`legacy_${user.id}`);
        
        const existing = await docRef.get();
        if (this.dryRun) {
          if (existing.exists) {
            report.skipped++;
          } else {
            report.imported++;
          }
        } else {
          if (existing.exists) {
            report.skipped++;
            // Still update it, but log as skipped for duplicate tracking
            await docRef.set({
              email: normalizedEmail,
              role: role === 'admin' ? 'buyer' : role, // Fallback safe role
              legacy_user_id: user.id,
              migrated_at: new Date().toISOString()
            }, { merge: true });
          } else {
            await docRef.set({
              email: normalizedEmail,
              role: role === 'admin' ? 'buyer' : role,
              legacy_user_id: user.id,
              migrated_at: new Date().toISOString()
            }, { merge: true });
            this.rollbackLog.push(docRef.path);
            report.imported++;
          }
        }
      } catch (err) {
        report.failed++;
        report.errors.push(`Failed user ${user.id}: ${(err as Error).message}`);
      }
    }
    return report;
  }

  async runDryRun(): Promise<MigrationReport> {
    const usersPath = path.resolve(this.dataDirectory, "accounts_user.json");
    this.dryRun = true;
    return this.migrateUsers(usersPath);
  }

  async rollback(): Promise<void> {
    console.log(`Starting rollback of ${this.rollbackLog.length} documents...`);
    for (const docPath of this.rollbackLog) {
      try {
        const parts = docPath.split('/');
        // Ensure path splits correctly. e.g. "users/legacy_1" -> parts[0]="users", parts[1]="legacy_1"
        if(parts.length === 2) {
            await db.collection(parts[0]).doc(parts[1]).delete();
        } else {
            await db.doc(docPath).delete();
        }
        console.log(`Rolled back: ${docPath}`);
      } catch (e) {
        console.error(`Failed to rollback ${docPath}`, e);
      }
    }
    this.rollbackLog = [];
  }
}
