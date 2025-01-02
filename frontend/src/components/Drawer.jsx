import React, { useState, useEffect } from "react";
import { FaCircleUser } from "react-icons/fa6";
import { FaArrowLeft, FaPlus, FaCheck } from "react-icons/fa";
import axios from "../config/axios";
import { debounce } from "lodash";
import toast from "react-hot-toast";

const Drawer = ({ isOpen, onClose, users, projectId, addUsers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]); // Keep track of selected user IDs
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === "Escape") {
      setIsModalOpen(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUserSelection = (user) => {
    if (selectedUsers.includes(user._id)) {
      setSelectedUsers(selectedUsers.filter((userId) => userId !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user._id]);
    }
  };

  const handleAddUsers = () => {
    addUsers(selectedUsers);
    setSelectedUsers([]);
    setIsModalOpen(false);
    setSearchTerm("");
  };

  const handleCancel = () => {
    setSelectedUsers([]);
    setIsModalOpen(false);
  };

  const fetchUsers = async (query) => {
    try {
      setLoading(true);
      const response = await axios.get(`/users/search/${query}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAllUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce the fetchUsers function to avoid API calls on every keystroke
  const debouncedFetchUsers = debounce((query) => {
    fetchUsers(query);
  }, 1000);

  useEffect(() => {
    if (isModalOpen && searchTerm.length > 2) {
      debouncedFetchUsers(searchTerm); // Call the debounced function
    }
    if (searchTerm.length === 0) {
      setAllUsers([]); // Clear user list if search is empty
    }
  }, [isModalOpen, searchTerm]);

  // Filter out users who are already part of the project
  const filteredUsers = allUsers.filter(
    (user) => !users.some((u) => u._id === user._id)
  );

  return (
    <>
      {/* Left Panel */}
      <div
        className={`fixed inset-y-0 left-0 w-1/4 bg-gray-700 shadow-lg border-r border-gray-300 transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onKeyDown={handleKeyPress}
        tabIndex={0}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-300">
          <h2 className="text-xl text-white font-bold">Collaborators</h2>
          <div className="flex items-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 rounded-full hover:bg-gray-200 hover:text-gray-950"
            >
              <FaPlus />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 hover:text-gray-950 ml-4"
            >
              <FaArrowLeft />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-screen">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex items-center mb-4 pb-3 border-b-2"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white">
                <FaCircleUser className="text-3xl mt-2" />
              </div>
              <span className="ml-2 text-xl">{user.email}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Positioned in the Center of the Screen */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-blue-950 p-6 rounded-lg w-1/3">
            <h3 className="text-xl text-white font-bold mb-4">
              Add Collaborators
            </h3>
            <input
              type="text"
              className="w-full p-2 mb-4 border rounded"
              placeholder="Search users"
              value={searchTerm}
              onChange={handleSearch}
            />
            <div className="max-h-60 overflow-y-auto">
              {loading ? (
                <div>Loading...</div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between mb-2 border-b-2 pb-2"
                  >
                    <div className="flex items-center">
                      <FaCircleUser className="text-2xl mr-2" />
                      <span>{user.email}</span>
                    </div>
                    <button
                      onClick={() => handleUserSelection(user)}
                      className="text-xl"
                    >
                      {selectedUsers.includes(user._id) ? (
                        <FaCheck />
                      ) : (
                        <FaPlus />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-white text-black rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUsers}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Drawer;
