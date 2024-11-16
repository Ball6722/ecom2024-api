const prisma = require("../config/prisma");
const cloudinary = require('cloudinary').v2;
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_KEY_SECRET, // Click 'View API Keys' above to copy your API secret
});

exports.create = async (req, res) => {
  try {
    const { title, description, price, quantity, categoryId, images } =
      req.body;
    // console.log(title, description, price, quantity,categoryId, images)
    const product = await prisma.product.create({
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        images: {
          create: images.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });
    return res.send(product);
  } catch (error) {
    res.status(500).json({ message: "Server Error!" });
  }
};
exports.list = async (req, res) => {
  try {
    const { count } = req.params;
    const products = await prisma.product.findMany({
      take: parseInt(count),
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error!" });
  }
};
exports.read = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await prisma.product.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error!" });
  }
};
exports.update = async (req, res) => {
  try {
    const { title, description, price, quantity, categoryId, images } =
      req.body;
    // console.log(title, description, price, quantity,categoryId, images)

    // เคลียร์รูปเก่า
    await prisma.image.deleteMany({
      where: {
        productId: Number(req.params.id),
      },
    });

    const product = await prisma.product.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        images: {
          create: images.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });
    return res.send(product);
  } catch (error) {
    res.status(500).json({ message: "Server Error!" });
  }
};
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    // 1.ค้นหาสินค้า

    const product  = await prisma.product.findFirst({
      where: {
        id:Number(id)
      },
      include:{
        images: true
      }
    })
    console.log(product)
    if(!product){
      return res.status(400).json({
        message: 'product not found!'
      })
    }

    // 2.Promis cloud ลบแบบรอฉันด้วย
    const deleteImage = product.images.map((image)=>
      new Promise((resolve, reject)=>{
        cloudinary.uploader.destroy(image.public_id,(err, result)=>{
          if (err) {
            reject(err)
          }else{
            resolve(result)
          }
        })
      })
    )

    await Promise.all(deleteImage)

    // 3.ลบสินค้า
    await prisma.product.delete({
      where: {
        id: Number(id),
      },
    });
    res.send("delete success!!!");
  } catch (error) {
    res.status(500).json({ message: "Server Error!" });
  }
};
exports.listby = async (req, res) => {
  try {
    const { sort, order, limit } = req.body;
    console.log(sort, order, limit);
    const products = await prisma.product.findMany({
      take: limit,
      orderBy: { [sort]: order },
      include: {
        category: true,
        images: true
      },
    });
    // console.log(products)
    res.send(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error!" });
  }
};

const handleQuery = async (req, res, query) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Search Error!!!" });
  }
};
const handlePrice = async (req, res, priceRange) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        price: {
          gte: priceRange[0],
          lte: priceRange[1],
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Search Error!!!" });
  }
};
const handleCategory = async (req, res, categoryId) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId: {
          in: categoryId.map((id) => Number(id)),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error!!!" });
    console.log(error);
  }
};

exports.searchFiltes = async (req, res) => {
  try {
    const { query, category, price } = req.body;
    if (query) {
      await handleQuery(req, res, query);
    }
    if (category) {
      await handleCategory(req, res, category);
    }
    if (price) {
      await handlePrice(req, res, price);
    }
    //res.send('Hello searchFiltes Product')
  } catch (error) {
    res.status(500).json({ message: "Server Error!" });
  }
};

exports.createImages = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image,{
      public_id: `Roitai-${Date.now()}`,
      resource_type: 'auto',
      folder: 'Ecom2024' 
    })
    res.send(result)
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.removeImage = async (req, res) => {
  try {
    // code
    const { public_id } = req.body
    cloudinary.uploader.destroy(public_id, (result)=>{
      res.send('Remove Images Success!!!');
    })
    
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
