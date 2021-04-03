// Import Schema and Model
const { Schema, model } = require("../db/connection.js")

// The Image Schema
const imageSchema = new Schema({
    url: String,
})

// The User Schema
const userSchema = new Schema({
    username: { type: String, unique: true, required: true }, 
    password: { type: String, required: true },
    images: [imageSchema]
}) 

// The User Model
const User = model("User", userSchema)

// Export the User Model
module.exports = User
