import zipfile
from pathlib import Path

from dicom_parser import Series
from flask import Blueprint, jsonify, request, send_file

from src.core.models import DicomTags

studies_bp = Blueprint("studies", __name__)


@studies_bp.route("/upload", methods=["POST"])
def studies_upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if file:
        # Save the uploaded file
        filename = file.filename

        uploads_path = Path("./uploads")
        uploads_path.mkdir(parents=True, exist_ok=True)
        zippath = Path("./uploads") / filename
        file.save(zippath.absolute())

        # Extract files from the uploaded ZIP file
        extract_path = Path(f"./data/studies")
        extract_path.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(zippath.absolute(), 'r') as zip_ref:
            zip_ref.extractall(extract_path)
        # Optionally, you can remove the uploaded ZIP file after extraction
        zippath.unlink()

        return jsonify({'success': True})


@studies_bp.route("")
def studies_list():
    """list studies information without preloading image data"""
    all_studies = []
    for study_dir_path in Path("./data/studies").glob("*"):
        print("study ", study_dir_path)
        study_id = study_dir_path.name  # default as file name if fallback because no series
        study = {"series": []}
        for series_dir_path in study_dir_path.glob("*"):
            print("series:", series_dir_path)
            # TODO: parse the folder using dicom parser
            # returns some information about the series
            try:
                series = Series(series_dir_path)
                study_id = series.get(DicomTags.StudyInstanceUID.name, default=study_id)
                series_id = series.get(DicomTags.SeriesInstanceUID.name)
                series_tags = [
                    DicomTags.StudyDate,
                    DicomTags.SeriesDate,
                    DicomTags.StudyTime,
                    DicomTags.SeriesTime,
                    DicomTags.PatientID,
                    DicomTags.PatientSex,
                ]
                images_meta = []
                for img in series.images:
                    img_id = img.header.get(DicomTags.SOPInstanceUID.name)
                    images_meta.append(
                        {"id": img_id, "relative_url": f"studies/{study_id}/series/{series_id}/images/{img_id}.dcm"})
                series_dict = {t.name: str(series.get(t.name, missing_ok=True)) for t in series_tags}
                series_dict['images'] = images_meta
                series_dict['id'] = series_id
                study["series"].append(series_dict)
            except Exception as e:
                # don't panic if one study can't be listed, skip.
                print(e)
        if len(study['series']):
            study['id'] = study_id
        all_studies.append(study)

    return jsonify({"studies": all_studies})


@studies_bp.route("/<study_id>/series/<series_id>/images/<img_id>")
def images_get(study_id: str, series_id: str, img_id: str):
    """get image by its id"""
    studies_path = Path("./data/studies")
    if series_id.find("/") != -1 or series_id.find("\\") != -1 or img_id.find("/") != -1 or img_id.find("\\") != -1:
        # safety check so that we don't expose the whole fs
        return "file not found", 404

    return send_file((studies_path / study_id / series_id / img_id).absolute(), as_attachment=True)
