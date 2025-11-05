import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    let { url } = req.query;
    if (!url) return res.status(400).send("❌ Missing ?url= parameter");

    const response = await fetch(url);
    const contentType = response.headers.get("content-type") || "";

    // Override security headers
    res.removeHeader("X-Frame-Options");
    res.removeHeader("Content-Security-Policy");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("X-Frame-Options", "ALLOWALL");

    if (contentType.includes("text/html")) {
      let html = await response.text();

      // Replace subdomains to go through this proxy
      html = html
        .replace(/https:\/\/image-generation\.perchance\.org/gi, `${req.headers.host}/api/proxy?url=https://image-generation.perchance.org`)
        .replace(/https:\/\/textgen\.perchance\.org/gi, `${req.headers.host}/api/proxy?url=https://textgen.perchance.org`)
        .replace(/https:\/\/perchance\.org/gi, `${req.headers.host}/api/proxy?url=https://perchance.org`);

      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } else {
      const buffer = await response.arrayBuffer();
      res.setHeader("Content-Type", contentType);
      res.send(Buffer.from(buffer));
    }
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy error: " + err.message);
  }
}
