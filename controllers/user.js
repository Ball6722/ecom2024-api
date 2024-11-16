const prisma = require("../config/prisma")

exports.listUsers = async(req, res) => {
    try {
        const users = await prisma.user.findMany({
            select:{
                id: true,
                email: true,
                role: true,
                enabled: true,
                address: true,
                updatedAt: true
            }
        })
        res.send(users)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error!!!' })
    }
}

exports.changeStatus = async(req, res)=>{
    try {
        const { id, enabled } = req.body
        const user = await prisma.user.update({
            where:{
                id:Number(id)
            },
            data:{
                enabled:enabled
            }
        })
        res.send('Update Status Success')
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error' })
    }
}

exports.changeRole = async(req, res)=>{
    try {
        const { id, role } = req.body
        const user = await prisma.user.update({
            where:{
                id:Number(id)
            },
            data:{
                role: role
            }
        })
        res.send('Update Status Success')
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error' })
    }
}
exports.userCart = async(req, res)=>{
    try {
        const { cart } = req.body

        const user = await prisma.user.findFirst({
            where:{
                id: Number(req.user.id)
            }
        })

        // Check quantity
        for (const item of cart) {
            const product = await prisma.product.findUnique({
                where:{ id: item.id },
                select: { quantity: true, title:true }
            })
            if (!product || item.count > product.quantity) {
                return res.status(400).json({
                    ok:false,
                    message: `ขออภัย . สินค้า ${product.title || 'product'} หมด`
                })
            }
        }

        // delete items cart
        await prisma.productOnCart.deleteMany({
            where:{
                cart: { orderById: user.id}
            }
        })

        // delete old cart

        await prisma.cart.deleteMany({
            where:{
                orderById: user.id
            }
        })

        // เตรียมสินค้า 
        let products = cart.map((item)=>({
            productId: item.id,
            count: item.count,
            price: item.price
        }))
        

        // หาผลรวม 
        let cartTotal = products.reduce((sum, item) => sum + item.price * item.count, 0)
        console.log(cartTotal)

        // new cart
        const newCart = await prisma.cart.create({
            data:{
                products:{
                    create: products
                },
                cartTotal:cartTotal,
                orderById:user.id
            }
        })
        
        res.send('Add Cart Success')
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error' })
    }
}
exports.getUserCart = async(req, res)=>{
    try {
        const cart = await prisma.cart.findFirst({
            where:{
                orderById: Number(req.user.id)
            },
            include:{
                products:{
                    include:{
                        product: true
                    }
                }
            }
        })
        res.json({
            products: cart.products,
            cartTotal: cart.cartTotal
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error' })
    }
}
exports.emtyCart = async(req, res)=>{
    try {
        const cart = await prisma.cart.findFirst({
            where:{
                orderById: Number(req.user.id)
            }
        })
        if(!cart){
            return res.status(400).json({ message: 'No Cart' })       
        }
        await prisma.productOnCart.deleteMany({
            where:{ cartId:cart.id }
        })
        const result = await prisma.cart.deleteMany({
            where: { orderById: Number(req.user.id) }
        })
        res.json({
            message: 'Cart Emty Success',
            deleteCount: result.count
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error' })
    }
}
exports.saveAddress = async(req, res)=>{
    try {
        const { address } = req.body
        console.log(address)
        const addressUser = await prisma.user.update({
            where:{
                id:Number(req.user.id)
            },
            data:{
                address:address
            }
        })

        res.json({ ok: true, message: 'Address update success' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error' })
    }
}
exports.saveOrder = async(req, res)=>{
    try {
        const { id, amount, status, currency } = req.body.paymentIntent
        // Step 0 Check Stripe
       
        // Step 1 Get User Cart
        const userCart = await prisma.cart.findFirst({
            where:{
                orderById: Number(req.user.id)
            },
            include:{ products: true }
        })

        // check cart emty
        if(!userCart || userCart.products.length === 0){
            return res.status(400).json({ ok: false, message: 'Cart is Emty' })
        }



        // create a new order
        const amountTHB = Number(amount) / 100
        const order = await prisma.order.create({
            data:{
                products:{
                    create: userCart.products.map((item) =>({
                        productId: item.productId,
                        count: item.count,
                        price: item.price
                    }))
                },
                orderBy:{
                    connect:{ id: req.user.id }
                },
                cartTotal: userCart.cartTotal,
                stripePaymentId: id,
                amount: Number(amountTHB),
                status: status,
                currency: currency

            }
        })
        
        // update product
        const  update = userCart.products.map((item)=>({
            where:{ id: item.productId },
            data:{
                quantity: { decrement: item.count },
                sold: { increment: item.count }
            }
        }))

        await Promise.all(
            update.map((updated) => prisma.product.update(updated))
        )

        await prisma.cart.deleteMany({
            where:{ orderById: Number(req.user.id) }
        })

        res.json({ ok: true, order })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error' })
    }
}
exports.getOrder = async(req, res)=>{
    try {
        const orders = await prisma.order.findMany({
            where:{ orderById: Number(req.user.id) },
            include:{
                products:{
                    include:{ product: true }
                }
            }
        })
        if(orders.length === 0){
            return res.status(400).json({ ok:true, message: 'No orders' })
        }
        res.send({ ok: true, orders })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error' })
    }
}

