import { supabase } from '@/lib/supabase';

export async function uploadPublicFile(file: File, folder = 'branding') {
  if (!supabase) {
    throw new Error('Supabase chưa được cấu hình');
  }

  if (!(file instanceof File)) {
    throw new Error('File không hợp lệ');
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  console.log('UPLOAD SESSION:', sessionData.session);
  console.log('UPLOAD USER:', sessionData.session?.user);
  console.log('UPLOAD TOKEN:', sessionData.session?.access_token);
  console.log('UPLOAD SESSION ERROR:', sessionError);

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage.from('site-assets').upload(fileName, file, {
    cacheControl: '3600',
    contentType: file.type || 'image/jpeg',
    upsert: true,
  });

  console.log('UPLOAD RESULT:', data);
  console.log('UPLOAD ERROR:', error);

  if (error) {
    throw new Error(error.message);
  }

  const { data: publicUrlData } = supabase.storage.from('site-assets').getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
