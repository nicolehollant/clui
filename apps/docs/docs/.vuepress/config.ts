import { defaultTheme, defineUserConfig } from 'vuepress'

export default defineUserConfig({
  lang: 'en-US',
  title: 'CLUI',
  description: 'little thing so that you can create and save basic UIs around your CLI tools 🥰',
  theme: defaultTheme({
    logo: '/images/favicon.png',
    repo: 'nicolehollant/clui',
    sidebar: ['/guide', '/guide/walkthrough'],
    navbar: [
      {
        text: 'Download',
        link: '#',
      },
    ],
  }),
})
