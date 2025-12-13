// src/app/api/cron/close-auctions/route.ts

/**
 * Cron Job API - Close Expired Auctions
 * ---------------------------------------------------------
 * GET /api/cron/close-auctions
 *
 * This endpoint should be called periodically (every minute recommended)
 * to automatically close expired auctions.
 *
 * Setup Options:
 *
 * 1. External Cron Service (Recommended for Production):
 *    - Use services like Vercel Cron, cron-job.org, or EasyCron
 *    - Set them to hit this endpoint every 1 minute
 *    - Example: GET https://yourapp.com/api/cron/close-auctions
 *
 * 2. Local Development:
 *    - Manually trigger by visiting: http://localhost:3000/api/cron/close-auctions
 *    - Or use a tool like Postman to call it periodically
 *
 * Security:
 * - In production, add authentication (API key or secret token)
 * - For now, it's publicly accessible for testing
 */

import { NextResponse } from "next/server";
import { closeExpiredAuctions } from "@/lib/auction-closer";

/**
 * GET /api/cron/close-auctions
 *
 * Triggers the auction closing process for all expired auctions
 */
export async function GET(request: Request) {
  try {
    console.log("🔄 Cron job triggered: Closing expired auctions...");

    // Execute the auction closing logic
    const results = await closeExpiredAuctions();

    console.log("✅ Cron job completed successfully");

    return NextResponse.json(
      {
        success: true,
        message: "Auction closing process completed",
        results: {
          totalChecked: results.total,
          successful: results.successful,
          failed: results.failed,
          timestamp: new Date().toISOString(),
        },
        details: results.details,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Cron job failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to close auctions",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/close-auctions
 *
 * Alternative method for cron services that prefer POST requests
 */
export async function POST(request: Request) {
  return GET(request);
}

// Option A: Vercel Cron (If deploying to Vercel)
// Create vercel.json:
// {
//   "crons": [
//     {
//       "path": "/api/cron/close-auctions",
//       "schedule": "* * * * *"
//     }
//   ]
// }
//

// Option B: cron-job.org (Free, Works Anywhere)

// Go to https://cron-job.org
// Sign up (free)
// Create a new cron job:

// URL: https://yourapp.com/api/cron/close-auctions
// Interval: Every 1 minute
// Method: GET

// Now it runs automatically every minute even on localhost (if publicly accessible) ✅
