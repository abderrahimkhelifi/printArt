import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { verifyAdminToken } from "../auth";
import { ENV } from "./env";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Check for admin JWT token in Authorization header
    const authHeader = opts.req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const adminPayload = verifyAdminToken(token);
      if (adminPayload?.isAdmin) {
        // Create a synthetic admin user — no DB lookup needed
        const now = new Date();
        user = {
          id: 0,
          openId: 'admin',
          name: 'Admin',
          email: ENV.adminEmail ?? null,
          loginMethod: 'jwt',
          role: 'admin',
          createdAt: now,
          updatedAt: now,
          lastSignedIn: now,
        };
        return { req: opts.req, res: opts.res, user };
      }
    }

    // Fall back to session cookie (OAuth)
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
