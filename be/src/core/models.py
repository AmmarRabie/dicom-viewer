import dataclasses
from enum import Enum


@dataclasses.dataclass
class Study:
    id: str


class DicomTags(Enum):
    StudyDate = "StudyDate"
    SeriesDate = "SeriesDate"
    StudyTime = "StudyTime"
    SeriesTime = "SeriesTime"
    PatientID = "PatientID"
    PatientSex = "PatientSex"
    StudyInstanceUID = "StudyInstanceUID"
    SeriesInstanceUID = "SeriesInstanceUID"
    SOPInstanceUID = "SOPInstanceUID"
