const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const u = await p.user.findMany({
    where: { memberships: { some: { role: "SUPERADMIN" } } },
    select: {
      email: true,
      name: true,
      memberships: {
        select: { orgId: true, role: true, isActive: true, kamar: true },
      },
    },
  });
  console.log(JSON.stringify(u, null, 2));
  const orgs = await p.org.findMany({ select: { id: true, name: true } });
  console.log("ORGS=" + JSON.stringify(orgs));
})().finally(() => p.$disconnect());
