import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">🚫 Access Denied</h1>
      <p className="text-lg mb-6">
        You don't have permission to view this page.
      </p>
      <Link
        to="/"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default Unauthorized;
