import { GetStaticPropsContext } from 'next'

export type Movie = {
  id: string
  title: string
}

export default function MoviePage({ movie }: { movie: Movie }) {
  return <h1>{movie.title}</h1>
}

// This does not work - request is made in getStaticPaths
export async function getStaticPaths() {
  // uncomment this and it works
  // if (process.env.NEXT_RUNTIME === 'nodejs') {
  //   const { server } = await import('../../mocks/node')
  //   server.listen()
  // }

  const movies = await fetchMovies()

  return {
    fallback: false,
    paths: movies.map((movie) => ({
      params: { id: movie.id },
    })),
  }
}

// This works - no request is made in getStaticPaths
// export async function getStaticPaths() {
//   return {
//     paths: [],
//     fallback: 'blocking',
//   }
// }

export async function getStaticProps({
  params,
}: GetStaticPropsContext<{ id: string }>) {
  // This works because of instrumentation.ts
  const movies = await fetchMovies()
  const movie = movies.find((movie) => movie.id === params.id)

  return {
    props: {
      movie,
    },
  }
}

export async function fetchMovies(): Promise<Movie[]> {
  const response = await fetch('https://graphql.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query ListMovies {
          movies {
            id
            title
          }
        }
      `,
    }),
  })

  if (!response.ok) {
    console.error(response.status)
    throw 'If you see this mocking did not work'
  }

  const { data } = await response.json()

  return data.movies
}
