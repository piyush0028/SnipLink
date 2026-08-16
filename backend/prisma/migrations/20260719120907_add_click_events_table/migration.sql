-- CreateTable
CREATE TABLE "click_events" (
    "id" TEXT NOT NULL,
    "urlId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "referrer" TEXT,
    "country" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "device" TEXT,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "click_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "click_events_urlId_clickedAt_idx" ON "click_events"("urlId", "clickedAt");

-- AddForeignKey
ALTER TABLE "click_events" ADD CONSTRAINT "click_events_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "urls"("id") ON DELETE SET NULL ON UPDATE CASCADE;
