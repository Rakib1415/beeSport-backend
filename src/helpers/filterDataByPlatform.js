async function filterDataByPlatform(data, platform) {
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      if (platform === "ios" && key.startsWith("android_")) {
        delete data[key];
      } else if (platform === "android" && key.startsWith("ios_")) {
        delete data[key];
      }
    }
  }
  return data;
}

module.exports = filterDataByPlatform;
