import React, { useEffect, useState } from "react";
import "./admin.css"; // optional, if you have styling
import "./AllStores.css"
function AllStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/stores") // use full backend URL or proxy
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Ensure rating is a number
        const sanitized = data.map((store) => ({
          ...store,
          rating: store.rating != null ? Number(store.rating) : 0,
        }));
        setStores(sanitized);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // Filter stores based on search input
  const filteredStores = stores.filter((store) =>
    store.name?.toLowerCase().includes(search.toLowerCase()) ||
    store.email?.toLowerCase().includes(search.toLowerCase()) ||
    store.address?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="status loading">⏳ Loading stores...</div>;
  if (error) return <div className="status error">❌ Error: {error}</div>;

  return (
    <div className="all-stores">
      <h1>All Stores ({filteredStores.length})</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="🔍 Search by name, email, or address..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />

      {filteredStores.length === 0 ? (
        <div className="status empty">⚠️ No stores found.</div>
      ) : (
        <table className="stores-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {filteredStores.map((store) => (
              <tr key={store.id}>
                <td>{store.name || "N/A"}</td>
                <td>{store.email || "N/A"}</td>
                <td>{store.address || "N/A"}</td>
                <td>{store.rating != null ? store.rating.toFixed(1) : "N/A"} ⭐</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AllStores;
