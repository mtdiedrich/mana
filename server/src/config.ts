import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT ?? "3000", 10),
  jwtSecret: process.env.JWT_SECRET ?? "change-me",
  databaseUrl: process.env.DATABASE_URL ?? "file:./grimoire.db",
  /** Token expiry: 7 days */
  jwtExpiresIn: "7d" as const,
};
