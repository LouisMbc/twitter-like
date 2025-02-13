import React, { useState, useEffect } from "react";
import { sendMessage, getMessages } from "../../app/api/messages";

export default function MessageBox({ userId, contactId }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchMessages() {
      const data = await getMessages(userId, contactId);
      setMessages(data);
    }
    fetchMessages();
  }, [userId, contactId]);

  async function handleSend() {
    if (message.trim() === "") return;
    await sendMessage(userId, contactId, message);
    setMessages([...messages, { sender_id: userId, content: message }]);
    setMessage("");
  }

  return (
    <div className="p-4 border bg-white shadow-md rounded-lg">
      <div className="h-64 overflow-y-auto">
        {messages.map((msg, index) => (
          <p key={index} className={`p-2 ${msg.sender_id === userId ? "text-right text-blue-500" : "text-left text-gray-700"}`}>
            {msg.content}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full p-2 border rounded-md mt-2"
        placeholder="Écrire un message..."
      />
      <button onClick={handleSend} className="bg-primary text-white p-2 mt-2 w-full rounded-md">
        Envoyer
      </button>
    </div>
  );
}
