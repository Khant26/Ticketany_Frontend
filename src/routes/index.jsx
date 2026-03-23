import { createBrowserRouter } from "react-router"
import { lazy, Suspense } from "react"
import Layout from "../Layout"
import App from "../pages/App"

// Lazy load components for code splitting
const Home = lazy(() => import("../pages/Home"))
const SignUp = lazy(() => import("../components/SignUp"))
const SignIn = lazy(() => import("../components/SignIn"))
const Profile = lazy(() => import("../components/Profile"))
const AllEvents = lazy(() => import("../components/AllEvents"))
const EventPageDetails = lazy(() => import("../components/EventPageDetails"))
const ErrorPage = lazy(() => import("../components/errorpage"))

// Loading fallback component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
)

// Wrapper component to provide Suspense boundary
const withSuspense = (Component) => (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component {...props} />
  </Suspense>
)

let router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        Component: App,
      },
      {
        path: "/signup",
        Component: withSuspense(SignUp),
      },
      {
        path: "/signin",
        Component: withSuspense(SignIn),
      },
      {
        path: "/home",
        Component: withSuspense(Home),
      },
      {
        path: "/profile",
        Component: withSuspense(Profile),
      },
      {
        path: "/events/:category",
        Component: withSuspense(AllEvents),
      },
      {
        path: "EventPageDetails/:id",
        Component: withSuspense(EventPageDetails),
      },
      {
        path: "*",
        Component: withSuspense(ErrorPage),
      },
    ],
  }
])

export default router

export default router