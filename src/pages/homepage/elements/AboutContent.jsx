import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Layout from "../../../component/Layout";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import Quill from 'quill';

const Font = Quill.import('formats/font');
Font.whitelist = [
  'sans-serif', 'serif', 'monospace',
  'Amiri', 'Rubik-Bold', 'Rubik-Light',
  'Scheherazade-Regular', 'Scheherazade-Bold',
  'Aslam', 'Mehr-Nastaliq'
];

Quill.register(Font, true);

const modules = {
  toolbar: [
    [
      {
        font: [
          'Amiri',
          'Rubik-Bold',
          'Rubik-Light',
          'Scheherazade-Regular',
          'Scheherazade-Bold',
          'Aslam',
          'Mehr-Nastaliq',
          'serif',
          'sans-serif',
          'monospace'
        ]
      },
      { size: [] }
    ],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ align: [] }],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['link', 'image', 'video'],
    ['clean']
  ]
};



const formats = [
  'font',
  'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'header',
  'align',
  'blockquote', 'code-block',
  'list', 'bullet',
  'indent',
  'link', 'image', 'video',
  'clean'
];




const AboutContent = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Separate states for add and edit forms
  const [addFormData, setAddFormData] = useState({
    englishTitle: "",
    urduTitle: "",
    englishDescription: "",
    urduDescription: "",
    image: null,
  });

  const [selectedContent, setSelectedContent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Edit form has its own state
  const [editFormData, setEditFormData] = useState({
    englishTitle: "",
    urduTitle: "",
    englishDescription: "",
    urduDescription: "",
    image: null,
  });

  const baseURL = "https://newmmdata-backend.onrender.com";



  const fetchContent = async () => {
    try {
      const res = await axios.get(`${baseURL}/api/about`);
      setContents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to load about content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAddFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!addFormData.image) {
      Swal.fire("Error", "Image is required.", "error");
      return;
    }

    const form = new FormData();
    Object.entries(addFormData).forEach(([key, value]) => {
      form.append(key, value);
    });

    Swal.fire({
      title: "Submitting...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await axios.post(`${baseURL}/api/about`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchContent();
      setAddFormData({
        englishTitle: "",
        urduTitle: "",
        englishDescription: "",
        urduDescription: "",
        image: null,
      });
      setIsAddModalOpen(false);
      Swal.fire("Success", "Content added successfully.", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to add the content.", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      Swal.fire({
        title: "Deleting...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        await axios.delete(`${baseURL}/api/about/${id}`);
        setContents((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "Content has been deleted.", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to delete the content.", "error");
      }
    }
  };

  const openEditModal = (item) => {
    setSelectedContent(item);
    setEditFormData({
      englishTitle: item.englishTitle,
      urduTitle: item.urduTitle,
      englishDescription: item.englishDescription,
      urduDescription: item.urduDescription,
      image: null,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.entries(editFormData).forEach(([key, value]) => {
      if (value) form.append(key, value);
    });

    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await axios.put(`${baseURL}/api/about/${selectedContent.id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchContent();
      setIsEditModalOpen(false);
      Swal.fire("Success", "Content updated successfully.", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to update the content.", "error");
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold text-center mb-8">About Us</h2>

        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="text-right mb-4">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Content
          </button>
        </div>

        {/* Add Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Add About Content</h3>
              <form onSubmit={handleAddSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium">English Title</label>
                    <input
                      type="text"
                      name="englishTitle"
                      value={addFormData.englishTitle}
                      onChange={handleAddInputChange}
                      required
                      className="mt-1 p-2 border border-gray-300 rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Urdu Title</label>
                    <input
                      type="text"
                      name="urduTitle"
                      value={addFormData.urduTitle}
                      onChange={handleAddInputChange}
                      required
                      className="mt-1 p-2 border border-gray-300 rounded w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium">English Description</label>
                    <ReactQuill
                      theme="snow"
                      value={addFormData.englishDescription}
                      onChange={(value) => setAddFormData({...addFormData, englishDescription: value})}
                      modules={modules}
                      formats={formats}
                      className="bg-white border rounded-lg min-h-[200px]"
                      style={{ direction: 'ltr', textAlign: 'left' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium">Urdu Description</label>
                    <ReactQuill
                      theme="snow"
                      value={addFormData.urduDescription}
                      onChange={(value) => setAddFormData({...addFormData, urduDescription: value})}
                      modules={modules}
                      formats={formats}
                      className="bg-white border rounded-lg min-h-[200px]"
                      style={{ direction: 'rtl', textAlign: 'right' }}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAddImageChange}
                    required
                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-gray-400 text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {!loading && contents.length > 0 && (
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full bg-white shadow border rounded-lg">
              <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                <tr>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">English Title</th>
                  <th className="px-4 py-3">Urdu Title</th>
                  <th className="px-4 py-3">English Description</th>
                  <th className="px-4 py-3">Urdu Description</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contents.map((item) => (
                  <tr key={item.id} className="border-t text-sm">
                    <td className="px-4 py-3">
                      <img
                        src={`${baseURL}/api/about/image/${item.id}`}
                        alt="About"
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-4 py-3">{item.englishTitle}</td>
                    <td className="px-4 py-3 text-right">{item.urduTitle}</td>
                    <td className="px-4 py-3">
                      <div dangerouslySetInnerHTML={{ __html: 
                        item.englishDescription.length > 300
                          ? `${item.englishDescription.substring(0, 300)}...`
                          : item.englishDescription
                      }} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div dangerouslySetInnerHTML={{ __html: 
                        item.urduDescription.length > 300
                          ? `${item.urduDescription.substring(0, 300)}...`
                          : item.urduDescription
                      }} />
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedContent(item);
                            setIsViewModalOpen(true);
                          }}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* View Modal */}
        {isViewModalOpen && selectedContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-auto">
            <div className="bg-white p-6 rounded-lg max-w-xl w-full max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">View Content</h3>
              <img
                src={`${baseURL}/api/about/image/${selectedContent.id}`}
                alt="About"
                className="w-40 h-40 object-cover mb-4 rounded"
              />
              <p><strong>English Title:</strong> {selectedContent.englishTitle}</p>
              <p><strong>Urdu Title:</strong> {selectedContent.urduTitle}</p>
              <p><strong>English Description:</strong></p>
              <div dangerouslySetInnerHTML={{ __html: selectedContent.englishDescription }} />
              <p><strong>Urdu Description:</strong></p>
              <div dangerouslySetInnerHTML={{ __html: selectedContent.urduDescription }} />
              <div className="text-right mt-4">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && selectedContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Edit About Content</h3>
              <form onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium">English Title</label>
                    <input
                      type="text"
                      name="englishTitle"
                      value={editFormData.englishTitle}
                      onChange={handleEditInputChange}
                      required
                      className="mt-1 p-2 border border-gray-300 rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Urdu Title</label>
                    <input
                      type="text"
                      name="urduTitle"
                      value={editFormData.urduTitle}
                      onChange={handleEditInputChange}
                      required
                      className="mt-1 p-2 border border-gray-300 rounded w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium">English Description</label>
                    <ReactQuill
                      theme="snow"
                      value={editFormData.englishDescription}
                      onChange={(value) => setEditFormData({...editFormData, englishDescription: value})}
                      modules={modules}
                      formats={formats}
                      className="bg-white border rounded-lg min-h-[200px]"
                      style={{ direction: 'ltr', textAlign: 'left' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium">Urdu Description</label>
                    <ReactQuill
                      theme="snow"
                      value={editFormData.urduDescription}
                      onChange={(value) => setEditFormData({...editFormData, urduDescription: value})}
                      modules={modules}
                      formats={formats}
                      className="bg-white border rounded-lg min-h-[200px]"
                      style={{ direction: 'rtl', textAlign: 'right' }}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-gray-400 text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AboutContent;