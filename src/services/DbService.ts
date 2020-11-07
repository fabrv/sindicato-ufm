import { Client } from "pg"

class DbService {
  client: Client
  constructor (client: Client) {
    this.client = client
  }
}

export default DbService