let express = require('express')
let router = express.Router()

let categoryController = require("../app/controllers/CategoryController")


router.use('/', categoryController.index)

router.use('/hi', categoryController.index)
module.exports = router