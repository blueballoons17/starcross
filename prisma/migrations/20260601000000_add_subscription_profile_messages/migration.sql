-- ── Profile: add interests / photos / answers ──────────────────────────────
ALTER TABLE "Profile" ADD COLUMN "interests" TEXT;
ALTER TABLE "Profile" ADD COLUMN "photos" TEXT;
ALTER TABLE "Profile" ADD COLUMN "answers" TEXT;

-- ── User: add Stripe subscription fields + daily swipe tracking ─────────────
-- SQLite cannot ADD multiple columns with constraints in-place, so we
-- recreate the table and copy existing rows.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_User" (
    "id"                           TEXT     NOT NULL PRIMARY KEY,
    "email"                        TEXT     NOT NULL,
    "passwordHash"                 TEXT     NOT NULL,
    "createdAt"                    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"                    DATETIME NOT NULL,
    "stripeCustomerId"             TEXT,
    "stripeSubscriptionId"         TEXT,
    "subscriptionStatus"           TEXT,
    "subscriptionCurrentPeriodEnd" DATETIME,
    "dailySwipeCount"              INTEGER  NOT NULL DEFAULT 0,
    "dailySwipeResetAt"            DATETIME
);

INSERT INTO "new_User" (
    "id", "email", "passwordHash", "createdAt", "updatedAt"
)
SELECT
    "id", "email", "passwordHash", "createdAt", "updatedAt"
FROM "User";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- ── Message ─────────────────────────────────────────────────────────────────
CREATE TABLE "Message" (
    "id"        TEXT     NOT NULL PRIMARY KEY,
    "matchId"   TEXT     NOT NULL,
    "senderId"  TEXT     NOT NULL,
    "content"   TEXT     NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_matchId_fkey"  FOREIGN KEY ("matchId")  REFERENCES "Match" ("id")  ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"  ("id")  ON DELETE CASCADE ON UPDATE CASCADE
);

-- ── Notification ─────────────────────────────────────────────────────────────
CREATE TABLE "Notification" (
    "id"        TEXT     NOT NULL PRIMARY KEY,
    "userId"    TEXT     NOT NULL,
    "type"      TEXT     NOT NULL,
    "title"     TEXT     NOT NULL,
    "body"      TEXT     NOT NULL,
    "read"      BOOLEAN  NOT NULL DEFAULT false,
    "relatedId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
