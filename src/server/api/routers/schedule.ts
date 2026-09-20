import { env } from "~/env";
import { createTRPCRouter, orgProcedure } from "~/server/api/trpc";
import {
  DEFAULT_EPOCH,
  WEEK_MS,
  buildSchedule,
  mondayOf,
  periodIndexFrom,
  tzOffsetMinutes,
} from "~/server/schedule";

export const scheduleRouter = createTRPCRouter({
  /** Jadwal minggu ini + preview minggu depan (siapa → task apa). */
  current: orgProcedure.query(async ({ ctx }) => {
    const [memberships, tasks, setting] = await Promise.all([
      ctx.db.membership.findMany({
        where: { orgId: ctx.orgId, isActive: true },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      }),
      ctx.db.task.findMany({
        where: { orgId: ctx.orgId },
        orderBy: { position: "asc" },
      }),
      ctx.db.orgSetting.findUnique({ where: { orgId: ctx.orgId } }),
    ]);

    const now = new Date();
    const tz = tzOffsetMinutes(now, env.TIMEZONE);
    const seed = Math.abs((setting?.seed ?? 0) >>> 0);
    const weekIndex = Math.max(
      0,
      periodIndexFrom(now, new Date(DEFAULT_EPOCH), tz),
    );

    const memberIds = memberships.map((m) => m.user.id);
    const taskIds = tasks.map((t) => t.id);
    const memberName = new Map(
      memberships.map((m) => [m.user.id, m.user.name]),
    );
    const memberKamar = new Map(memberships.map((m) => [m.user.id, m.kamar]));
    const taskName = new Map(tasks.map((t) => [t.id, t.name]));

    const render = (w: number) => {
      const map = buildSchedule({ memberIds, taskIds, seed, periodIndex: w });
      return {
        weekStart: mondayOf(now, tz) + w * WEEK_MS,
        items: tasks.map((t) => {
          const memberId = map.get(t.id) ?? null;
          return {
            taskId: t.id,
            taskName: taskName.get(t.id) ?? t.name,
            memberId,
            memberName: memberId ? (memberName.get(memberId) ?? null) : null,
            kamar: memberId ? (memberKamar.get(memberId) ?? null) : null,
          };
        }),
      };
    };

    return {
      rotation: setting?.rotation ?? "weekly",
      thisWeek: render(weekIndex),
      nextWeek: render(weekIndex + 1),
      memberCount: memberships.length,
      taskCount: tasks.length,
    };
  }),
});
