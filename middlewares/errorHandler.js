// NOT FOUND

const notFound = (req, res, next) => {
    const error = new Error(`Not Found: ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    const status =
        res.statusCode === 200 || res.statusCode === 201 ? "success" : "fail";
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        status,
        message: err?.message,
        stack: err?.stack,
    });
};

module.exports = { notFound, errorHandler };
