const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { exclude } = require("../helpers");

const APP_SECRET = process.env.APP_SECRET;

//Utility functions
module.exports.generateSalt = async () => {
  return await bcrypt.genSalt();
};

module.exports.generatePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

module.exports.isValidJSON = (jsonString) => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
};

module.exports.validatePassword = async (enteredPassword, savedPassword, salt) => {
  return (await this.generatePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.generateSignature = async (payload, expiresIn) => {
  try {
    return jwt.sign(payload, APP_SECRET, { expiresIn });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.GenerateTempToken = async (data) => {
  try {
    return jwt.sign(payload, code, { expiresIn: "1d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.generateVerificationToken = async (payload) => {
  try {
    return jwt.sign(payload, APP_SECRET, { expiresIn: "1d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.CheckOptValidity = async (opt, hashedOtp) => {
  try {
    await bcrypt.compare(opt, hashedOtp, (err, result) => {
      if (err) {
        return false;
      } else {
        return true;
      }
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.IsTimestampSmallerThanTwoMinutesAgo = (timestamp) => {
  const inputDate = new Date(timestamp);
  const currentTime = new Date();
  const timeDifference = currentTime - inputDate;
  return timeDifference <= 120000;
};

module.exports.validateSignature = async (req) => {
  try {
    const signature = req.headers.authorization;
    if (!signature) return false;
    let payload = await jwt.verify(signature.split(" ")[1], process.env.APP_SECRET);
    if (payload.role !== "admin") {
      let existingUser = await User.findOne({ phone: payload.phone });
      payload = { ...payload, ...(existingUser && { id: existingUser._id }) };
    }
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports.excludeMany = async (array, keys) => {
  let newArray = [];
  array?.map((item) => {
    for (let key of keys) {
      delete item[key];
    }
    newArray.push(item);
  });
  return newArray;
};

module.exports.exclude = (existingApp, keys) => {
  for (let key of keys) {
    delete existingApp[key];
  }
  return existingApp;
};

module.exports.formateData = (data) => {
  if (data) {
    return data;
  } else {
    throw new Error("Data Not found!");
  }
};

module.exports.UpdateObject = (oldObject, newObject) => {
  const newData = Object?.entries(oldObject);
  newData.forEach((item) => {
    const key = item[0];
    const value = item[1];

    if (newObject.hasOwnProperty(key)) {
      oldObject[key] = newObject[key];
    }
  });
  return oldObject;
};

module.exports.deleteImagesFromArray = async (array) => {
  for (const item of array) {
    await deleteImage(item.image_url);
  }
};

module.exports.generateVerificationCode = (length) => {
  let result = "";
  const characters = "0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

module.exports.generateRandomId = (length) => {
  let result = "";
  const characters = "123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

module.exports.shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

module.exports.transformErrorsToMap = (errors) => {
  const errorMap = {};

  errors.forEach((error) => {
    const { path, msg } = error;
    errorMap[path] = msg;
  });

  return errorMap;
};

module.exports.getSlugify = (inputString) => {
  return inputString
    .toString() // Ensure it's a string
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading and trailing spaces
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w-]+/g, "") // Remove non-word characters (except hyphens)
    .replace(/--+/g, "-"); // Replace multiple hyphens with a single hyphen
};

module.exports.getPublicId = (url, folder) => {
  return url.split(`${folder}/`)[1].replace(".png", "").replace(".jpg", "").replace(".jpeg", "");
};

module.exports.generateFlussonicToken = (streamLink, streamKey, userIp) => {
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

module.exports.generateFlussonicLink = (streamLink, streamKey, userIp) => {
  const flussonicKey = process.env.FLI_KEY; // The key from flussonic.conf file. KEEP IT IN SECRET.
  const tokenLifetime = 3600 * 3; // The link will become invalid in 3 hours.
  const allowedDesync = 300; // Allowed time desync between Flussonic and hosting servers in seconds.

  const currentTime = Math.floor(Date.now() / 1000);
  const startTime = currentTime - allowedDesync;
  const endTime = startTime + tokenLifetime;

  const ipAddress = userIp; // (v20.07) Set ipAddress = 'no_check_ip' if you want to exclude IP address of client devices from checking.
  const salt = crypto.randomBytes(16).toString("hex");

  const tokenString = `${streamKey}${ipAddress}${startTime}${endTime}${flussonicKey}${salt}`;
  const hashedToken = crypto.createHash("sha1").update(tokenString).digest("hex");

  const token = `${hashedToken}-${salt}-${endTime}-${startTime}`;

  const authenticatedLink = `${streamLink}?token=${token}`;

  return authenticatedLink;
};

const config = {
	totalItems: 0,
	limit: 10,
	page: 1,
	// sortType: 'dsc',
	// sortBy: 'updatedAt',
	// search: '',
};

const defaults = Object.freeze(config);


module.exports.getPagination = ({
	totalItems = defaults.totalItems,
	limit = defaults.limit,
	page = defaults.page,
}) => {
	const totalPage = Math.ceil(totalItems / limit);

	const pagination = {
		page,
		limit,
		totalItems,
		totalPage,
	};

	if (page < totalPage) {
		pagination.next = page + 1;
	}

	if (page > 1) {
		pagination.prev = page - 1;
	}

	return pagination;
};