<template>
  <div
    class="flex items-center justify-between gap-12 sticky top-0 px-8 py-4 z-30 backdrop-blur bg-gradient-to-r from-black/60 to-neutral-900/30 border-b border-neutral-800"
  >
    <header class="shrink-0">
      <NuxtLink to="/" class="w-max flex items-center gap-3">
        <img src="@/assets/icon.png" class="w-4 h-4" />
        <h1 class="sm:text-xl text-neutral-500 w-max hover:text-blue-500 transition">CLUI /</h1>
      </NuxtLink>
      <h2
        class="font-bold text-3xl text-transparent bg-clip-text bg-gradient-to-br from-blue-500 via-teal-500 to-lime-600"
      >
        Edit CLUI Flow
      </h2>
    </header>
  </div>
  <div v-if="cluiFlow && fullCommand != null" class="p-8 space-y-6 pb-96">
    <SenpTextInput label="Title" v-model="cluiFlow.title"></SenpTextInput>
    <SenpTextArea v-model="cluiFlow.description" label="Description"></SenpTextArea>
    <ListEditor
      label="Dependencies"
      description="List of dependencies for the CLUI Flow. Leave url blank to omit from an entry"
      :labels="['name', 'url?']"
      v-model="listEditors.dependencies"
    ></ListEditor>

    <label class="grid gap-1">
      <p class="text-sm text-neutral-50">CWD</p>
      <SenpCard
        :classes="{
          wrapper: {
            extend: 'flex items-center gap-2 w-full [&:has(input:focus)]:ring !flex-row',
          },
        }"
      >
        <input
          type="text"
          class="focus:outline-none bg-transparent border-0 outline-none ring-0 w-full !p-0 focus:ring-0 focus:ring-offset-0"
          v-model="cwd"
        />
        <button @click="cd" class="text-blue-500">change</button>
      </SenpCard>
    </label>

    <ListEditor
      label="Inputs"
      description="List of inputs for the CLUI Flow. Name is replaced with current value in the command builder. Value is used as a default value. Type can target different inputs, use 'string', 'file', or 'boolean'"
      :labels="['name', 'value', 'type']"
      v-model="listEditors.inputs"
    ></ListEditor>

    <label class="grid gap-1">
      <p class="text-sm text-neutral-50">Command Builder</p>
      <SenpCard class="grid gap-2">
        <p class="text-sm text-neutral-200">
          The command builder is the shell command run based on your inputs, keys from the variable map below will be
          replaced with their respective values
        </p>
        <SenpTextArea v-model="cluiFlow.commandBuilder"></SenpTextArea>
        <div class="grid gap-1">
          <p class="text-xs font-bold text-neutral-400">Preview</p>
          <div class="bg-black/20 rounded-lg p-4">
            <p class="text-sm text-blue-500">
              {{ cwd }}
            </p>
            <p class="mt-2 text-sm text-neutral-200">
              <code class="font-bold text-blue-500 mr-2">&gt;</code>

              {{ fullCommand }}
            </p>
          </div>
        </div>

        <details>
          <summary class="text-neutral-700">
            <p class="inline ml-2 text-neutral-200">variable map</p>
          </summary>
          <table
            class="[&_td]:py-2 [&_td]:px-4 mt-2 [&_td]:border [&_td]:border-neutral-800 rounded-lg overflow-hidden ring-1 ring-neutral-800"
          >
            <thead>
              <td class="text-sm font-bold text-neutral-400">Key</td>
              <td class="text-sm font-bold text-neutral-400">Value</td>
            </thead>
            <tr v-for="(value, key, index) in cluiVariableMap" :key="'clui-var-' + index">
              <td>{{ key }}</td>
              <td>{{ value() }}</td>
            </tr>
            <tr v-for="(entry, index) in listEditors.inputs" :key="'input-name-' + index">
              <td>{{ entry[0] }}</td>
              <td>{{ entry[1] }} <span class="text-xs text-neutral-400">(or current value)</span></td>
            </tr>
          </table>
        </details>
      </SenpCard>
    </label>
    <ListEditor
      label="Tags"
      description="Tags to help you find this!"
      :labels="['name']"
      v-model="listEditors.tags"
    ></ListEditor>
    <hr class="border-neutral-800" />
    <div class="flex items-center gap-4">
      <SenpButton @click="updateFlow">Update Flow</SenpButton>
      <SenpButton @click="saveAsNewFlow">Save As New Flow</SenpButton>
      <NuxtLink :to="{ path: '/flow', query: { path: ($route as any).query.path } }">
        <SenpButton theme="secondary">Cancel</SenpButton>
      </NuxtLink>
    </div>
    <SenpCard
      :classes="{ wrapper: { extend: '!bg-red-900/20' } }"
      type="header"
      title="Invalid"
      v-if="state.valid === 'invalid'"
    >
      <ul>
        <li class="list-item list-inside" v-for="err in state.error?.flatten()">
          {{ err }}
        </li>
      </ul>
    </SenpCard>
  </div>
</template>

<script setup lang="ts">
import type { ZodError } from 'zod'
import { CluiFlow, cluiVariableMap } from '~/composables/useCluiFlow'
const route = useRoute()
const router = useRouter()
const loadingFlow = ref(false)
const flowPath = ref('')
const { cd, cwd } = useCwd()
const { fullCommand, cluiFlow, cluiFlowSchema } = useCluiFlow('')
const listEditors = reactive({
  dependencies: [] as [string, string][],
  tags: [] as [string][],
  inputs: [] as [string, string, string][],
  outputs: [],
})
const state = reactive({
  valid: 'unchecked' as 'unchecked' | 'valid' | 'invalid',
  error: null as null | ZodError<(typeof cluiFlowSchema)['_input']>,
})

async function updateFlow() {
  const parsed = cluiFlowSchema.safeParse(cluiFlow.value)
  if (!parsed.success) {
    state.valid = 'invalid'
    state.error = parsed.error
    return
  }
  state.valid = 'valid'
  state.error = null
  const cluiPath = await window.api.updateCluiFlow({
    flow: parsed.data,
    path: route.query.path + '',
  })
  state.error = cluiPath
  router.push({ path: '/flow', query: { path: cluiPath } })
}

async function saveAsNewFlow() {
  const parsed = cluiFlowSchema.safeParse(cluiFlow.value)
  if (!parsed.success) {
    state.valid = 'invalid'
    state.error = parsed.error
    return
  }
  state.valid = 'valid'
  state.error = null
  let suffix = 0
  let exists = await window.api.flowExists({ ...parsed.data })
  while (exists) {
    suffix += 1
    exists = await window.api.flowExists({ ...parsed.data, title: parsed.data.title + ` (${suffix})` })
  }
  const cluiPath = await window.api.saveCluiFlow({
    ...parsed.data,
    title: parsed.data.title + (suffix > 0 ? ` (${suffix})` : ''),
  })
  state.error = cluiPath
  router.push({ path: '/flow', query: { path: cluiPath } })
}

watch(
  () => listEditors.dependencies,
  () => {
    cluiFlow.value.dependencies = listEditors.dependencies.map((value) => {
      if (value[1]) {
        return { name: value[0], url: value[1] }
      }
      return value[0]
    })
  },
  { deep: true }
)

watch(
  () => listEditors.inputs,
  () => {
    cluiFlow.value.inputs = listEditors.inputs.map((value) => {
      return {
        name: value[0],
        value: value[1],
        type: (['string', 'file', 'boolean'].includes(value[2]) ? value[2] : 'string') as 'string' | 'file' | 'boolean',
      }
    })
  },
  { deep: true }
)

watch(
  () => listEditors.tags,
  () => {
    cluiFlow.value.tags = listEditors.tags.map((value) => {
      return value[0]
    })
  },
  { deep: true }
)

function cluiFlowToListEditor(flow: CluiFlow): {
  dependencies: [string, string][]
  tags: [string][]
  inputs: [string, string, string][]
} {
  return {
    dependencies:
      flow.dependencies?.map((value) => {
        if (typeof value === 'string') {
          return [value, '']
        }
        return [value.name, value.url]
      }) ?? [],
    tags:
      flow.tags?.map((value) => {
        return [value]
      }) ?? [],
    inputs:
      flow.inputs?.map((value) => {
        return [value.name, value.value ?? '', value.type]
      }) ?? [],
  }
}

const title = ref('CLUI Edit')

onMounted(async () => {
  if (!route.query.path) {
    router.push('/')
  }
  const flow = await window.api.openFlow(route.query.path + '')
  cluiFlow.value = cluiFlowSchema.parse(JSON.parse(flow))
  title.value = 'CLUI Edit - ' + cluiFlow.value.title
  const { dependencies, tags, inputs } = cluiFlowToListEditor(cluiFlow.value)
  listEditors.dependencies = dependencies
  listEditors.tags = tags
  listEditors.inputs = inputs
  const settings = await window.api.getSettings()
  cwd.value = cwd.value.replace(settings.paths.home, '~')
  flowPath.value = (route.query.path + '').replace(settings.paths.home, '~')
  loadingFlow.value = false
})

useHead({
  title: title,
})
</script>
