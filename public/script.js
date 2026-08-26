// Find your send button and input box by their IDs or classes
const sendBtn = document.querySelector('.send-btn'); // Replace with your actual button class/ID
const chatInput = document.querySelector('.chat-input'); // Replace with your actual input class/ID
const chatMessages = document.querySelector('.chat-messages'); // The container where messages appear

async function sendMessage() {
  const userText = chatInput.value.trim();
  if (!userText) return;

  // 1. Display the user's message in the Mochi window
  chatMessages.innerHTML += `<div class="user-msg"><b>User:</b> ${userText}</div>`;
  chatInput.value = '';

  try {
    // 2. Call your Vercel serverless API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText }),
    });

    const data = await response.json();

    // 3. Display Mochi's AI response in the chat window
    if (data.reply) {
      chatMessages.innerHTML += `<div class="mochi-msg"><b>Mochi:</b> ${data.reply}</div>`;
    } else {
      chatMessages.innerHTML += `<div class="error-msg">Mochi couldn't reply right now!</div>`;
    }
  } catch (error) {
    console.error('Error:', error);
    chatMessages.innerHTML += `<div class="error-msg">Connection error! Check browser console.</div>`;
  }
}

// Attach the function to click and enter key events
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});
