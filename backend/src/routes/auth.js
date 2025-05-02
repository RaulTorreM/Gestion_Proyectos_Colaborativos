const { Router } = require('express');
const { loginUser, refreshToken, logoutUser } = require('../controllers/auth.controller');

const router = Router();

router.post('/login', loginUser);
router.post('/refresh-token', refreshToken);
router.post('/logout', logoutUser);

module.exports = router;
