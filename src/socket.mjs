let socket

export default function () {
  if (!socket) {
    socket = window.io('ws://localhost:3001')
  }

  return socket
}
