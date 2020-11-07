import express from 'express'
import { Client } from 'pg'
import { articleRoute } from './routes/article'

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

app.use('/articles', articleRoute(pgClient))

export default app