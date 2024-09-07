from flask_security import SQLAlchemySessionUserDatastore
from models import db
from flask_security.utils import hash_password

def create(user_datastore:SQLAlchemySessionUserDatastore):
    # ROLES CREATION
    admin_role = user_datastore.find_or_create_role(name='admin', description='Administrator')
    sponsor_role = user_datastore.find_or_create_role(name='sponsor', description='Sponsor')    
    influencer_role = user_datastore.find_or_create_role(name='influencer', description='Influencer')

    # USERS CREATION
    if not user_datastore.find_user(username="admin"):
        admin = user_datastore.create_user(username="admin", email="admin@spin.com", password = hash_password("admin"))
        user_datastore.add_role_to_user(admin, admin_role)

    if not user_datastore.find_user(username="sponsor"):
        sponsor = user_datastore.create_user(username="sponsor", email="sponsor@spin.com", password = hash_password("sponsor"))
        user_datastore.add_role_to_user(sponsor, sponsor_role)

    if not user_datastore.find_user(username="influencer"):
        influencer = user_datastore.create_user(username="influencer", email="influencer@spin.com", password = hash_password("influencer"))
        user_datastore.add_role_to_user(influencer, influencer_role)
     
    db.session.commit()