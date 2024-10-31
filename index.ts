import { createHash } from "crypto";
import express from "express";
import Redis from "ioredis";

// Create a Redis instance.
// By default, it will connect to localhost:6379.
// We are going to cover how to specify connection options soon.
const redis = new Redis();


const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});


app.post("/:id", async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;

  const cacheKey = id + ":" + createHash("sha256").update(JSON.stringify(data)).digest("hex");
  console.log("cacheKey:", cacheKey);
  
  try {
    // Check if data exists in Redis cache
    const cachedData = await redis.get(`cache:${cacheKey}`);
    
    if (cachedData) {
      console.log("cache hit! on key:", cacheKey);
      console.log("cachedData:", cachedData);
      // Return cached data if it exists
      return res.json(JSON.parse(cachedData));
    }

    // Add a small delay to simulate an expensive operation
    // could be a database query, a file read, calling an external api, etc.
    await new Promise(resolve => setTimeout(resolve, 2000));

    // If not in cache, fetch from main data source
    // For demo, just creating sample data
    const newData = { id, message: "here's my cached data" + data };
    
    // Store in Redis with 1 hour expiry
    await redis.setex(`cache:${cacheKey}`, 3600, JSON.stringify(newData));
    
    res.json(newData);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3012, () => {
  console.log("Server is running on port 3012");
});

