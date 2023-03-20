const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.js');
const middlewar = require('../middlewars/auth.js')

// Defino la rutas

router.get('/',middlewar.auth, userController.pruebaUser );
router.post('/register',userController.register);
router.post('/login', userController.login);
router.get('/profile/:id', middlewar.auth, userController.profile);
router.get('/list/:page?', middlewar.auth, userController.list);
router.put('/update', middlewar.auth, userController.update);

module.exports = router;