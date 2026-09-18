export type NotificationType = "warning" | "success" | "info"

export interface AppNotification {
  id: number
  title: string
  body: string
  time: string
  read: boolean
  type: NotificationType
}
