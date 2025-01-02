import React, { useState, useEffect } from "react";
import { useUser } from "../context/user.context";
import { FaCircleUser } from "react-icons/fa6";
import axios from "../config/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user, login } = useUser();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const getAllProjects = async () => {
    try {
      const res = await axios.get("/projects/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProjects(res.data.projects);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    getAllProjects();

    const handleKeyPress = (e) => {
      if (e.key === "Escape") setShowModal(false);
      if (e.key === "Enter" && showModal) handleCreateProject(e);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      if (newProjectName.trim().length === 0) {
        toast.error("Project name cannot be empty");
        return;
      }

      const res = await axios.post(
        "/projects/create",
        { name: newProjectName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 201) {
        const newProject = res.data.newProject;
        setProjects([...projects, newProject]);
        const updatedUser = {
          ...user,
          projects: [...projects, newProject],
        };
        login(updatedUser);
        setShowModal(false);
        setNewProjectName("");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.error || "Failed to create project");
    }
  };

  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-4 sticky top-0  z-10 p-4 shadow-md">
        <span className="text-2xl font-bold">Projects</span>
        <div className="text-2xl font-bold flex items-center">
          <FaCircleUser className="mr-2 mt-1" />
          {user?.email}
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Create Project
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="card bg-neutral shadow-xl transform transition-transform duration-300 hover:scale-105 cursor-pointer"
                onClick={() => navigate(`/${project._id}`, { state: project })}
              >
                <div className="card-body">
                  <h2 className="card-title">{project.name}</h2>
                  <p>Collaborators: {project.users.length}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            No projects available. Create one now!
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="card w-96 bg-neutral p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg mb-4">Create New Project</h3>
            <input
              type="text"
              placeholder="Project Name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="input input-bordered w-full mb-4"
            />
            <div className="flex justify-end gap-4">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreateProject}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
