import { defineConfig } from "prisma/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
  migrate: {
    adapter: async () => {
      return new PrismaLibSql({
        url: process.env.DATABASE_URL ?? "file:./dev.db",
      });
    },
  },
});
