const express = require('express')
const router = express.Router()
const path = require('path')
// ^ =at the beggining of the string only, $= at the end of the string only
router.get('^/$|/index(.html)?', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
})

module.exports = router