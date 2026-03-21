import { createBrowserRouter } from "react-router"
import App from "../pages/App"
import Layout from "../Layout"
import EventPageDetails from "../components/EventPageDetails"
import Home from "../pages/Home"
import SignUp from "../components/SignUp"
import SignIn from "../components/SignIn"
import Profile from "../components/Profile"
import AllEvents from "../components/AllEvents"

let router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        path: "/",
        Component: App,
      },
      {
        path: "/signup",
        Component: SignUp,
      },
      {
        path: "/signin",
        Component: SignIn,
      },
      {
        path: "/home",
        Component: Home,
      },
      {
        path: "/profile",
        Component: Profile,
      },
      { path: "/events/:category",
        Component: AllEvents,
      },
      {
        path: "EventPageDetails/:id",
        Component: EventPageDetails,
      },
    ],
  }
])

export default router