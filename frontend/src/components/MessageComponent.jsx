import React from "react";
import { useUser } from "../context/user.context";
import Markdown from "markdown-to-jsx";

const MessageComponent = ({ messages }) => {
  const { user } = useUser();
  return (
    <div className="flex-grow overflow-y-auto p-4 ">
      {messages.length > 0 ? (
        messages.map((msg, index) => (
          <div
            key={index}
            className={`chat ${
              msg.sender_id === user._id ? "chat-end" : "chat-start"
            }`}
          >
            <div
              className={`chat-bubble ${
                msg.sender_id === user._id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              } whitespace-pre-wrap break-words`}
            >
              <div className={`text-xs  mt-1`}>{msg.sender_email}</div>
              {msg.sender_email === "AI" ? (
                <Markdown>{msg.message}</Markdown>
              ) : (
                <div>{msg.message}</div>
              )}

              <div className="text-xs  mt-1 float-end">17-02-2025 12:00</div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center">No messages yet</p>
      )}
    </div>
  );
};

export default MessageComponent;
