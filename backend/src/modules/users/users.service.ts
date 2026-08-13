import { Prisma } from "@prisma/client";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import type { CreateUserSchemaInput } from "./users.schema";

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createUser(input: CreateUserSchemaInput) {
  try {
    return await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw ApiError.conflict("Email already in use");
    }
    throw err;
  }
}
