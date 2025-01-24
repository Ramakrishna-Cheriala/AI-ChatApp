import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "../context/user.context";
import { FaCircleUser } from "react-icons/fa6";
import axios from "../config/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20); // Keep limit constant
  const [hasMore, setHasMore] = useState(true); // Flag for more chats
  const [loading, setLoading] = useState(false); // To prevent duplicate fetches

  const getAllChats = async () => {
    if (loading || !hasMore) return; // Prevent duplicate API calls
    try {
      setLoading(true);
      const res = await axios.get(`/chats?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const newChats = res.data.chats; // Ensure API returns `chats`

      if (newChats.length < limit) {
        setHasMore(false); // No more data to fetch
      }

      setChats((prevChats) => [...prevChats, ...newChats]); // Append new data
      setPage((prevPage) => prevPage + 1); // Increment page for the next fetch
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch chats");
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = useCallback(() => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    // Check if user has scrolled near the bottom
    if (scrollHeight - scrollTop <= clientHeight + 200) {
      getAllChats();
    }
  }, [loading, hasMore]);

  useEffect(() => {
    if (user) {
      getAllChats(); // Initial fetch
    }
  }, [user]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="p-6 h-screen flex flex-col bg-gray-900">
      <div className="flex justify-between items-center mb-4 sticky top-0 z-10 p-4 bg-gray-800 shadow-md">
        <span className="text-2xl font-bold">Chats</span>
        <div className="text-2xl font-bold flex items-center">
          <FaCircleUser className="mr-2 mt-1" />
          {user?.email}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length > 0 ? (
          <div className="space-y-4">
            {chats.map((chat) => (
              <div
                key={chat._id}
                className="flex items-center p-4 bg-gray-800 shadow rounded-lg cursor-pointer hover:bg-gray-700"
                onClick={() => {
                  if (chat.chatType === "group") {
                    navigate(`/chat/${chat._id}`, { state: chat });
                  } else {
                    chat.participants.map((participant) => {
                      if (participant._id !== user._id) {
                        navigate(`/chat/${participant._id}`, { state: chat });
                      }
                    });
                  }
                }}
              >
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg mr-4">
                  {chat.chatType === "group" ? "G" : "P"}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {/* {chat.chatType === "group" ? chat.chatName : "Private Chat"} */}
                    {chat.chatName}
                  </h3>
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-center text-gray-500">Loading more...</div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">Start Messaging</div>
        )}
      </div>
    </div>
  );
};

export default Chat;
