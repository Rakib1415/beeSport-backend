const crypto = require("crypto");

const generateFlussonicToken = (streamLink, streamKey, userIp) => {
  const key = process.env.FLI_KEY; // The key from flussonic.conf file. KEEP IT IN SECRET.
  const lifetime = 3600 * 3; // The link will become invalid in 3 hours.

  const ipaddr = userIp; // (v20.07) Set ipaddr = 'no_check_ip' if you want to exclude IP address of client devices from checking.
  const desync = 300; // Allowed time desync between Flussonic and hosting servers in seconds.
  const starttime = Math.floor(Date.now() / 1000) - desync;
  const endtime = starttime + lifetime;
  const salt = crypto.randomBytes(16).toString("hex");

  const hashsrt = streamKey + ipaddr + starttime + endtime + key + salt;
  const hash = crypto.createHash("sha1").update(hashsrt).digest("hex");

  const token = `${hash}-${salt}-${endtime}-${starttime}`;

  const link = `${streamLink}?token=${token}&remote=${userIp}`;

  return link;
};

module.exports = {
  generateFlussonicToken
};
