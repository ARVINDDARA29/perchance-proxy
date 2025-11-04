import express from "express";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";

const app = express();

app.get("/proxy/:gen", async (req, res) => {
  try {
    const gen = req.params.gen;
    const targetUrl = `https://perchance.org/${gen}`;

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    if (!response.ok) throw new Error(`Upstream ${response.status}`);

    let html = await response.text();
    const dom = new JSDOM(html);
    const { document } = dom.window;

    // fix relative URLs
    [...document.querySelectorAll("link, script, img")].forEach((el) => {
      const attr = el.tagName === "LINK" ? "href" : "src";
      const val = el.getAttribute(attr);
      if (val && !val.startsWith("http") && !val.startsWith("//")) {
        el.setAttribute(attr, `https://perchance.org/${val.replace(/^\//, "")}`);
      }
    });

    // inject CSS to fit iframe
    const style = document.createElement("style");
    style.textContent = `
      html, body { height:100%; width:100%; margin:0; overflow:auto; }
      iframe, canvas { max-width:100%; }
    `;
    document.head.appendChild(style);

    // send sanitized HTML
    res.set({
      "Content-Type": "text/html; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "X-Frame-Options": "ALLOWALL",
      "Content-Security-Policy": "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
    });

    res.send(dom.serialize());
  } catch (err) {
    res.status(500).send(`<h1>Error</h1><pre>${err.message}</pre>`);
  }
});

// default route
app.get("/", (req, res) => {
  res.send(`
    <h2>✅ Perchance Proxy Running (v2)</h2>
    <p>Try these URLs:</p>
    <ul>
      <li><a href="/proxy/bio-dome">/proxy/bio-dome</a></li>
      <li><a href="/proxy/ai-character-chat">/proxy/ai-character-chat</a></li>
    </ul>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
