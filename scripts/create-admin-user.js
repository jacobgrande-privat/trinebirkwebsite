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
    const { data: existingUser } = await supabase
      .from('backoffice_users')
      .select('email')
      .eq('email', adminEmail)
      .maybeSingle();

    if (existingUser) {
      console.log('Admin user already exists');
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        emailRedirectTo: 'http://localhost:5173/backoffice'
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
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
