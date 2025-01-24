import React from "react";
import Chat from "./Chat";
import Messages from "./Messages";

const Home = () => {
  return (
    <div className="flex h-screen">
      {/* Left Panel: Chats */}
      <div className="w-1/4 bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <Chat />
      </div>

      {/* Right Panel: Messages */}
      <div className="w-3/4 bg-white overflow-y-auto">
        <Messages />
      </div>
    </div>
  );
};

export default Home;
