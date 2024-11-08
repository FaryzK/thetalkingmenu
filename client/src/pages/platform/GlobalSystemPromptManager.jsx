// src/platform/GlobalSystemPromptManager.jsx
import React, { useState, useEffect } from "react";

export default function GlobalSystemPromptManager() {
  const [globalPrompt, setGlobalPrompt] = useState("");
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch the current global system prompt
    const fetchGlobalPrompt = async () => {
      try {
        const response = await fetch("/api/global-system-prompt");
        if (!response.ok) throw new Error("Failed to fetch global prompt");

        const data = await response.json();
        setGlobalPrompt(data.prompt);
        setEditing(true); // Set editing mode if data exists
      } catch (error) {
        console.error("Error fetching global system prompt:", error);
      }
    };
    fetchGlobalPrompt();
  }, []);

  const handleSave = async () => {
    try {
      const method = editing ? "PUT" : "POST";
      const response = await fetch("/api/global-system-prompt", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: globalPrompt }),
      });

      if (!response.ok) throw new Error("Failed to save global prompt");

      setMessage(
        editing
          ? "Global System Prompt updated successfully!"
          : "Global System Prompt created successfully!"
      );
      setEditing(true); // After saving, switch to editing mode
    } catch (error) {
      console.error("Error saving global system prompt:", error);
      setMessage("Failed to save Global System Prompt.");
    }
  };

  return (
    <div>
      <h2>Global System Prompt Manager</h2>
      {message && <p>{message}</p>}
      <textarea
        value={globalPrompt}
        onChange={(e) => setGlobalPrompt(e.target.value)}
        rows="5"
        placeholder="Enter the global system prompt..."
      />
      <button onClick={handleSave}>
        {editing ? "Update Global Prompt" : "Create Global Prompt"}
      </button>
    </div>
  );
}
