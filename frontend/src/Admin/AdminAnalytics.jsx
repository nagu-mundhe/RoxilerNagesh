import React, { useState, useEffect } from "react";

function AdminAnalytics() {
  const [dashboard, setDashboard] = useState({ totalUsers: 0, totalStores: 0 });

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard")
      .then(res => res.json())
      .then(data => setDashboard(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="analytics">
      <h1>Dashboard</h1>
      <div>Total Users: {dashboard.totalUsers}</div>
      <div>Total Stores: {dashboard.totalStores}</div>
    </div>
  );
}

export default AdminAnalytics;
