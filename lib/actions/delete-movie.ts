'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteMovieAction(movieId: string) {
    try {
        const supabase = await createClient()

        await supabase.from('showtimes').delete().eq('movie_id', movieId)

        const { error } = await supabase.from('movies').delete().eq('id', movieId)

        if (error) {
            return { success: false, message: error.message }
        }

        revalidatePath('/')
        revalidatePath('/admin')
        return { success: true }
    } catch (err: any) {
        return { success: false, message: err?.message || 'Failed to delete movie' }
    }
}