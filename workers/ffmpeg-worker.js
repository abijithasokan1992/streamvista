const ffmpeg = require("fluent-ffmpeg");

function createProxy(input, output) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .videoCodec("libx264")
      .size("1280x720")
      .outputOptions([
        "-preset fast",
        "-crf 23"
      ])
      .save(output)
      .on("end", () => {
        console.log("Proxy generated");
        resolve();
      })
      .on("error", (err) => {
        console.error("FFmpeg Proxy Error:", err.message);
        reject(err);
      });
  });
}

function generateThumbnails(input) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .on("filenames", (filenames) => {
        console.log("Will generate " + filenames.join(", "));
      })
      .on("end", () => {
        console.log("Thumbnails generated");
        resolve();
      })
      .on("error", (err) => {
        console.error("FFmpeg Thumbnail Error:", err.message);
        reject(err);
      })
      .screenshots({
        count: 5,
        folder: "./thumbnails"
      });
  });
}

const inputPath = "./uploads/raw/video.mov";
const outputPath = "./uploads/proxy/video_proxy.mp4";

async function processVideo() {
  try {
    await createProxy(inputPath, outputPath);
    await generateThumbnails(inputPath);
  } catch (err) {
    console.log("Processing failed (check if input file exists):", err.message);
  }
}

processVideo();
