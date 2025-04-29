import { createClient } from '@/utils/supabase/client';

async function uploadProfilePicture(file: File): Promise<string | null> {
  try {
    const supabase = createClient();

    // Generate a unique filename
    const filename = `profile-picture-${Date.now()}-${file.name}`;

    // Upload the file to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    console.log({ data }) 

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return null;
    }

    // Get the public URL
    const publicUrlData = await supabase.storage
      .from('profile-pictures')
      .getPublicUrl(data.path);


    return publicUrlData.data.publicUrl;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return null;
  }
}

export default uploadProfilePicture;
