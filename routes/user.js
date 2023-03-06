const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.js');

// Defino la rutas

router.get('/usuario', userController.pruebaUser );

module.exports = router;