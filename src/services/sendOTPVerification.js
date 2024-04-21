const GeneralSettings = require("../models/GeneralSetting");
const { default: axios } = require("axios");

async function sendOTPVerification(phone, otp) {
  const generalSettings = await GeneralSettings.findOne();
  const qpsms_appkey = generalSettings.qpsms_appkey;
  const qpsms_secretkey = generalSettings.qpsms_secretkey;

  //   console.log("qpsms_appkey: ", qpsms_appkey);
  //   console.log("qpsms_secretkey: ", qpsms_secretkey);
  //   console.log("phone: ", phone);
  //   console.log("otp: ", otp);

  const { data } = await axios.get(
    `http://api.quanqiusms.com/api/sms/mtsend?appkey=${qpsms_appkey}&secretkey=${qpsms_secretkey}&phone=${phone}&content=${otp}`
  );

  return data?.code;
}

module.exports = sendOTPVerification;
