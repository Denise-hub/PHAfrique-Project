/**
 * Set the password for denmaombi@gmail.com (SUPER_ADMIN) so you can sign in with email/password.
 * Prerequisites: npm run db:setup and npm run db:seed (so the user exists).
 *
 * Run from project root:
 *   Add to .env:  ADMIN_PASSWORD=YourPassword
 *   Then run:     npm run db:set-super-admin-password
 *
 * Or one-shot (PowerShell): $env:ADMIN_PASSWORD='YourPassword'; npm run db:set-super-admin-password
 * Or one-shot (CMD):        set ADMIN_PASSWORD=YourPassword && npm run db:set-super-admin-password
 */
try { require('dotenv').config() } catch (_) {}
const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const SUPER_ADMIN_EMAIL = 'denmaombi@gmail.com'
const prisma = new PrismaClient()

async function main() {
  const rawPassword = (process.env.ADMIN_PASSWORD || '').trim()
  if (!rawPassword || rawPassword.length < 8) {
    console.error('Set ADMIN_PASSWORD (min 8 characters) in .env or in the command, then run this script.')
    console.error('Example: ADMIN_PASSWORD="YourPassword" node prisma/set-super-admin-password.js')
    process.exit(1)
  }

  const email = SUPER_ADMIN_EMAIL.toLowerCase().trim()
  const existing = await prisma.adminUser.findUnique({ where: { email } })
  if (!existing) {
    console.error(`No admin found for ${SUPER_ADMIN_EMAIL}. Run: npm run db:seed`)
    process.exit(1)
  }

  const passwordHash = await hash(rawPassword, 10)
  await prisma.adminUser.update({
    where: { email },
    data: { passwordHash },
  })
  console.log('Password set for', SUPER_ADMIN_EMAIL + '. You can now sign in with email/password.')
}

main()
  .catch((e) => {
    console.error('Failed:', e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
