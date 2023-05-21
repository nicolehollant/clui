import { defaultTheme, defineUserConfig } from 'vuepress'

export default defineUserConfig({
  lang: 'en-US',
  title: 'CLUI',
  description: 'little thing so that you can create and save basic UIs around your CLI tools 🥰',
  head: [['link', { rel: 'icon', href: '/images/favicon.png' }]],
  theme: defaultTheme({
    logo: '/images/favicon.png',
    repo: 'nicolehollant/clui',
    sidebar: ['/guide', '/guide/walkthrough'],
    navbar: [
      {
        text: 'Download',
        link: 'https://github.com/nicolehollant/clui/releases',
      },
    ],
  }),
})
