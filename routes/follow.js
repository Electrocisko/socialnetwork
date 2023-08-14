const express = require('express');
const router = express.Router();
const followControler = require('../controllers/follow.js');
const check = require('../middlewars/auth.js');

// Defino la rutas
router.get('/prueba-follow', followControler.pruebaFollow);
router.post('/save',  check.auth,followControler.save );

module.exports = router;