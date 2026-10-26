import app from './app.js'
import { config } from './config.js'
import { closeDatabase, connectDatabase } from './db.js'

await connectDatabase()
const server = app.listen(config.port, () => console.log(`Adji Cash API → http://localhost:${config.port}`))

async function shutdown() {
  server.close(async (error) => {
    if (error) {
      console.error('Failed to close the API server:', error)
      process.exitCode = 1
    }
    try {
      await closeDatabase()
    } catch (closeError) {
      console.error('Failed to close the database connection:', closeError)
      process.exitCode = 1
    }
  })
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
