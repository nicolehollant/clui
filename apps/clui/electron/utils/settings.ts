import os from 'os'
import fixPath from 'fix-path'

export function bootstrapSettings(app: Electron.App) {
  fixPath()
  const paths = {
    home: os.homedir(),
    appData: app.getPath('appData'),
    userData: app.getPath('userData'),
    tmp: app.getPath('temp'),
  }
  const theme: 'system' | 'dark' | 'light' = 'dark'
  const env = {
    PATH: process.env.PATH,
  }

  const settings = {
    paths,
    theme,
    env,
  }

  return settings
}
