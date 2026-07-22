import { defineConfig } from '@trigger.dev/sdk'

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF ?? '<set-in-dashboard>',
  dirs: ['./src/trigger']
})
