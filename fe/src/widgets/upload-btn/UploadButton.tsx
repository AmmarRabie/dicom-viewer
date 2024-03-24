import { useState } from "react"
import { Button } from "@mui/material"

export interface UploadButtonProps {
  title: string
  upload_url: string
}

export const UploadButton = (props: UploadButtonProps) => {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      console.log(event)
      // TODO: set file in the state, so that we can retry if error
      setFile(event.target.files[0])
      handleUpload(event.target.files[0])
    }
  }

  const handleUpload = (file: File) => {
    if (!file) {
      return
    }

    setIsLoading(true)

    const formData = new FormData()
    formData.append("file", file)

    fetch(props.upload_url, {
      method: "POST",
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        // Handle response from the server
        console.log("Upload successful:", data)
        // TODO: update event to the outer component or to state
        // dispatch(uploadSuccess(data));
      })
      .catch(error => {
        console.error("Error uploading file:", error)
        // TODO: update event to the outer component or to state
        // dispatch(uploadFailure(error));
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <div>
      <input
        type="file"
        accept=".zip"
        onChange={handleFileChange}
        disabled={isLoading}
        style={{ display: "none" }}
        id="upload-file"
      />
      <label htmlFor="upload-file">
        <Button disabled={isLoading} variant="contained" component="span">
          {props.title}
        </Button>
      </label>
    </div>
  )
}
