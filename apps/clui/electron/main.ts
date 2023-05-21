import { app, BrowserWindow, contextBridge, dialog, ipcMain, ipcRenderer, shell } from 'electron'
import { join, normalize, resolve } from 'path'
import { runShellCommand } from './utils/shell'
import { bootstrapSettings } from './utils/settings'
import { CluiFlow } from '~/composables/useCluiFlow'
import { mkdir, writeFile, readdir, readFile, rename, access } from 'fs/promises'
import { ElectronAPI } from './preload'

process.env.ROOT = join(__dirname, '..')
process.env.DIST = join(process.env.ROOT, 'dist-electron')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.ROOT, 'public')
  : join(process.env.ROOT, '.output/public')
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

const flowsDirectory = join(app.getPath('userData'), 'flows')
const archivedFlowsDirectory = join(app.getPath('userData'), 'archivedFlows')

let win: BrowserWindow
const preload = join(process.env.DIST, 'preload.js')

console.log({ preload })

async function ensureFlowsDirExists() {
  await mkdir(flowsDirectory, { recursive: true })
  await mkdir(archivedFlowsDirectory, { recursive: true })
  return
}

function bootstrap() {
  console.log('BOOTSTRAPPING')
  ensureFlowsDirExists()
  const settings = bootstrapSettings(app)
  win = new BrowserWindow({
    minWidth: 375,
    minHeight: 500,
    webPreferences: {
      preload,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      nodeIntegration: true,
      webSecurity: false,
    },
  })

  win.webContents.send('settingsLoaded', settings)

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    // win.webContents.openDevTools()
  } else {
    win.loadFile(join(process.env.VITE_PUBLIC!, 'index.html'))
  }
}
// updateCluiFlow: (flow: { flow: CluiFlow; path: string }) => ipcRenderer.invoke('updateCluiFlow', flow),
//   deleteCluiFlow: (path: string) => ipcRenderer.invoke('deleteCluiFlow', path),
type CluiFlowHandlers = {
  [k in keyof Omit<ElectronAPI, 'pingStdOut' | 'sendStdIn'>]: (
    event: Electron.IpcMainInvokeEvent,
    ...params: Parameters<ElectronAPI[k]>
  ) => ReturnType<ElectronAPI[k]>
}

const cluiFlowHandlers = {
  shellCommand: async (event, ...args) => {
    const result = await runShellCommand(args[0], args[1], args[2])
    console.log(result)
    return result
  },
  openDirectory: async (event, ...args) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
    })
    return result
  },
  saveCluiFlow: async (event, ...args) => {
    const cluiFlow = args[0] as CluiFlow
    const cluiFlowPath = join(flowsDirectory, cluiFlow.title + '.json')
    await writeFile(cluiFlowPath, JSON.stringify(cluiFlow))
    return cluiFlowPath
  },
  updateCluiFlow: async (event, ...args) => {
    const { flow, path } = args[0]
    await writeFile(path, JSON.stringify(flow))
    return path
  },
  deleteCluiFlow: async (event, ...args) => {
    const settings = bootstrapSettings(app)
    const cluiFlowPath = resolve(normalize(args[0].replace('~', settings.paths.home)))
    await rename(cluiFlowPath, join(archivedFlowsDirectory, cluiFlowPath.split('/').at(-1) ?? ''))
    return cluiFlowPath
  },
  listFlows: async (event, ...args) => {
    const files = await readdir(flowsDirectory)
    const result: { flow: CluiFlow; path: string }[] = []
    for (const file of files) {
      const currPath = join(flowsDirectory, file)
      const currentFile = await readFile(currPath)
      try {
        const res = JSON.parse(currentFile.toString())
        result.push({
          path: currPath,
          flow: res,
        })
      } catch (error) {
        continue
      }
    }
    return result
  },
  openSettings: async (event) => {
    shell.showItemInFolder(app.getPath('userData'))
    return
  },
  openInFinder: async (event, ...args) => {
    const itemPath = args[0]
    const settings = bootstrapSettings(app)
    console.log({ itemPath })
    shell.showItemInFolder(normalize(itemPath.replace('~', settings.paths.home)))
    return
  },
  openExternal: async (event, ...args) => {
    const itemPath = args[0]
    await shell.openExternal(itemPath)
    return
  },
  openFlow: async (event, ...args) => {
    const flowPath = args[0]
    const currentFile = await readFile(flowPath)
    return currentFile.toString()
  },
  flowExists: async (event, ...args) => {
    const cluiFlow = args[0]
    const cluiFlowPath = join(flowsDirectory, cluiFlow.title + '.json')
    try {
      await access(cluiFlowPath)
      return cluiFlowPath
    } catch (error) {
      console.log(error)
      return ''
    }
  },
  getSettings: async (event, ...args) => {
    const settings = bootstrapSettings(app)
    return settings
  },
} satisfies CluiFlowHandlers

for (const [key, value] of Object.entries(cluiFlowHandlers)) {
  ipcMain.handle(key, value)
}

// ipcMain.handle('shellCommand', async (event, ...args) => {
//   const result = await runShellCommand(args[0], args[1], args[2])
//   console.log(result)
//   return result
// })

// ipcMain.handle('openDirectory', async (event, ...args) => {
//   const result = await dialog.showOpenDialog(win, {
//     properties: ['openDirectory'],
//   })
//   return result
// })

// ipcMain.handle('saveCluiFlow', async (event, ...args) => {
//   const cluiFlow = args[0] as CluiFlow
//   const cluiFlowPath = join(flowsDirectory, cluiFlow.title + '.json')
//   await writeFile(cluiFlowPath, JSON.stringify(cluiFlow))
//   return cluiFlowPath
// })

// ipcMain.handle('listFlows', async (event, ...args) => {
//   const files = await readdir(flowsDirectory)
//   const result: { flow: CluiFlow; path: string }[] = []
//   for (const file of files) {
//     const currPath = join(flowsDirectory, file)
//     const currentFile = await readFile(currPath)
//     try {
//       const res = JSON.parse(currentFile.toString())
//       result.push({
//         path: currPath,
//         flow: res,
//       })
//     } catch (error) {
//       continue
//     }
//   }
//   return result
// })

// ipcMain.handle('openSettings', async (event, ...args) => {
//   shell.showItemInFolder(app.getPath('userData'))
//   return
// })

// ipcMain.handle('openInFinder', async (event, ...args) => {
//   const itemPath = args[0]
//   const settings = bootstrapSettings(app)
//   console.log({ itemPath })
//   shell.showItemInFolder(normalize(itemPath.replace('~', settings.paths.home)))
//   return
// })

// ipcMain.handle('openFlow', async (event, ...args) => {
//   const flowPath = args[0]
//   const currentFile = await readFile(flowPath)

//   return currentFile.toString()
// })

// ipcMain.handle('getSettings', async (event, ...args) => {
//   const settings = bootstrapSettings(app)
//   return settings
// })

app.whenReady().then(bootstrap)
