<template>
  <section class="min-h-full h-full overflow-auto">
    <div
      class="flex items-center justify-between gap-12 sticky top-0 px-8 py-4 z-30 backdrop-blur bg-gradient-to-r from-black/60 to-neutral-900/30 border-b border-neutral-800"
    >
      <header class="shrink-0 w-full">
        <NuxtLink to="/" class="w-max flex items-center gap-3">
          <img src="@/assets/icon.png" class="w-4 h-4" />
          <h1 class="sm:text-xl text-neutral-500 w-max hover:text-blue-500 transition">CLUI /</h1>
        </NuxtLink>
        <div class="flex items-center justify-between w-full">
          <Loader v-if="loadingFlow" />
          <h2
            class="font-bold text-xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-br from-blue-500 via-teal-500 to-lime-600"
            v-else
          >
            {{ cluiFlow.title }}
          </h2>
          <SenpMenu>
            <template #trigger>
              <SenpButton :title="flowPath" theme="secondary">
                <Icon name="heroicons:cog-20-solid"></Icon>
              </SenpButton>
            </template>
            <template #items>
              <div class="divide-y divide-neutral-700">
                <SenpMenuItem
                  @click="revealInFinder"
                  rounded="top"
                  leading="heroicons:folder-open"
                  label="Show In Finder"
                />
                <NuxtLink :to="{ path: '/flow/edit', query: { path: ($route as any).query.path } }" class="block">
                  <SenpMenuItem rounded="none" leading="heroicons:pencil-square-solid" label="Edit Flow" />
                </NuxtLink>
                <SenpMenuItem
                  class="text-red-400"
                  active-class="bg-red-900/50 !text-red-100"
                  @click="modals.deleteFlow = true"
                  rounded="bottom"
                  leading="heroicons:trash"
                  label="Delete Flow"
                />
              </div>
            </template>
          </SenpMenu>
        </div>
      </header>
    </div>
    <div v-if="loadingFlow" class="w-full h-full flex items-center justify-center">
      <div class="pb-40">
        <Icon name="svg-spinners:blocks-wave" class="w-40 h-40 md:w-64 md:h-64 text-neutral-600 animate-pulse"></Icon>
      </div>
    </div>
    <div v-else-if="flowPath" class="p-8 pb-40 space-y-6">
      <h3 class="text-xl font-semibold">Flow Inputs</h3>
      <div v-for="input in cluiFlow.inputs" :key="input.name">
        <label class="grid gap-1" v-if="input.type === 'file'">
          <p class="text-sm text-neutral-50">{{ input.name }}</p>
          <SenpFileInput v-model="(input.value as any)" read-as="file"></SenpFileInput>
        </label>
        <SenpTextInput
          v-if="input.type === 'string'"
          v-model="(input.value as any)"
          :label="input.name"
        ></SenpTextInput>
      </div>
      <SenpCard type="header" title="Command">
        <div class="flex items-center gap-2 w-full [&:has(input:focus)]:ring !flex-row p-2 rounded-lg">
          <input
            type="text"
            class="focus:outline-none bg-transparent border-0 outline-none ring-0 w-full !p-0 focus:ring-0 focus:ring-offset-0 text-blue-400"
            v-model="cwd"
          />
          <button @click="cd" class="text-blue-500 w-max">cd</button>
        </div>

        <hr class="border-neutral-800" />
        <div class="flex gap-4 p-2">
          <p class="select-none font-bold text-blue-500">&gt;</p>
          <p>
            <code class="text-teal-300"
              ><span class="text-lime-400 font-semibold">{{ fullCommand.split(/\s+/)[0] }}</span>
              <span
                v-for="(char, i) in fullCommand.replace(fullCommand.split(/\s+/)[0] + '', '').split('')"
                :key="'fullCommand' + i + char"
                :class="{
                  'text-blue-400': char === '/',
                  'text-pink-400': char === '.',
                  'text-green-400': char === '~',
                  'text-rose-400': char === '[' || char === ']',
                  'text-orange-400': char === ';' || char === '&',
                }"
              >
                {{ char }}
              </span>
            </code>
          </p>
        </div>
      </SenpCard>
      <Loader v-if="loading" />
      <SenpCard :classes="{ wrapper: { extend: output.exitCode.message === 'Success' ? '!bg-green-900/30' : '' } }">
        <p v-if="output.exitCode.message" class="text-lg font-bold">{{ output.exitCode.message }}</p>
        <p v-if="output.data" class="whitespace-pre-wrap">{{ output.data }}</p>
        <p v-if="output.error" class="whitespace-pre-wrap">{{ output.error }}</p>
        <SenpCard
          v-if="loading"
          :classes="{
            wrapper: {
              extend: 'flex  items-center gap-2 w-full [&:has(input:focus)]:ring !flex-row',
            },
          }"
        >
          <p><code class="text-lg font-bold text-blue-500">&gt;</code></p>
          <input
            type="text"
            class="focus:outline-none bg-transparent border-0 outline-none ring-0 w-full !p-0 focus:ring-0 focus:ring-offset-0"
            v-model="standardInput"
            @keydown.enter.prevent="sendStandardInput"
          />
          <button @click="sendStandardInput" class="text-blue-500">send</button>
        </SenpCard>
      </SenpCard>
      <SenpButton @click="submit">Submit</SenpButton>
      <div class="py-6">
        <hr class="border-neutral-800" />
      </div>
      <h3 class="text-xl font-semibold">Flow Details</h3>
      <p>
        {{ cluiFlow.description }}
      </p>
      <div class="flex flex-wrap gap-4">
        <SenpTag theme="neutral" v-for="tag in cluiFlow.tags">{{ tag }}</SenpTag>
      </div>
      <details v-if="cluiFlow.dependencies?.length">
        <summary class="text-neutral-700">
          <p class="inline ml-2 text-neutral-200">dependencies</p>
        </summary>
        <ul class="px-2 py-4 border-l-2 border-neutral-800 ml-1">
          <li v-for="dependency in cluiFlow.dependencies" class="list-item list-disc list-inside pl-2 text-neutral-500">
            <a
              v-if="typeof dependency === 'object'"
              :href="dependency.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-200 inline underline"
            >
              {{ dependency.name }}
            </a>
            <p v-else class="text-neutral-200 inline">
              {{ dependency }}
            </p>
          </li>
        </ul>
      </details>
      <details>
        <summary class="text-neutral-700">
          <p class="inline ml-2 text-neutral-200">flow definition</p>
        </summary>
        <div class="pt-4">
          <SenpCodeEditor
            :model-value="JSON.stringify(cluiFlow, null, 2)"
            language="json"
            theme="onedark"
            disabled
          ></SenpCodeEditor>
        </div>
      </details>
    </div>
  </section>
  <SenpModal title="Delete Flow" v-model:open="modals.deleteFlow">
    <p>Are you sure you want to delete this flow?</p>
    <div class="flex gap-2 mt-4">
      <SenpButton @click="deleteFlow">Delete Flow</SenpButton>
      <SenpButton @click="modals.deleteFlow = false" theme="secondary">Cancel</SenpButton>
    </div>
  </SenpModal>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const loadingFlow = ref(true)
const flowPath = ref('')
const modals = reactive({
  deleteFlow: false,
})
const { cd, cwd } = useCwd()
const { output, sendCommand, sendStandardInput, standardInput } = useShellCommand()
const { fullCommand, cluiFlow, cluiFlowSchema } = useCluiFlow('')
const { exec: submit, loading } = useLoading(async () => {
  console.log({
    'cluiFlow.value.cwd': cluiFlow.value.cwd,
    'cwd.value': cwd.value,
  })
  await sendCommand(fullCommand.value.split(/\s+/)[0], [fullCommand.value.split(/\s+/).slice(1).join(' ')], {
    cwd: cwd.value.replace('~', homeDir.value),
    shell: true,
  })
  return true
})

function revealInFinder() {
  window.api.openInFinder(flowPath.value)
}

async function deleteFlow() {
  await window.api.deleteCluiFlow(flowPath.value)
  router.push('/')
}

const title = ref('CLUI Flow')
const homeDir = ref('~')

onMounted(async () => {
  if (!route.query.path) {
    router.push('/')
  }
  try {
    const flow = await window.api.openFlow(route.query.path + '')
    cluiFlow.value = cluiFlowSchema.parse(JSON.parse(flow))
    title.value = 'CLUI Flow - ' + cluiFlow.value.title
    const settings = await window.api.getSettings()
    homeDir.value = settings.paths.home
    cwd.value = cluiFlow.value?.cwd
      ? cluiFlow.value.cwd.replace(settings.paths.home, '~')
      : cwd.value.replace(settings.paths.home, '~')
    flowPath.value = (route.query.path + '').replace(settings.paths.home, '~')
    loadingFlow.value = false
  } catch (error) {
    router.push('/')
  }
})

useHead({
  title: title,
})
</script>
