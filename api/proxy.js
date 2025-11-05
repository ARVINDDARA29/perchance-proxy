const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).send("Missing id parameter");

    const target = `https://perchance.org/${id}`;
    console.log("➡️ Fetching:", target);

    const response = await fetch(target);
    const html = await response.text();

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (err) {
    console.error("❌ Proxy error:", err);
    res.status(500).send("Proxy error: " + err.message);
  }
}
