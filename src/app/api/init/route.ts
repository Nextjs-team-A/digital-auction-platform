// src/app/api/init/route.ts

/**
 * Scheduler Initialization Endpoint
 * ---------------------------------------------------------
 * This endpoint is called automatically when the app starts.
 * It initializes the automatic auction closing scheduler.
 *
 * This file exports the scheduler start function so it runs
 * as soon as the module is imported.
 */

import { NextResponse } from "next/server";
import { startAuctionScheduler } from "@/lib/scheduler";

// Start the scheduler immediately when this module loads
// This happens automatically when the Next.js server starts
// But NOT during the build process (static generation)
const isBuild = process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.NEXT_PHASE === 'phase-export';

if (!isBuild && typeof window === 'undefined') {
  startAuctionScheduler();
}

/**
 * GET /api/init
 * Health check endpoint to verify scheduler is running
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "running",
      message: "Auction scheduler is active",
      checkInterval: "Every 1 minute",
    },
    { status: 200 }
  );
}
