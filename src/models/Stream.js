const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LiveMatch"
  },
  id: {
    type: Number,
    required: true,
    unique: true
  },
  match_id: {
    type: Number
  },
  stream_title: {
    type: String,
    required: true
  },
  is_premium: { type: Number, default: 0 },
  resolution: {
    type: String,
    required: true
  },
  stream_status: { type: String, default: "1" },
  platform: { type: String, enum: ["both", "android", "ios"], default: "both" },
  stream_type: {
    type: String,
    enum: ["root_stream", "restricted", "m3u8", "web"],
    default: "root_stream"
  },
  portrait_watermark: { type: String, default: "{}" },
  landscape_watermark: { type: String, default: "{}" },
  root_streams: [{ type: Object }],
  stream_url: String,
  headers: String,
  stream_key: String,
  position: { type: Number, default: 99999999 }
});

const Stream = mongoose.model("Stream", streamSchema);

module.exports = Stream;
