document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

async function sendMessage() {
  const userInput = document.getElementById('user-input').value;
  if (userInput.trim() === '') return;

  // Display user's message in the chat
  displayMessage(userInput, 'user-message');

  // Clear the input field
  document.getElementById('user-input').value = '';

  try {
    // Send the question to the backend (API running on port 3000)
    const response = await fetch('http://localhost:3000/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: userInput }),
    });

    const data = await response.json();
    
    // Display bot's response
    displayMessage(data.response, 'bot-message');
  } catch (error) {
    console.error('Error:', error);
    displayMessage('Sorry, something went wrong. Please try again.', 'bot-message');
  }
}

// Function to display messages in the chat
function displayMessage(message, senderClass) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', senderClass);
  messageDiv.innerText = message;

  const chatBox = document.getElementById('chat-box');
  chatBox.appendChild(messageDiv);

  // Scroll to the bottom of the chat
  chatBox.scrollTop = chatBox.scrollHeight;
}
