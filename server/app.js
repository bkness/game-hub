require('dotenv').config()
const express = require('express')
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const { authMiddleware } = require('./utils/auth')
const { typeDefs, resolvers } = require('./schemas')
const db = require('./config/connection')
const cors = require('cors')
const { rateLimit } = require('express-rate-limit')

const app = express()
// Behind Vercel's (and Render's) proxy: without this, req.ip is the proxy's
// address and every visitor shares one rate-limit bucket.
app.set('trust proxy', 1)
const server = new ApolloServer({
	typeDefs,
	resolvers,
})

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
})

const logger = (req, res, next) => {
	console.log(`${req.method} request to ${req.url}`)
	next()
}

// Apollo must finish start() before its middleware can be mounted, so the
// app is only usable once `ready` resolves. server.js awaits it before
// listening; the Vercel function (api/graphql.js) awaits it per request.
const ready = server.start().then(() => {
	app.use(express.urlencoded({ extended: true }))
	app.use(express.json())
	app.use(cors())
	app.use(limiter)
	app.use(logger)
	// /api/graphql is where Vercel routes the rewritten /graphql request
	app.use(
		['/graphql', '/api/graphql'],
		expressMiddleware(server, {
			context: authMiddleware,
		})
	)
	return app
})

module.exports = { app, ready, db }
