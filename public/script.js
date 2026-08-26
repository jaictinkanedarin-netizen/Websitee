async function sendToMochi() {
  const inputEl = document.querySelector('input[placeholder*="Ask Mochi"]');
  const chatBox = document.querySelector('.mochi-messages-container'); // Adjust class to match your chat container
  const userText = inputEl.value.trim();

  if (!userText) return;

  // 1. Show User message in UI
  chatBox.innerHTML += `<div style="text-align:right; margin:8px; color:white; background:#ff69b4; padding:8px 12px; border-radius:12px; display:inline-block;">${userText}</div>`;
  inputEl.value = '';

  // 2. Send message to your Vercel backend route
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText })
    });

    const data = await res.json();

    if (data.reply) {
      // 3. Render real AI response
      chatBox.innerHTML += `<div style="text-align:left; margin:8px; background:#fff0f5; color:#333; padding:8px 12px; border-radius:12px; white-space:pre-wrap;">${data.reply}</div>`;
    } else {
      chatBox.innerHTML += `<div style="color:red; margin:8px;">Error: ${data.error}</div>`;
    }
  } catch (err) {
    chatBox.innerHTML += `<div style="color:red; margin:8px;">Failed to connect to server.</div>`;
  }
}
