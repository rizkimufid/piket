import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { auth } from "~/server/auth";
import { ACTIVE_ORG_COOKIE, cookieValue } from "~/server/active-org";
import { db } from "~/server/db";

/**
 * 1. CONTEXT
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth();
  const cookie = opts.headers.get("cookie");

  return {
    db,
    session,
    activeOrgId: cookieValue(cookie, ACTIVE_ORG_COOKIE),
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  if (t._config.isDev) {
    console.log(`[TRPC] ${path} took ${Date.now() - start}ms`);
  }

  return result;
});

/**
 * 3. PROCEDURES
 */

/** Tidak perlu login (mis. `/login`, bootstrap `/register`). */
export const publicProcedure = t.procedure.use(timingMiddleware);

const requireAuthMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Login dulu ya." });
  }
  return next({
    ctx: { ...ctx, session: { ...ctx.session, user: ctx.session.user } },
  });
});

/** Harus login. */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(requireAuthMiddleware);

/**
 * Harus login DAN tergabung di sebuah org. `membership` & `orgId` disuntikkan
 * ke context — semua data di bawahnya wajib di-scope ke org ini.
 */
const withOrgMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Login dulu ya." });
  }
  const membership = await ctx.db.membership.findFirst({
    where: {
      userId: ctx.session.user.id,
      ...(ctx.activeOrgId ? { orgId: ctx.activeOrgId } : {}),
    },
    include: { org: true, user: true },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Kamu belum tergabung di org mana pun.",
    });
  }

  return next({ ctx: { ...ctx, membership, orgId: membership.orgId } });
});

/** Harus login + tergabung di org aktif. */
export const orgProcedure = t.procedure
  .use(timingMiddleware)
  .use(requireAuthMiddleware)
  .use(withOrgMiddleware);

/** Hanya superadmin org aktif yang boleh mutasi. */
export const adminProcedure = orgProcedure.use(async ({ ctx, next }) => {
  if (ctx.membership.role !== "SUPERADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Khusus superadmin nih.",
    });
  }
  return next({ ctx });
});
