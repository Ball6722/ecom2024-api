const express = require('express')
const { create, list, remove } = require('../controllers/category')
const router = express.Router()
const { authCheck, authAdmin } = require('../middlewares/authCheck')

// @ENPOINT http://localhost:5000/api/category
router.post('/category',authCheck,authAdmin, create)
router.get('/category', list)
router.delete('/category/:id',authCheck,authAdmin, remove)

module.exports = router