const app = require("./config/server");

const startServer = async () => {
  try {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT);
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error("Error starting the server:", error.message);
    process.exit(1);
  }
};

startServer();
