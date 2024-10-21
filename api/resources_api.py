from datetime import datetime
from flask import request
from flask_restful import Resource, Api, fields, reqparse, marshal_with
from flask_security import auth_required
from models import db, Campaign, AdRequest, User

api = Api(prefix='/api')

# parser = reqparse.RequestParser()

campaign_parser = reqparse.RequestParser()
campaign_parser.add_argument('name', type=str, required=True, help="Campaign Name is required")
campaign_parser.add_argument('description', type=str)
campaign_parser.add_argument('start_date', type=str, required=True)
campaign_parser.add_argument('end_date', type=str, required=True)
campaign_parser.add_argument('budget', type=float, required=True)
campaign_parser.add_argument('visibility', type=str, default='public')
campaign_parser.add_argument('sponsor_id', type=int, required=True)
campaign_parser.add_argument('goals', type=str)

ad_request_parser = reqparse.RequestParser()
ad_request_parser.add_argument('campaign_id', type=int, required=True)
ad_request_parser.add_argument('influencer_id', type=int, required=False)
ad_request_parser.add_argument('message', type=str)
ad_request_parser.add_argument('requirements', type=str, required=True)
ad_request_parser.add_argument('payment_amount', type=float, required=True)
ad_request_parser.add_argument('status', type=str, default='Pending')

ad_request_fields = {
    'id': fields.Integer,
    'campaign_id': fields.Integer,
    'influencer_id': fields.Integer,
    'message': fields.String,
    'requirements': fields.String,
    'payment_amount': fields.Float,
    'status': fields.String
}

campaign_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'start_date': fields.String,
    'end_date': fields.String,
    'budget': fields.Float,
    'visibility': fields.String,
    'sponsor_id': fields.Integer,
    'goals': fields.String,
    'ad_requests': fields.List(fields.Nested(ad_request_fields))
}

class CampaignResource(Resource):
    @auth_required('token', 'session')
    @marshal_with(campaign_fields)
    def get(self, id=None):
        if id:
            campaign = Campaign.query.get(id)
            if not campaign:
                return {'message': 'Campaign not found'}, 404
            return campaign
        else:
            campaigns = Campaign.query.all()
            # print(type(campaigns))
            return campaigns
    
    @auth_required('token', 'session')
    def post(self):
        # print("Headers received:", request.headers)
        # print("Request data:", request.get_json()) 
        # data = request.get_json()
        args = campaign_parser.parse_args()

        # print("Checkpoint0")
        start_date = datetime.strptime(args['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(args['end_date'], '%Y-%m-%d').date()
        # campaign = Campaign(**args)

        # print("Checkpoint1")
        sponsor = User.query.get(args['sponsor_id'])
        # print("Checkpoint2")
        if not sponsor:
            return {'message': 'Invalid Sponsor ID'}, 400
        
        campaign = Campaign(
            name=args['name'],
            description=args['description'],
            start_date=start_date,
            end_date=end_date,
            budget=args['budget'],
            visibility=args['visibility'],
            sponsor_id = args['sponsor_id'],
            goals=args['goals']
        )

        # print("Checkpoint3")
        db.session.add(campaign)
        db.session.commit()
        return {'message': 'Campaign created'}, 200
    
    @auth_required('token', 'session')
    def delete(self, id):
        campaign = Campaign.query.get(id)
        if not campaign:
            return {'message': 'Campaign not found'}, 404

        db.session.delete(campaign)
        db.session.commit()
        return {'message': 'Campaign deleted'}, 200
    

    @auth_required('token', 'session')
    def put(self, id):
        args = campaign_parser.parse_args()
        start_date = datetime.strptime(args['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(args['end_date'], '%Y-%m-%d').date()

        campaign = Campaign.query.get(id)
        if not campaign:
            return {'message': 'Campaign not found'}, 404

        campaign.name = args['name']
        campaign.description = args['description']
        campaign.start_date = start_date
        campaign.end_date = end_date
        campaign.budget = args['budget']
        campaign.visibility = args['visibility']
        campaign.sponsor_id = args['sponsor_id']
        campaign.goals = args['goals']

        db.session.commit()
        return {'message': 'Campaign updated'}, 200
    

# api.add_resource(CampaignResource, '/campaigns')
api.add_resource(CampaignResource, '/campaigns', '/campaigns/<int:id>')
    

class AdRequestResource(Resource):
    @auth_required('token', 'session')
    @marshal_with(ad_request_fields)
    def get(self, id:None):
        if id:
            ad_request = AdRequest.query.get(id)
            if not ad_request:
                return {'message': 'Ad Request not found'}, 404
            return ad_request
        else:
            ad_requests = AdRequest.query.all()
            # print(type(campaigns))
            return ad_requests
    
    @auth_required('token', 'session')
    def post(self):
        args = ad_request_parser.parse_args()

        campaign = Campaign.query.get(args['campaign_id'])
        if not campaign:
            return {'message': 'Invalid Campaign ID'}, 400
        
        # influencer = User.query.get(args['influencer_id'])
        # if not influencer:
        #     return {'message': 'Invalid Influencer ID'}, 400
        
        ad_request = AdRequest(**args)
        db.session.add(ad_request)
        db.session.commit()
        return {'message' : 'Ad-Request created'}, 200
    
    @auth_required('token', 'session')
    def delete(self, id):
        ad_request = AdRequest.query.get(id)
        if not ad_request:
            return {'message': 'Ad Request not found'}, 404

        db.session.delete(ad_request)
        db.session.commit()
        return {'message': 'Ad Request deleted'}, 200
    

    @auth_required('token', 'session')
    def put(self, id):
        args = ad_request_parser.parse_args()
        # start_date = datetime.strptime(args['start_date'], '%Y-%m-%d').date()
        # end_date = datetime.strptime(args['end_date'], '%Y-%m-%d').date()

        ad_request = AdRequest.query.get(id)
        if not ad_request:
            return {'message': 'Ad Request not found'}, 404

        ad_request.message = args['message']
        ad_request.requirements = args['requirements']
        ad_request.payment_amount = args['payment_amount']

        db.session.commit()
        return {'message': 'Ad Request updated'}, 200
        

api.add_resource(AdRequestResource, '/ad-requests', '/ad-requests/<int:id>')