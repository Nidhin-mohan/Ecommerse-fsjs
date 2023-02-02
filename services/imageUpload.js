const s3 = require("../config/s3.config");

exports.s3FileUpload = async ({ bucketName, key, body, contentType }) => {
  return await s3.upload({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
    .promise();
};

exports.deleteFile = async ({ bucketName, key }) => {
  return await s3
    .deleteObject({
      Bucket: bucketName,
      Key: key,
    })
    .promise();
};
