/**
 * Gemini API Integration Utility
 * This script demonstrates how to interact with the Gemini 2.5 Flash model
 * using standard fetch requests with built-in exponential backoff logic.
 */

const apiKey = ""; // The environment provides the key at runtime
const model = "gemini-2.5-flash-preview-09-2025";

/**
 * Implements exponential backoff for API calls.
 * @param {Function} fn - The async function to retry.
 * @param {number} retries - Max number of retries.
 */
async function fetchWithRetry(fn, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Generates content using the Gemini API.
 * @param {string} prompt - The user prompt.
 */
async function generateGeminiContent(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{
      parts: [{ text: prompt }]
    }]
  };

  const executeCall = async () => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
    }

    return await response.json();
  };

  try {
    const result = await fetchWithRetry(executeCall);
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || "No content generated.";
  } catch (error) {
    console.error("Final attempt failed:", error.message);
    return `Error: ${error.message}`;
  }
}

// Example execution
async function main() {
  console.log("Initializing Gemini request...");
  const prompt = "Explain the concept of 'corrupted shared libraries' in Linux systems and how to resolve them.";
  
  const response = await generateGeminiContent(prompt);
  console.log("\n--- AI Response ---\n");
  console.log(response);
}

main();
