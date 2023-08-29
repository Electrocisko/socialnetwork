const express = require('express');
const router = express.Router();
const publicationControler = require('../controllers/publication.js');
const check = require('../middlewars/auth.js');
const multer = require('multer');

//  Configuracion de subida
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/publications/')
    },
    filename: (req, file, cb) => {
        cb(null, "pub-"+Date.now()+ file.originalname)
    }
})

const uploads = multer({storage});

// Defino la rutas

router.get('/', publicationControler.pruebaPublication );
router.get('/detail/:id', check.auth, publicationControler.detail);
router.post('/save',check.auth, publicationControler.save);
router.delete('/delete/:id', check.auth, publicationControler.remove);
router.get('/user/:id/:page?', check.auth, publicationControler.user);
router.post('/upload/:id', [check.auth, uploads.single("file0")], publicationControler.uploader);

module.exports = router;