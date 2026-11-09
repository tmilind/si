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
        },
      ],
    } },
});
