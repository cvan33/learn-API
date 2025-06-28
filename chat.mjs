import dotenv from 'dotenv';
dotenv.config();
import { Client } from 'pg';
import Groq from 'groq-sdk';
import express from 'express';
import cors from 'cors';  // Import the CORS package

// Setup Express app
const app = express();
const port = 3000;  // Port for the server

// Use the CORS middleware to allow requests from the frontend
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Setup PostgreSQL client
const dbClient = new Client({
  user: 'postgres',      // Replace with your PostgreSQL username
  host: 'localhost',     // Assuming PostgreSQL is running locally
  database: 'campusbot', // Your database name
  password: 'toor',      // Replace with your password
  port: 5432,            // Default PostgreSQL port
});

// Connect to PostgreSQL
dbClient.connect().then(() => {
  console.log("Connected to the database successfully!");
}).catch(err => {
  console.error("Database connection error:", err.stack);
});

// Setup Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Function to run a dynamic SQL query
async function runSQLQuery(query) {
  try {
    const result = await dbClient.query(query);
    return result.rows;  // Returns the rows from the query
  } catch (error) {
    console.error('Error running SQL query:', error);
    return null;
  }
}

// Function to interpret the user's question and generate SQL query
async function interpretQuestion(question) {
  // Handle "How many users?"
  if (question.toLowerCase().includes("how many users")) {
    const query = 'SELECT COUNT(*) FROM users';
    const result = await runSQLQuery(query);
    return `There are ${result[0]?.count || 0} users in the database.`;
  }

  // Handle "What are the user names?"
  if (question.toLowerCase().includes("user names")) {
    const query = 'SELECT name FROM users';
    const result = await runSQLQuery(query);
    const names = result.map((user) => user.name).join(", ");
    return `The users in the database are: ${names}.`;
  }

  // Handle specific "Who is [name]?"
  if (question.toLowerCase().includes("who is")) {
    const userName = question.replace("who is", "").trim();
    const query = `SELECT name FROM users WHERE name ILIKE '${userName}'`;
    const result = await runSQLQuery(query);
    return result.length > 0 ? `Found user: ${result[0].name}` : `No user found with the name ${userName}.`;
  }

  // If the question doesn't match any of the above cases
  return "I'm sorry, I don't understand that question.";
}

// Function to get Groq chat completion
async function getGroqChatCompletion(response) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: response,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    return chatCompletion.choices[0]?.message?.content || "No response from the AI.";
  } catch (error) {
    console.error("Error with Groq API:", error);
    return "Sorry, I couldn't process the response.";
  }
}

// POST route to handle user questions
app.post('/ask', async (req, res) => {
  const userQuestion = req.body.question;

  if (!userQuestion) {
    return res.status(400).json({ error: "No question provided" });
  }

  // Interpret the user question and generate an SQL response
  const sqlResponse = await interpretQuestion(userQuestion);

  // Now get the AI response based on the generated SQL response
  const aiResponse = await getGroqChatCompletion(sqlResponse);

  // Send the AI response back to the user
  res.json({ response: aiResponse });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
