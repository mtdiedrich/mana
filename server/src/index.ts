import { config } from "./config.js";
import { prisma } from "./prisma.js";
import { createApp } from "./app.js";

const app = createApp(prisma);

app.listen(config.port, () => {
  console.log(`Grimoire API server running on http://localhost:${config.port}`);
});
