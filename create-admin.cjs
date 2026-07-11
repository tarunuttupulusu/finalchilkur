const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables are missing in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('\n📖 Usage: node create-admin.cjs <email> <password>\n');
  process.exit(1);
}

async function createAdmin() {
  console.log(`⏳ Creating admin account for ${email}...`);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'http://localhost:3000/admin',
    }
  });

  if (error) {
    console.error('❌ Failed to create admin:', error.message);
  } else {
    console.log('✅ Admin user created successfully!');
    if (data.session) {
      console.log('🔑 You are now ready to log in on the admin portal.');
    } else {
      console.log('📬 Please check your email for a Supabase confirmation link (or confirm/auto-confirm it in your Supabase Auth dashboard settings to log in immediately).');
    }
  }
}

createAdmin();
