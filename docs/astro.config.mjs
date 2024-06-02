import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://galadrimteam.github.io",
  base: "adomin",
  integrations: [
    starlight({
      title: "Adomin - Docs",
      favicon: "favicon.png",
      social: {
        github: "https://github.com/galadrimteam/adomin",
      },
    }),
  ],
});
