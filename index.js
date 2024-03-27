require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT;
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { validate } = require("uuid");

// MONGODB CONNECTED IN THEN CATCH

// mongoose
//   .connect("mongodb://127.0.0.1:27017/testproductDB")
//   .then(() => console.log("db is connected!"))
//   .catch((error) => {
//     console.log("db is not connected");
//     console.log(error);
//     process.exit(1);
//   });




// MONGODB CONNECTED IN ASYNC AWAIT

const connectedDb = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("db is connected!");
  } catch (error) {
    console.log("db is not connected");
    console.log(error.message);
    process.exit(1);
  }
};



// CREATE PRODUCTS SCHEMA

const productsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "product title is required"],
    minlength: [4, "product minimum 4 characters"],
    maxlength: [100, "product maximum 30 characters"],
    lowercase: true,
    trim: true,

    // enum:{
    //   values:["i-phone","sumsang"],
    //   message:"{value} is not supported"
    // },

    validate: {
      validator: function (v) {
        return v.length === 10;
      },
      message:(props)=>`${props.value} is not valid title`
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  
  },
  phone:{
    type:String,
    required:[true,"phone number is required"],
    validate:{
      validator:function(v){
        return /\d{3}\d{3}\d{5}/.test(v);
      },
      message:(props)=>`${props.value} is not valid number`
    },
  },
  price: {
    type: Number,
    required: [true, "price is required"],
    min: [200, "minimum price 200 tk"],
    max: [2500, "maxium price 2500 tk"],
  },
  description: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());




// CREATE PRODUCT MODEL

const product = mongoose.model("products", productsSchema);




// PRODUCTS CREATE POST ROUTE

app.post("/products", async (req, res) => {
  try {
    // SINGLE PRODUCT DATA POST AND SAVE IN MONGODB

    const newProduct = new product({
      title: req.body.title,
      price: req.body.price,
      description: req.body.description,
      email: req.body.email,
      phone: req.body.phone,
    });
    const productData = await newProduct.save();

    // MULTIPLE PRODUCT DATA SAVE IN MONGODB

    // const productData = await product.insertMany([
    //   {
    //     title:"this is i-phone",
    //     price:16000,
    //     description:"this is description"
    //   },
    //   {
    //     title:"this is samsung",
    //     price:20000,
    //     description:"this is description samsung"
    //   },
    //   {
    //     title:"this is vivo",
    //     price:11000,
    //     description:"this is description vivo"
    //   }
    // ]);

    res.status(201).send(productData);
  } catch (error) {
    res.status(401).send({
      message: error.message,
    });
  }
});



// PROCUCTS TO GET FORM MONGODB DATABASE

app.get("/products", async (req, res) => {
  try {
    const price = req.query.price;
    let products;

    if (price) {
      products = await product.find({ price: { $gte: price } });
    } else {
      products = await product.find();
    }

    if (products) {
      res.status(201).send({
        success: true,
        message: "get all data",
        data: products,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "products not found",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});




// SEARCH ID BY SPECIFIC DATA FORM MONGODB DATABASE STORE

app.get("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // COMPLETE DOCUMENT ONE PRODUCT HAVE TO SHOW

    const products = await product.findOne({ _id: id });

    // SPECIFIC DATA SHOW (EXAMPLE: SHOW TITLE DATA & PRICE DATA NOT SHOW ID)

    //  const products = await product.findOne({_id: id}).select({
    //   title:1,
    //   price:1,
    //   _id:0
    //  })

    if (products) {
      res.status(202).send({
        success: true,
        message: "return single data",
        data: products,
      });
    } else {
      res.status(400).send({
        success: false,
        message: "product not found",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});




// PRODUCT DELETE FORM MONGODB

app.delete("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // SINGLE DATA DELETE NO INFORMATIO SHOW
    const deleteData = await product.deleteOne({ _id: id });

    // SINGLE DATA DELETE WITH INFORMATION IN MONGODB

    // const productInfo =await product.findByIdAndDelete({_id:id})

    if (product) {
      res.status(200).send({
        success: true,
        message: "product was deleted",
        data: deleteData,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "product was not delete",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});



// SINGLE UPDATE DATA FORM MONGODB

app.put("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // SINGLE UPDATE DATA NO INFORMATION SHOW FORM MONGDB

    // const updateData = await product.updateOne({
    //   _id:id
    // },{
    //   $set:{
    //     price:125,
    //   },
    // })

    // SINGLE UPDATE DATA WITH INFORMATION SHOW FORM MONGDB

    const updateData = await product.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          title: req.body.title,
          price: req.body.price,
          description: req.body.description,
          email: req.body.email,
          phone: req.body.phone
        },
      },
      {
        new: true,
      }
    );

    if (updateData) {
      res.status(205).send({
        success: true,
        message: "product was updated",
        data: updateData,
      });
    } else {
      res.status(403).send({
        success: false,
        message: "product was not updated",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});



// HOME ROUTE
app.get("/", (req, res) => {
  res.send("welcome to homepage");
});



// SERVER RUNNING PORT

app.listen(PORT, async () => {
  console.log(`server is running at http://localhost:${PORT}`);
  await connectedDb();
});
