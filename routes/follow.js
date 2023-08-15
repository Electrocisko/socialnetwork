const express = require('express');
const router = express.Router();
const followControler = require('../controllers/follow.js');
const check = require('../middlewars/auth.js');

// Defino la rutas
router.get('/prueba-follow', followControler.pruebaFollow);
router.post('/save',  check.auth,followControler.saveFollow );
router.delete('/delete/:id',  check.auth,followControler.deleteFollow );
router.get('/following/:id?/:page?', check.auth,followControler.following);
router.get('/followers/:id?/:page?', check.auth,followControler.followers);


module.exports = router;