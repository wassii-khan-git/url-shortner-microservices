import dns from "dns";
import { nanoid } from "nanoid";

// Stores { uniqueId: originalLongUrl }
const urlMap = new Map();

// --- Helper for DNS lookup (promisified for async/await) ---
const lookupPromise = (hostname) => {
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, (err) => {
      if (err) {
        // If DNS lookup fails, reject with an error
        reject(new Error("invalid url")); // Changed error message to match test
      }
      // If DNS lookup succeeds, resolve
      resolve();
    });
  });
};

// Controller to handle shortening a URL
export const ShortUrlController = async (req, res) => {
  try {
    const { url } = req.body;

    // 1. Handle missing URL: If no URL exists, return 400 with 'invalid url' error
    // This change addresses the test case where a missing URL might be considered an 'invalid url'.
    if (!url) {
      return res.status(400).json({ error: "invalid url" });
    }

    // 2. Validate URL format and resolve hostname using DNS
    try {
      const urlObject = new URL(url); // Attempt to parse the URL
      const hostname = urlObject.hostname;

      // Perform DNS lookup to ensure the hostname is valid and resolvable
      await lookupPromise(hostname);
    } catch (error) {
      // Catch errors from URL parsing or DNS lookup
      // Return 400 with 'invalid url' for malformed or unresolvable URLs
      return res.status(400).json({ error: "invalid url" });
    }

    // 3. Generate a unique ID for the short URL
    // Using nanoid() without a length argument generates a 21-character ID by default.
    const uniqueId = nanoid();

    // 4. Construct the full short URL
    // req.protocol gets 'http' or 'https'
    // req.get('host') gets 'localhost:3000' or your domain
    const short_url = `${req.protocol}://${req.get("host")}/${uniqueId}`;

    // 5. Store the mapping: uniqueId (key) -> originalLongUrl (value)
    // This is crucial for redirection later.
    urlMap.set(uniqueId, url);

    // Log the current state of the map for debugging
    console.log("--- Current URL Map (in-memory) ---");
    console.log(urlMap);
    console.log("-----------------------------------");

    // 6. Send back the original URL and the unique ID as the short_url
    // This matches your latest provided code's response structure.
    res.status(200).json({ original_url: url, short_url: uniqueId });
  } catch (error) {
    // Catch any unexpected errors during the process
    console.error("Error shortening URL:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", details: error.message });
  }
};

// Controller to handle redirection from a short URL
export const RedirectToUrlController = async (req, res) => {
  try {
    // The route parameter is named 'urlCode' in routes/urlRoutes.js
    const { urlCode } = req.params;

    // Although the test might not cover this, it's good practice to handle missing urlCode
    if (!urlCode) {
      return res
        .status(400)
        .json({ message: "URL code is missing from parameters." });
    }

    console.log("URL code received:", urlCode);

    // Look up the original long URL in the map using the unique ID
    const original_url = urlMap.get(urlCode);

    // If the unique ID is found, redirect to the original URL
    if (original_url) {
      // Use 302 (Found) for temporary redirects
      res.redirect(302, original_url);
    } else {
      // If the unique ID is not found, send a 404 Not Found error
      res.status(404).send("Short URL not found.");
    }
  } catch (error) {
    console.error("Error redirecting URL:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", details: error.message });
  }
};
