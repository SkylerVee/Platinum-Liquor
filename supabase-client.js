(function () {
    const config = window.supabaseConfig || {};
    const supabaseUrl = config.url || window.SUPABASE_URL || window.__SUPABASE_URL__ || '';
    const supabaseAnonKey = config.anonKey || window.SUPABASE_ANON_KEY || window.__SUPABASE_ANON_KEY__ || '';

    if (!window.supabase || !supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase is not configured yet. Add your project URL and anon key to window.supabaseConfig, window.SUPABASE_URL, or window.SUPABASE_ANON_KEY before loading the page.');
        window.supabaseClient = null;
        return;
    }

    const client = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true
        }
    });

    window.supabaseClient = client;
    window.supabase = client;
})();
