const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.js');
const middlewar = require('../middlewars/auth.js');
const multer = require('multer');

//  Configuracion de subida
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/avatars/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now()+ file.originalname)
    }
})

const uploads = multer({storage: storage});

// Defino la rutas
router.get('/',middlewar.auth, userController.pruebaUser );
router.post('/register',userController.register);
router.post('/login', userController.login);
router.get('/profile/:id', middlewar.auth, userController.profile);
router.get('/list/:page?', middlewar.auth, userController.list);
router.put('/update', middlewar.auth, userController.update);
router.post('/upload', [middlewar.auth, uploads.single('file0')],userController.uploader);
router.get('/avatar/:file' ,userController.avatar);
router.get('/counters/:id?', middlewar.auth, userController.counters);

module.exports = router;