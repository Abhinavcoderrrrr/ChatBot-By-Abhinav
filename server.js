const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// 🔒 Replace with your Google API Key
const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY_HERE";

const PORT = 3000;

app.use(express.json());
app.use(cors()); // Enable frontend requests

// ✅ Check if the server is running
app.get('/', (req, res) => {
    res.send('✅ Server is running!');
});

// ✅ API Route for generating text (Using gemini-2.0-flash)
app.post('/generate', async (req, res) => {
    try {
        const userInput = req.body.message;

        if (!userInput) {
            return res.status(400).json({ error: "❌ Message is required in request body." });
        }

        console.log("📩 Received request:", userInput);

        // 🔥 Sending request to Google Gemini API
        const response = await axios.post(
            `YOUR_API_ENDPOINT?key=${GOOGLE_API_KEY}`,
            {
                contents: [{
                    parts: [{ text: userInput }]
                }]
            },
            {
                headers: { "Content-Type": "application/json" }
            }
        );

        console.log("✅ Response received from Google API:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("❌ Error:", error.response?.data || error.message);

        res.status(500).json({
            error: "Internal Server Error",
            details: error.response?.data || error.message
        });
    }
});

// ✅ Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
