jest.mock('@middlewares/validateToken', () => ({
    validateToken: jest.fn((req, res, next) => {
        const accessToken = req.headers.authorization;
        
        if (!accessToken || accessToken === 'null' || accessToken === '') {
            return res.status(400).json({ error: 'Access token requerido' });
        }
        
        if (accessToken === 'invalid_token' || accessToken === 'invalid-token' || accessToken === 'expired_token') {
            return res.status(401).json({ error: 'Access Token inválido o expirado' });
        }
        
        // Para casos especiales de test
        if (accessToken === 'valid_token_but_no_user') {
            req.userId = 'non_existent_user';
            return next();
        }
        
        if (accessToken === 'valid_token') {
            req.userId = 'user123';
            return next();
        }
        
        // Simular token válido por defecto
        req.userId = 'mockUserId';
        next();
    })
}));