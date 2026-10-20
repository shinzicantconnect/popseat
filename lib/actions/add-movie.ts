'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface AddMovieInput {
    title: string
    description?: string
    durationMinutes?: number
    posterUrl?: string
    genre?: string
    showtimeDate?: string
    showtimeTime?: string
    ticketPrice?: number
    cinemaHall?: string
}

export async function addMovie(input: AddMovieInput | FormData) {
    try {
        const supabase = await createClient()

        let title: string
        let description: string
        let durationMinutes: number
        let genre: string
        let posterUrl: string = ''
        let showtimeDate: string = ''
        let showtimeTime: string = ''
        let ticketPrice: number = 300
        let cinemaHall: string = 'Auditorium 1'

        if (input instanceof FormData) {
            title = input.get('title') as string
            description = input.get('description') as string
            const rawDuration = input.get('durationMinutes') as string
            durationMinutes = parseInt(rawDuration || '120', 10) || 120
            genre = (input.get('genre') as string) || 'General Cinema'
            const posterFile = input.get('poster') as File | null
            // Support both combined datetime-local and separate date/time fields
            const startTime = (input.get('start_time') as string) || ''
            showtimeDate = (input.get('showtimeDate') as string) || (startTime ? startTime.split('T')[0] : '')
            showtimeTime = (input.get('showtimeTime') as string) || (startTime ? startTime.split('T')[1]?.slice(0, 5) : '')
            ticketPrice = parseFloat((input.get('ticketPrice') as string) || '300')
            cinemaHall = (input.get('cinemaHall') as string) || 'Auditorium 1'

            if (posterFile && posterFile.size > 0) {
                const fileExt = posterFile.name.split('.').pop()
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
                const filePath = `posters/${fileName}`

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
        } else {
            title = input.title
            description = input.description || ''
            durationMinutes = input.durationMinutes || 120
            genre = input.genre || 'General Cinema'
            posterUrl = input.posterUrl || ''
            showtimeDate = input.showtimeDate || ''
            showtimeTime = input.showtimeTime || ''
            ticketPrice = input.ticketPrice || 300
            cinemaHall = input.cinemaHall || 'Auditorium 1'
        }

        // 2. Insert movie
        const { data: movie, error: insertError } = await supabase
            .from('movies')
            .insert({
                title,
                description,
                genre,
                duration: durationMinutes,
                duration_minutes: durationMinutes,
                poster_url: posterUrl || null,
            })
            .select('id')
            .single()

        if (insertError) {
            return { success: false, message: `Movie Insert Failed: ${insertError.message}` }
        }

        // 3. Construct ISO start time safely
        let startTimeIso: string
        if (showtimeDate && showtimeTime) {
            const dateTimeString = `${showtimeDate}T${showtimeTime}:00`
            const dateObj = new Date(dateTimeString)
            startTimeIso = isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString()
        } else {
            startTimeIso = new Date().toISOString()
        }

        // 4. Insert showtime
        const { error: showtimeError } = await supabase
            .from('showtimes')
            .insert({
                movie_id: movie.id,
                start_time: startTimeIso,
                price: ticketPrice,
                standard_price: ticketPrice,
                vip_price: 350,
                cinema_hall: cinemaHall,
            })

        if (showtimeError) {
            console.error('[Showtime Insert Error]:', showtimeError.message)
            return { success: false, message: `Showtime Insert Failed: ${showtimeError.message}` }
        }

        revalidatePath('/')
        revalidatePath('/admin')
        return { success: true }
    } catch (err: any) {
        return { success: false, message: err?.message || 'Failed to complete setup', error: err?.message }
    }
}

export async function addMovieAction(input: AddMovieInput | FormData) {
    return addMovie(input)
}