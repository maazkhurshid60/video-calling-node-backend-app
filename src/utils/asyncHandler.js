const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(res.status(err.statusCode || 500).json(
            {
                success: false,
                message: err.message
            }
        )))
    }
}

export { asyncHandler }
