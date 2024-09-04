from flask_security import SQLAlchemySessionUserDatastore
from models import db
from flask_security.utils import hash_password

def create(user_datastore:SQLAlchemySessionUserDatastore):
    # ROLES CREATION
    user_datastore.find_or_create_role(name='admin', description='Administrator')
    user_datastore.find_or_create_role(name='sponsor', description='Sponsor')    
    user_datastore.find_or_create_role(name='influencer', description='Influencer')

    # USERS CREATION
    if not user_datastore.find_user(username="admin"):
        user_datastore.create_user(username="admin", email="admin@spin.com", password = hash_password("admin_password"), roles=['admin'])
    if not user_datastore.find_user(username="sponsor"):
        user_datastore.create_user(username="sponsor", email="sponsor@spin.com", password = hash_password("sponsor_password"), roles=['sponsor'])
    if not user_datastore.find_user(username="influencer"):
        user_datastore.create_user(username="influencer", email="influencer@spin.com", password = hash_password("influencer_password"), roles=['influencer'])
     
    db.session.commit()