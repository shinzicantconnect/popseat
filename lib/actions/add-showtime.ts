'use server' // Run only on the server side NOT on the front-end

import { createClient } from '@/lib/supabase/server' 
import { revalidatePath } from 'next/cache' // is a built-in function that clears (purges) the cached data for a specific web page or route path on the server.

export async function addShowtimeAction(movieId: string, dateStr: string, timeStr: string, price = 300) {
    try { 
        const supabase = await createClient() // creates a supabase client
        const startTime = new Date(`${dateStr}T${timeStr}:00`).toISOString() // converts the date and time to a string // ISO format result: 2026-11-01T18:30:00

        const { error } = await supabase.from('showtimes').insert({ // inserts the showtime to the database
            movie_id: movieId, 
            start_time: startTime, 
            price: price,
            standard_price: price,
            vip_price: 350,
        })

        if (error) return { success: false, message: error.message } // if there is an error, return the error message

        revalidatePath('/') 
        revalidatePath('/admin') 
        return { success: true } // returns true if the showtime was added successfully
    } catch (err: any) {
        return { success: false, message: err?.message || 'Failed to schedule showtime' } // if there is an error, return the error message
    }
}
