-- ── User: add referral fields ────────────────────────────────────────────────
ALTER TABLE "User" ADD COLUMN "referralCode"      TEXT;
ALTER TABLE "User" ADD COLUMN "pendingFreeMonths" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- ── Referral table ────────────────────────────────────────────────────────────
CREATE TABLE "Referral" (
    "id"             TEXT     NOT NULL PRIMARY KEY,
    "referrerId"     TEXT     NOT NULL,
    "referredUserId" TEXT     NOT NULL,
    "paidAt"         DATETIME,
    "createdAt"      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Referral_referrerId_fkey"
        FOREIGN KEY ("referrerId")     REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Referral_referredUserId_fkey"
        FOREIGN KEY ("referredUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Referral_referredUserId_key" ON "Referral"("referredUserId");
