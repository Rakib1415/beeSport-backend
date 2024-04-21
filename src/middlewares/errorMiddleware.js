const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);

  // Check if the error is a known mongoose error (Database-related)
  if (err.code && err.meta && err.meta.target) {
    res.status(400).json({ status: false, message: err.message }); // Bad request
  } else {
    res.status(500).json({ status: false, message: err.message || "Internal Server Error" }); // Internal server error
  }
};

module.exports = errorMiddleware;
