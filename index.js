// This loads your secret key from the .env file
require("dotenv").config();

// This opens the Gemini "toolbox" you installed
const { GoogleGenerativeAI } = require("@google/generative-ai");

// This grabs your secret key and gets Gemini ready
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// This is a simple "recipe" for asking Gemini a question
async function askSomething() {
  // Get the specific model
  // NEW CODE - USE THIS
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompt = "Explain what an API is like I'm 10 years old.";

  console.log("Asking Gemini...");
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  console.log("---- GEMINI'S ANSWER: ----");
  console.log(text);
}

// This line actually runs the recipe
askSomething();
