const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const { validateLogin } = require('../middleware/validation');

// Login con credenciales
router.post('/login', validateLogin, authController.login);

// OAuth Google
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  authController.oauthCallback
);

// Refresh token
router.post('/refresh', 
  passport.authenticate('jwt', { session: false }), 
  authController.refreshToken
);

// Logout
router.post('/logout', 
  passport.authenticate('jwt', { session: false }), 
  authController.logout
);

module.exports = router;