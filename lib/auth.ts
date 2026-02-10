import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { env } from "./env";
import { createClient } from "./supabase";

const JWKS_URL =
  env.JWKS_URL || "https://static.opencampus.xyz/jwks/jwks-staging.json";
const jwks = createRemoteJWKSet(new URL(JWKS_URL));

export interface AuthState {
  OCId: string;
  ethAddress?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteContext = { params?: Record<string, any> };

/**
 * Wrap API route handlers with OCID authentication
 * Supports both simple routes and dynamic routes with params
 */
export function withAuth<T extends RouteContext = RouteContext>(
  handler: (request: NextRequest, auth: AuthState, context?: T) => Promise<NextResponse>,
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    try {
      const authHeader = request.headers.get("Authorization");

      if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "Missing or invalid Authorization header" },
          { status: 401 },
        );
      }

      const token = authHeader.slice(7);

      const { payload } = await jwtVerify(token, jwks);
      const OCId = payload.edu_username as string | undefined;

      if (!OCId) {
        return NextResponse.json(
          { error: "Invalid token: missing OCID" },
          { status: 401 },
        );
      }

      return handler(request, {
        OCId,
        ethAddress: payload.eth_address as string | undefined,
      }, context);
    } catch (error) {
      console.error("JWT verification failed:", error);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }
  };
}

// Verify auth and return user from database
export interface AuthResult {
  authenticated: boolean;
  user: { id: string; ocid: string } | null;
  error?: string;
}

export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, user: null, error: "No token provided" };
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, jwks);
    const OCId = payload.edu_username as string | undefined;

    if (!OCId) {
      return { authenticated: false, user: null, error: "Invalid token" };
    }

    // Get user from database
    const supabase = createClient();
    const { data: user, error } = await supabase
      .from("users")
      .select("id, ocid")
      .eq("ocid", OCId)
      .single();

    if (error || !user) {
      return { authenticated: false, user: null, error: "User not found" };
    }

    return { authenticated: true, user };
  } catch (error) {
    console.error("Token verification failed:", error);
    return { authenticated: false, user: null, error: "Invalid token" };
  }
}
