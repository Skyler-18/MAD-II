from flask import Flask
from flask_wtf import CSRFProtect
from api import resources_api

app = Flask(__name__)

import config
import models
import routes

csrf = CSRFProtect(app)

with app.app_context():
    from models import User, Role, db, security
    import initial_data
    from flask_security import SQLAlchemyUserDatastore

    user_datastore = SQLAlchemyUserDatastore(db, User, Role)
    security.init_app(app, user_datastore)

    db.init_app(app)
    db.create_all()

    initial_data.create(user_datastore)
    
    routes.create_routes(app, user_datastore)
    resources_api.api.init_app(app)

if __name__ == "__main__":
    app.run(debug=True)