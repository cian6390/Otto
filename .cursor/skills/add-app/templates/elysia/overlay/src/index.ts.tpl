import { healthResponseSchema } from '@t42/validators'
import { Elysia } from 'elysia'

const port = Number(process.env.API_PORT ?? process.env.PORT ?? 3001)

new Elysia()
  .get('/api/health', () =>
    healthResponseSchema.parse({
      status: 'ok',
      timestamp: new Date().toISOString()
    })
  )
  .listen(port)

console.log(`Listening on http://localhost:${port}`)
