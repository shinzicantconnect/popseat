'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Admin client that bypasses RLS using the anon key against open policies
function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function addComingSoonAction(input: FormData) {
  try {
    const supabase = getAdminClient()

    const title = input.get('title') as string
    const description = input.get('description') as string
    const genre = (input.get('genre') as string) || 'General Cinema'
    const rawDuration = input.get('durationMinutes') as string
    const durationMinutes = parseInt(rawDuration || '120', 10) || 120
    const releaseDate = (input.get('releaseDate') as string) || ''
    const ticketPrice = parseFloat((input.get('ticketPrice') as string) || '300')
    const directedBy = (input.get('directedBy') as string) || ''
    const cast = (input.get('cast') as string) || ''
    const posterFile = input.get('poster') as File | null

    let posterUrl = ''
    if (posterFile && posterFile.size > 0) {
      const fileExt = posterFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `coming-soon/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('movie-posters')
        .upload(filePath, posterFile)

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('movie-posters')
          .getPublicUrl(filePath)
        posterUrl = publicUrlData.publicUrl
      }
    }

    const { error } = await supabase.from('coming_soon').insert({
      title,
      description,
      genre,
      duration_minutes: durationMinutes,
      release_date: releaseDate || null,
      ticket_price: ticketPrice,
      directed_by: directedBy || null,
      cast_list: cast || null,
      poster_url: posterUrl || null,
    })

    if (error) {
      // If table doesn't exist yet, return a helpful message
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'The coming_soon table does not exist in Supabase. Please create it first.',
        }
      }
      return { success: false, message: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to add coming soon movie' }
  }
}

export async function deleteComingSoonAction(id: string) {
  try {
    const supabase = getAdminClient()
    const { error } = await supabase.from('coming_soon').delete().eq('id', id)
    if (error) return { success: false, message: error.message }
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to delete' }
  }
}
