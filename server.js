const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

export default async function handler(req, res) {
  const { id } = req.query;
  const target = `https://perchance.org/${id}`;

  try {
    const response = await fetch(target);
    const html = await response.text();

    res.setHeader("Content-Type", "text/html");
    res.removeHeader?.("X-Frame-Options");
    res.removeHeader?.("Content-Security-Policy");
    res.status(200).send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send("Proxy error: " + error.message);
  }
}
