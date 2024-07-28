const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const socket = require("socket.io");
const http = require('http');
const server = http.createServer(app);
const AuthRoute = require("./routes/AuthRoute");
const PostRoute = require("./routes/PostRoute");



mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/SIH", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

// mongoDB database connection error handing

db.on("error", (err) => {
  console.log(err);
});

db.once("open", () => {
  console.log("database connection done");
});

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(express.static("public"));


const PORT = process.env.PORT || 4000;

// Server listening port

app.listen(PORT, () => {
  console.log("server is running on port 3000");
});

const io = socket(server);

io.on('connection', (socket) => {
  console.log('a user connected');
  io.on('subscribeFeed',(feedId)=>{
    const FPS = 30;
    setInterval(()=>{
      io.emit('videoFrame',(image,feedId))
    },1000/FPS)  
  })
});

app.use("/api/auth", AuthRoute);
app.use("/api/post", PostRoute);

