import { type RouteConfig, index, layout, route } from "@react-router/dev/routes"

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("transactions", "routes/transactions.tsx"),
    route("labels", "routes/labels.tsx"),
    route("settings", "routes/settings.tsx"),
  ]),
  route("login", "routes/login.tsx"),
  route("auth/callback", "routes/auth.callback.tsx"),
] satisfies RouteConfig
