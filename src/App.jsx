import { useEffect, useState } from "react";
import Loading from "./components/Loading";
import Search from "./components/Search";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";
const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiYjcwNzYwOWMzYTQxOTljMGJkNDQxYWI0MzdkNjMwMSIsIm5iZiI6MTczOTE4Mzg5OC45NzUwMDAxLCJzdWIiOiI2N2E5ZDcxYWQxNWU0ZjNkOTQ5MzcxYjgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.jCJiIwid7-Ns37IxplMRnwJ6Yhxio8OVbr6ckYJKWq4";
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};
function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [trendingErrMsg, setTrendingErrMsg] = useState("");
  const [movies, setMovies] = useState([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setdebouncedSearchTerm] = useState("");
  const [trendingMovies, setTrendingMovies] = useState("");

  useDebounce(() => setdebouncedSearchTerm(searchTerm), 1000, [searchTerm]);
  const fetchMovies = async (query) => {
    setIsLoading(true);
    setErrMsg("");
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURI(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error("Something went wrong");
      }
      const data = await response.json();

      setMovies(data.results || []);
      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      setErrMsg(data.error || "Error fetching movies please try again");
      setMovies([]);
      return;
    } finally {
      setIsLoading(false);
    }
  };
  const loadTrendingMovies = async () => {
    setIsLoadingTrending(true);
    setTrendingErrMsg("");
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.log(`greska ${error}`);
      setTrendingErrMsg("Error fetching trending movies please try again");
    } finally {
      setIsLoadingTrending(false);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);
  useEffect(() => {
    loadTrendingMovies();
  }, []);
  return (
    <main className="overflow-hidden">
      {/**dodao  klasu overflov-hidden ako bude problema za responzivnost skloniti skloniti */}
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="hero" />
          <h1>
            Find <span className="text-gradient">Movies </span>You'll Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        {isLoadingTrending ? (
          <Loading />
        ) : trendingErrMsg ? (
          <p className="text-red-500">{trendingErrMsg}"</p>
        ) : (
          trendingMovies.length && (
            <section className="trending">
              <h2>Trending Movies </h2>
              <ul>
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.title} />
                  </li>
                ))}
              </ul>
            </section>
          )
        )}
        <section className="all-movies">
          <h2> All movies</h2>
          {isLoading ? (
            <Loading />
          ) : errMsg ? (
            <p className="text-red-500">{errMsg}"</p>
          ) : (
            <ul>
              {movies.map((item) => (
                <MovieCard key={item.id} movie={item} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
