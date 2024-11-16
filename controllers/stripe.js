const prisma = require("../config/prisma");
const stripe = require("stripe")(
  "sk_test_51QKAU6IithGkxzRxiUOr24ekHgjJcOGU5rBtDPiDsON8haQkKdYka4C59YoDneJG9sm5L8ZXVpqt8XCTy33mBKCt00CkSL0a4C"
);

exports.payment = async (req, res) => {
  try {
    // ดึงจำนวนเงินที่ต้องจ่ายจากตระกร้าสินค้า

    const cart = await prisma.cart.findFirst({
      where:{
        orderById:req.user.id
      }
    })
    console.log(cart)
    const amountTHB = cart.cartTotal * 100

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountTHB,
      currency: "thb",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.send({
        clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error!!!" });
  }
};
