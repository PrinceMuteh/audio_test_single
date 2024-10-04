import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const audioData = await new Promise((resolve, reject) => {
      const filePath = path.resolve("./public", "uploads", "recording.wav");
      const fileStream = fs.createWriteStream(filePath);
      req.pipe(fileStream);
      req.on("end", () => resolve(filePath));
      req.on("error", reject);
    });

    res
      .status(200)
      .json({ message: "Audio uploaded successfully", file: audioData });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
