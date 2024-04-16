import * as vscode from 'vscode'
import nodeNotifier from 'node-notifier'

let saveCounter = 0

// listen for save events and show a notification
export function activate(context: vscode.ExtensionContext) {
  // ensure the extension is activated
  console.log(
    'Congratulations, your extension "reflectivecoder" is now active!'
  )

  let disposable = vscode.workspace.onDidSaveTextDocument(
    (document: vscode.TextDocument) => {
      // Check if the file is not settings.json
      if (!document.uri.fsPath.includes('settings.json')) {
        const config = vscode.workspace.getConfiguration('reflectiveCoder')
        const enableNotifications = config.get<boolean>('enableNotifications')
        const notificationFrequency =
          config.get<number>('notificationFrequency') ?? 1
        const customMessage = config.get<string>('customMessage') ?? ''
        const silentHours = config.get<string>('silentHours') ?? ''

        if (enableNotifications && checkSilentHours(silentHours)) {
          saveCounter++
          if (saveCounter >= notificationFrequency) {
            vscode.window.showInformationMessage(customMessage)
            saveCounter = 0 // Reset counter
          }
        }
      }
    }
  )

  context.subscriptions.push(disposable)
}

// Check if the current time is within the silent hours
function checkSilentHours(silentHours: string): boolean {
  if (!silentHours) return true

  const [start, end] = silentHours.split('-')
  const now = new Date()
  const startTime = new Date(now)
  const endTime = new Date(now)
  const [startHour, startMinute] = start.split(':').map(Number)
  const [endHour, endMinute] = end.split(':').map(Number)

  startTime.setHours(startHour, startMinute, 0)
  endTime.setHours(endHour, endMinute, 0)

  return !(now >= startTime && now <= endTime)
}

// show a notification when the extension is deactivated
export function deactivate() {
  const config = vscode.workspace.getConfiguration('reflectiveCoder')
  const enableNotifications = config.get<boolean>('enableNotifications', true)
  const customMessage = config.get<string>(
    'customMessage',
    'Remember to reflect on your engineering day book!'
  )

  if (enableNotifications) {
    nodeNotifier.notify(
      {
        title: 'VS Code is Closing',
        message: customMessage,
        wait: true,
      },
      (err, response, metadata) => {
        console.log(metadata)
      }
    )
  }
}
