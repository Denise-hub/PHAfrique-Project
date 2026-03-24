try { require('dotenv').config() } catch (_) {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CO_FOUNDER: 'CO_FOUNDER',
  SOCIAL_MEDIA_MANAGER: 'SOCIAL_MEDIA_MANAGER',
  NEWSLETTER_MANAGER: 'NEWSLETTER_MANAGER',
}

// SUPER_ADMIN email: must be in AdminUser for Google and credentials sign-in
const SUPER_ADMIN_EMAIL = 'denmaombi@gmail.com'

async function main() {
  // RBAC: keep seed safe by default.
  // We always ensure SUPER_ADMIN exists, but do not recreate other admins unless explicitly requested.
  const adminUsers = [
    { email: SUPER_ADMIN_EMAIL, role: ROLES.SUPER_ADMIN, passwordHash: process.env.ADMIN_PASSWORD_HASH || null },
  ]

  if (process.env.SEED_DEFAULT_ADMIN_TEAM === 'true') {
    adminUsers.push(
      { email: 'eunice.tshilengu@phafrique.org', role: ROLES.CO_FOUNDER, passwordHash: null },
      { email: 'jemima.lotika@phafrique.org', role: ROLES.CO_FOUNDER, passwordHash: null },
      { email: 'kabala@phafrique.org', role: ROLES.CO_FOUNDER, passwordHash: null },
      { email: 'munashe.faranisi@phafrique.org', role: ROLES.SOCIAL_MEDIA_MANAGER, passwordHash: null },
      { email: 'queren.basemenane@phafrique.org', role: ROLES.NEWSLETTER_MANAGER, passwordHash: null },
    )
  }
  for (const u of adminUsers) {
    const email = u.email.toLowerCase().trim()
    const updateData = { role: u.role }
    if (u.passwordHash) {
      updateData.passwordHash = u.passwordHash
    }
    await prisma.adminUser.upsert({
      where: { email },
      update: updateData,
      create: { email, role: u.role, passwordHash: u.passwordHash },
    })
  }
  const superAdmin = await prisma.adminUser.findUnique({ where: { email: SUPER_ADMIN_EMAIL.toLowerCase().trim() } })
  if (!superAdmin) throw new Error(`SUPER_ADMIN (${SUPER_ADMIN_EMAIL}) was not created. Check AdminUser table and schema.`)
  if (superAdmin.role !== ROLES.SUPER_ADMIN) throw new Error(`SUPER_ADMIN (${SUPER_ADMIN_EMAIL}) must have role ${ROLES.SUPER_ADMIN}.`)
  console.log('Seeded admin users and roles (SUPER_ADMIN:', SUPER_ADMIN_EMAIL + ')')

  const programData = [
    { title: 'Maternal and Child Health', slug: 'maternal-and-child-health', description: 'Every mother and child is physically and mentally healthy', imageUrl: '/assets/images/portfolios/UPDATED-MATERNAL-WHITE-BG-2048x2048.jpg', sortOrder: 0 },
    { title: 'Mental Health', slug: 'mental-health', description: 'Every African has access to mental health support', imageUrl: '/assets/images/portfolios/UPDATED-MENTAL-HEALTH-WHITE-BG-2048x2048.jpg', sortOrder: 1 },
    { title: 'Environmental Health', slug: 'environmental-health', description: 'Every African lives in a safe clean environment', imageUrl: '/assets/images/portfolios/UPDATED-ENVIRONMENTAL-WHITE-BG-2048x2048.jpg', sortOrder: 2 },
    { title: 'Ethics', slug: 'ethics', description: 'Every African has equitable access to healthcare', imageUrl: '/assets/images/portfolios/UPDATED-ETHICS-WHITE-BG-2048x2048.jpg', sortOrder: 3 },
  ]
  for (const p of programData) {
    await prisma.program.upsert({ where: { slug: p.slug }, update: {}, create: p })
  }
  console.log('Seeded programs')

  const projectData = [
    { title: 'SOS MENHEMA', slug: 'sos-menhema', description: null, imageUrl: null, link: null, sortOrder: 0 },
    { title: 'Internship program', slug: 'internship-program', description: null, imageUrl: null, link: null, sortOrder: 1 },
    { title: 'Project Hope workshops', slug: 'project-hope-workshops', description: null, imageUrl: null, link: null, sortOrder: 2 },
    { title: 'Kgetsi Ya Tsi project', slug: 'kgetsi-ya-tsi-project', description: null, imageUrl: null, link: null, sortOrder: 3 },
  ]
  for (const p of projectData) {
    await prisma.project.upsert({ where: { slug: p.slug }, update: {}, create: p })
  }
  console.log('Seeded projects')

  await prisma.opportunity.upsert({
    where: { slug: 'internship-program' },
    update: {},
    create: {
      title: 'Internship program',
      slug: 'internship-program',
      type: 'internship',
      description: 'Join our team to gain experience in public health program design, community outreach, and health systems strengthening across Africa.',
      applicationDeadline: null,
      isActive: true,
      sortOrder: 0,
    },
  })
  console.log('Seeded opportunities')

  for (const { key, value } of [
    { key: 'contact_phone', value: '+27 76 651 0576' },
    { key: 'contact_email', value: 'info@phafrique.com' },
    { key: 'contact_address', value: 'Rosebank, Johannesburg, South Africa' },
  ]) {
    await prisma.content.upsert({ where: { key }, update: { value }, create: { key, value } })
  }
  console.log('Seeded content keys')
}

main()
  .catch((e) => {
    if (e.code === 'P2021' && e.meta?.table?.includes('AdminUser')) {
      console.error('The AdminUser table does not exist. Create it first by running:')
      console.error('  npm run db:push')
      console.error('Then run: npm run db:seed')
    } else {
      console.error(e)
    }
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
