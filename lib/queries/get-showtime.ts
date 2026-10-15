import { createClient } from '@/lib/supabase/server'
import { getMoviePoster } from './omdb'

export interface ShowtimeDetails {
  id: string
  hall_name: string
  start_time: string
  price_standard: number
  price_vip: number
  ticket_price?: number
  movie: {
    id: string
    title: string
    description?: string
    duration_minutes?: number
    poster_url?: string | null
    genre?: string
  }
}

const FALLBACK_SHOWTIMES: Record<string, ShowtimeDetails> = {
  'st-101': {
    id: 'st-101',
    hall_name: 'IMAX Auditorium 1',
    start_time: '2026-10-15T19:30:00Z',
    price_standard: 300,
    price_vip: 350,
    movie: {
      id: 'm1',
      title: 'Dune: Part Two',
      description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
      duration_minutes: 166,
      poster_url: null
    }
  },
  'st-102': {
    id: 'st-102',
    hall_name: 'Standard Screen 4',
    start_time: '2026-10-15T21:45:00Z',
    price_standard: 300,
    price_vip: 350,
    movie: {
      id: 'm1',
      title: 'Dune: Part Two',
      description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
      duration_minutes: 166,
      poster_url: null
    }
  },
  'st-201': {
    id: 'st-201',
    hall_name: 'Auditorium 2',
    start_time: '2026-10-16T18:00:00Z',
    price_standard: 300,
    price_vip: 350,
    movie: {
      id: 'm2',
      title: 'Interstellar',
      description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.',
      duration_minutes: 169,
      poster_url: null
    }
  }
}

export async function getShowtimeDetails(id: string): Promise<ShowtimeDetails | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('showtimes')
      .select('*, movies(*)')
      .eq('id', id)
      .single()

    if (error) {
      console.warn('[getShowtimeDetails] Supabase query notice:', error.message)
    }

    if (!error && data) {
      const movieData = Array.isArray(data.movies) ? data.movies[0] : data.movies
      let poster = movieData?.poster_url
      if (!poster && movieData?.title) {
        try {
          poster = await getMoviePoster(movieData.title)
        } catch {
          poster = null
        }
      }

      return {
        id: data.id,
        hall_name: data.cinema_hall || data.hall_name || 'Auditorium 1',
        start_time: data.start_time,
        price_standard: Number(data.standard_price ?? data.price ?? 300),
        price_vip: Number(data.vip_price ?? 350),
        ticket_price: Number(data.standard_price ?? data.price ?? 300),
        movie: {
          id: movieData?.id || 'm-unknown',
          title: movieData?.title || 'Featured Movie',
          description: movieData?.description,
          duration_minutes: movieData?.duration_minutes ?? movieData?.duration ?? 120,
          poster_url: poster,
          genre: movieData?.genre
        }
      }
    }
  } catch (err) {
    console.warn('[getShowtimeDetails] Query error:', err)
  }

  // Fallback to local mock data if using mock IDs (st-101, st-102, st-201)
  const fallback = FALLBACK_SHOWTIMES[id]
  if (fallback) {
    if (!fallback.movie.poster_url && fallback.movie.title) {
      try {
        fallback.movie.poster_url = await getMoviePoster(fallback.movie.title)
      } catch {
        // ignore
      }
    }
    return fallback
  }

  return null
}
