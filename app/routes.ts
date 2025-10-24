import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes"

export default [
  layout("./pages/authenticated/layout.tsx", [
    index("./pages/authenticated/dashboard.tsx"),
    route("transactions", "./pages/authenticated/transactions.tsx"),
    route("labels", "./pages/authenticated/labels.tsx"),
    route("settings", "./pages/authenticated/settings.tsx"),
  ]),
  route("login", "./pages/login.tsx"),
] satisfies RouteConfig
