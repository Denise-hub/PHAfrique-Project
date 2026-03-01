/**
 * Ensures denmaombi@gmail.com exists in AdminUser with role SUPER_ADMIN.
 * Use if Google sign-in returns "Access Denied" and you want to fix only this user.
 * Run from project root: node prisma/ensure-super-admin.js
 */
try { require('dotenv').config() } catch (_) {}
const { PrismaClient } = require('@prisma/client')

const SUPER_ADMIN_EMAIL = 'denmaombi@gmail.com'
const prisma = new PrismaClient()

async function main() {
  const email = SUPER_ADMIN_EMAIL.toLowerCase().trim()
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { role: 'SUPER_ADMIN' },
    create: { email, role: 'SUPER_ADMIN', passwordHash: process.env.ADMIN_PASSWORD_HASH || null },
  })
  console.log('SUPER_ADMIN ensured:', admin.email, 'role:', admin.role)
}

main()
  .catch((e) => {
    console.error('Failed:', e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
