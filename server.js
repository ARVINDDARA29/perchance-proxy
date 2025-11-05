import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

// main proxy route
app.use("/proxy", async (req, res) => {
  try {
    let targetUrl = req.query.url;

    // agar koi URL nahi diya to error
    if (!targetUrl) {
      return res.status(400).send("Missing ?url= parameter");
    }

    console.log("Proxying:", targetUrl);
    const response = await fetch(targetUrl);
    const contentType = response.headers.get("content-type");
    res.setHeader("Content-Type", contentType);
    const data = await response.text();
    res.send(data);
  } catch (err) {
    console.error("Proxy Error:", err);
    res.status(500).send("Proxy Error: " + err.message);
  }
});

// start server locally (Vercel will auto handle in cloud)
app.listen(3000, () => console.log("✅ Server running on port 3000"));
