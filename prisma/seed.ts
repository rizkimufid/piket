import { PrismaClient } from "../generated/prisma/client.js";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const TEMP_PASSWORD = "piket123";
const SEED_MEMBERS = [
  { email: "pajol@piket.local", name: "Pajol" },
  { email: "fajrial@piket.local", name: "Fajrial" },
  { email: "aceng@piket.local", name: "Aceng" },
  { email: "fariel@piket.local", name: "Fariel" },
  { email: "latief@piket.local", name: "Latief" },
  { email: "reyhan@piket.local", name: "Reyhan" },
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
      update: { isActive: true },
      create: {
        userId: user.id,
        orgId,
        role: "MEMBER",
        kamar: null,
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
