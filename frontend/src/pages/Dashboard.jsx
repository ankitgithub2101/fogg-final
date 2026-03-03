import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";
import Toast from "../components/Toasts";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [filesList, setFilesList] = useState([]);
  const [editFileId, setEditFileId] = useState(null); // for modal edit
  const navigate = useNavigate();

  const toastRef = useRef();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    fetchFiles();
  }, []);

  const showToast = (type, message) => {
    toastRef.current?.show(type, message);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await API.get("/files/myfiles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFilesList(data);
    } catch (err) {
      console.error(err);
      showToast("danger", "Failed to fetch files");
    }
  };

  const handleUpload = async () => {
    if (!file) return showToast("warning", "Select a file first");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      await API.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      showToast("success", "File uploaded successfully!");
      setFile(null);
      fetchFiles();
    } catch (err) {
      console.error(err);
      showToast("danger", "Upload failed");
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/files/file/${fileId}`, { headers: { Authorization: `Bearer ${token}` } });
      setFilesList(filesList.filter((f) => f._id !== fileId));
      showToast("success", "File deleted successfully!");
    } catch (err) {
      console.error(err);
      showToast("danger", "Delete failed");
    }
  };

  const handleEdit = (fileId) => {
    setEditFileId(fileId); // open modal
  };

  const handleEditSubmit = async () => {
    if (!file) return showToast("warning", "Select a new file first");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      await API.put(`/files/file/${editFileId}`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      showToast("success", "File updated successfully!");
      setFile(null);
      setEditFileId(null);
      fetchFiles();
    } catch (err) {
      console.error(err);
      showToast("danger", "Update failed");
    }
  };

  return (
    <div>
      <Navbar user={user} onLogout={handleLogout} />
      <Toast ref={toastRef} />

      <div className="p-4 max-w-3xl mx-auto">
        {/* Upload */}
        <div className="flex gap-2 mb-4">
          <input type="file" onChange={handleFileChange} className="flex-1" />
          <button onClick={handleUpload} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Upload
          </button>
        </div>

        {/* File list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filesList.map((f) => (
            <div key={f._id} className="bg-gray-100 p-2 rounded flex flex-col items-center gap-2">
              {f.mimetype.startsWith("image/") ? (
                <img src={`http://localhost:5000/${f.path}`} alt={f.originalname} className="w-30 rounded" />
              ) : (
                <a href={`http://localhost:5000/${f.path}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  {f.originalname}
                </a>
              )}
              <div className="flex gap-2">
                <button onClick={() => handleEdit(f._id)} className="bg-yellow-500 px-3 py-1 rounded hover:bg-yellow-600">
                  Edit
                </button>
                <button onClick={() => handleDelete(f._id)} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editFileId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-96">
              <h3 className="text-lg font-semibold mb-4">Edit File</h3>
              <input type="file" onChange={handleFileChange} className="mb-4 w-full" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditFileId(null)} className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400">
                  Cancel
                </button>
                <button onClick={handleEditSubmit} className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600">
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;