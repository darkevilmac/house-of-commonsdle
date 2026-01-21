import { existsSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const OUTPUT_FILE = join(__dirname, '../src/data/members.json')

if (!existsSync(OUTPUT_FILE)) {
  const outputDir = join(__dirname, '../src/data')
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }
  writeFileSync(OUTPUT_FILE, '[]')
  console.log('Created empty members.json as fallback')
}
