import "reflect-metadata"
import { ApolloServer } from "apollo-server-express"
import connectRedis from "connect-redis"
import cors from "cors"
import express from "express"
import session from "express-session"
import Redis from "ioredis"
import { buildSchema } from "type-graphql"
import { COOKIE_NAME, __prod__ } from "./constants"
import { HelloResolver } from "./resolvers/hello"
import { PostResolver } from "./resolvers/post"
import { UserResolver } from "./resolvers/user"
import { createConnection } from "typeorm"
import { User } from "./entities/User"
import { Post } from "./entities/Post"

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    database: "lireddit2",
    username: "postgres",
    password: "admin",
    logging: true,
    synchronize: true,
    entities: [Post, User],
  })

  const app = express()

  const RedisStore = connectRedis(session)
  const redis = new Redis({})

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  )
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis, disableTouch: true }),
      secret: "iygiutgfcjvbvygfhcfhjc",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years,
        httpOnly: true,
        secure: __prod__, //cookie only works in https
        sameSite: "lax", //csrf
      },
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, redis }),
  })

  apolloServer.applyMiddleware({
    app,
    cors: false,
  })

  app.listen(4000, () => {})
}

main().catch((err) => console.error(err))
