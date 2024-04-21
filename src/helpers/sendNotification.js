const { default: axios } = require("axios");
const AppModel = require("../models/AppModel");

const sendNotification = async (data, platform) => {
  // Send notifications in each app
  data.apps.forEach(async (id) => {
    const appSettings = await AppModel.findOne({ app_unique_id: id });

    const imageUrl = data.image;
    const notificationTitle = data.title;
    const notificationMessage = data.body;
    const firebaseTopics = appSettings[`${platform}_firebase_topics`];
    const firebaseServerKey = appSettings[`${platform}_firebase_server_key`];
    const onesignalAppId = appSettings[`${platform}_onesignal_app_id`];
    const onesignalApiKey = appSettings[`${platform}_onesignal_api_key`];
    const notificationType = appSettings[`${platform}_notification_type`];
    const fcmUrl = "https://fcm.googleapis.com/fcm/send";
    const oneSignalUrl = "https://onesignal.com/api/v1/notifications";

    if (notificationType === "fcm") {
      const dataArr = {
        title: notificationTitle,
        body: notificationMessage,
        style: "picture",
        image: imageUrl,
        notification_type: data.notification_type,
        action_url: data.action_url
      };

      const notificationData = {
        title: notificationTitle,
        body: notificationMessage,
        image: imageUrl,
        style: "picture",
        android: {
          notification: {
            notificationCount: 1
          }
        },
        apple: {
          notification: {
            notificationCount: 1
          }
        }
      };

      const android = {
        notification: {
          image: imageUrl
        }
      };

      const arrayToSend = {
        to: `/topics/${firebaseTopics}`,
        data: dataArr,
        priority: "high",
        notification: notificationData,
        android: android
      };

      const headers = {
        Authorization: `key=${firebaseServerKey}`,
        "Content-Type": "application/json"
      };

      async function sendFcmNotification() {
        try {
          const response = await axios.post(fcmUrl, arrayToSend, {
            headers: headers
          });
          console.log("Notification sent successfully:", response.data);
        } catch (error) {
          console.error("Error sending notification:", error.message);
        }
      }

      sendFcmNotification();
    } else {
      // One Signal Notification
      const headings = {
        en: notificationTitle
      };
      const contents = {
        en: notificationMessage
      };

      const ios_img = {
        id1: imageUrl
      };

      const headers = {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: `Basic ${onesignalApiKey}`
      };

      const options = {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          app_id: onesignalAppId,
          headings: headings,
          included_segments: ["All"],
          contents: contents,
          big_picture: imageUrl,
          large_icon: appSettings.app_logo,
          content_available: true,
          ios_attachments: ios_img
        })
      };

      fetch(oneSignalUrl, options)
        .then((response) => response.json())
        .then((response) => console.log("Notification send successfully!"))
        .catch((err) => console.error(err));
    }
  });
};

module.exports = sendNotification;
