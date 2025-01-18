import React, { useState, useEffect } from "react";
import axios from "axios";

const LoginCounter = () => {
  const [stats, setStats] = useState({ loginCount: 0, totalUsers: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        // Gọi API với thông tin xác thực
        const response = await axios.get(`${API_URL}/api/stats/login-count`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data.success && isMounted) {
          setStats(response.data.data);
          setError(null);
        } else if (isMounted) {
          setError("Failed to load data");
        }
      } catch (err) {
        console.error("Error details:", err);
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to load statistics");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [API_URL]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">Loading statistics...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-xl">
          {error}
          <br />
          Please try again later.
        </div>
      </div>
    );

  const percentage = (stats.loginCount / stats.totalUsers) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-2xl font-bold mb-4">Daily Login Statistics</h2>
      <div className="relative w-48 h-48">
        <svg className="transform -rotate-90 w-48 h-48">
          <circle
            cx="96"
            cy="96"
            r="45"
            stroke="#eee"
            strokeWidth="10"
            fill="transparent"
            className="absolute"
          />
          <circle
            cx="96"
            cy="96"
            r="45"
            stroke="#3b82f6"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold">{stats.loginCount}</div>
          <div className="text-gray-500">of</div>
          <div className="text-xl">{stats.totalUsers}</div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-lg">
          {percentage.toFixed(1)}% users logged in today
        </p>
      </div>
    </div>
  );
};

export default LoginCounter;
