document.getElementById("SendButton").addEventListener("click", sendMessage);
document.getElementById("PromptInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") sendMessage();
});

function displayMessage(text, className) {
    console.log(`Displaying message: ${text} with class: ${className}`);
    let chatContainer = document.getElementById('chatContainer');
    let messageDiv = document.createElement('div');
    
    messageDiv.className = `message ${className}`;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll to the latest message

    if (className === "ai-message") {
        let index = 0;
        function typeLetter() {
            if (stopTyping) {
                messageDiv.innerText = text; // Display full message if stopped
                return;
            }
            if (index < text.length) {
                messageDiv.innerText += text.charAt(index) === ' ' ? '\u00A0' : text.charAt(index);
                index++;
                setTimeout(typeLetter, 20); // Adjust typing speed here (faster)
            }
        }
        typeLetter();
    } else {
        messageDiv.innerText = text;
    }
}

function sendMessage() {
    console.log("Sending message...");
    let promptInput = document.getElementById('PromptInput');
    let userMessage = promptInput.value.trim();

    if (!userMessage) return;

    displayMessage(userMessage, "user-message");
    promptInput.value = '';

    fetch("http://192.168.42.228:3000/generate", {  // ✅ Using your specified IP
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: userMessage })
    })
    .then(response => response.json())
    .then(data => {
        console.log("📩 Received AI Response:", data);  // Debugging response

        // ✅ Extract the AI text response correctly
        if (data.candidates && data.candidates.length > 0) {
            let aiMessage = data.candidates[0].content.parts[0].text;
            displayMessage(aiMessage, "ai-message");
        } else if (data.error) {
            displayMessage(`Error: ${data.error}`, "ai-message");
        } else {
            displayMessage("Error: Unexpected server response", "ai-message");
        }
    })
    .catch(error => {
        console.error("❌ Fetch Error:", error);
        displayMessage("Error: Unable to connect to server", "ai-message");
    });
}

function saveChat() {
    console.log("Saving chat...");
    let chatContainer = document.getElementById('chatContainer');
    let messages = chatContainer.getElementsByClassName('message');
    let chatHistory = [];

    for (let message of messages) {
        chatHistory.push({
            text: message.innerText,
            className: message.className
        });
    }

    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    console.log("Chat saved successfully");

    // Show notification
    let notification = document.getElementById('notification');
    notification.innerText = "Chat saved";
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000); // Hide after 3 seconds
}

// Load messages when the page is loaded
window.onload = function() {
    console.log("Page loaded");

    let chatHistory = JSON.parse(localStorage.getItem('chatHistory'));
    if (chatHistory) {
        for (let message of chatHistory) {
            displayMessage(message.text, message.className);
        }
    } else {
        console.log("No chat history found");
    }
};

document.getElementById("SaveChatButton").addEventListener("click", saveChat);
document.getElementById("ResetButton").addEventListener("click", resetChat);

function resetChat() {
    console.log("Resetting chat...");
    let chatContainer = document.getElementById('chatContainer');
    chatContainer.innerHTML = ''; // Clear all messages from the chat container
    localStorage.removeItem('chatHistory'); // Remove chat history from local storage
    console.log("Chat reset successfully");
}

// Auto-save chat every 5 minutes
setInterval(saveChat, 300000); // 300000 milliseconds = 5 minutes

let stopTyping = false;

function stopChat() {
    console.log("Stopping chat...");
    stopTyping = true;
}

document.getElementById("StopButton").addEventListener("click", stopChat);
