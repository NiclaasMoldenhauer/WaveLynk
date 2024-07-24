// error handler middleware
export const errorHandler = (err, req, res, next) => {
    //checken ob headers existieren
    if (res.headersSent) {
        // if true => next middleware
        return next(err);
    }

    // Status Code ausgeben
    const statusCode =
    res
    .statusCode && 
    res
    .statusCode >= 400 ?
    res
    .statusCode : 500;
    res
    .status(statusCode); // Statzts Code für Response

    // log error stack wenn nicht in production ---> debugging
    if (process.env.NODE_ENV === 'development') {
        console.log(err)
    }

    res
    .json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    })
}

export default errorHandler;
