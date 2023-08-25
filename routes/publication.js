const express = require('express');
const router = express.Router();
const publicationControler = require('../controllers/publication.js');
const check = require('../middlewars/auth.js');

// Defino la rutas

router.get('/', publicationControler.pruebaPublication );
router.get('/detail/:id', check.auth, publicationControler.detail);
router.post('/save',check.auth, publicationControler.save);

module.exports = router;