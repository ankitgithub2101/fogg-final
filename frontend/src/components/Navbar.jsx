import React from "react";

function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-blue-600 text-white flex justify-between items-center p-4 shadow-md">
      <div className="font-bold text-lg">Fog Computing</div>
      {user && (
        <div className="flex items-center gap-4">
          <span>{user.name}</span>
          <button
            onClick={onLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;