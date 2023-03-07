const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.js');

// Defino la rutas

router.get('/', userController.pruebaUser );
router.post('/register',userController.register);

module.exports = router;