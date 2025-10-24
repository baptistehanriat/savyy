import { ArrowLeftRight, HomeIcon, Tags } from "lucide-react"
import { SidebarGroup } from "~/components/primitives/sidebar"
import { PrettyNavLink } from "./pretty-nav-link"

export function Nav() {
  return (
    <SidebarGroup>
      <PrettyNavLink to="/">
        <HomeIcon />
        Dashboard
      </PrettyNavLink>
      <PrettyNavLink to="/transactions">
        <ArrowLeftRight />
        Transactions
      </PrettyNavLink>
      <PrettyNavLink to="/labels">
        <Tags />
        Labels
      </PrettyNavLink>
    </SidebarGroup>
  )
}
