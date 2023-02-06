const Collection = require("../models/collection.schema.js");
const asyncHandler = require("../services/asyncHandler");
const CustomError = require("../utils/customError");

/******************************************************
 * @Create_COLLECTION
 * @route http://localhost:5000/api/collection
 * @description CreateCollection controller for creating new collection
 * @parameters name
 * @returns User Object
 ******************************************************/

exports.createCollection = asyncHandler(async (req, res) => {
  //take name from front end
  const { name } = req.body;

  if (!name) {
    throw new CustomError("Collection name is required", 400);
  }

  //add this name to database
  const collection = await Collection.create({
    name,
  });
  //send this response value to frontend
  res.status(200).json({
    success: true,
    message: "Collection created with success",
    collection,
  });
});

/******************************************************
 * @Update_COLLECTION
 * @route http://localhost:5000/api/collection/:id
 * @description UpdateCollection controller for updating existing collection
 * @parameters name, id
 * @returns User Object
 ******************************************************/

exports.updateCollection = asyncHandler(async (req, res) => {
  //existing value to be updates
  const { id: collectionId } = req.params;
 
  //new value to get updated
  const { name } = req.body;

  if (!name) {
    throw new CustomError("Collection name is required", 400);
  }

  let updatedCollection = await Collection.findByIdAndUpdate(
    collectionId,
    {
      name,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedCollection) {
    throw new CustomError("Collection not found", 400);
  }

  //send response to front end
  res.status(200).json({
    success: true,
    message: "Collection updated successfully",
    updatedCollection,
  });
});

/******************************************************
 * @Delete_COLLECTION
 * @route http://localhost:5000/api/collection/:id
 * @description DeleteCollection controller for deleting     collection
 * @parameters id
 * @returns User Object
 ******************************************************/

exports.deleteCollection = asyncHandler(async (req, res) => {
  const { id: collectionId } = req.params;

  const collectionToDelete = await Collection.findByIdAndDelete(collectionId);

  if (!collectionToDelete) {
    throw new CustomError("Collection not found", 400);
  }

  collectionToDelete.remove();
  //send response to front end
  res.status(200).json({
    success: true,
    message: "Collection deleted successfully",
  });
});

/******************************************************
 * @GetAll_COLLECTION
 * @route http://localhost:5000/api/collection/all
 * @description Get all collection
 * @parameters 
 * @returns User Object
 ******************************************************/

exports.getAllCollections = asyncHandler(async (req, res) => {
  const collections = await Collection.find();

  if (!collections) {
    throw new CustomError("No Collection found", 400);
  }

  res.status(200).json({
    success: true,
    collections,
  });
});
