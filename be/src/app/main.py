from flask import Flask
from flask_cors import CORS

from .studies.studies import studies_bp

app = Flask('app', "/dicom-viewer")
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

app.register_blueprint(studies_bp, url_prefix='/api/studies')
