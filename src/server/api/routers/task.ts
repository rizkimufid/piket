import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, orgProcedure } from "~/server/api/trpc";
import { adminProcedure } from "~/server/api/trpc";

export const taskRouter = createTRPCRouter({
  /** Task org aktif, urut posisi. */
  list: orgProcedure.query(async ({ ctx }) => {
    return ctx.db.task.findMany({
      where: { orgId: ctx.orgId },
      orderBy: [{ position: "asc" }],
    });
  }),

  create: adminProcedure
    .input(z.object({ name: z.string().min(1, "Nama task wajib.").max(80) }))
    .mutation(async ({ ctx, input }) => {
      const last = await ctx.db.task.findFirst({
        where: { orgId: ctx.orgId },
        orderBy: { position: "desc" },
      });
      return ctx.db.task.create({
        data: {
          orgId: ctx.orgId,
          name: input.name.trim(),
          position: (last?.position ?? -1) + 1,
        },
      });
    }),

  updateName: adminProcedure
    .input(z.object({ id: z.string().min(1), name: z.string().min(1).max(80) }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.task.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
      });
      if (!task)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task nggak ketemu.",
        });
      return ctx.db.task.update({
        where: { id: task.id },
        data: { name: input.name.trim() },
      });
    }),

  /** Geser posisi naik/turun (swap posisi dengan tetangga). */
  move: adminProcedure
    .input(z.object({ id: z.string().min(1), dir: z.enum(["up", "down"]) }))
    .mutation(async ({ ctx, input }) => {
      const all = await ctx.db.task.findMany({
        where: { orgId: ctx.orgId },
        orderBy: { position: "asc" },
      });
      const idx = all.findIndex((t) => t.id === input.id);
      if (idx < 0)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task nggak ketemu.",
        });

      const target = input.dir === "up" ? idx - 1 : idx + 1;
      const other = all[target];
      if (!other) return { ok: false };

      await ctx.db.$transaction([
        ctx.db.task.update({
          where: { id: all[idx]!.id },
          data: { position: other.position },
        }),
        ctx.db.task.update({
          where: { id: other.id },
          data: { position: all[idx]!.position },
        }),
      ]);
      return { ok: true };
    }),

  remove: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.task.deleteMany({
        where: { id: input.id, orgId: ctx.orgId },
      });
      return { ok: true };
    }),
});
