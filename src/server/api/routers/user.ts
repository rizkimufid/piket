import { TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { z } from "zod";

import { ACTIVE_ORG_COOKIE } from "~/server/active-org";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  /** Profil + org yang diikuti + org aktif. */
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        mustChangePassword: true,
        memberships: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            role: true,
            kamar: true,
            isActive: true,
            org: { select: { id: true, name: true } },
          },
        },
      },
    });
    return { user, activeOrgId: ctx.activeOrgId };
  }),

  /** Ganti org aktif (cookie `org_active`). */
  setActiveOrg: protectedProcedure
    .input(z.object({ orgId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.db.membership.findUnique({
        where: {
          userId_orgId: { userId: ctx.session.user.id, orgId: input.orgId },
        },
      });
      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Kamu nggak di org itu.",
        });
      }

      const jar = await cookies();
      jar.set(ACTIVE_ORG_COOKIE, input.orgId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });

      return { activeOrgId: input.orgId };
    }),
});
