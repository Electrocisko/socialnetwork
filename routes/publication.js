const express = require('express');
const router = express.Router();
const publicationControler = require('../controllers/publication.js');

// Defino la rutas

router.get('/publication', publicationControler.pruebaPublication );

module.exports = router;