import { connectDatabase } from "./src/db.js";
import express from "express";

const app = express()
const port = process.env.PORT || 5000

connectDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log("App is working")
        })
    })
    .catch((error) => {
        console.log("Error: ", error)
    })