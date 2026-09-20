import { z } from "zod";

import { createTRPCRouter } from "~/server/api/trpc";
import { adminProcedure } from "~/server/api/trpc";

export const orgRouter = createTRPCRouter({
  /** "Acak ulang" — ganti seed. Spesifikasi: docs/PRD.md §7.1. */
  regenerateSeed: adminProcedure.mutation(async ({ ctx }) => {
    const seed = Math.floor(Math.random() * 2_147_483_647);
    await ctx.db.orgSetting.upsert({
      where: { orgId: ctx.orgId },
      create: { orgId: ctx.orgId, seed },
      update: { seed },
    });
    return { seed };
  }),

  updateName: adminProcedure
    .input(z.object({ name: z.string().min(1).max(80) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.org.update({
        where: { id: ctx.orgId },
        data: { name: input.name.trim() },
      });
      return { ok: true };
    }),
});
