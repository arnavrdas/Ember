// Middlewares

  const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500

    console.error(`❌ [${statusCode}] ${err.message}`)

    res.status(statusCode).json({
      message: err.message || 'Something went wrong',
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    })
  }

module.exports = { errorHandler }