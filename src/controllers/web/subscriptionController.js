const Subscription = require("../../models/Subscription");

const getAllSubscription = async () => {
  try {
    const subscriptions = await Subscription.find();
    return {
      status: true,
      message: subscriptions.length === 0 ? "No Subscription found!" : "Subscription fetched successfully!",
      data: subscriptions
    };
  } catch (error) {
    return { status: false, message: "Something went wrong!" };
  }
};

module.exports = {
  getAllSubscription
};
