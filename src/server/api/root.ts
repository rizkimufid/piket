import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import { authRouter } from "./routers/auth";
import { memberRouter } from "./routers/member";
import { orgRouter } from "./routers/org";
import { roomRouter } from "./routers/room";
import { scheduleRouter } from "./routers/schedule";
import { taskRouter } from "./routers/task";
import { userRouter } from "./routers/user";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  org: orgRouter,
  member: memberRouter,
  task: taskRouter,
  room: roomRouter,
  schedule: scheduleRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
