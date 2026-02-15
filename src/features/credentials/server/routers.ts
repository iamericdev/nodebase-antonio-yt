import { PAGINATION } from "@/config/constants";
import { CredentialType } from "@/generated/prisma/enums";
import db from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";

export const credentialsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().min(1, "Value is required"),
      }),
    )
    .mutation(({ ctx, input }) => {
      return db.credential.create({
        data: {
          name: input.name,
          userId: ctx.auth.user.id,
          type: input.type,
          value: input.value, // TODO: encrypt this value in production (use something like amazon secrets manager)
        },
      });
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return db.credential.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().min(1, "Value is required"),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, name, type, value } = input;
      return db.credential.update({
        where: {
          id,
          userId: ctx.auth.user.id,
        },
        data: {
          name,
          type,
          value,
          updatedAt: new Date(),
        },
      });
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return db.credential.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;
      const [items, count] = await Promise.all([
        db.credential.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        }),
        db.credential.count({
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        }),
      ]);
      const totalPages = Math.ceil(count / pageSize);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      return {
        items,
        count,
        totalPages,
        hasNextPage,
        hasPrevPage,
      };
    }),

  getByType: protectedProcedure
    .input(z.object({ type: z.enum(CredentialType) }))
    .query(({ ctx, input }) => {
      return db.credential.findMany({
        where: {
          userId: ctx.auth.user.id,
          type: input.type,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }),
});
