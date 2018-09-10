/* eslint-disable no-console */
const logger = require('winston')
const url = require('url')
const { MongoClient } = require('mongodb')

const services = require('./services')
const app = require('./app')

const port = app.get('port')

function startServer() {
  const dbName = url.parse(app.get('mongodb')).path.substring(1)
  const mongoUrl = process.env.NODE_ENV === 'production'
    ? process.env.MONGO_URL
    : app.get('mongodb')

  MongoClient.connect(mongoUrl, { useNewUrlParser: true })
    .then((client) => {
      if (!client.collection) {
        client.db(dbName)
      }

      app.set('mongoClient', client.db('vc'))
        .configure(services)

      const server = app.listen(port)

      process.on('unhandledRejection', (reason, p) => logger.error('Unhandled Rejection at: Promise ', p, reason))

      server.on('listening', () => logger.info(`Feathers application started on http://${app.get('host')}:${port}`))
    })
}

startServer()
