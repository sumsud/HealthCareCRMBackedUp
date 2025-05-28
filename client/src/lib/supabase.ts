import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Authentication might not work correctly.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
    }
  }
);

// Auth helper functions
export const signInWithEmail = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUpWithEmail = async (email: string, password: string, options?: any) => {
  return supabase.auth.signUp({ email, password, options });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export const resetPassword = async (email: string) => {
  return supabase.auth.resetPasswordForEmail(email);
};

export const updatePassword = async (newPassword: string) => {
  return supabase.auth.updateUser({ password: newPassword });
};

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// For RLS (Row Level Security) policy checks
export function getUserId() {
  return supabase.auth.getUser().then(({ data }) => data.user?.id);
}

// Storage operations
export async function uploadFile(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) throw error;
  return data;
}

export function getFileUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
  return true;
}

// Realtime subscriptions
export function subscribeToTable(
  table: string, 
  callback: (payload: any) => void,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
  filter?: string
) {
  let channel = supabase
    .channel(`public:${table}`)
    .on(
      'postgres_changes',
      { event, schema: 'public', table, filter },
      callback
    )
    .subscribe();
  
  // Return a cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
}