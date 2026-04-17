import { supabase } from '@/lib/supabase';

export async function uploadPublicFile(file: File, folder = 'branding') {
  if (!supabase) {
    throw new Error('Supabase chưa được cấu hình');
  }

  if (!(file instanceof File)) {
    throw new Error('File không hợp lệ');
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage.from('site-assets').upload(fileName, file, {
    cacheControl: '3600',
    contentType: file.type || 'image/jpeg',
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data: publicUrlData } = supabase.storage.from('site-assets').getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

export async function uploadJobFile(file: File) {
  if (!supabase) {
    throw new Error('Supabase chưa được cấu hình');
  }

  if (!(file instanceof File)) {
    throw new Error('File không hợp lệ');
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
  const fileName = `jobs/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage.from('job-assets').upload(fileName, file, {
    cacheControl: '3600',
    contentType: file.type || 'application/pdf',
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data: publicUrlData } = supabase.storage.from('job-assets').getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  };
}

export async function deleteJobFile(path: string) {
  if (!supabase) {
    throw new Error('Supabase chưa được cấu hình');
  }

  if (!path) {
    throw new Error('Thiếu đường dẫn file');
  }

  const { error } = await supabase.storage.from('job-assets').remove([path]);

  if (error) {
    throw new Error(error.message);
  }
}
