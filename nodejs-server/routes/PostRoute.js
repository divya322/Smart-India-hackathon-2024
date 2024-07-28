const express = require("express");
const router = express.Router();

const PostController = require("../controller/PostController");

router.get('/video', PostController.video);

module.exports = router;