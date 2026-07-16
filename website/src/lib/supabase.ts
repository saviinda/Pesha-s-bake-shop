import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase is properly configured with real keys
export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const configured = (
    !!url &&
    url !== '' &&
    !url.includes('placeholder') &&
    !!key &&
    key !== '' &&
    !key.includes('placeholder')
  );
  
  if (!configured && typeof window !== 'undefined') {
    console.warn('Supabase not configured - using localStorage fallback. Check environment variables.');
  }
  
  return configured;
};

export const uploadToStorage = async (
  file: File,
  bucket: string
): Promise<string> => {
  if (!isSupabaseConfigured()) {
    // Fallback: return base64 for local mock dev
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const ext = file.name.split('.').pop() || 'bin';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const filePath = `public/${fileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: true, contentType: file.type });

  if (error) {
    console.error(`Storage upload error (bucket: ${bucket}):`, error);
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
};
