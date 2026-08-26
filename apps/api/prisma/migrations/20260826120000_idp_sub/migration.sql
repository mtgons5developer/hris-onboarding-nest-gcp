-- Rename IdP subject column (was Firebase UID).
ALTER TABLE "users" RENAME COLUMN "firebase_uid" TO "idp_sub";
ALTER INDEX "users_firebase_uid_key" RENAME TO "users_idp_sub_key";
ALTER INDEX "users_firebase_uid_idx" RENAME TO "users_idp_sub_idx";
