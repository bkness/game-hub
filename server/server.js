const express = require('express')
const path = require('path')
const { app, ready, db } = require('./app')

const PORT = process.env.PORT || 3001

ready.then(() => {
	// if we're in production, serve client/dist as static assets
	if (process.env.NODE_ENV === 'production') {
		app.use(express.static(path.join(__dirname, '../client/dist')))

		app.get('*', (req, res) => {
			res.sendFile(path.join(__dirname, '../client/dist/index.html'))
		})
	}

	db.once('open', () => {
		app.listen(PORT, () => {
			console.log(`API server running on port ${PORT}!`)
			console.log(`Use GraphQL at http://localhost:${PORT}/graphql`)
		})
	})
})
