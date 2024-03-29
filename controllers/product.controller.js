const Product = require("../models/product.schema");
const formidable = require("formidable");
const fs = require("fs");
const { deleteFile, s3FileUpload } = require("../services/imageUpload");
const Mongoose = require("mongoose");
const asyncHandler = require("../services/asyncHandler");
const CustomError = require("../utils/customError");
const config = require("../config/index");
const { findById } = require("../models/product.schema");


/**********************************************************
 * @ADD_PRODUCT
 * @route https://localhost:5000/api/product
 * @description Controller used for creating a new product
 * @description Only admin can add product
 * @description Uses AWS S3 Bucket for image upload
 * @returns Product Object
 *********************************************************/


exports.addProduct = asyncHandler(async (req, res) => {
  // Set up `formidable` with options to handle file uploads
  const form = formidable({
    multiples: true,
    keepExtensions: true,
  });

  form.parse(req, async function (err, fields, files) {
    try {
      if (err) {
        throw new CustomError(err.message || "Something went wrong", 500);
      }

      let productId = new Mongoose.Types.ObjectId().toHexString();
      let imgArray;
      // check for fields
      if (
        !fields.name ||
        !fields.price ||
        !fields.description ||
        !fields.collectionId
      ) {
        throw new CustomError("Please fill all details", 500);
      }

      if (!files.photos) {
        throw new CustomError("Please fill photos", 401);
        //remove image
      } else {
        let filesArray = files.photos;

        filesArray = Array.isArray(filesArray) ? filesArray : [filesArray];

        // handling images
        let imgArrayResp = Promise.all(
          filesArray.map(async (element, index) => {
            const data = fs.readFileSync(element.filepath);

            const upload = await s3FileUpload({
              bucketName: config.S3_BUCKET_NAME,
              key: `products/${productId}/photo_${index + 1}.png`,
              body: data,
              contentType: element.mimetype,
            });

            return {
              secure_url: upload.Location,
            };
          })
        );

        imgArray = await imgArrayResp;
      }

      fields.user = req.user.id;

      // adding product to database
      const product = await Product.create({
        _id: productId,
        photos: imgArray,
        ...fields,
      });

      if (!product) {
        throw new CustomError("Product was not created", 400);
        //remove image
      }

      res.status(200).json({
        success: true,
        message: "product created",
        product,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Something went wrong",
      });
    }
  });
});

/**********************************************************
 * @GET_ALL_PRODUCT
 * @route https://localhost:5000/api/product
 * @description Controller used for getting all products   details
 * @description User and admin can get all the prducts
 * @returns Products Object
 *********************************************************/

exports.getAllProducts = asyncHandler(async (req, res) => {
  // getting all products from database
  const products = await Product.find({});

  if (!products) {
    throw new CustomError("No product was found", 404);
  }
  res.status(200).json({
    success: true,
    products,
  });
});


/**********************************************************
 * @PRODUCT_BY_ID
 * @route https://localhost:5000/api/product/:id
 * @description Controller used for getting single product details
 * @description User and admin can get single product details
 * @returns Product Object
 *********************************************************/


exports.getProductById = asyncHandler(async (req, res) => {
  const { id: productId } = req.params;

  //finding a product by its id from database
  const product = await Product.findById(productId);

  
  if (!product) {
    throw new CustomError("No product was found", 401);
  }

  res.status(200).json({
    success: true,
    product,
  });
});


/**********************************************************
 * @GET_ADD_REVIEW
 * @route https://localhost:5000/api/product/review/:productId
 * @description Controller used for add/update review
 * @description User  can a add product review
 * @returns Products Object
 *********************************************************/

exports.addReview = asyncHandler(async (req, res) => {
 
   const { rating, comment} = req.body;
   const { productId } = req.params;

  if (!rating || !comment ) {
    throw new CustomError("Please fill all fields", 400);
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

   if (!product) {
     throw new CustomError("No product was found", 401);
   }

  
  const AlreadyReview = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  //if review exist update it other wise create 
  if (AlreadyReview) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }

  // adjust ratings

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  //save

  await product.save({ validateBeforeSave: false });


  res.status(200).json({
    success: true,
    product,
  });
});


/**********************************************************
 * @DELETE_REVIEW
 * @route https://localhost:5000/api/product/review/:productId
 * @description Controller used for delete review
 * @description User  can delete product review  added by him
 * @returns Products Object
 *********************************************************/

exports.deleteReview = asyncHandler(async (req, res) => {
 
   const { productId } = req.params;

  // finding product by productId form database  
  const product = await Product.findById(productId);

   if (!product) {
     throw new CustomError("No product was found", 401);
   }
  // filtering the review using user id
  const reviews = product.reviews.filter(
    (rev) => rev.user.toString() !== req.user._id.toString()
  );  


  const numberOfReviews = reviews.length;

  // adjust ratings

  const ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  //update the product

  await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      ratings,
      numberOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
    message: "Review succesfully  deleted",
   
  });
});



/**********************************************************
 * @productFilters
 * @route https://localhost:5000/api/product/review/:productId
 * @description Controller used for filter products
 * @description User  can filter products
 * @returns Products Object
 *********************************************************/

exports.productFilters = asyncHandler(async (req, res) => {
   
  const { checked, radio } = req.query;
  const radioArray = radio.split(",").map(Number);
 
  let args = {};
  if (checked?.length > 0) args.collectionId = checked;
if (radioArray?.length === 2)
  args.price = { $gte: radioArray[0], $lte: radioArray[1] };  const products = await Product.find(args);
  res.status(200).json({
    success: true,
    products,
  });
});










/**********************************************************
 * @UPDATE_PRODUCT
 * @route https://localhost:5000/api/admin/product/:id
 * @description Controller used for updating a product
 * @description Only admin can update product
 * @description Uses AWS S3 Bucket for image upload
 * @returns Product Object
 *********************************************************/

exports.adminUpdateProduct = asyncHandler(async (req, res) => {
 const {id} = req.params;
  
 const product = await Product.findById(id);

 if (!product) {
   throw new CustomError("No product was found", 401);
 }

 const form = formidable({
   multiples: true,
   keepExtensions: true,
 });

 form.parse(req, async function (err, fields, files) {
   try {
     if (err) {
       throw new CustomError(err.message || "Something went wrong", 500);
     }

     let productId = product.id
     console.log(productId)
     let imgArray;
     // check for fields
     if (
       !fields.name ||
       !fields.price ||
       !fields.description ||
       !fields.collectionId
     ) {
       throw new CustomError("Please fill all details", 500);
     }

     if (files.photos)  {
       let filesArray = files.photos;

       filesArray = Array.isArray(filesArray) ? filesArray : [filesArray];

     try {
       await Promise.all(
         product.photos.map(async (index) => {
        
           await deleteFile({
             bucketName: config.S3_BUCKET_NAME,
             key: `products/${product.id}/photo_${index + 1}.png`,
           });
         })
       );
     } catch (error) {
       return res.status(500).json({
         success: false,
         message: error.message || "Something went wrong",
       });
     }


       // handling images
       let imgArrayResp = Promise.all(
         filesArray.map(async (element, index) => {
           const data = fs.readFileSync(element.filepath);
           const upload = await s3FileUpload({
             bucketName: config.S3_BUCKET_NAME,
             key: `products/${product.id}/photo_${index + 1}.png`,
             body: data,
             contentType: element.mimetype,
           });

           return {
             secure_url: upload.Location,
           };
         })
       );

       imgArray = await imgArrayResp;
     }
    
     const updatedproduct = await Product.findByIdAndUpdate(id,{
       photos: imgArray,
       ...fields,
     },{
    new: true,
    runValidators: true,
  });

     if (!updatedproduct) {
       throw new CustomError("Failed to update product", 400);
       //remove image
     }
     res.status(200).json({
       success: true,
       message: "product updated",
       updatedproduct,
     });
   } catch (error) {
     return res.status(500).json({
       success: false,
       message: error.message || "Something went wrong",
     });
   }
 });
});

/**********************************************************
 * @ADMIN_DELETE_PRODUCT
 * @route https://localhost:5000/api/admin/product/:id
 * @description Admin route to delete a product
 * @description admin can delete a product using product id
 * @returns Succes message Product has been deleted succesfully
 *********************************************************/


exports.adminDeleteOneProduct = asyncHandler(async (req, res) => {
 
  const { id } = req.params;

  const product = await Product.findById(id);

   if (!product) {
     throw new CustomError("No product was found", 401);
   }
  //destroy the existing image

   try {
     await Promise.all(
       product.photos.map(async (index) => {
         await deleteFile({
           bucketName: config.S3_BUCKET_NAME,
           key: `products/${product.id}/photo_${index + 1}.png`,
         });      
       })
     );
   } catch (error) {
     return res.status(500).json({
       success: false,
       message: error.message || "Something went wrong",
     });
   }

  await product.remove();

  res.status(200).json({
    success: true,
   message: "Product has been deleted succesfully"
  });
});



 