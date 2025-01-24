import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useUser } from "../context/user.context";
import axios from "../config/axios";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import { FaArrowLeft, FaUsers } from "react-icons/fa";
import MessageComponent from "../components/MessageComponent";

const Messages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const chat = location.state;

  // Refs for scrolling and infinite scroll
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const previousScrollHeightRef = useRef(0);

  // Scroll to bottom function
  const scrollToBottom = (behavior = "auto") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Fetch messages with pagination
  const getMessages = async (currentPage) => {
    if (!chat || !hasMore || loading) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `/chats/messages/${chat._id}?page=${currentPage}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        const newMessages = response.data.messages;
        const container = messagesContainerRef.current;

        // If it's the first page, replace messages and scroll to bottom
        if (currentPage === 1) {
          setMessages(newMessages);
          requestAnimationFrame(() => scrollToBottom("smooth"));
        }
        // For subsequent pages, prepend messages and maintain scroll position
        else {
          const previousScrollHeight = container.scrollHeight;
          setMessages((prevMessages) => [...newMessages, ...prevMessages]);

          requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight - previousScrollHeight;
          });
        }

        // Check if there are more messages
        setHasMore(newMessages.length === limit);
      }
    } catch (error) {
      console.error("Error fetching messages:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle infinite scroll
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Check if scrolled to the top
    if (container.scrollTop === 0 && hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
      getMessages(page + 1);
    }
  };

  // Initial setup for socket and message loading
  useEffect(() => {
    if (chat) {
      getMessages(1);
      if (chat.chatType === "group") {
        initializeSocket(id);
      } else {
        initializeSocket(chat._id);
      }

      // Listen for incoming messages
      receiveMessage("chat-message", (data) => {
        setMessages((prevMessages) => [...prevMessages, data]);
        requestAnimationFrame(() => scrollToBottom("smooth"));
      });
    }
  }, [id, chat]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!chat) return;

    try {
      const messagePayload = { message };
      const apiUrl =
        chat.chatType === "private"
          ? `/chats/send-message/${id}`
          : `/chats/send-group-message/${id}`;

      const response = await axios.post(apiUrl, messagePayload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        setMessages((prevMessages) => [
          ...prevMessages,
          response.data.newMessage,
        ]);
        setMessage("");
        sendMessage("chat-message", response.data.newMessage);
        requestAnimationFrame(() => scrollToBottom("smooth"));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!chat) return <div>Select a chat to start messaging</div>;

  return (
    <div className="h-screen flex bg-gray-900">
      <div className="w-full border-r border-gray-300 flex flex-col">
        <div className="flex items-center p-4 border-b border-gray-300">
          <button
            className="mr-4 p-2 rounded-full hover:bg-gray-200 hover:text-gray-950"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
          </button>
          <div className="flex justify-between w-full">
            <h2 className="text-2xl font-bold">{chat?.chatName}</h2>
            <button
              className="mr-4 p-2 rounded-full hover:bg-gray-200 hover:text-gray-950"
              onClick={() => setIsDrawerOpen(true)}
            >
              <FaUsers className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Messages Section with Infinite Scroll */}
        <div
          ref={messagesContainerRef}
          className="flex-grow overflow-y-auto p-4"
          onScroll={handleScroll}
        >
          {loading && <div className="text-center">Loading...</div>}
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
    </div>
  );
};

export default Messages;
