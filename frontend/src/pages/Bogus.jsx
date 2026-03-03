import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import BogusNavbar from "../components/BogusNavbar";
import Toast from "../components/Toasts";

function Bogus() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [filesList, setFilesList] = useState([]);
  const [editFileId, setEditFileId] = useState(null);
  const [user, setUser] = useState(null);

  const toastRef = useRef();

  const showToast = (type, message) => {
    toastRef.current?.show(type, message);
  };

  useEffect(() => {
    const bogusMode = localStorage.getItem("bogusMode");
    if (!bogusMode) {
      navigate("/login", { replace: true });
    } else {
      fetchFiles();
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("bogusMode");
    navigate("/login", { replace: true });
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const fetchFiles = async () => {
    try {
      const { data } = await API.get("/files/bogus-myfiles");
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
      await API.post("/files/bogus-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
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
      await API.delete(`/files/bogus-file/${fileId}`);
      setFilesList(filesList.filter((f) => f._id !== fileId));
      showToast("success", "File deleted successfully!");
    } catch (err) {
      console.error(err);
      showToast("danger", "Delete failed");
    }
  };

  const handleEdit = (fileId) => setEditFileId(fileId);

  const handleEditSubmit = async () => {
    if (!file) return showToast("warning", "Select a new file first");
    const formData = new FormData();
    formData.append("file", file);

    try {
      await API.put(`/files/bogus-file/${editFileId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
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
      <BogusNavbar user={user} onLogout={handleLogout} />
      <Toast ref={toastRef} />

      <div className="p-4 max-w-3xl mx-auto">
        {/* Upload */}
        <div className="flex gap-2 mb-4">
          <input type="file" onChange={handleFileChange} className="flex-1" />
          <button
            onClick={handleUpload}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Upload
          </button>
        </div>

        {/* File list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filesList.map((f) => (
            <div key={f._id} className="bg-gray-100 p-2 rounded flex flex-col items-center gap-2">
              {f.mimetype.startsWith("image/") ? (
                <img
                  src={`https://fogg-final.netlify.app/${f.path}`}
                  alt={f.originalname}
                  className="w-30 rounded"
                />
              ) : (
                <a
                  href={`https://fogg-final.netlify.app/${f.path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  {f.originalname}
                </a>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(f._id)}
                  className="bg-yellow-500 px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(f._id)}
                  className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                >
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
                <button
                  onClick={() => setEditFileId(null)}
                  className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                >
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

export default Bogus;