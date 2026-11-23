import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sourceintellect.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
  markdown: { shikiConfig: {
      theme: 'github-light',
      // Astro does not forward Shiki's colorReplacements, so swap the inline <pre> background ourselves.
      transformers: [
        {
          pre(node) {
            const style = node.properties.style;
            if (typeof style === 'string') {
              node.properties.style = style.replace(/background-color:\s*#(?:fff|ffffff)\b/i, 'background-color:#f1f3f4');
            }
          },
          // Astro caches rendered Markdown and does not notice edits to these functions:
          // after changing them, delete node_modules/.astro/data-store.json before building.
          // github-light's keyword red (#D73A49) is 4.11:1 on the grey code background; use its darker red (6.0:1).
          code(node) {
            const walk = (n) => {
              const style = n.properties?.style;
              if (typeof style === 'string') n.properties.style = style.replace(/#D73A49/gi, '#B31D28');
              n.children?.forEach(walk);
            };
            walk(node);
          },
        },
      ],
    } },
});
