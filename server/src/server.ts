import { buildApp } from "./app.js";
import { config } from "./config/env.js";

(async () => {
  const app = await buildApp();

  try {
    await app.listen({
      port: config.PORT,
      host: config.isProduction ? "0.0.0.0" : "localhost",
    });

    console.log(`🚀 Server running on http://${config.isProduction ? "0.0.0.0" : "localhost"}:${config.PORT}`);
    console.log(`📚 Docs at /docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
})();
