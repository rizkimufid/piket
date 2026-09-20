import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, orgProcedure } from "~/server/api/trpc";
import { adminProcedure } from "~/server/api/trpc";

export const roomRouter = createTRPCRouter({
  /** Kamar org aktif (urut nama) + jumlah anggotanya. */
  list: orgProcedure.query(async ({ ctx }) => {
    return ctx.db.room.findMany({
      where: { orgId: ctx.orgId },
      include: { _count: { select: { members: true } } },
      orderBy: { name: "asc" },
    });
  }),

  create: adminProcedure
    .input(z.object({ name: z.string().min(1, "Nama kamar wajib.").max(60) }))
    .mutation(async ({ ctx, input }) => {
      const name = input.name.trim();
      const dup = await ctx.db.room.findFirst({
        where: { orgId: ctx.orgId, name },
      });
      if (dup) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Kamar itu udah ada.",
        });
      }
      return ctx.db.room.create({ data: { orgId: ctx.orgId, name } });
    }),

  updateName: adminProcedure
    .input(z.object({ id: z.string().min(1), name: z.string().min(1).max(60) }))
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
      });
      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kamar nggak ketemu.",
        });
      }
      const name = input.name.trim();
      const dup = await ctx.db.room.findFirst({
        where: { orgId: ctx.orgId, name, id: { not: room.id } },
      });
      if (dup) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Kamar itu udah ada.",
        });
      }
      return ctx.db.room.update({ where: { id: room.id }, data: { name } });
    }),

  /**
   * Hapus kamar. Anggota yang ada di kamar ini otomatis dilepas
   * (roomId → null, onDelete SetNull). Balikin jumlah yang kena.
   */
  remove: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
        include: { _count: { select: { members: true } } },
      });
      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kamar nggak ketemu.",
        });
      }
      await ctx.db.room.delete({ where: { id: room.id } });
      return { memberCount: room._count.members };
    }),
});