const bcrypt = require("bcryptjs")
const prisma = require("../config/prisma")
const jwt = require("jsonwebtoken")
exports.register = async(req, res) => {
    try {
        const { email, password } = req.body
        // Step1 Validate Body
        if (!email) {
            return res.status(400).json({ message: 'Email Is Required!' })
        }
        if (!password) {
            return res.status(400).json({ message: 'Password Is Required!' })
        }

        // Step2 Check Email Already?
        const user = await prisma.user.findFirst({
            where:{
                email:email
            }
        })
        if (user) {
            return res.status(400).json({ message: 'Email already exits.!!' })
        }

        // Step 3 hashPassword 
        const hashPassword = await bcrypt.hash(password,10)

        // Step 4 Register
        await prisma.user.create({
            data:{
                email:email,
                password:hashPassword
            }
        })
        return res.status(200).json({ message: 'register success !!!' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error!' })
    }
    
}
exports.login = async(req, res) => {
    try {
        const { email, password } = req.body
        // Step 1 Check Email
        const user = await prisma.user.findFirst({
            where:{
                email:email
            }
        })
        if (!user || !user.enabled) {
            return res.status(400).json({ message:'User Not found or not Enabled' })
        }

        // Step 2 Check Password
        const  isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Password Invalid!!!' })
        }

        // Step 3 Create Payload
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        }
        

        // Step 4  Generate Token
        jwt.sign(payload,process.env.SECRET,{
            expiresIn: '1d'
        },(err, token) =>{
            if (err) {
                return res.status(500).json({ message: 'Server Error!!!' })
            }
            res.status(200).json({ payload, token })
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error!' })
    }
}
exports.currentUser = async(req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where:{
                email: req.user.email
            },
            select:{
                id: true,
                email: true,
                name: true,
                role: true
            }
        })
        res.send(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error!' })
    }
}