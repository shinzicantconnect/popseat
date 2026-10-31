'use server' 

import { createClient } from '@/lib/supabase/server' 
import { revalidatePath } from 'next/cache' // is a built-in function that clears (purges) the cached data for a specific web page or route path on the server.

export async function deleteMovieAction(movieId: string) {
  try {
    const supabase = await createClient() // creates a supabase client

    await supabase.from('showtimes').delete().eq('movie_id', movieId)

    const { error } = await supabase.from('movies').delete().eq('id', movieId) // include SQL command (.delete(), .eq() )

    if (error) {
      return { success: false, message: error.message } // if there is an error, return the error message
    }

    revalidatePath('/') // updates the path
    revalidatePath('/admin') // updates the path
    return { success: true } // returns true if the movie was deleted successfully
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to delete movie' } // if there is an error, return the error message
  }
}

