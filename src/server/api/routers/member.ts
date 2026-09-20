import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, orgProcedure } from "~/server/api/trpc";
import { adminProcedure } from "~/server/api/trpc";

export const memberRouter = createTRPCRouter({
  /** Anggota org aktif (termasuk yang non-aktif) — terurut waktu gabung. */
  list: orgProcedure.query(async ({ ctx }) => {
    return ctx.db.membership.findMany({
      where: { orgId: ctx.orgId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        room: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }),

  update: adminProcedure
    .input(
      z.object({
        membershipId: z.string().min(1),
        name: z.string().min(1).max(80).optional(),
        roomId: z.string().min(1).nullable().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.db.membership.findFirst({
        where: { id: input.membershipId, orgId: ctx.orgId },
      });
      if (!membership) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Anggota nggak ketemu.",
        });
      }

      const data = {
        roomId: input.roomId ?? null,
        isActive: input.isActive,
      };

      if (input.roomId) {
        const room = await ctx.db.room.findFirst({
          where: { id: input.roomId, orgId: ctx.orgId },
        });
        if (!room) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Kamar yang dipilih nggak ada.",
          });
        }
      }

      await ctx.db.$transaction(async (tx) => {
        if (input.name) {
          await tx.user.update({
            where: { id: membership.userId },
            data: { name: input.name.trim() },
          });
        }
        await tx.membership.update({
          where: { id: membership.id },
          data: { roomId: data.roomId, isActive: data.isActive },
        });
      });

      return { ok: true };
    }),

  /** Hapus anggota (take out dari rotasi). Diri sendiri tidak bisa dihapus. */
  remove: adminProcedure
    .input(z.object({ membershipId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.db.membership.findFirst({
        where: { id: input.membershipId, orgId: ctx.orgId },
      });
      if (!membership) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Anggota nggak ketemu.",
        });
      }
      if (membership.id === ctx.membership.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Jangan hapus diri sendiri dong.",
        });
      }

      await ctx.db.membership.delete({ where: { id: membership.id } });
      return { ok: true };
    }),
});
