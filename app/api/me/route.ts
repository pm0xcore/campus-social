import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (_request, auth) => {
  // Log the OCID (as requested)
  console.log("Authenticated user OCID:", auth.OCId);

  return NextResponse.json({
    OCId: auth.OCId,
    ethAddress: auth.ethAddress,
  });
});
