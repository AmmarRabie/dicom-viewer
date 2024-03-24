export interface Image {
  id: string
  relative_url: string
}

export interface Series {
  PatientID: string
  PatientSex: string
  SeriesDate: string
  SeriesTime: string
  StudyDate: string
  StudyTime: string
  id: string
  images: Image[]
}

export interface Study {
  id: string
  series: Series[]
}
