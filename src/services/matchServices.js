const createStreaming = (streaming_sources) => {
  let streamingData = [];

  streaming_sources?.map((source) => {
    const headerObject = {};

    for (const item of source?.headers) {
      headerObject[item.key] = item.value;
    }

    streamingData.push({
      stream_title: source?.stream_title,
      stream_type: source?.stream_type,
      resolution: source?.resolution,
      platform: source?.platform,
      is_premium: source?.is_premium,
      rewarded_aad: source?.is_premium,
      portrait_watermark: source?.portrait_watermark,
      landscape_watermark: source?.landscape_watermark,
      stream_url: source?.stream_url,
      root_streams: source?.root_streams,
      headers: JSON.stringify(headerObject),
      stream_key: source?.stream_key,
      stream_status: source?.stream_status
    });
  });
  return streamingData;
};

module.exports = {
  createStreaming
};
