const express = require("express");
const { register, login, currentUser } = require("../controllers/auth");
const { checkAuth, checkAdmin, authCheck, authAdmin } = require('../middlewares/authCheck')

const router = express.Router();


router.post("/register", register);
router.post('/login', login);
router.post('/current-user',authCheck,currentUser);
router.post('/current-admin',authCheck,authAdmin,currentUser);

module.exports = router;
