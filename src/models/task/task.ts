import { z } from "zod";
import { UserModel } from "../user/user";

export const TaskModel = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(1, { message: "Поле обязательное для заполнения" }),
  assignedTo: z.optional(UserModel).nullable(),
  fromUser: z.optional(UserModel).nullable(),
});

export type TTaskModel = z.infer<typeof TaskModel>;
