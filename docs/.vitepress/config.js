import { version } from '../../package.json';

export default {
  lang: 'en-US',
  title: 'SWR Vue',
  lastUpdated: true,
  base: '/swr-vue/',

  themeConfig: {
    nav: nav(),

    sidebar: sidebar(),

    socialLinks: [
      { icon: 'github', link: 'https://github.com/edumudu/swr-vue' }
    ],

    footer: {
      message: 'Released under the MIT License.',
    },

    editLink: {
      pattern: 'https://github.com/edumudu/swr-vue/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },
  }
}

function nav() {
  return [
    {
      text: version,
      items: [
        {
          text: 'Release Notes',
          link: 'https://github.com/edumudu/swr-vue/releases'
        },
        {
          text: 'Contributing',
          link: 'https://github.com/edumudu/swr-vue/blob/main/CONTRIBUTING.md'
        },
      ],
    },
  ]
}

function sidebar() {
  return [
    {
      text: 'Introduction',
      items: [
        { text: 'About', link: '/introduction' },
        { text: 'Getting started', link: '/getting-started' },
      ]
    },
    {
      text: 'Usage',
      items: [
        { text: 'Mutation', link: '/mutation' },
        { text: 'Global Configuration', link: '/global-configuration' },
        { text: 'Data Fetching', link: '/data-fetching' },
        { text: 'Error Handling', link: '/error-handling' },
        { text: 'Revalidation', link: '/revalidation' },
        { text: 'Conditional Fetching', link: '/conditional-fetching' },
        { text: 'Typescript', link: '/typescript' },
      ]
    },
    {
      text: 'API',
      items: [
        { text: 'Options', link: '/options' },
      ]
    },
  ]
}
