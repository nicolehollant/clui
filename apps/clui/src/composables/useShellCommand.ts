import type { SpawnOptions } from 'child_process'
import { ipcRenderer } from 'electron'

export function useShellCommand() {
  const standardInput = ref('')
  const output = ref({
    data: '',
    error: '',
    exitCode: {
      code: -1,
      message: 'Not yet run',
    },
  })
  async function sendCommand(command: string, args: string[], options: SpawnOptions) {
    let interval = setInterval(async () => {
      console.log('hmmmmm')
      // const curr = await ipcRenderer.invoke('pingStdOut')
      const curr = await window.api.pingStdOut()
      output.value = curr
    }, 500)
    // const result = await ipcRenderer.invoke('shellCommand', command, args, options)
    const result = await window.api.shellCommand(command, args, options)
    clearInterval(interval)
    output.value = result
  }
  async function sendStandardInput() {
    // await ipcRenderer.invoke('sendStdIn', standardInput.value)
    await window.api.sendStdIn(standardInput.value)
    standardInput.value = ''
  }
  return { output, sendCommand, sendStandardInput, standardInput }
}

export function useCwd() {
  const cwd = ref(process.cwd())
  async function cd() {
    // const result = await ipcRenderer.invoke('openDirectory')
    const result = await window.api.openDirectory()
    const settings = await window.api.getSettings()
    cwd.value = (result?.filePaths?.[0] + '').replace(settings.paths.home, '~') || cwd.value
  }
  return { cd, cwd }
}
