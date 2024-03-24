// create a react component using react with redux, that displays list of studies stored in the state
// study is of type Study that have {id: string, name: string}
// studies should be displayed in a table like format. use mui/material-ui if needed
// table row should have id, name, when clicked will go to /studies/{id} page

import { CircularProgress } from "@mui/material"
import { useListQuery } from "../studiesApiSlice"
import { useParams } from "react-router-dom"
import DicomViewer from "../../widgets/dicom-viewer/DicomViewer"
import { environment } from "../../../environment/environment"
import { type KeyboardEvent, useState } from "react"

export const StudyDetailsPage = () => {
  const { data, isLoading } = useListQuery()
  const { id: studyID } = useParams<{ id: string }>()
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0)

  const studies = data?.studies || []
  const study = studies.filter(s => s.id === studyID)[0]

  if (isLoading) {
    return <CircularProgress />
  }

  if (!study) {
    return <div> study not found !</div>
  }

  const imagesCount = study.series[0].images.length

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const { key } = event

    if (key === "ArrowRight" && currentImageIndex < imagesCount - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    } else if (key === "ArrowLeft" && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  // TODO: support series selection with a dropdown menu.
  const imageRelUrl = study.series[0].images[currentImageIndex].relative_url
  const imageUrl = `${environment.apiUrl}/${imageRelUrl}`
  return (
    <div tabIndex={0} onKeyDown={handleKeyDown} className="DicomViewerWrapper">
      <DicomViewer dcm_url={imageUrl} />
    </div>
  )
}
