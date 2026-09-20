import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { Role } from "../../../../generated/prisma";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const SALT_ROUNDS = 10;
const TEMP_PASSWORD_CHARS =
  "0123456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ";

function randomTempPassword(len = 8): string {
  let out = "";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) {
    out += TEMP_PASSWORD_CHARS[arr[i]! % TEMP_PASSWORD_CHARS.length];
  }
  return out;
}

export const authRouter = createTRPCRouter({
  /**
   * Bootstrap superadmin: hanya jalan saat belum ada user sama sekali.
   * Sekaligus membuat Org + OrgSetting pertama.
   */
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Nama jangan kosong ya.").max(80),
        email: z.string().email("Emailnya cek lagi ya."),
        password: z.string().min(8, "Sandi minimal 8 karakter."),
        orgName: z.string().min(1, "Nama org/kontrakan wajib diisi.").max(80),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userCount = await ctx.db.user.count();
      if (userCount > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Superadmin sudah ada. Anggota ditambahkan lewat superadmin.",
        });
      }

      const email = input.email.trim().toLowerCase();
      const existing = await ctx.db.user.findUnique({ where: { email } });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email itu udah dipake.",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
      const seed = Math.floor(Math.random() * 2_147_483_647);

      await ctx.db.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { name: input.name.trim(), email, passwordHash },
        });
        const org = await tx.org.create({
          data: { name: input.orgName.trim() },
        });
        await tx.membership.create({
          data: { role: Role.SUPERADMIN, userId: user.id, orgId: org.id },
        });
        await tx.orgSetting.create({ data: { orgId: org.id, seed } });
      });

      return { ok: true };
    }),

  /**
   * Superadmin mendaftarkan anggota: sistem generate sandi sementara
   * (mustChangePassword=true). Spesifikasi: docs/PRD.md §5.
   */
  createMember: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Nama wajib diisi.").max(80),
        email: z.string().email("Format email kurang pas."),
        roomId: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const email = input.email.trim().toLowerCase();
      const existing = await ctx.db.user.findUnique({ where: { email } });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email itu udah dipake.",
        });
      }

      const tempPassword = randomTempPassword();
      const passwordHash = await bcrypt.hash(tempPassword, SALT_ROUNDS);

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
        const user = await tx.user.create({
          data: {
            name: input.name.trim(),
            email,
            passwordHash,
            mustChangePassword: true,
          },
        });
        await tx.membership.create({
          data: {
            role: Role.MEMBER,
            roomId: input.roomId ?? null,
            userId: user.id,
            orgId: ctx.orgId,
          },
        });
      });

      return {
        email,
        name: input.name.trim(),
        tempPassword, // tampilkan SEKALI ke superadmin untuk diteruskan
      };
    }),

  /** Superadmin me-reset sandi anggota (muncul sandi sementara). */
  resetPassword: adminProcedure
    .input(z.object({ membershipId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.db.membership.findFirst({
        where: { id: input.membershipId, orgId: ctx.orgId },
        include: { user: true },
      });
      if (!membership) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Anggota nggak ketemu.",
        });
      }

      const tempPassword = randomTempPassword();
      await ctx.db.user.update({
        where: { id: membership.userId },
        data: {
          passwordHash: await bcrypt.hash(tempPassword, SALT_ROUNDS),
          mustChangePassword: true,
        },
      });

      return { email: membership.user.email, tempPassword };
    }),

  /** Ganti sandi sendiri (dipakai saat wajib ganti). */
  changePassword: protectedProcedure
    .input(
      z.object({ password: z.string().min(8, "Sandi minimal 8 karakter.") }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          passwordHash: await bcrypt.hash(input.password, SALT_ROUNDS),
          mustChangePassword: false,
        },
      });
      return { ok: true };
    }),
});
