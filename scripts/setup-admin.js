const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

console.log('\n=== PHAfrica Admin Login Setup ===\n')

// Get password from command line or prompt
const password = process.argv[2] || 'admin123'
const email = process.argv[3] || 'admin@phafrica.org'

console.log(`Setting up admin credentials:`)
console.log(`Email: ${email}`)
console.log(`Password: ${password}\n`)

// Generate password hash
const passwordHash = bcrypt.hashSync(password, 10)

// Generate NEXTAUTH_SECRET if needed
const nextAuthSecret = crypto.randomBytes(32).toString('base64')

// Read existing .env or create from example
const envPath = path.join(__dirname, '..', '.env')
const envExamplePath = path.join(__dirname, '..', 'env.example')

let envContent = ''

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf-8')
  console.log('Found existing .env file\n')
} else if (fs.existsSync(envExamplePath)) {
  envContent = fs.readFileSync(envExamplePath, 'utf-8')
  console.log('Creating .env from env.example\n')
} else {
  envContent = `DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3006"
NEXTAUTH_SECRET=""
ADMIN_EMAIL=""
ADMIN_PASSWORD_HASH=""
`
  console.log('Creating new .env file\n')
}

// Update or add environment variables
const updates = {
  'ADMIN_EMAIL': email,
  'ADMIN_PASSWORD_HASH': passwordHash,
}

// Update NEXTAUTH_SECRET if it's empty or missing
if (!envContent.includes('NEXTAUTH_SECRET=') || envContent.match(/NEXTAUTH_SECRET="?"\s*$/m)) {
  updates['NEXTAUTH_SECRET'] = nextAuthSecret
}

// Update the env content
Object.entries(updates).forEach(([key, value]) => {
  const regex = new RegExp(`^${key}=.*$`, 'm')
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `${key}="${value}"`)
    console.log(`✓ Updated ${key}`)
  } else {
    envContent += `\n${key}="${value}"`
    console.log(`✓ Added ${key}`)
  }
})

// Write the updated .env file
fs.writeFileSync(envPath, envContent, 'utf-8')

console.log('\n✅ Admin credentials configured!')
console.log('\nLogin credentials:')
console.log(`  Email: ${email}`)
console.log(`  Password: ${password}`)
console.log('\n⚠️  Please restart your dev server for changes to take effect.')
console.log('   Run: npm run dev\n')
