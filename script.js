
const API_URL = "https://studenthelper-4.vercel.app/api/chat";

const chat = document.getElementById("chat");
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const subjectButtons = document.querySelectorAll(".subject-button");

let selectedSubject = "General";

// Add messages to the chat
function addMessage(message, type) {
  const messageElement = document.createElement("div");

  messageElement.classList.add("message");
  messageElement.classList.add(
    type === "user" ? "user-message" : "bot-message"
  );

  messageElement.textContent = message;
  chat.appendChild(messageElement);

  chat.scrollTop = chat.scrollHeight;

  return messageElement;
}

// Select a school subject
subjectButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedSubject = button.dataset.subject;

    addMessage(
      "Subject selected: " + selectedSubject,
      "bot"
    );
  });
});

// Send a question to the AI
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = input.value.trim();

  if (!message) return;

  addMessage(message, "user");

  input.value = "";
  sendButton.disabled = true;
  sendButton.textContent = "Thinking...";

  const loadingMessage = addMessage(
    "StudentHelper is thinking...",
    "bot"
  );

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message,
        subject: selectedSubject,
        grade: "Not specified"
      })
    });

    const data = await response.json();

    loadingMessage.remove();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    addMessage(
      data.answer || "I couldn't generate an answer.",
      "bot"
    );

  } catch (error) {
    loadingMessage.remove();

    addMessage(
      "Sorry! I couldn't connect to StudentHelper's AI. " +
      error.message,
      "bot"
    );

    console.error("StudentHelper error:", error);

  } finally {
    sendButton.disabled = false;
    sendButton.textContent = "Send";
    input.focus();
  }
});
