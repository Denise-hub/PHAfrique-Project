const bcrypt = require('bcryptjs')

// Get password from command line argument or use default
const password = process.argv[2] || 'admin123'

console.log('\n=== Admin Password Hash Generator ===\n')
console.log(`Password: ${password}`)
console.log(`\nHash (copy this to .env as ADMIN_PASSWORD_HASH):`)
console.log(bcrypt.hashSync(password, 10))
console.log('\nTo use a different password, run:')
console.log('node scripts/generate-password-hash.js your-password\n')
