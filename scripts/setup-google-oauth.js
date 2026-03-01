const fs = require('fs')
const path = require('path')

console.log('\n=== Google OAuth Setup Helper ===\n')

const envPath = path.join(__dirname, '..', '.env')
let envContent = ''

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf-8')
} else {
  console.log('⚠️  .env file not found. Creating new one...\n')
  envContent = `DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""
ADMIN_EMAIL="denmaombi@gmail.com"
ADMIN_PASSWORD_HASH=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
`
}

// Check current status
const hasClientId = envContent.includes('GOOGLE_CLIENT_ID=') && !envContent.match(/GOOGLE_CLIENT_ID=""/)
const hasClientSecret = envContent.includes('GOOGLE_CLIENT_SECRET=') && !envContent.match(/GOOGLE_CLIENT_SECRET=""/)

if (hasClientId && hasClientSecret) {
  console.log('✅ Google OAuth credentials are already configured!\n')
  const clientIdMatch = envContent.match(/GOOGLE_CLIENT_ID="([^"]+)"/)
  const clientId = clientIdMatch ? clientIdMatch[1] : ''
  console.log(`Client ID: ${clientId.substring(0, 20)}...`)
  console.log('\nTo update, follow the steps below and run this script again.\n')
} else {
  console.log('❌ Google OAuth credentials are not configured.\n')
  console.log('📋 Follow these steps:\n')
  console.log('1. Go to: https://console.cloud.google.com/apis/credentials')
  console.log('2. Sign in with your Google account (denmaombi@gmail.com)')
  console.log('3. Create a new project or select existing')
  console.log('4. Enable "Google+ API" or "Google Identity"')
  console.log('5. Configure OAuth consent screen:')
  console.log('   - User Type: External')
  console.log('   - App name: PHAfrica Admin')
  console.log('   - User support email: denmaombi@gmail.com')
  console.log('   - Add test user: denmaombi@gmail.com')
  console.log('6. Create OAuth 2.0 Client ID:')
  console.log('   - Application type: Web application')
  console.log('   - Name: PHAfrica Admin Login')
  console.log('   - Authorized JavaScript origins:')
  console.log('     * http://localhost:3000')
  console.log('     * http://localhost:3006')
  console.log('   - Authorized redirect URIs:')
  console.log('     * http://localhost:3000/api/auth/callback/google')
  console.log('     * http://localhost:3006/api/auth/callback/google')
  console.log('7. Copy the Client ID and Client Secret')
  console.log('\n8. Run this command with your credentials:')
  console.log('   node scripts/setup-google-oauth.js YOUR_CLIENT_ID YOUR_CLIENT_SECRET\n')
}

// If credentials provided as arguments, update .env
const clientId = process.argv[2]
const clientSecret = process.argv[3]

if (clientId && clientSecret) {
  console.log('\n📝 Updating .env file with Google OAuth credentials...\n')
  
  // Update or add GOOGLE_CLIENT_ID
  if (envContent.includes('GOOGLE_CLIENT_ID=')) {
    envContent = envContent.replace(/GOOGLE_CLIENT_ID="[^"]*"/, `GOOGLE_CLIENT_ID="${clientId}"`)
  } else {
    envContent += `\nGOOGLE_CLIENT_ID="${clientId}"`
  }
  
  // Update or add GOOGLE_CLIENT_SECRET
  if (envContent.includes('GOOGLE_CLIENT_SECRET=')) {
    envContent = envContent.replace(/GOOGLE_CLIENT_SECRET="[^"]*"/, `GOOGLE_CLIENT_SECRET="${clientSecret}"`)
  } else {
    envContent += `\nGOOGLE_CLIENT_SECRET="${clientSecret}"`
  }
  
  fs.writeFileSync(envPath, envContent, 'utf-8')
  
  console.log('✅ Google OAuth credentials added to .env file!')
  console.log('\n⚠️  IMPORTANT: Restart your dev server for changes to take effect.')
  console.log('   Run: npm run dev\n')
} else if (!hasClientId || !hasClientSecret) {
  console.log('\n💡 Quick Setup:\n')
  console.log('After getting your credentials from Google Cloud Console, run:')
  console.log('node scripts/setup-google-oauth.js YOUR_CLIENT_ID YOUR_CLIENT_SECRET\n')
}
