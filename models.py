# from app import app
from flask_sqlalchemy import SQLAlchemy
from flask_security import Security, UserMixin, RoleMixin
from flask_security.models import fsqla_v3

db = SQLAlchemy()
security = Security()

fsqla_v3.FsModels.set_db_info(db)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True)
    email = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)
    active = db.Column(db.Boolean, default=True)
    fs_uniquifier = db.Column(db.String(), nullable=False)
    roles = db.relationship('Role', secondary='user_roles')
    # Sponsore Details
    company_name = db.Column(db.String(100), nullable=True) 
    # want to check if company name should be unique
    industry = db.Column(db.String(100), nullable=True)
    budget = db.Column(db.Float, nullable=True)
    # Influencer Details
    category = db.Column(db.String(100), nullable=True)
    niche = db.Column(db.String(100), nullable=True)
    followers = db.Column(db.Integer, nullable=True)
    # Relationships to capmaigns and ad requests
    campaigns = db.relationship('Campaign', backref='sponsor', lazy=True)
    ad_requests = db.relationship('AdRequest', backref='influencer', lazy=True)

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(16), unique=True, nullable=False)
    description = db.Column(db.String)

class UserRoles(db.Model):
    user_roles_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

class Campaign(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    budget = db.Column(db.Float, nullable=False)
    visibility = db.Column(db.String(50), default='public')
    sponsor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    goals = db.Column(db.Text, nullable=True)

    ad_requests = db.Relationship('AdRequest', backref='campaign', lazy=True)

class AdRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaign.id'))
    influencer_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    message = db.Column(db.Text, nullable=True)
    requirements = db.Column(db.Text, nullable=False)
    payment_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='Pending')

class FlaggedContent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content_type = db.Column(db.String(50))
    content_id = db.Column(db.Integer)
    reason = db.Column(db.Text)