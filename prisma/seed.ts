import { PrismaClient } from "../generated/prisma/client.js";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const TEMP_PASSWORD = "piket123";
const SEED_ROOMS = ["2A", "2B", "3A", "3B"];
const SEED_MEMBERS = [
  { email: "pajol@piket.local", name: "Pajol", room: "2A" },
  { email: "fajrial@piket.local", name: "Fajrial", room: "2A" },
  { email: "aceng@piket.local", name: "Aceng", room: "2B" },
  { email: "fariel@piket.local", name: "Fariel", room: "3A" },
  { email: "latief@piket.local", name: "Latief", room: "3A" },
  { email: "reyhan@piket.local", name: "Reyhan", room: "3B" },
];

async function main() {
  const superadmin = await db.user.findFirst({
    where: { memberships: { some: { role: "SUPERADMIN" } } },
    include: { memberships: { select: { orgId: true } } },
  });

  if (!superadmin) {
    throw new Error(
      "Tidak ada SUPERADMIN di DB. Bootstrap superadmin dulu lewat /register sebelum seed.",
    );
  }

  const orgId = superadmin.memberships[0]?.orgId;

  if (!orgId) {
    throw new Error(
      "Superadmin belum punya Membership aktif. Bootstrap dulu lewat /register.",
    );
  }

  console.log(
    `→ Superadmin: ${superadmin.email} — tautkan anggota ke org ${orgId}`,
  );

  const passwordHash = await bcrypt.hash(TEMP_PASSWORD, 10);

  const rooms = new Map(
    await Promise.all(
      SEED_ROOMS.map(async (name) => {
        const room = await db.room.upsert({
          where: { orgId_name: { orgId, name } },
          update: {},
          create: { orgId, name },
        });
        return [name, room.id] as const;
      }),
    ),
  );
  console.log(
    `  ✓ kamar seed: ${SEED_ROOMS.map((n) => `${n} (${rooms.get(n)})`).join(", ")}`,
  );

  for (const m of SEED_MEMBERS) {
    const user = await db.user.upsert({
      where: { email: m.email },
      update: {},
      create: {
        email: m.email,
        name: m.name,
        passwordHash,
        mustChangePassword: true,
      },
    });

    await db.membership.upsert({
      where: { userId_orgId: { userId: user.id, orgId } },
      update: { isActive: true, roomId: rooms.get(m.room) ?? null },
      create: {
        userId: user.id,
        orgId,
        role: "MEMBER",
        roomId: rooms.get(m.room) ?? null,
        isActive: true,
      },
    });
    console.log(
      `  ✓ ${m.email} (${m.name}) — sandi sementara \`${TEMP_PASSWORD}\`, wajib ganti pas login`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
