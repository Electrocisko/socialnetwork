const express = require('express');
const router = express.Router();
const followControler = require('../controllers/follow.js');

// Defino la rutas

router.get('/follow', followControler.pruebaFollow );

module.exports = router;