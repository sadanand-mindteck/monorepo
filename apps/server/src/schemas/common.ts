import z from "zod";

export const requestParam = z.object({ id: z.string() });
export const pagination = z.object({ page: z.number(), limit: z.number(), total: z.number(), pages: z.number() });
