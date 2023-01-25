const mongoose = require("mongoose");
const app = require("./app.js");
const config = require("./config/index");

//create a fn
// run a fn
// (async () => {})()

(async () => {
  try {
    await mongoose.connect(config.MONGODB_URL);
    console.log("DB CONNECTED");

    app.on("error", (err) => {
      console.log("ERROR: ", err);
      throw err;
    });

    const onListening = () => {
      console.log(`Listening on ${config.PORT}`);
    };

    app.listen(config.PORT, onListening);
  } catch (err) {
    console.log("ERROR ", err);
    throw err;
  }
})();
