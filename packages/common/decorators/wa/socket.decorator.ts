import { WA_SOCKET_METADATA } from "@playwa/common"

export const WebSocket = (): PropertyDecorator => {
  return (target, key) => {
    Reflect.set(target, key, null)
    Reflect.defineMetadata(WA_SOCKET_METADATA, true, target, key)
  }
}
