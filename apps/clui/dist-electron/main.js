var import_electron = require("electron");
var import_path = require("path");
var import_shell = require("./utils/shell");
var import_settings = require("./utils/settings");
var import_promises = require("fs/promises");
process.env.ROOT = (0, import_path.join)(__dirname, "..");
process.env.DIST = (0, import_path.join)(process.env.ROOT, "dist-electron");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL ? (0, import_path.join)(process.env.ROOT, "public") : (0, import_path.join)(process.env.ROOT, ".output/public");
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
const flowsDirectory = (0, import_path.join)(import_electron.app.getPath("userData"), "flows");
const archivedFlowsDirectory = (0, import_path.join)(import_electron.app.getPath("userData"), "archivedFlows");
let win;
const preload = (0, import_path.join)(process.env.DIST, "preload.js");
console.log({ preload });
async function ensureFlowsDirExists() {
  await (0, import_promises.mkdir)(flowsDirectory, { recursive: true });
  await (0, import_promises.mkdir)(archivedFlowsDirectory, { recursive: true });
  return;
}
function bootstrap() {
  console.log("BOOTSTRAPPING");
  ensureFlowsDirExists();
  const settings = (0, import_settings.bootstrapSettings)(import_electron.app);
  win = new import_electron.BrowserWindow({
    minWidth: 375,
    minHeight: 500,
    webPreferences: {
      preload,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      nodeIntegration: true,
      webSecurity: false
    }
  });
  win.webContents.send("settingsLoaded", settings);
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile((0, import_path.join)(process.env.VITE_PUBLIC, "index.html"));
  }
}
const cluiFlowHandlers = {
  shellCommand: async (event, ...args) => {
    const result = await (0, import_shell.runShellCommand)(args[0], args[1], args[2]);
    console.log(result);
    return result;
  },
  openDirectory: async (event, ...args) => {
    const result = await import_electron.dialog.showOpenDialog(win, {
      properties: ["openDirectory"]
    });
    return result;
  },
  saveCluiFlow: async (event, ...args) => {
    const cluiFlow = args[0];
    const cluiFlowPath = (0, import_path.join)(flowsDirectory, cluiFlow.title + ".json");
    await (0, import_promises.writeFile)(cluiFlowPath, JSON.stringify(cluiFlow));
    return cluiFlowPath;
  },
  updateCluiFlow: async (event, ...args) => {
    const { flow, path } = args[0];
    await (0, import_promises.writeFile)(path, JSON.stringify(flow));
    return path;
  },
  deleteCluiFlow: async (event, ...args) => {
    const settings = (0, import_settings.bootstrapSettings)(import_electron.app);
    const cluiFlowPath = (0, import_path.resolve)((0, import_path.normalize)(args[0].replace("~", settings.paths.home)));
    await (0, import_promises.rename)(cluiFlowPath, (0, import_path.join)(archivedFlowsDirectory, cluiFlowPath.split("/").at(-1) ?? ""));
    return cluiFlowPath;
  },
  listFlows: async (event, ...args) => {
    const files = await (0, import_promises.readdir)(flowsDirectory);
    const result = [];
    for (const file of files) {
      const currPath = (0, import_path.join)(flowsDirectory, file);
      const currentFile = await (0, import_promises.readFile)(currPath);
      try {
        const res = JSON.parse(currentFile.toString());
        result.push({
          path: currPath,
          flow: res
        });
      } catch (error) {
        continue;
      }
    }
    return result;
  },
  openSettings: async (event) => {
    import_electron.shell.showItemInFolder(import_electron.app.getPath("userData"));
    return;
  },
  openInFinder: async (event, ...args) => {
    const itemPath = args[0];
    const settings = (0, import_settings.bootstrapSettings)(import_electron.app);
    console.log({ itemPath });
    import_electron.shell.showItemInFolder((0, import_path.normalize)(itemPath.replace("~", settings.paths.home)));
    return;
  },
  openExternal: async (event, ...args) => {
    const itemPath = args[0];
    await import_electron.shell.openExternal(itemPath);
    return;
  },
  openFlow: async (event, ...args) => {
    const flowPath = args[0];
    const currentFile = await (0, import_promises.readFile)(flowPath);
    return currentFile.toString();
  },
  flowExists: async (event, ...args) => {
    const cluiFlow = args[0];
    const cluiFlowPath = (0, import_path.join)(flowsDirectory, cluiFlow.title + ".json");
    try {
      await (0, import_promises.access)(cluiFlowPath);
      return cluiFlowPath;
    } catch (error) {
      console.log(error);
      return "";
    }
  },
  getSettings: async (event, ...args) => {
    const settings = (0, import_settings.bootstrapSettings)(import_electron.app);
    return settings;
  }
};
for (const [key, value] of Object.entries(cluiFlowHandlers)) {
  import_electron.ipcMain.handle(key, value);
}
import_electron.app.whenReady().then(bootstrap);
