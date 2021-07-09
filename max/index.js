const max = require('max-api')
const server = require('http').createServer()
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

max.post('loaded')

io.on('connection', (client) => {
  max.post('[io] connected')

  client.on('disconnect', () => {
    max.post('[io] disconnect')
  })
})

server.listen(3001)

max.addHandlers({
  snapshot(number) {
    io.emit('snapshot', number)
  },
  script(message) {
    if (message === 'stop') {
      max.post('closing socket server')
      io.close()
    }
  },
})
