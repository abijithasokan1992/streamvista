const ffmpeg = require("fluent-ffmpeg");

ffmpeg("./uploads/raw/video.mov")
  .on("filenames", (filenames) => {
    console.log("Generating: " + filenames.join(", "));
  })
  .on("end", () => {
    console.log("Thumbnails generated successfully.");
  })
  .on("error", (err) => {
    console.error("Error generating thumbnails:", err.message);
  })
  .screenshots({
    count: 5,
    folder: "./thumbnails"
  });
