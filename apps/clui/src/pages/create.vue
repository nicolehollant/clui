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
        Create CLUI Flow
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
    <SenpButton @click="() => submit(false)">Submit Flow</SenpButton>
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
  <SenpModal :open="!!saveState.exists" @update:open="saveState.exists = ''">
    <HeadlessDialogTitle
      as="h3"
      class="z-10 -mx-6 text-lg font-medium leading-6 sticky top-0 bg-neutral-800/50 backdrop-blur border-b border-neutral-700 p-6"
    >
      Flow Already Exists
    </HeadlessDialogTitle>
    <div class="grid gap-4 relative py-6 z-0">
      <p>
        Do you want to overwrite the existing flow titled
        <button class="font-bold text-blue-400 hover:underline" @click="revealInFinder(saveState.exists)">
          {{ cluiFlow.title }}</button
        >?
      </p>
      <div class="max-h-80 rounded-lg overflow-auto">
        <SenpCodeEditor disabled language="json" theme="onedark" :model-value="saveState.flow"></SenpCodeEditor>
      </div>
      <div class="flex gap-2">
        <SenpButton @click="() => submit(true)">Overwrite</SenpButton>
        <SenpButton theme="secondary" @click="saveState.exists = ''">Cancel</SenpButton>
      </div>
    </div>
  </SenpModal>
</template>

<script setup lang="ts">
import type { ZodError } from 'zod'
import { CluiFlow, cluiVariableMap } from '~/composables/useCluiFlow'
const router = useRouter()
const { cd, cwd } = useCwd()
const saveState = reactive<{ flow: string; exists: string }>({
  flow: '',
  exists: '',
})
const { output, sendCommand, sendStandardInput, standardInput } = useShellCommand()
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
function revealInFinder(path: string) {
  window.api.openInFinder(path)
}
async function submit(overwrite = false) {
  const parsed = cluiFlowSchema.safeParse(cluiFlow.value)
  if (!parsed.success) {
    state.valid = 'invalid'
    state.error = parsed.error
    return
  }
  state.valid = 'valid'
  state.error = null
  saveState.exists = await window.api.flowExists(parsed.data)
  if (saveState.exists && !overwrite) {
    saveState.flow = JSON.stringify(JSON.parse(await window.api.openFlow(saveState.exists)), null, 2)
    return
  }
  const cluiPath = await window.api.saveCluiFlow(parsed.data)
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

const { exec, loading } = useLoading(async () => {
  await sendCommand(fullCommand.value.split(/\s+/)[0], [fullCommand.value.split(/\s+/).slice(1).join(' ')], {
    cwd: cluiFlow.value.cwd,
    shell: true,
  })
  return true
})

useHead({
  title: 'CLUI Create Flow',
})
</script>
