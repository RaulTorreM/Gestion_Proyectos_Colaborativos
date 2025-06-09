jest.mock('@middlewares/validateResult', () => jest.fn((req, res, next) => {
    if (req.testForceValidationError) {
      return res.status(400).json({ errors: [{ msg: 'Forced validation error' }] });
    }
    next();
}));