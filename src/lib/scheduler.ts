// src/lib/scheduler.ts

/**
 * Automatic Auction Closing Scheduler
 * ---------------------------------------------------------
 * This service runs automatically when the server starts.
 * It checks for expired auctions every 1 minute and closes them.
 *
 * Features:
 * - Runs every 60 seconds automatically
 * - Closes expired auctions
 * - Sends email notifications
 * - Updates product status
 * - No manual intervention needed
 *
 * Usage:
 * - Automatically starts when server starts
 * - No need to visit any URL
 * - Works in development and production
 */

import cron from "node-cron";
import { closeExpiredAuctions } from "./auction-closer";

let isSchedulerRunning = false;

/**
 * Start the automatic auction closing scheduler
 * Runs every 1 minute (at the start of each minute)
 */
export function startAuctionScheduler() {
  // Prevent multiple instances
  if (isSchedulerRunning) {
    console.log("⚠️  Scheduler already running, skipping duplicate start");
    return;
  }

  console.log("🚀 Starting Automatic Auction Closing Scheduler...");
  console.log("⏰ Will check for expired auctions every 1 minute");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Schedule: Run every minute (at the start of each minute)
  // Pattern: '* * * * *' means: "every minute"
  // Alternative: '*/1 * * * *' (same meaning)
  cron.schedule("* * * * *", async () => {
    const now = new Date().toLocaleString();
    console.log(`\n🔄 [${now}] Running scheduled auction check...`);

    try {
      // Call the auction closing logic
      const results = await closeExpiredAuctions();

      // Log results
      if (results.total === 0) {
        console.log("   ✓ No expired auctions found");
      } else {
        console.log(`   ✓ Checked: ${results.total} expired auction(s)`);
        console.log(`   ✓ Successful: ${results.successful}`);
        console.log(`   ✓ Failed: ${results.failed}`);

        // Log details for each closed auction
        results.details.forEach((detail) => {
          if (detail.success) {
            console.log(`   ✅ Closed: "${detail.productTitle}"`);
          } else {
            console.log(
              `   ❌ Failed: "${detail.productTitle}" - ${detail.message}`
            );
          }
        });
      }
    } catch (error) {
      console.error("   ❌ Scheduler error:", error);
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  });

  isSchedulerRunning = true;
  console.log("✅ Scheduler started successfully!");
  console.log("   The system will now automatically close expired auctions.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

/**
 * Stop the scheduler (useful for testing or shutdown)
 */
export function stopAuctionScheduler() {
  if (isSchedulerRunning) {
    console.log("🛑 Stopping auction scheduler...");
    isSchedulerRunning = false;
  }
}
