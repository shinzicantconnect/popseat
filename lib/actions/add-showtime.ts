'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addShowtimeAction(movieId: string, dateStr: string, timeStr: string, price = 300) {
    try {
        const supabase = await createClient()
        const startTime = new Date(`${dateStr}T${timeStr}:00`).toISOString()

        const { error } = await supabase.from('showtimes').insert({
            movie_id: movieId,
            start_time: startTime,
            price: price,
            standard_price: price,
            vip_price: 350,
        })

        if (error) return { success: false, message: error.message }

        revalidatePath('/')
        revalidatePath('/admin')
        return { success: true }
    } catch (err: any) {
        return { success: false, message: err?.message || 'Failed to schedule showtime' }
    }
}