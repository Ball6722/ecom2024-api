const express = require('express')
const { create, list, update, remove, listby, searchFiltes, read, createImages, removeImage } = require('../controllers/product')
const router = express.Router()
const { authCheck, authAdmin } = require('../middlewares/authCheck')

router.post('/product', create)
router.get('/products/:count', list)
router.put('/product/:id', update)
router.get('/product/:id', read)
router.delete('/product/:id', remove)
router.post('/productby', listby)
router.post('/search/filters', searchFiltes)
router.post('/images',authCheck,authAdmin, createImages)
router.post('/removeimages',authCheck,authAdmin, removeImage)

module.exports = router