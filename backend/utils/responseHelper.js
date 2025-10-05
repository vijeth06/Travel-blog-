/**
 * Response Helper Utilities
 * Standardized response formats for the API
 */

const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
    const response = {
        success: true,
        message,
        ...(data && { data })
    };
    return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', error = null) => {
    const response = {
        success: false,
        message,
        ...(error && process.env.NODE_ENV === 'development' && { error })
    };
    return res.status(statusCode).json(response);
};

const validationErrorResponse = (res, errors) => {
    return errorResponse(res, 400, 'Validation Error', { 
        errors: errors.array ? errors.array() : errors 
    });
};

const notFoundResponse = (res, message = 'Resource not found') => {
    return errorResponse(res, 404, message);
};

const unauthorizedResponse = (res, message = 'Unauthorized access') => {
    return errorResponse(res, 401, message);
};

const forbiddenResponse = (res, message = 'Forbidden access') => {
    return errorResponse(res, 403, message);
};

const conflictResponse = (res, message = 'Conflict occurred') => {
    return errorResponse(res, 409, message);
};

const paginatedResponse = (res, data, pagination, message = 'Success') => {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            currentPage: pagination.page,
            totalPages: Math.ceil(pagination.total / pagination.limit),
            totalItems: pagination.total,
            itemsPerPage: pagination.limit,
            hasNextPage: pagination.page < Math.ceil(pagination.total / pagination.limit),
            hasPrevPage: pagination.page > 1
        }
    });
};

const createdResponse = (res, data, message = 'Resource created successfully') => {
    return successResponse(res, 201, message, data);
};

const updatedResponse = (res, data, message = 'Resource updated successfully') => {
    return successResponse(res, 200, message, data);
};

const deletedResponse = (res, message = 'Resource deleted successfully') => {
    return successResponse(res, 200, message);
};

const noContentResponse = (res) => {
    return res.status(204).send();
};

module.exports = {
    successResponse,
    errorResponse,
    validationErrorResponse,
    notFoundResponse,
    unauthorizedResponse,
    forbiddenResponse,
    conflictResponse,
    paginatedResponse,
    createdResponse,
    updatedResponse,
    deletedResponse,
    noContentResponse
};