const express = require('express')
const router = express.Router()
const { authCheck } = require('../middlewares/authCheck')
const { changeOrderStatus, getOrder } = require('../controllers/admin')

router.put('/admin/order-status', authCheck, changeOrderStatus)
router.get('/admin/order', authCheck, getOrder)

module.exports = router