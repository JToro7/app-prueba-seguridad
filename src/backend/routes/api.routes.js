
const express = require('express');
const router = express.Router();
const passport = require('passport');
const { authorize } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');
const adminController = require('../controllers/admin.controller');

// Middleware de autenticación para todas las rutas
router.use(passport.authenticate('jwt', { session: false }));

// Rutas de usuario
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/settings', userController.getSettings);
router.put('/settings', userController.updateSettings);

// Rutas de cursos (estudiantes y profesores)
router.get('/courses', 
  authorize(['student', 'teacher']), 
  userController.getCourses
);

// Rutas de administrador
router.get('/admin/dashboard', 
  authorize(['admin']), 
  adminController.getDashboard
);

router.get('/admin/users', 
  authorize(['admin']), 
  adminController.getUsers
);

module.exports = router;