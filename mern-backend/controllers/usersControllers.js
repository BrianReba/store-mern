const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

//@desc get all users >> @route GET /users >> @access Private
// fetching all users from the database, excluding their password information, and storing these user records as plain JavaScript objects for further processing
const getAllUsers = asyncHandler(async (req, res) => {
	const users = await User.find().select('-password').lean()
	if (!users?.length) {
		return res.status(400).json({ message: 'No users found' })
	}
	res.json(users)
	
})

//@desc create new users >> @route POST /users >> @access Private
const createNewUser = asyncHandler(async (req, res) => {
	const { username, password, roles } = req.body

	// Data validation
	if (!username || !password || !Array.isArray(roles) || !roles.length) {
		return res.status(400).json({ message: 'All fields are required' })
	}

	const duplicate = await User.findOne({ username }).lean().exec()

	if (duplicate) {
		return res.status(409).json({ message: 'Duplicate username' })
	}

	//Hash password
	const hashedPwd = await bcrypt.hash(password, 10)

	const userObject = { username, "password": hashedPwd, roles }

	// Create and store new user

	const user = await User.create(userObject)

	if (user) {
		res.status(201).json({ message: `New user ${username} created`})
	} else {
		res.status(400).json({ message: 'Invalid user data received' })
	}

})

//@desc update user >> @route PATCH /users >> @access Private
const updateUser = asyncHandler(async (req, res) => {
	const { id, username, roles, active, password } = req.body

	// Validation data
	if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
		return res.status(400).json({ message: 'All fields are required' })
	}

	const user = await User.findById(id).exec()

	if (!user) {
		return res.status(400).json({ message: 'User not found '})
	}

	const duplicate = await User.findOne({ username }).lean().exec()
	//Allow updates to the original user // if didnt allow an update it would also catch the current user we working, we need to avoid this.
	if (duplicate && duplicate?._id.toString() !== id) {
		return res.status(409).json({ message: 'Duplicate username '})
	}

	user.username = username
	user.roles = roles
	user.active = active

	if (password) {
		// Hash password
		user.password = await bcrypt.hash(password, 10)
	}

	const updatedUser = await user.save()

	res.json({ message: `${updatedUser.username} updated` })
})

//@desc delete users >> @route DELETE /users >> @access Private
const deleteUser = asyncHandler(async (req, res) => {
	const { id } = req.body

	if (!id) {
		return res.status(400).json({ message: 'User ID required' })
	}

	const note = await Note.findOne({ user: id }).lean().exec()
	if (note) {
		return res.status(400).json({ message: 'User has assigned notes' })
	}

	const user = await User.findById(id).exec()

	if (!user) {
		return res.status(400).json({ message: 'User not found' })
	}

	const result = await user.deleteOne()

	const reply = `Username ${result.username} with ID ${result.id} deleted`

	res.json(reply)
})

module.exports = {
	getAllUsers,
	createNewUser,
	updateUser,
	deleteUser
}