var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var stdin_exports = {};
module.exports = __toCommonJS(stdin_exports);
var import_electron = require("electron");
console.log("---- electron/preload.ts ----");
const api = {
  pingStdOut: () => import_electron.ipcRenderer.invoke("pingStdOut"),
  sendStdIn: (input) => import_electron.ipcRenderer.invoke("sendStdIn", input),
  openDirectory: () => import_electron.ipcRenderer.invoke("openDirectory"),
  shellCommand: (command, args, options) => import_electron.ipcRenderer.invoke("shellCommand", command, args, options),
  saveCluiFlow: (cluiFlow) => import_electron.ipcRenderer.invoke("saveCluiFlow", cluiFlow),
  flowExists: (cluiFlow) => import_electron.ipcRenderer.invoke("flowExists", cluiFlow),
  updateCluiFlow: (flow) => import_electron.ipcRenderer.invoke("updateCluiFlow", flow),
  deleteCluiFlow: (path) => import_electron.ipcRenderer.invoke("deleteCluiFlow", path),
  listFlows: () => import_electron.ipcRenderer.invoke("listFlows"),
  getSettings: () => import_electron.ipcRenderer.invoke("getSettings"),
  openSettings: () => import_electron.ipcRenderer.invoke("openSettings"),
  openFlow: (fname) => import_electron.ipcRenderer.invoke("openFlow", fname),
  openInFinder: (path) => import_electron.ipcRenderer.invoke("openInFinder", path),
  openExternal: (path) => import_electron.ipcRenderer.invoke("openExternal", path)
};
window.api = api;
