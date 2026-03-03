import React from "react";

function BogusNavbar({ user, onLogout }) {
  return (
    <nav className="bg-red-600 text-white p-4 flex justify-between items-center shadow">
      <div className="text-lg font-bold">User Dashboard 🎭</div>
      <div className="flex items-center gap-4">
        {user && <span className="hidden sm:inline">Hello, {user.name}</span>}
        <button
          onClick={onLogout}
          className="bg-red-800 px-3 py-1 rounded hover:bg-red-900 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default BogusNavbar;