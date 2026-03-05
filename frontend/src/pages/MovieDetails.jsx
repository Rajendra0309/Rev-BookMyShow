// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { getMovieById } from "../services/movieService";
// import { getShows } from "../services/showService";

// function MovieDetails() {

//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [movie, setMovie] = useState(null);
//   const [shows, setShows] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchMovie();
//     fetchShows();
//   }, []);

//   // Fetch Movie
//   const fetchMovie = async () => {
//     try {
//       const data = await getMovieById(id);
//       setMovie(data.data);
//     } catch (err) {
//       console.error("Error fetching movie:", err);
//     }
//   };

//   // Fetch Shows
//   const fetchShows = async () => {
//     try {
//       const data = await getShows();

//       const movieShows = data.filter(
//         (show) =>
//           show.movieId?._id === id &&
//           show.status === "Active"
//       );

//       setShows(movieShows);

//     } catch (err) {
//       console.error("Error fetching shows:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return <div className="container mt-5">Loading...</div>;
//   }

//   if (!movie) {
//     return <div className="container mt-5">Movie not found</div>;
//   }

//   return (
//     <div className="container mt-5">

//       {/* MOVIE INFO */}

//       <div className="card p-4 mb-4 shadow-sm">

//         <h2>{movie.title}</h2>

//         <p>
//           <strong>Language:</strong> {movie.language}
//         </p>

//         <p>
//           <strong>Genre:</strong> {movie.genre.join(", ")}
//         </p>

//         <p>
//           <strong>Duration:</strong> {movie.duration} minutes
//         </p>

//         <p>
//           <strong>Rating:</strong> ⭐ {movie.rating}
//         </p>

//         <p>
//           <strong>Description:</strong> {movie.description}
//         </p>

//       </div>

//       {/* SHOW LIST */}

//       <h4>Available Shows</h4>

//       {shows.length === 0 ? (

//         <p className="text-danger">
//           No shows available
//         </p>

//       ) : (

//         <table className="table table-bordered mt-3">

//           <thead>
//             <tr>
//               <th>Theatre</th>
//               <th>City</th>
//               <th>Screen</th>
//               <th>Date</th>
//               <th>Time</th>
//               <th>Price</th>
//               <th>Seats Available</th>
//               <th>Action</th>
//             </tr>
//           </thead>

//           <tbody>

//             {shows.map((show) => {

//               const totalSeats =
//                 show.screenId?.totalSeats || 0;

//               const bookedSeats =
//                 show.bookedSeats?.length || 0;

//               const seatsAvailable =
//                 totalSeats - bookedSeats;

//               return (

//                 <tr key={show._id}>

//                   <td>
//                     {show.screenId?.theatreId?.name}
//                   </td>

//                   <td>
//                     {show.screenId?.theatreId?.city}
//                   </td>

//                   <td>
//                     {show.screenId?.screenName}
//                   </td>

//                   <td>
//                     {new Date(show.showDate)
//                       .toLocaleDateString("en-GB")}
//                   </td>

//                   <td>{show.showTime}</td>

//                   <td>₹{show.ticketPrice}</td>

//                   <td>{seatsAvailable}</td>

//                   <td>

//                     <button
//                       className="btn btn-primary btn-sm"
//                       disabled={seatsAvailable === 0}
//                       onClick={() =>
//                         navigate(`/booking/movieId=${movie._id}`)
//                       }
//                     >
//                       Book
//                     </button>

//                   </td>

//                 </tr>

//               );

//             })}

//           </tbody>

//         </table>

//       )}

//     </div>
//   );
// }

// export default MovieDetails;

// new code
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById } from "../services/movieService";
import { getShows } from "../services/showService";
import { checkSeatAvailability } from "../services/bookingService";

function MovieDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovie();
    fetchShows();
  }, []);

  // ───────── Fetch Movie ─────────
  const fetchMovie = async () => {
    try {

      const data = await getMovieById(id);
      setMovie(data.data || data);

    } catch (error) {

      console.error("Error fetching movie:", error);

    }
  };

  // ───────── Fetch Shows ─────────
  const fetchShows = async () => {

    try {

      const res = await getShows();
      const allShows = res.data || res || [];

      const filteredShows = allShows.filter(
        show =>
          show.status === "Active" &&
          (show.movieId?._id === id || show.movieId === id)
      );

      const showsWithSeats = await Promise.all(

        filteredShows.map(async show => {

          try {

            const availRes = await checkSeatAvailability(show._id);
            const bookedSeats = availRes.data.bookedSeats || [];

            const totalSeats = show.screenId?.totalSeats || 0;

            const availableSeats = totalSeats - bookedSeats.length;

            return {
              ...show,
              totalSeats,
              availableSeats
            };

          } catch {

            return {
              ...show,
              totalSeats: show.screenId?.totalSeats || 0,
              availableSeats: 0
            };

          }

        })
      );

      setShows(showsWithSeats);

    } catch (error) {

      console.error("Error fetching shows:", error);

    } finally {

      setLoading(false);

    }
  };

  // ───────── Group Shows By Theatre ─────────
  const groupShowsByTheatre = () => {

    const grouped = {};

    shows.forEach(show => {

      const theatre =
        show.screenId?.theatreId?.name || "Unknown Theatre";

      if (!grouped[theatre]) {
        grouped[theatre] = [];
      }

      grouped[theatre].push(show);

    });

    return grouped;
  };

  if (loading)
    return <div className="container mt-5">Loading...</div>;

  if (!movie)
    return <div className="container mt-5">Movie not found.</div>;

  const groupedShows = groupShowsByTheatre();

  return (

    <div className="container mt-5">

      {/* Movie Info */}

      <h2>{movie.title}</h2>

      <p>
        <strong>Language:</strong> {movie.language}
      </p>

      <p>
        <strong>Genre:</strong> {movie.genre?.join(", ")}
      </p>

      <p>
        <strong>Duration:</strong> {movie.duration} minutes
      </p>

      <p>
        <strong>Rating:</strong> {movie.rating}
      </p>

      <hr />

      <h5>Description</h5>
      <p>{movie.description}</p>

      <hr />

      {/* Shows */}

      <h4 className="mt-4">Available Shows</h4>

      {shows.length === 0 ? (

        <div className="alert alert-warning">
          No shows available for this movie.
        </div>

      ) : (

        Object.keys(groupedShows).map(theatre => (

          <div key={theatre} className="card mb-3">

            <div className="card-header">
              <strong>{theatre}</strong>
            </div>

            <div className="card-body">

              {groupedShows[theatre].map(show => (

                <div
                  key={show._id}
                  className="d-flex justify-content-between align-items-center border-bottom py-2"
                >

                  <div>

                    <div>
                      📅 {new Date(show.showDate).toLocaleDateString("en-GB")}
                    </div>

                    <div>
                      🕐 {show.showTime}
                    </div>

                    <div>
                      🎬 Screen: {show.screenId?.screenName}
                    </div>

                    <div>
                      📍 City: {show.screenId?.theatreId?.city}
                    </div>
                    <div>
                      📍 Location: {show.screenId?.theatreId?.location}
                    </div>
                    <div>
                      💰 Price: ₹{show.ticketPrice}
                    </div>

                    <div>
                      🪑 Available Seats:
                      <strong>
                        {" "}
                        {show.availableSeats} / {show.totalSeats}
                      </strong>
                    </div>

                  </div>

                  {/* Book Button */}

                  <button
                    className="btn btn-danger btn-sm"
                    disabled={show.availableSeats === 0}
                    onClick={() =>
                      navigate(`/booking?showId=${show._id}`)
                    }
                  >
                    {show.availableSeats === 0 ? "Sold Out" : "Book"}
                  </button>

                </div>

              ))}

            </div>

          </div>

        ))

      )}

    </div>

  );
}

export default MovieDetails;