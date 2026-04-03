import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("transactions", "routes/transactions.tsx"),
    route("labels", "routes/labels.tsx"),
  ]),
  route("todos", "routes/todos.tsx"),
] satisfies RouteConfig;
