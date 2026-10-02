import { createInterface } from 'node:readline/promises'
import { Writable } from 'node:stream'
import { readFile, writeFile } from 'node:fs/promises'
import { hashPassword } from './auth.js'

let hidden = false
const output = new Writable({ write(chunk, encoding, callback) { if (!hidden) process.stdout.write(chunk, encoding); callback() } })
const terminal = createInterface({ input: process.stdin, output, terminal: true })
try {
  const username = (await terminal.question('Owner username: ')).trim()
  if (!/^[A-Za-z0-9_.-]{1,128}$/.test(username)) throw new Error('Use 1–128 letters, numbers, dots, underscores or hyphens.')
  process.stdout.write('Password (at least 12 characters; hidden): ')
  hidden = true
  const password = await terminal.question('')
  hidden = false
  process.stdout.write('\nConfirm password (hidden): ')
  hidden = true
  const confirmation = await terminal.question('')
  hidden = false
  process.stdout.write('\n')
  if (password.length < 12 || password.length > 1024) throw new Error('Password must contain 12–1024 characters.')
  if (password !== confirmation) throw new Error('Passwords did not match. Nothing changed.')
  const path = new URL('./.env', import.meta.url)
  let env = await readFile(path, 'utf8').catch(error => { if (error.code === 'ENOENT') return ''; throw error })
  const values = { OWNER_USERNAME: username, OWNER_PASSWORD_HASH: await hashPassword(password) }
  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${value}`
    const pattern = new RegExp(`^${key}=.*$`, 'm')
    env = pattern.test(env) ? env.replace(pattern, line) : `${env.trimEnd()}\n${line}\n`
  }
  await writeFile(path, env, { mode: 0o600 })
  console.log('Owner login saved in server/.env. Restart the server to apply it.')
} catch (error) {
  hidden = false
  console.error(error.message)
  process.exitCode = 1
} finally { terminal.close() }
