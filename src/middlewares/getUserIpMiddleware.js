function convertIPv6ToIPv4(publicIp) {
  const splitStr = publicIp.split(":");
  const hexValue = splitStr[6] + splitStr[7];

  // Ensure hexValue is a string before further processing
  if (typeof hexValue !== "string") {
    // console.error("Invalid hexValue:", hexValue);
    return "";
  }

  // Ensure hexValue has at least 8 characters before using substring
  if (hexValue.length < 8) {
    console.error("hexValue is too short:", hexValue);
    return "";
  }

  const ip1 = ~parseInt(hexValue.substring(0, 2), 16) & 0xff;
  const ip2 = ~parseInt(hexValue.substring(2, 4), 16) & 0xff;
  const ip3 = ~parseInt(hexValue.substring(4, 6), 16) & 0xff;
  const ip4 = ~parseInt(hexValue.substring(6, 8), 16) & 0xff;

  return `${ip1}.${ip2}.${ip3}.${ip4}`;
}

const getUserIpMiddleware = (req, res, next) => {
  const publicIP =
    req.headers["cf-connecting-ip"] ||
    req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "";

  req.userIp = publicIP;
  next();
};

module.exports = getUserIpMiddleware;
