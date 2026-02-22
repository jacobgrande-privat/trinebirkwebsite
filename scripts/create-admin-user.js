import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUser() {
  const adminEmail = 'jacob.grande@gmail.com';
  const adminPassword = 'PAVJq2cmKG.bpturRAtB';
  const adminName = 'Jacob Grande';

  console.log('Creating default admin user...');

  try {
    console.log('Checking if user exists...');

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });

    if (!loginError && loginData.user) {
      console.log('User already exists and login works!');
      console.log(`Email: ${adminEmail}`);
      console.log('Password: PAVJq2cmKG.bpturRAtB');
      await supabase.auth.signOut();
      return;
    }

    if (loginError && loginError.message.includes('Email not confirmed')) {
      console.log('User exists but email is not confirmed.');
      console.log('To fix this:');
      console.log('1. Go to Supabase Dashboard > Authentication > Users');
      console.log('2. Find jacob.grande@gmail.com');
      console.log('3. Click the menu (•••) and select "Confirm email"');
      return;
    }

    const { data: existingUser } = await supabase
      .from('backoffice_users')
      .select('email')
      .eq('email', adminEmail)
      .maybeSingle();

    if (existingUser) {
      console.log('User exists in database but auth failed. This should not happen.');
      console.log('Login error:', loginError?.message);
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        emailRedirectTo: 'http://localhost:5173/backoffice',
        data: {
          name: adminName
        }
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      process.exit(1);
    }

    if (!authData.user) {
      console.error('No user returned from signup');
      process.exit(1);
    }

    const { error: dbError } = await supabase
      .from('backoffice_users')
      .insert({
        id: authData.user.id,
        email: adminEmail,
        name: adminName
      });

    if (dbError) {
      console.error('Database error:', dbError);
      process.exit(1);
    }

    console.log('Admin user created successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log('Password: PAVJq2cmKG.bpturRAtB');
    console.log('');
    console.log('NOTE: If email confirmation is enabled in Supabase, you need to:');
    console.log('1. Go to Supabase Dashboard > Authentication > Users');
    console.log('2. Find jacob.grande@gmail.com');
    console.log('3. Click the menu (•••) and select "Confirm email"');
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
