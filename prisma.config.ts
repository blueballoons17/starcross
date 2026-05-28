import { defineConfig } from "prisma/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
  migrate: {
    adapter: async () => {
      const client = createClient({
        url: process.env.DATABASE_URL ?? "file:./dev.db",
      });
      return new PrismaLibSql(client);
    },
  },
});
