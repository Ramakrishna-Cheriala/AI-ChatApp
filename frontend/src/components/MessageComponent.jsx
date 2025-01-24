import React from "react";
import { useUser } from "../context/user.context";
import Markdown from "markdown-to-jsx";
import { format } from "date-fns";

const MessageComponent = ({ messages }) => {
  const { user } = useUser();
  return (
    <div className="flex-grow overflow-y-auto p-4 ">
      {messages.length > 0 ? (
        messages.map((msg, index) => (
          <div
            key={index}
            className={`chat ${
              msg.sender?._id === user._id && !msg.isAI
                ? "chat-end"
                : "chat-start"
            }`}
          >
            <div
              className={`chat-bubble ${
                msg.sender._id === user._id && !msg.isAI
                  ? "bg-blue-500 text-white"
                  : msg.isAI
                  ? "bg-gray-950 text-white "
                  : "bg-gray-200 text-gray-800"
              } whitespace-pre-wrap break-words`}
            >
              <div className={`text-xs  mt-1`}>
                {msg.isAI ? <>AI</> : <>{msg.sender.email}</>}
              </div>
              {msg.isAI ? (
                <div className="overflow-x-auto">
                  <Markdown>{msg.content}</Markdown>
                </div>
              ) : (
                <div>{msg.content}</div>
              )}

              <div className="text-xs  mt-1 float-end">
                {format(new Date(msg.sentAt), "dd-MM-yyyy hh:mm a")}
              </div>
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
