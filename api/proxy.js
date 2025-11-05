import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    let { url } = req.query;
    if (!url) return res.status(400).send("❌ Missing ?url= parameter");

    // Fetch target page
    const response = await fetch(url);
    const contentType = response.headers.get("content-type") || "";

    // If it's HTML → rewrite internal URLs
    if (contentType.includes("text/html")) {
      let html = await response.text();

      // Replace perchance subdomains with proxy links
      html = html
        .replace(/https:\/\/image-generation\.perchance\.org/gi, `${req.headers.host}/api/proxy?url=https://image-generation.perchance.org`)
        .replace(/https:\/\/textgen\.perchance\.org/gi, `${req.headers.host}/api/proxy?url=https://textgen.perchance.org`)
        .replace(/https:\/\/perchance\.org/gi, `${req.headers.host}/api/proxy?url=https://perchance.org`);

      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } else {
      // Other file types (images, JSON, etc.)
      const buffer = await response.arrayBuffer();
      res.setHeader("Content-Type", contentType);
      res.send(Buffer.from(buffer));
    }
  } catch (err) {
    console.error("Proxy Error:", err);
    res.status(500).send("Proxy Error: " + err.message);
  }
}
