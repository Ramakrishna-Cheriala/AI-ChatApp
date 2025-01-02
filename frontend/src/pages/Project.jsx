import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import MessageComponent from "../components/MessageComponent";
import axios from "../config/axios";
import Drawer from "../components/Drawer";
import toast from "react-hot-toast";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import { useUser } from "../context/user.context";

const Project = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [project, setProject] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Ref for scrolling to the bottom
  const messagesEndRef = useRef(null);

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getProjectDetails = async () => {
    axios
      .get(`/projects/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        setProject(res.data.project);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getProjectDetails();
    initializeSocket(id);

    // Receive messages and scroll to bottom
    receiveMessage("project-message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      scrollToBottom(); // Scroll to the latest message
    });
  }, [id]);

  useEffect(() => {
    // Scroll to the bottom whenever messages are updated
    scrollToBottom();
  }, [messages]); // Trigger scroll on message update

  const handleSendMessage = () => {
    if (message.trim()) {
      // Send message to socket
      sendMessage("project-message", {
        message,
        sender_id: user._id,
        sender_email: user.email,
      });

      // Add the sent message to the chat and scroll to bottom
      setMessages((prevMessages) => [
        ...prevMessages,
        { message, sender_id: user._id, sender_email: user.email },
      ]);
      setMessage("");
      scrollToBottom(); // Scroll after sending the message
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddUsers = (users) => {
    try {
      axios
        .put(
          `/projects/add-user/${id}`,
          { users },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((res) => {
          getProjectDetails(); // Update project details after adding users
          toast.success("Users added successfully");
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to add users");
        });
    } catch (error) {
      console.log(error);
      toast.error("Error occurred while adding users");
    }
  };

  return (
    <div className="h-screen flex">
      {project?.users && (
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          users={project?.users}
          projectId={id}
          addUsers={(users) => handleAddUsers(users)}
        />
      )}

      <div className="w-1/4 border-r border-gray-300 flex flex-col">
        <div className="flex items-center p-4 border-b border-gray-300">
          <button
            className="mr-4 p-2 rounded-full hover:bg-gray-200 hover:text-gray-950"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
          </button>
          <div className="flex justify-between w-full">
            <h2 className="text-2xl font-bold">{project.name}</h2>
            <button
              className="mr-4 p-2 rounded-full hover:bg-gray-200 hover:text-gray-950"
              onClick={() => setIsDrawerOpen(true)}
            >
              <FaUsers className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Messages Section */}
        <div className="flex-grow overflow-y-auto p-4">
          <MessageComponent messages={messages} />
          {/* Ref for scrolling to the bottom */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Field at Bottom */}
        <div className="mt-auto mr-2 ml-2 pb-4 border-t border-gray-300 flex">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            rows="1"
            onKeyDown={handleKeyPress}
            className="flex-grow border border-gray-300 rounded-l-md focus:outline-none resize-y max-h-32 overflow-y-auto p-6"
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-3/4 p-4">
        <h1 className="text-2xl font-bold mb-4">Project Details</h1>
        <p>More content about the project can go here.</p>
      </div>
    </div>
  );
};

export default Project;
