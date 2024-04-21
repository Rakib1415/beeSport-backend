const { shuffle } = require("../../helpers/shuffleArray");
const AppModel = require("../../models/AppModel");
const { exclude } = require("../../utils");
const filterDataByPlatform = require("../../helpers/filterDataByPlatform");

const getAppSettings = async (appBody) => {
  try {
    const { app_id, platform } = appBody;

    const app = await AppModel.findOne({ app_unique_id: app_id });

    if (!app) {
      throw new Error("App with the specified unique ID does not exist");
    }

    let appSetting = app.toObject();

    if (platform) {
      appSetting = await filterDataByPlatform(appSetting, platform);

      if (platform === "ios") {
        if (appSetting.ios_app_ads && appSetting.ios_app_ads.length > 0) {
          const filterByPrimaryAds = appSetting.ios_app_ads.filter(
            (ads) => ads.ad_type === appSetting.ios_ad_type && ads.status === "1"
          );
          const shuffledIosAppAds = shuffle(filterByPrimaryAds);
          appSetting.ios_ad = { ...shuffledIosAppAds[0] };
        }

        // IOS Others Ads
        if (appSetting.ios_multiple_ad === "1" && appSetting.ios_others_ad_type?.length > 0) {
          const otherAdsList = appSetting.ios_others_ad_type.map((ads) => ads.value);

          const filterByOtherAds = appSetting.ios_app_ads.filter(
            (ads) => otherAdsList.includes(ads.ad_type) && ads.status === "1"
          );

          appSetting.ios_others_ad = filterByOtherAds;
          appSetting.ios_others_ad_type = JSON.stringify(otherAdsList); // Value Replace
        }
      } else if (platform === "android") {
        if (appSetting.android_app_ads && appSetting.android_app_ads.length > 0) {
          const filterByPrimaryAds = appSetting.android_app_ads.filter(
            (ads) => ads.ad_type === appSetting.android_ad_type && ads.status === "1"
          );
          const shuffledAndroidAppAds = shuffle(filterByPrimaryAds);
          appSetting.android_ad = { ...shuffledAndroidAppAds[0] };
        }

        // Android Others Ads
        if (appSetting.android_multiple_ad === "1" && appSetting.android_others_ad_type?.length > 0) {
          const otherAdsList = appSetting.android_others_ad_type.map((ads) => ads.value);

          const filterByOtherAds = appSetting.android_app_ads.filter(
            (ads) => otherAdsList.includes(ads.ad_type) && ads.status === "1"
          );

          appSetting.android_others_ad = filterByOtherAds;
          appSetting.android_others_ad_type = JSON.stringify(otherAdsList); // Value Replace
        }
      } else {
        return { status: false, message: "Please, provide correct platform!" };
      }
    } else {
      // Android primary ads
      if (appSetting.android_app_ads && appSetting.android_app_ads.length > 0) {
        const filterByPrimaryAds = appSetting.android_app_ads.filter(
          (ads) => ads.ad_type === appSetting.android_ad_type && ads.status === "1"
        );

        const shuffledAndroidAppAds = shuffle(filterByPrimaryAds);

        appSetting.android_ad = { ...shuffledAndroidAppAds[0] };
      }

      // IOS primary ads
      if (appSetting.ios_app_ads && appSetting.ios_app_ads.length > 0) {
        const filterByPrimaryAds = appSetting.ios_app_ads.filter(
          (ads) => ads.ad_type === appSetting.ios_ad_type && ads.status === "1"
        );

        const shuffledIosAppAds = shuffle(filterByPrimaryAds);
        appSetting.ios_ad = { ...shuffledIosAppAds[0] };
      }

      // Android Others Ads
      if (appSetting.android_multiple_ad === "1" && appSetting.android_others_ad_type?.length > 0) {
        const otherAdsList = appSetting.android_others_ad_type.map((ads) => ads.value);

        const filterByOtherAds = appSetting.android_app_ads.filter(
          (ads) => otherAdsList.includes(ads.ad_type) && ads.status === "1"
        );

        appSetting.android_others_ad = filterByOtherAds;
        appSetting.android_others_ad_type = JSON.stringify(otherAdsList); // Value Replace
      }

      // IOS Others Ads
      if (appSetting.ios_multiple_ad === "1" && appSetting.ios_others_ad_type?.length > 0) {
        const otherAdsList = appSetting.ios_others_ad_type.map((ads) => ads.value);

        const filterByOtherAds = appSetting.ios_app_ads.filter(
          (ads) => otherAdsList.includes(ads.ad_type) && ads.status === "1"
        );

        appSetting.ios_others_ad = filterByOtherAds;
        appSetting.ios_others_ad_type = JSON.stringify(otherAdsList); // Value Replace
      }
    }

    if (appSetting.android_multiple_ad === "0") {
      exclude(appSetting, ["android_others_ad_type"]);
    }
    if (appSetting.ios_multiple_ad === "0") {
      exclude(appSetting, ["ios_others_ad_type"]);
    }

    appSetting.ip = JSON.stringify([`${process.env.BACKEND_URL}/`]);

    exclude(appSetting, [
      "android_app_ads",
      "ios_app_ads",
      "createdAt",
      "updatedAt",
      "__v",
      "_id",
      "app_name",
      "app_unique_id",
      "status",
      "app_logo",
      "android_notification_type",
      "android_onesignal_app_id",
      "android_onesignal_api_key",
      "android_firebase_server_key",
      "android_firebase_topics",
      "ios_notification_type",
      "ios_onesignal_app_id",
      "ios_onesignal_api_key",
      "ios_firebase_server_key",
      "ios_firebase_topics",
      "android_required_app_logo",
      "ios_required_app_logo"
    ]);

    return { status: true, data: appSetting };
  } catch (error) {
    console.error("Error getting app settings:", error);
    throw new Error("Failed to fetch app settings");
  }
};

module.exports = { getAppSettings };
