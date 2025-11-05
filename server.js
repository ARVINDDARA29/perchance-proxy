import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/proxy/*", async (req, res) => {
  const targetUrl = req.params[0];
  const perchanceUrl = `https://${targetUrl}`;

  try {
    const response = await fetch(perchanceUrl);
    let body = await response.text();

    res.setHeader("Content-Type", "text/html");
    res.removeHeader("X-Frame-Options");
    res.removeHeader("Content-Security-Policy");

    // Fix relative paths
    body = body.replace(/src="\//g, 'src="https://');
    body = body.replace(/href="\//g, 'href="https://');

    res.send(body);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

app.listen(3000, () => console.log("✅ Proxy active on port 3000"));
