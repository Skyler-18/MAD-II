from flask import Flask
from flask_wtf import CSRFProtect
from models import User, Role, db, security, cache
from api import resources_api
from routes import create_routes
from initial_data import create
from celery_app import celery_init_app
from config import Config
import flask_excel
from tasks import daily_reminder, monthly_reminder
from celery.schedules import crontab

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)  # Load configuration from config.py

    csrf = CSRFProtect(app)
    cache.init_app(app)
    db.init_app(app)

    with app.app_context():
        from flask_security import SQLAlchemyUserDatastore

        user_datastore = SQLAlchemyUserDatastore(db, User, Role)
        security.init_app(app, user_datastore)
        
        db.create_all()
        create(user_datastore)
        create_routes(app, user_datastore, cache)
        resources_api.api.init_app(app)

    return app

app = create_app()
celery_app = celery_init_app(app)
flask_excel.init_excel(app)


@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # sender.add_periodic_task(10.0, daily_reminder.s(), name='add every 10')

    sender.add_periodic_task(
        crontab(hour=20, minute=0),
        daily_reminder.s(),
    ) 

    sender.add_periodic_task(
        crontab(hour=10, minute=0, day_of_month=1),
        monthly_reminder.s(),
    ) 


if __name__ == "__main__":
    app.run(debug=True)