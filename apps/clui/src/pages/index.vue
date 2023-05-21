<template>
  <div
    class="flex items-center justify-between gap-12 sticky top-0 px-8 py-6 z-30 backdrop-blur bg-gradient-to-r from-black/60 to-neutral-900/30 border-b border-neutral-800"
  >
    <header class="shrink-0">
      <div class="flex items-center gap-4">
        <img src="@/assets/icon.png" class="w-8 h-8" />
        <h1
          class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-500 via-teal-500 to-lime-600"
        >
          CLUI
        </h1>
      </div>
    </header>
    <SenpMenu>
      <template #trigger>
        <SenpButton theme="secondary">
          <Icon name="heroicons:cog-20-solid"></Icon>
        </SenpButton>
      </template>
      <template #items>
        <div class="divide-y divide-neutral-700">
          <SenpMenuItem
            @click="openSettings"
            rounded="top"
            leading="heroicons:folder-open"
            label="Show AppData in Finder"
          />
          <div class="flex gap-4 items-center px-2 py-2 text-sm text-neutral-400 font-medium">
            <Icon name="heroicons:information-circle"></Icon>
            <p class="text-xs leading-5">Version 0.0.1</p>
          </div>
        </div>
      </template>
    </SenpMenu>
  </div>
  <div v-if="loading" class="w-full h-full flex items-center justify-center">
    <div class="pb-40">
      <Icon name="svg-spinners:blocks-wave" class="w-40 h-40 md:w-64 md:h-64 text-neutral-600 animate-pulse"></Icon>
    </div>
  </div>
  <main class="p-8 h-full relative" v-else>
    <SenpTextInput v-model="filter" label="Filter Flows"></SenpTextInput>
    <div
      class="mt-4 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-40 [&:has(a:hover)_a]:blur-[2px] [&:has(a:hover)_a]:opacity-40 [&:has(a:hover)_a:hover]:!blur-none [&:has(a:hover)_a:hover]:!opacity-100 [&:has(a:hover)_a:hover]:scale-105 [&_a]:transition [&_a]:duration-300"
    >
      <NuxtLink
        v-for="flow in filteredFlows"
        :to="{ path: '/flow', query: { path: flow.path } }"
        :key="flow.path"
        class="focus:outline-none focus:ring rounded-lg"
      >
        <SenpCard type="header" :title="flow.flow.title" class="h-full">
          <p class="flex-1">{{ flow.flow.description }}</p>
          <div class="flex flex-wrap gap-4">
            <SenpTag :key="flow.path + '-tag-' + tag" v-for="tag in flow.flow.tags">
              {{ tag }}
            </SenpTag>
          </div>
        </SenpCard>
      </NuxtLink>
    </div>
  </main>
  <NuxtLink
    to="/create"
    class="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center"
  >
    <Icon name="mdi:plus" size="32"></Icon>
  </NuxtLink>
</template>

<script setup lang="ts">
import Fuse from 'fuse.js'
import { CluiFlow } from '~/composables/useCluiFlow'

const filter = ref('')

const flows = ref<{ flow: CluiFlow; path: string }[]>([])
const searcher = ref<Fuse<any>>()

const filteredFlows = computed(() => {
  if (!filter.value || !searcher.value) {
    return flows.value
  }
  return searcher.value.search(filter.value).map((a) => a.item)
})

function openSettings() {
  window.api.openSettings()
}

const { exec, loading } = useLoading(async () => {
  const res = await window.api.listFlows()
  flows.value = res
  searcher.value = new Fuse(flows.value, {
    keys: [
      {
        name: 'flow.title',
        weight: 1,
      },
      {
        name: 'flow.tags',
        weight: 0.6,
      },
      {
        name: 'flow.description',
        weight: 0.2,
      },
      {
        name: 'path',
        weight: 0.3,
      },
    ],
  })
})

onMounted(() => {
  exec()
})

useHead({
  title: 'CLUI Home',
})
</script>
