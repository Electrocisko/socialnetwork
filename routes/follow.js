const express = require('express');
const router = express.Router();
const followControler = require('../controllers/follow.js');
const check = require('../middlewars/auth.js');

// Defino la rutas
router.get('/prueba-follow', followControler.pruebaFollow);
router.post('/save',  check.auth,followControler.saveFollow );
router.delete('/delete/:id',  check.auth,followControler.deleteFollow );

module.exports = router;