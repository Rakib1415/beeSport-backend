const axios = require("axios");

const sportMonkslUrl = axios.create({
  baseURL: process.env.SPORTMONKS_URL,
  timeout: 30000,
  headers: {
    "content-type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest"
  },
  params: {
    api_token: process.env.SPORTMONKS_API_TOKEN
  }
});

const sportMonksCricketUrl = axios.create({
  baseURL: process.env.SPORTMONKS_CRICKET_URL,
  timeout: 30000,
  headers: {
    "content-type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest"
  },
  params: {
    api_token: process.env.SPORTMONKS_API_TOKEN
    // api_token: "qeixY5ven6byituSUihNnx7fnP07caRz7h4UbbqswxZp2"
  }
});

module.exports = { sportMonkslUrl, sportMonksCricketUrl };
