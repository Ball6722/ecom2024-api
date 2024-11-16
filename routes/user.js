const express = require('express')
const { listUsers, changeStatus, changeRole, userCart, getUserCart, emtyCart, saveAddress, saveOrder, getOrder } = require('../controllers/user')
const { authCheck, authAdmin } = require('../middlewares/authCheck')
const router = express.Router()

router.get('/users',authCheck,authAdmin,listUsers)
router.post('/change-status', authCheck,authAdmin, changeStatus)
router.post('/change-role', authCheck,authAdmin, changeRole)


router.post('/user/cart', authCheck, userCart)
router.get('/user/cart', authCheck, getUserCart)
router.delete('/user/cart',authCheck, emtyCart)

router.post('/user/address',authCheck,saveAddress)

router.post('/user/order',authCheck, saveOrder)
router.get('/user/order',authCheck, getOrder)
module.exports = router