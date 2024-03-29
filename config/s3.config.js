const aws = require("aws-sdk");
const config = require("./index.js");

const s3 = new aws.S3({
  accessKeyId: config.S3_ACCESS_KEY,
  secretAccessKey: config.S3_SECRET_ACCESS_KEY,
  region: config.S3_REGION,
});

module.exports = s3;
