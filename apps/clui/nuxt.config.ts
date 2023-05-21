// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: './src/',
  modules: ['@nuxtjs/tailwindcss', 'nuxt-electron', 'nuxt-icon'],
  build: {
    transpile: ['highlight.js', 'fix-path', 'shell-env', 'vuedraggable', 'fix-path'],
  },
  extends: ['senp-ui'],
  electron: {
    renderer: {},
  },
  hooks: {},
  app: {
    head: {
      title: 'CLUI',
    },
  },
})
