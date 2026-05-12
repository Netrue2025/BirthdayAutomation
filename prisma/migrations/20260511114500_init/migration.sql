CREATE TYPE "BirthdayEventStatus" AS ENUM ('PENDING', 'NOTIFIED', 'CARD_READY', 'SENT', 'SKIPPED', 'FAILED');
CREATE TYPE "NotificationChannel" AS ENUM ('TELEGRAM', 'WHATSAPP', 'SYSTEM');

CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "dateOfBirth" DATE NOT NULL,
    "imageUrl" TEXT,
    "churchGroup" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "churchName" TEXT NOT NULL DEFAULT 'Grace Family Church',
    "logoUrl" TEXT,
    "defaultTemplateId" TEXT NOT NULL DEFAULT 'elegant',
    "notificationTime" TEXT NOT NULL DEFAULT '08:00',
    "telegramBotToken" TEXT,
    "telegramChatId" TEXT,
    "telegramEnabled" BOOLEAN NOT NULL DEFAULT false,
    "defaultBirthdayMessage" TEXT NOT NULL DEFAULT 'We celebrate God''s grace upon your life today. May this new year overflow with joy, strength, and divine favor.',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Lagos',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BirthdayEvent" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "eventDate" DATE NOT NULL,
    "status" "BirthdayEventStatus" NOT NULL DEFAULT 'PENDING',
    "templateId" TEXT,
    "greetingMessage" TEXT,
    "cardImageUrl" TEXT,
    "whatsappUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BirthdayEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "channel" "NotificationChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "providerMsgId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GeneratedCard" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedCard_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Member_fullName_idx" ON "Member"("fullName");
CREATE INDEX "Member_phoneNumber_idx" ON "Member"("phoneNumber");
CREATE INDEX "Member_dateOfBirth_idx" ON "Member"("dateOfBirth");
CREATE INDEX "Member_churchGroup_idx" ON "Member"("churchGroup");
CREATE UNIQUE INDEX "BirthdayEvent_memberId_eventDate_key" ON "BirthdayEvent"("memberId", "eventDate");
CREATE INDEX "BirthdayEvent_eventDate_idx" ON "BirthdayEvent"("eventDate");
CREATE INDEX "BirthdayEvent_status_idx" ON "BirthdayEvent"("status");
CREATE INDEX "NotificationLog_channel_idx" ON "NotificationLog"("channel");
CREATE INDEX "NotificationLog_status_idx" ON "NotificationLog"("status");
CREATE INDEX "NotificationLog_createdAt_idx" ON "NotificationLog"("createdAt");
CREATE UNIQUE INDEX "GeneratedCard_memberId_templateId_imageHash_key" ON "GeneratedCard"("memberId", "templateId", "imageHash");
CREATE INDEX "GeneratedCard_expiresAt_idx" ON "GeneratedCard"("expiresAt");

ALTER TABLE "BirthdayEvent" ADD CONSTRAINT "BirthdayEvent_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "BirthdayEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GeneratedCard" ADD CONSTRAINT "GeneratedCard_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
