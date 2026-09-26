// Vercel function: the whole GraphQL API. The client is served as static
// files from client/dist; vercel.json rewrites /graphql here.
const { ready } = require('../server/app')

module.exports = async (req, res) => {
	const app = await ready
	return app(req, res)
}
