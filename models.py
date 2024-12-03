# from app import app
from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from flask_security import Security, UserMixin, RoleMixin
from flask_security.models import fsqla_v3
from flask_caching import Cache

db = SQLAlchemy()
security = Security()
cache = Cache()

fsqla_v3.FsModels.set_db_info(db)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    # username = db.Column(db.String, nullable=False, unique=True)
    email = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)
    active = db.Column(db.Boolean, default=False)
    fs_uniquifier = db.Column(db.String(), nullable=False)
    roles = db.relationship('Role', secondary='user_roles', lazy='joined', backref=db.backref('users', lazy='joined'))
    name = db.Column(db.String(100), nullable=True)

    # Sponsor Details
    # company_name = db.Column(db.String(100), nullable=True) 
    # want to check if company name should be unique
    industry = db.Column(db.String(100), nullable=True)
    annual_revenue = db.Column(db.Float, nullable=True)

    # Influencer Details
    category = db.Column(db.String(100), nullable=True)
    niche = db.Column(db.String(100), nullable=True)
    followers = db.Column(db.Integer, nullable=True)

    campaigns = db.relationship('Campaign', backref='sponsor', lazy=True, cascade="all, delete-orphan")
    influencer_requests = db.relationship('Requests', backref='influencer', lazy=True, cascade="all, delete-orphan")

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
    visibility = db.Column(db.String(16), default='public')
    sponsor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    goals = db.Column(db.Text, nullable=True)

    ad_requests = db.Relationship('AdRequest', back_populates='campaign', lazy='dynamic', cascade="all, delete-orphan")

class AdRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaign.id'), nullable=False)
    message = db.Column(db.Text, nullable=True)
    requirements = db.Column(db.Text, nullable=False)
    payment_amount = db.Column(db.Float, nullable=False)

    campaign = db.Relationship('Campaign', back_populates='ad_requests')
    related_requests = db.Relationship('Requests', backref='ad_request', lazy=True, cascade="all, delete-orphan")

class Requests(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ad_id = db.Column(db.Integer, db.ForeignKey('ad_request.id'), nullable=False)
    influencer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    negotiated_amount = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(50), default='Pending')

class FlaggedCampaign(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaign.id'), nullable=False)
    reason = db.Column(db.Text)

    campaign = db.relationship('Campaign', backref=db.backref('flagged', lazy=True))