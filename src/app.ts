import express from 'express'
import path from 'path'
import { Client } from 'pg'
import { articleRoute } from './routes/articleRoute'
import { categoryRoute } from './routes/categoryRoute'

const pgClient = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})
pgClient.connect().catch((err) => {
  console.error(err)
})

const app = express()
// Load static files
app.use(express.static(path.resolve(__dirname, '../public')))
app.use('/articulo', articleRoute(pgClient))
app.use('/', categoryRoute(pgClient))

export default app