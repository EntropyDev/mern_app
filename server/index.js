import express from "express"
import bodyParder from "body-parser"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import helmet from "helmet"
import morgan from "morgan"
import multer from "multer"
import path from "path"
import {fileURLToPath} from "url"
import { ppid } from "process"
import authRoutes from "./routes/auth.js"
import {register} from "./controllers/auth.js"

// Configurations
const __filename = fileURLToPath(import.meta.url) //Wrap the file url. we can use directory name when using type modules
const __dirname = path.dirname(__filename)

dotenv.config()
const app = express()
app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))
app.use(morgan("common"))
app.use(bodyParder.json({ limit: "30mb", extended: true }))
app.use(bodyParder.urlencoded({ limit: "30mb", extended: true }))
app.use(cors())
app.use("/assets", express.static(path.join(__dirname, "public/assets")))

// File Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/assets")
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
})
const upload = multer( {storage} ) 

// Routes with file
app.post("/auth/register", upload.single("picture"), register)

// Routes
app.use("/auth", authRoutes)

// Mongoose setup
const PORT = process.env.PORT || 6001
mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`))
})
.catch((error) => console.log(`${error} did not connect`))
