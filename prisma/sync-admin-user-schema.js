/**
 * Sync AdminUser table with schema: add displayName and imageUrl if missing.
 * Run from project root: node prisma/sync-admin-user-schema.js
 * Requires: DATABASE_URL in .env (e.g. "file:./dev.db")
 *
 * If AdminUser table does not exist, run first: npx prisma db push
 */
try { require('dotenv').config() } catch (_) {}
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl || !dbUrl.startsWith('file:')) {
    console.log('DATABASE_URL must be set and use file: (SQLite). Current:', dbUrl ? 'set' : 'not set')
    process.exit(1)
  }

  let columns
  try {
    columns = await prisma.$queryRawUnsafe('PRAGMA table_info(AdminUser)')
  } catch (e) {
    if (e.message && e.message.includes('no such table')) {
      console.log('AdminUser table does not exist. Run this first from the project root:')
      console.log('  npx prisma db push')
      console.log('Then run this script again to add any missing columns.')
      process.exit(1)
    }
    throw e
  }

  const names = (columns || []).map((c) => c.name)

  let changed = false
  if (!names.includes('displayName')) {
    await prisma.$executeRawUnsafe('ALTER TABLE AdminUser ADD COLUMN displayName TEXT')
    console.log('Added column: displayName')
    changed = true
  }
  if (!names.includes('imageUrl')) {
    await prisma.$executeRawUnsafe('ALTER TABLE AdminUser ADD COLUMN imageUrl TEXT')
    console.log('Added column: imageUrl')
    changed = true
  }

  if (changed) {
    console.log('AdminUser schema sync complete.')
  } else {
    console.log('AdminUser table already has displayName and imageUrl.')
  }
}

main()
  .catch((e) => {
    console.error('Sync failed:', e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
