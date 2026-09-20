import { PrismaClient } from './generated/prisma/client.js';
const p = new PrismaClient();
try {
  const u = await p.user.findMany({
    where: { memberships: { some: { role: 'SUPERADMIN' } } },
    select: { email: true, name: true, memberships: { select: { orgId: true, role: true, isActive: true, kamar: true } } },
  });
  console.log('SUPERADMINS=' + JSON.stringify(u, null, 1));
  const orgs = await p.org.findMany({ select: { id: true, name: true } });
  console.log('ORGS=' + JSON.stringify(orgs));
} finally {
  await p.$disconnect();
}
