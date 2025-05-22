import { nanoid } from "nanoid";
import dns from "dns";
// new Map
const urlMap = new Map();

export const ShortUrlController = async (req, res) => {
  try {
    const { url } = req.body;
    // if no url exists
    if (!url) {
      return res.status(403).json({ message: "Url is not present" });
    }

    // is valid url
    try {
      const urlObject = new URL(url);
      const hostname = urlObject.hostname;

      await new Promise((resolve, reject) => {
        dns.lookup(hostname, (err) => {
          if (err) {
            reject(new Error("Invalid URL"));
          }
          resolve();
        });
      });
    } catch (error) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    // generate a unique id
    const uniqueId = nanoid();

    // short url
    const short_url = `${req.protocol}://${req.get("host")}/${uniqueId}`;

    // store it in the map
    urlMap.set(uniqueId, url);

    res.status(200).json({ original_url: url, short_url: uniqueId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const RedirectToUrlController = async (req, res) => {
  try {
    const { urlCode } = req.params;
    // if no url exists
    if (!urlCode) {
      return res.status(403).json({ message: "Url is not present" });
    }

    console.log("url code", urlCode);

    const original_url = urlMap.get(urlCode);

    console.log("original url", original_url);

    if (original_url) {
      console.log("it is found");

      res.redirect(302, original_url);
    } else {
      // If the unique ID is not found, send a 404 Not Found error
      res.status(404).send("Short URL not found.");
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
