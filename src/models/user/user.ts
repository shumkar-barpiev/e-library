import { any, z } from "zod";

export const UserModel = z.object({
  id: z.number().int().positive().optional(),
  version: z.number().int().positive().optional(),
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  mobilePhone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  partnerTypeSelect: z.number().optional(),
  roles: z.array(z.any()).optional(),
  partner: z.record(z.any()).optional(),
  organization: z.record(z.any()).optional(),
});

export const ReadOnlyROLES = ["agent", "subagent"];

export type TUserModel = z.infer<typeof UserModel>;
