import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  site: 'https://galadrimteam.github.io',
  base: 'adomin',
  integrations: [
    starlight({
      title: 'Adomin - Docs',
      favicon: 'favicon.png',
      social: {
        github: 'https://github.com/galadrimteam/adomin',
      },
      editLink: {
        baseUrl: 'https://github.com/galadrimteam/adomin/edit/main/docs/',
      },
      sidebar: [
        {
          label: 'Guides',
          autogenerate: { directory: 'guides', collapsed: true },
        },
        {
          label: 'Reference',
          items: [
            {
              label: 'Views',
              path: '/reference/views',
              autogenerate: { directory: 'reference/views', collapsed: true },
            },
            {
              label: 'Frontend',
              path: '/reference/frontend',
              autogenerate: { directory: 'reference/frontend', collapsed: true },
            },
          ],
        },
      ],
    }),
  ],
})
