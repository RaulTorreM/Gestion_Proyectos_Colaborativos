jest.mock('@middlewares/validateProject', () => ({
    validateCreateProject: [jest.fn((req, res, next) => {
        if (req.headers['x-test-force-validation-error'] === 'true') {
            const error = new Error('Mocked validation error');
            error.statusCode = 400;
            return next(error);
        }
        next();
    })],
    validateUpdateProject: [jest.fn((req, res, next) => {
        if (req.headers['x-test-force-validation-error'] === 'true') {
            const error = new Error('Mocked validation error');
            error.statusCode = 400;
            return next(error);
        }
        next();
    })],
    validateDeleteProject: [jest.fn((req, res, next) => {
        if (req.headers['x-test-force-validation-error'] === 'true') {
            const error = new Error('Mocked validation error');
            error.statusCode = 400;
            return next(error);
        }
        next();
    })]
}));