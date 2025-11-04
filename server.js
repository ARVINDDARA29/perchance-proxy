import express from "express";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";

const app = express();

app.get("/proxy/:gen", async (req, res) => {
  try {
    const genName = req.params.gen;
    const targetUrl = `https://perchance.org/${genName}`;

    // Fetch the target page
    const response = await fetch(targetUrl);
    let html = await response.text();

    // Parse the HTML to edit meta headers if needed
    const dom = new JSDOM(html);
    const { document } = dom.window;

    // Optional: inject a small style to fit iframe view
    const style = document.createElement("style");
    style.textContent = `
      body { margin: 0; overflow: auto; }
      html, body { height: 100%; width: 100%; }
    `;
    document.head.appendChild(style);

    // Return modified HTML with safe headers
    res.set({
      "Content-Type": "text/html",
      "X-Frame-Options": "ALLOWALL",
      "Access-Control-Allow-Origin": "*",
      "Cross-Origin-Resource-Policy": "cross-origin"
    });

    res.send(dom.serialize());
  } catch (error) {
    console.error(error);
    res.status(500).send(`<h1>Proxy Error</h1><p>${error.message}</p>`);
  }
});

// Root route (optional)
app.get("/", (req, res) => {
  res.send(`<h2>✅ Perchance Proxy Running</h2>
  <p>Use like this:</p>
  <code>/proxy/bio-dome</code><br>
  <code>/proxy/ai-character-chat</code>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
