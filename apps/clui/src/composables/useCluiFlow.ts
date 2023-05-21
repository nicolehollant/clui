import { z } from 'zod'
export const cluiVariableMap = {
  '@CWD': () => process.cwd(),
  '@NOW': () => Date.now(),
}

export type CluiFlow = {
  // title of the flow, searchable
  title: string
  // description of the flow, searchable
  description: string
  // tags for the flow, searchable
  tags: string[]
  // working directory to run the flow from
  cwd?: string
  // list of dependencies for the flow (i.e. ffmpeg, python, imagemagick)
  dependencies?: (string | { name: string; url: string })[]
  // list of inputs for the flow. type 'string' will create a text input mapped to the 'value' property, a 'boolean' type will create a checkbox, and a 'file' type will add a drag and drop file input in the UI that sets the 'value' property as the path to the uploaded file
  inputs: {
    name: string
    value?: any
    type: 'string' | 'file' | 'boolean'
  }[]
  // creates a command that is run from the specified working directory. all occurences of the inputs' 'name' properties will be replaced with their respective values
  commandBuilder: string
  outputs: {
    name: string
    value?: any
    type: 'string' | 'file' | 'null'
  }[]
}

const cluiFlowSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.string().array(),
  cwd: z.string().optional(),
  dependencies: z.union([z.string(), z.object({ name: z.string(), url: z.string() })]).array(),
  inputs: z
    .object({
      name: z.string(),
      value: z.any().default(null),
      type: z.union([z.literal('string'), z.literal('file'), z.literal('boolean')]),
    })
    .array(),
  commandBuilder: z.string(),
  outputs: z
    .object({
      name: z.string(),
      value: z.any().default(null),
      type: z.union([z.literal('string'), z.literal('file'), z.literal('null')]),
    })
    .array(),
})

export function useCluiFlow(maybeCluiFlow: any) {
  const cluiFlow = ref<CluiFlow>(
    (() => {
      try {
        if (typeof maybeCluiFlow === 'string') {
          maybeCluiFlow = maybeCluiFlow.replaceAll('@CWD', process.cwd())
          return cluiFlowSchema.parse(JSON.parse(maybeCluiFlow))
        }
        const result = cluiFlowSchema.parse(maybeCluiFlow)
        if (result.cwd === '@CWD') {
          result.cwd = process.cwd()
        }
        return result
      } catch (error) {
        return {
          title: 'Say Hello',
          description: 'prints a message to the screen',
          dependencies: [],
          tags: ['hello', 'world'],
          cwd: process.cwd(),
          inputs: [
            {
              name: '[message]',
              type: 'string',
              value: 'World @NOW',
            },
          ],
          commandBuilder: 'echo "[message]"',
          outputs: [],
        }
      }
    })()
  )

  const fullCommand = computed(() => {
    if (!cluiFlow.value?.commandBuilder) {
      return ''
    }
    let result = cluiFlow.value.commandBuilder
    cluiFlow.value.inputs.forEach((input) => {
      if (input.type === 'file' && !!input.value?.path) {
        result = result.replaceAll(input.name, '"' + (input.value as File)?.path.replaceAll('"', '"') + '"')
      } else if (input.type === 'string' && input.value != null) {
        result = result.replaceAll(input.name, input.value as string)
      }
    })
    Object.entries(cluiVariableMap).forEach(([key, value]) => {
      result = result.replaceAll(key, value() + '')
    })
    return result
  })

  return { cluiFlow, fullCommand, cluiFlowSchema }
}
