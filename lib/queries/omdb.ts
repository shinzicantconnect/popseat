export async function getMoviePoster(title: string): Promise<string | null> {
  const posterMap: Record<string, string> = {
    'Dune: Part Two': 'https://image.tmdb.org/t/p/w500/1pdfLPoL3VFi8St222f2M3i22M.jpg',
    'Interstellar': 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    'Oppenheimer': 'https://zxwzfmrskplypvqatmkm.supabase.co/storage/v1/object/public/movie-posters/posters/1791817766259-s6vxbipzepd.jpg',
    'Oppenhiemer': 'https://zxwzfmrskplypvqatmkm.supabase.co/storage/v1/object/public/movie-posters/posters/1791817766259-s6vxbipzepd.jpg',
    'Spiderman: Brand New Day': 'https://zxwzfmrskplypvqatmkm.supabase.co/storage/v1/object/public/movie-posters/posters/1791821432993-dhcuipik817.webp',
    'Odyssey': 'https://zxwzfmrskplypvqatmkm.supabase.co/storage/v1/object/public/movie-posters/posters/1791874631842-kp5ziy2a39s.jpg',
    "Five Nights at Freddy's 2": 'https://zxwzfmrskplypvqatmkm.supabase.co/storage/v1/object/public/movie-posters/posters/1791897181549-y6mwsama02f.webp',
    'Toy Story 5': 'https://zxwzfmrskplypvqatmkm.supabase.co/storage/v1/object/public/movie-posters/posters/1791898165732-segypx9jegn.jpeg'
  }

  const apiKey = process.env.OMDB_API_KEY || 'b158b980'

  try {
    const cleanTitle = title.replace(/:\s*/g, ' ').trim()
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(cleanTitle)}&apikey=${apiKey}`

    const res = await fetch(url, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (data.Response === 'True' && data.Poster && data.Poster !== 'N/A') {
        return data.Poster
      }
    }
  } catch {
    // Fall back to guaranteed TMDB posters
  }

  return posterMap[title] || 'https://image.tmdb.org/t/p/w500/1pdfLPoL3VFi8St222f2M3i22M.jpg'
}