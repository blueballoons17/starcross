import { defineConfig } from "prisma/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";

export default defineConfig({
  datasource: {
    adapter: new PrismaLibSql({ url: dbUrl }),
  },
});
