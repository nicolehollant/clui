import { SpawnOptions } from 'child_process'
import { ipcRenderer } from 'electron'
import { CluiFlow } from '~/composables/useCluiFlow'
import { bootstrapSettings } from './utils/settings'

console.log('---- electron/preload.ts ----')

const api = {
  pingStdOut: () => ipcRenderer.invoke('pingStdOut'),
  sendStdIn: (input: string) => ipcRenderer.invoke('sendStdIn', input),
  openDirectory: () => ipcRenderer.invoke('openDirectory'),
  shellCommand: (command: string, args: string[], options: SpawnOptions) =>
    ipcRenderer.invoke('shellCommand', command, args, options),
  saveCluiFlow: (cluiFlow: CluiFlow) => ipcRenderer.invoke('saveCluiFlow', cluiFlow),
  flowExists: (cluiFlow: CluiFlow) => ipcRenderer.invoke('flowExists', cluiFlow),
  updateCluiFlow: (flow: { flow: CluiFlow; path: string }) => ipcRenderer.invoke('updateCluiFlow', flow),
  deleteCluiFlow: (path: string) => ipcRenderer.invoke('deleteCluiFlow', path),
  listFlows: () => ipcRenderer.invoke('listFlows'),
  getSettings: (): Promise<ReturnType<typeof bootstrapSettings>> => ipcRenderer.invoke('getSettings'),
  openSettings: () => ipcRenderer.invoke('openSettings'),
  openFlow: (fname: string): Promise<string> => ipcRenderer.invoke('openFlow', fname),
  openInFinder: (path: string) => ipcRenderer.invoke('openInFinder', path),
  openExternal: (path: string) => ipcRenderer.invoke('openExternal', path),
}

export type ElectronAPI = typeof api
window.api = api
