import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    // URL query parameter lo
    const { url } = req.query;

    if (!url) {
      return res.status(400).send("❌ Missing ?url= parameter");
    }

    console.log("Proxying:", url);
    const response = await fetch(url);
    const contentType = response.headers.get("content-type");
    res.setHeader("Content-Type", contentType || "text/html");

    const body = await response.text();
    res.status(200).send(body);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy error: " + err.message);
  }
}
