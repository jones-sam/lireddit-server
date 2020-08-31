import { __prod__ } from "./constants"
import { Post } from "./entities/Post"
import { MikroORM } from "@mikro-orm/core"
import path from "path"
import { User } from "./entities/User"

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  dbName: "lireddit",
  user: "postgres",
  password: "admin",
  debug: !__prod__,
  type: "postgresql",
  entities: [Post, User],
} as Parameters<typeof MikroORM.init>[0]
