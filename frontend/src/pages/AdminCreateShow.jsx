import { useEffect, useState } from 'react';
import {
  getMovies,
  createMovie,
  updateMovie,
  deleteMovie
} from '../services/movieService';
import {
  createShow,
  getShows,
  cancelShow,
  updateShow
} from '../services/showService';
import {
  getAllTheatres,
  getScreensByTheatre
} from '../services/theatreService';
import { getToken } from '../services/authService';

function AdminCreateShow() {

  const [activeTab, setActiveTab] = useState('movie');

  /* ================= MOVIE STATES (UNCHANGED) ================= */

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const [search, setSearch] = useState({
    search: '',
    page: 1,
    limit: 5
  });

  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    language: '',
    duration: '',
    rating: '',
    description: ''
  });

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1
  });

  /* ================= SHOW STATES ================= */

  const [shows, setShows] = useState([]);
  const [selectedMovieForShow, setSelectedMovieForShow] = useState(null);

  const [movieSearchShowTab, setMovieSearchShowTab] = useState('');
  const [showSearch, setShowSearch] = useState('');

  // Theatre → Screen cascade for show creation
  const [theatres, setTheatres] = useState([]);
  const [screenOptions, setScreenOptions] = useState([]);
  const [selectedTheatreId, setSelectedTheatreId] = useState('');

  const [showForm, setShowForm] = useState({
    screenId: '',
    showDate: '',
    showTime: '',
    ticketPrice: ''
  });

  const [editingShow, setEditingShow] = useState(null);
  const [editForm, setEditForm] = useState({ showDate: '', showTime: '', ticketPrice: '' });

  const token = getToken();
  const user = JSON.parse(localStorage.getItem('user'));

  /* ================= FETCH MOVIES ================= */

  useEffect(() => {
    fetchMovies();
  }, [search.page]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const data = await getMovies(search);
      setMovies(data.data || []);
      setPagination({
        total: data.total || 0,
        totalPages: data.totalPages || 1
      });
    } catch {
      alert('Error fetching movies');
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH SHOWS ================= */

  useEffect(() => {
    fetchShows();
    fetchTheatres();
  }, []);

  const fetchTheatres = async () => {
    try {
      const res = await getAllTheatres();
      setTheatres(res.data.data || []);
    } catch { /* silent */ }
  };

  const handleTheatreChange = async (theatreId) => {
    setSelectedTheatreId(theatreId);
    setShowForm(f => ({ ...f, screenId: '' }));
    setScreenOptions([]);
    if (!theatreId) return;
    try {
      const res = await getScreensByTheatre(theatreId);
      setScreenOptions(res.data.data || res.data || []);
    } catch { /* silent */ }
  };

  // const fetchShows = async () => {
  //   try {
  //     const data = await getShows();
  //     setShows(data.data || []);
  //   } catch {
  //     alert('Error fetching shows');
  //   }
  // };
  const fetchShows = async () => {
  try {
    const res = await getShows();

    console.log("Shows API response:", res);

    setShows(res || []);
  } catch (err) {
    console.error("Error fetching shows:", err);
    alert("Error fetching shows");
  }
};

  /* ================= MOVIE FUNCTIONS (UNCHANGED) ================= */

  const handleSearch = () => {
    setSearch({ ...search, page: 1 });
    fetchMovies();
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      genre: '',
      language: '',
      duration: '',
      rating: '',
      description: ''
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const movieData = {
      ...formData,
      genre: formData.genre.split(',').map(g => g.trim())
    };

    try {
      if (editingId) {
        await updateMovie(editingId, movieData);
        alert('Movie updated successfully');
      } else {
        await createMovie(movieData);
        alert('Movie created successfully');
      }

      resetForm();
      fetchMovies();
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  const handleEdit = (movie) => {
    setFormData({
      title: movie.title,
      genre: movie.genre.join(', '),
      language: movie.language,
      duration: movie.duration,
      rating: movie.rating,
      description: movie.description
    });
    setEditingId(movie._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    await deleteMovie(id);
    fetchMovies();
  };

  const handleViewDetails = (movie) => {
    setSelectedMovie(movie);
  };

  const changePage = (newPage) => {
    setSearch({ ...search, page: newPage });
  };

  /* ================= SHOW FUNCTIONS ================= */

  const handleCreateShow = async (e) => {
    e.preventDefault();

    try {

      const payload = {
        movieId: selectedMovieForShow._id,
        ...showForm
      };

      if (editingShowId) {

        // UPDATE SHOW
        await updateShow(editingShowId, payload);
        alert("Show updated successfully");

      } else {

        // CREATE SHOW
        await createShow(payload);
        alert("Show created successfully");

      }

      setEditingShowId(null);

      setShowForm({
        screenId: '',
        showDate: '',
        showTime: '',
        ticketPrice: ''
      });

      setSelectedMovieForShow(null);
      fetchShows();

    } catch (err) {
      alert(err.response?.data?.message || 'Error saving show');
    }
  };
  const handleCancelShow = async (id) => {
    if (!window.confirm('Cancel this show?')) return;
    await cancelShow(id);
    fetchShows();
  };

  const handleEditShow = async (show) => {

    const theatreId = show.screenId?.theatreId?._id || show.screenId?.theatreId;

    setEditingShowId(show._id);   // ⭐ important

    setSelectedMovieForShow(show.movieId);
    setSelectedTheatreId(theatreId);

    try {
      const res = await getScreensByTheatre(theatreId);
      const screens = res.data.data || res.data || [];

      setScreenOptions(screens);

      setShowForm({
        screenId: show.screenId?._id || "",
        showDate: show.showDate?.split("T")[0],
        showTime: show.showTime,
        ticketPrice: show.ticketPrice
      });

    } catch (err) {
      console.error("Error loading screens:", err);
    }
  };

  /* ================= AUTH CHECK ================= */

  if (!token || user?.role !== 'Admin') {
    return (
      <div className="container mt-5 text-center">
        <h4>Access Denied</h4>
        <p className="text-danger">Admins only.</p>
      </div>
    );
  }
  // =================== show model popup=======================

  // const openShowModal = (movie) => {
  //   setSelectedMovieForShow(movie);
  //   setSelectedTheatreId('');
  //   setScreenOptions([]);
  // };

  const openShowModal = (movie) => {
    setEditingShowId(null); // ⭐ reset edit mode

    setSelectedMovieForShow(movie);
    setSelectedTheatreId('');
    setScreenOptions([]);

    setShowForm({
      screenId: '',
      showDate: '',
      showTime: '',
      ticketPrice: ''
    });
  };


  // const closeShowModal = () => {
  //   setSelectedMovieForShow(null);
  //   setSelectedTheatreId('');
  //   setScreenOptions([]);
  //   setShowForm({ screenId: '', showDate: '', showTime: '', ticketPrice: '' });
  // };

  const closeShowModal = () => {
    setEditingShowId(null);

    setSelectedMovieForShow(null);
    setSelectedTheatreId('');
    setScreenOptions([]);

    setShowForm({
      screenId: '',
      showDate: '',
      showTime: '',
      ticketPrice: ''
    });
  };

  const filteredMoviesForShow = movies.filter(movie =>
    movie.title.toLowerCase().includes(movieSearchShowTab.toLowerCase())
  );

  const filteredShows = shows.filter(show => {
    const searchValue = showSearch.toLowerCase();

    const movieTitle = show.movieId?.title?.toLowerCase() || "";
    const theatreName = show.screenId?.theatreId?.name?.toLowerCase() || "";
    const screenName = show.screenId?.screenName?.toLowerCase() || "";
    const showDate = new Date(show.showDate).toLocaleDateString('en-GB').toLowerCase();
    const showTime = show.showTime?.toLowerCase() || "";

    return (
      movieTitle.includes(searchValue) ||
      theatreName.includes(searchValue) ||
      screenName.includes(searchValue) ||
      showDate.includes(searchValue) ||
      showTime.includes(searchValue)
    );
  });

  return (
    <div className="container mt-5">

      <h2>Admin Panel</h2>

      {/* Tabs */}
      <div className="mb-4">
        <button
          className={`btn me-2 ${activeTab === 'movie' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('movie')}
        >
          Movie Management
        </button>

        <button
          className={`btn ${activeTab === 'show' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('show')}
        >
          Show Management
        </button>
      </div>

      {/* ================= MOVIE TAB (UNCHANGED) ================= */}
      {activeTab === 'movie' && (
        <>
          {/* Search */}
          <div className="card p-3 mb-4">
            <div className="row">
              <div className="col-md-10">
                <input
                  type="text"
                  placeholder="Search by title, language, or genre..."
                  className="form-control"
                  value={search.search}
                  onChange={(e) =>
                    setSearch({ ...search, search: e.target.value })
                  }
                />
              </div>
              <div className="col-md-2">
                <button className="btn btn-primary w-100" onClick={handleSearch}>
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="card p-4 mb-4">
            <h5>{editingId ? 'Update Movie' : 'Create Movie'}</h5>

            <input name="title" placeholder="Title" className="form-control mb-2"
              value={formData.title} onChange={handleFormChange} required />

            <input name="genre" placeholder="Genre (comma separated)"
              className="form-control mb-2"
              value={formData.genre} onChange={handleFormChange} />

            <input name="language" placeholder="Language"
              className="form-control mb-2"
              value={formData.language} onChange={handleFormChange} />

            <input type="number" name="duration" placeholder="Duration"
              className="form-control mb-2"
              value={formData.duration} onChange={handleFormChange} />

            <input type="number" name="rating" placeholder="Rating (0-10)"
              className="form-control mb-2"
              value={formData.rating} onChange={handleFormChange} />

            <textarea name="description" placeholder="Description"
              className="form-control mb-2"
              value={formData.description} onChange={handleFormChange} />

            <button className="btn btn-success">
              {editingId ? 'Update Movie' : 'Create Movie'}
            </button>
          </form>

          {/* Table */}
          {loading ? <p>Loading...</p> : (
            <>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Language</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((movie) => (
                    <tr key={movie._id}>
                      <td>{movie.title}</td>
                      <td>{movie.language}</td>
                      <td>{movie.rating}</td>
                      <td>
                        <button
                          className="btn btn-info btn-sm me-2"
                          onClick={() => handleViewDetails(movie)}
                        >
                          Details
                        </button>

                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleEdit(movie)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(movie._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="d-flex justify-content-center">
                {Array.from({ length: pagination.totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`btn btn-sm mx-1 ${search.page === i + 1 ? 'btn-primary' : 'btn-outline-primary'
                      }`}
                    onClick={() => changePage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Details Modal */}
          {selectedMovie && (
            <div className="modal d-block">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Movie Details</h5>
                    <button
                      className="btn-close"
                      onClick={() => setSelectedMovie(null)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p><strong>Title:</strong> {selectedMovie.title}</p>
                    <p><strong>Language:</strong> {selectedMovie.language}</p>
                    <p><strong>Genre:</strong> {selectedMovie.genre.join(', ')}</p>
                    <p><strong>Duration:</strong> {selectedMovie.duration} minutes</p>
                    <p><strong>Rating:</strong> {selectedMovie.rating}</p>
                    <p><strong>Description:</strong> {selectedMovie.description}</p>
                    <p><strong>Status:</strong> {selectedMovie.status}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================= SHOW TAB ================= */}
      {/* ================= SHOW TAB ================= */}
      {activeTab === 'show' && (
        <div className="row">

          {/* LEFT COLUMN – MOVIES */}
          <div className="col-md-6">
            
            <h4>Movies</h4>

            <input
              type="text"
              placeholder="Search movie..."
              className="form-control mb-2"
              value={movieSearchShowTab}
              onChange={(e) => setMovieSearchShowTab(e.target.value)}
            />
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Create Show</th>
                </tr>
              </thead>
              <tbody>
                {filteredMoviesForShow.map(movie => (
                  <tr key={movie._id}>
                    <td>{movie.title}</td>
                    <td>
                      {/* <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openShowModal(movie)}
                      >
                        Create Show
                      </button> */}
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openShowModal(movie)}
                      >
                        Create Show
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RIGHT COLUMN – SHOW LIST */}
          <div className="col-md-6">
            <h4>All Shows</h4>
            <input
              type="text"
              placeholder="Search by movie, theatre, screen, date or time..."
              className="form-control mb-2"
              value={showSearch}
              onChange={(e) => setShowSearch(e.target.value)}
            />
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Movie</th>
                  <th>Theatre</th>
                  <th>Screen</th>
                  <th>Date (dd/mm/yyyy)</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShows.map(show => (
                  <tr key={show._id}>
                    <td>{show.movieId?.title}</td>
                    <td>{show.screenId?.theatreId?.name}</td>
                    <td>{show.screenId?.screenName}</td>
                    <td>{new Date(show.showDate).toLocaleDateString('en-GB')}</td>
                    <td>{show.showTime}</td>
                    <td>{show.status}</td>
                    <td>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleEditShow(show)}
                        >
                          Edit
                        </button>

                      {show.status === 'Active' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancelShow(show._id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ================= SHOW CREATION MODAL ================= */}
      {selectedMovieForShow && (
        <div
          className="modal d-block"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                {/* <h5 className="modal-title">
                  Create Show for: {selectedMovieForShow.title}
                </h5> */}
                <h5 className="modal-title">
                  {editingShowId ? "Edit Show" : "Create Show"} for: {selectedMovieForShow.title}
                </h5>
                <button
                  className="btn-close"
                  onClick={closeShowModal}
                ></button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleCreateShow}>

                  {/* Theatre dropdown */}
                  <label className="form-label small text-muted">Select Theatre</label>
                  <select
                    className="form-select mb-2"
                    value={selectedTheatreId}
                    onChange={(e) => handleTheatreChange(e.target.value)}
                    required>
                    <option value="">-- Choose Theatre --</option>
                    {theatres.map(t => (
                      <option key={t._id} value={t._id}>{t.name} — {t.city}</option>
                    ))}
                  </select>

                  {/* Screen dropdown (loads after theatre selected) */}
                  <label className="form-label small text-muted">Select Screen</label>
                  <select
                    className="form-select mb-2"
                    value={showForm.screenId}
                    onChange={(e) => setShowForm({ ...showForm, screenId: e.target.value })}
                    disabled={!selectedTheatreId}
                    required>
                    <option value="">{selectedTheatreId ? '-- Choose Screen --' : 'Select a theatre first'}</option>
                    {screenOptions.map(s => (
                      <option key={s._id} value={s._id}>{s.screenName} ({s.totalSeats} seats)</option>
                    ))}
                  </select>

                  <input
                    type="date"
                    className="form-control mb-2"
                    value={showForm.showDate}
                    onChange={(e) =>
                      setShowForm({ ...showForm, showDate: e.target.value })
                    }
                    required
                  />

                  <input
                    type="time"
                    className="form-control mb-2"
                    value={showForm.showTime}
                    onChange={(e) =>
                      setShowForm({ ...showForm, showTime: e.target.value })
                    }
                    required
                  />

                  <input
                    type="number"
                    className="form-control mb-3"
                    placeholder="Ticket Price"
                    value={showForm.ticketPrice}
                    onChange={(e) =>
                      setShowForm({ ...showForm, ticketPrice: e.target.value })
                    }
                    required
                  />

                  {/* <button className="btn btn-success w-100">
                    Create Show
                  </button> */}
                  <button className="btn btn-success w-100">
                    {editingShowId ? "Update Show" : "Create Show"}
                  </button>

                </form>
              </div>

            </div>
          </div>
        </div>
      )}
      {editingShow && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Show: {editingShow.movieId?.title}</h5>
                <button className="btn-close" onClick={closeEditModal}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdateShow}>
                  <label className="form-label small text-muted">Show Date</label>
                  <input
                    type="date"
                    className="form-control mb-2"
                    value={editForm.showDate}
                    onChange={(e) => setEditForm({ ...editForm, showDate: e.target.value })}
                    required
                  />
                  <label className="form-label small text-muted">Show Time</label>
                  <input
                    type="time"
                    className="form-control mb-2"
                    value={editForm.showTime}
                    onChange={(e) => setEditForm({ ...editForm, showTime: e.target.value })}
                    required
                  />
                  <label className="form-label small text-muted">Ticket Price</label>
                  <input
                    type="number"
                    className="form-control mb-3"
                    placeholder="Ticket Price"
                    value={editForm.ticketPrice}
                    onChange={(e) => setEditForm({ ...editForm, ticketPrice: e.target.value })}
                    required
                  />
                  <button className="btn btn-success w-100">Update Show</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCreateShow;