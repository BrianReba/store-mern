const express = require('express')
const router = express.Router()
const usersControllers = require('../controllers/usersControllers')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
	.get(usersControllers.getAllUsers)
	.post(usersControllers.createNewUser)
	.patch(usersControllers.updateUser)
	.delete(usersControllers.deleteUser)

module.exports = router
