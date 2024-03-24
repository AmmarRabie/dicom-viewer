import "./App.css"
import { UploadButton } from "./widgets/upload-btn/UploadButton"
import { environment } from "./environment/environment"
import StudiesListPage from "./features/studies/studies-list-page/StudiesListPage"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { StudyDetailsPage } from "./features/studies/studies-details-page/StudyDetailsPage"
import { CssBaseline } from "@mui/material"

const router = createBrowserRouter([
  {
    path: "/",
    element: <StudiesListPage />, // Render StudiesList for root path
  },
  {
    path: "/:id",
    element: <StudyDetailsPage />,
  },
])

const App = () => {
  return (
    <div className="App">
      <CssBaseline />

      <RouterProvider router={router} />
    </div>
  )
}

export default App
