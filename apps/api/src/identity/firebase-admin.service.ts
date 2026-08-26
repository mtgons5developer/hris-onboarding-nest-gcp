import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private ready = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    if (admin.apps.length) {
      this.ready = true;
      return;
    }
    const projectId = this.config.get<string>('FIREBASE_PROJECT_ID');
    const credPath = this.config.get<string>('GOOGLE_APPLICATION_CREDENTIALS');
    if (!projectId && !credPath) {
      this.logger.warn('Firebase Admin not configured — AUTH_DEV_BYPASS only.');
      return;
    }
    try {
      admin.initializeApp({
        projectId: projectId || undefined,
        credential: credPath ? admin.credential.cert(credPath) : admin.credential.applicationDefault(),
      });
      this.ready = true;
    } catch (err) {
      this.logger.warn(`Firebase Admin init skipped: ${(err as Error).message}`);
    }
  }

  async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    if (!this.ready) {
      throw new UnauthorizedException('Firebase Admin is not configured');
    }
    try {
      return await admin.auth().verifyIdToken(token);
    } catch {
      throw new UnauthorizedException('Invalid Firebase ID token');
    }
  }

  async setRoleClaim(uid: string, role: string): Promise<void> {
    if (!this.ready) {
      this.logger.log(`[stub] set custom claim role=${role} uid=${uid}`);
      return;
    }
    await admin.auth().setCustomUserClaims(uid, { role });
  }
}
