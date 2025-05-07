const { Router } = require('express');
const { loginUser, refreshToken, getLoggedUser, logoutUser } = require('../controllers/auth.controller');
const { validateGetLoggedUser } = require('../middlewares/validateAuth');

const router = Router();

router.post('/login', loginUser);
router.post('/refresh-token', refreshToken);
router.get('/logged', validateGetLoggedUser, getLoggedUser);
router.post('/logout', logoutUser);


module.exports = router;
