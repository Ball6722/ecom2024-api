const prisma = require("../config/prisma")

exports.changeOrderStatus = async(req, res) =>{
    try {
        const { orderId, orderStatus } = req.body
        console.log(orderId, orderStatus)
        const order = await prisma.order.update({
            where:{ id: Number(orderId) },
            data:{
                orderStatus:orderStatus
            }
        })
        res.send('Update Success')
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error!!!' })
    }
}
exports.getOrder = async(req, res) =>{
    try {
        const orders = await prisma.order.findMany({
            include:{
               products:{
                include:{
                    product: true
                }
               },
               orderBy: {
                    select:{
                        id: true,
                        email: true,
                        address: true
                    }
               }
            }
        })
        res.send(orders)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error!!!' })
    }
}