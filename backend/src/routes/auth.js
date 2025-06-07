const { Router } = require('express');
const { loginUser, refreshToken, getLoggedUser, logoutUser } = require('../controllers/auth.controller');
const { validateToken } = require('../middlewares/validateToken');

const router = Router();

router.post('/login', loginUser);
router.post('/refresh-token', refreshToken);
router.get('/logged', validateToken, getLoggedUser);
router.post('/logout', validateToken, logoutUser);


module.exports = router;
