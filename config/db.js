const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
exports.connectDB = () => {
  mongoose
    .connect("mongodb+srv://ami949:Udy5uDvKv6NfaEaZ@cluster0.deyjolf.mongodb.net/", {
      dbName: "Go4Food",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    .then(() => {
      console.log("mongodb connected");
    })
    .catch((err) => console.log(err.message));

  mongoose.connection.on("connected", () => {
    console.log("Mongoose Connected to db");
  });
};
