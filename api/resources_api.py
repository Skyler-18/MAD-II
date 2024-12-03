from datetime import datetime, timezone
from flask import request, jsonify
import json
from flask_restful import Resource, Api, fields, marshal, reqparse, marshal_with
from flask_security import auth_required
from models import Requests, db, Campaign, AdRequest, User, FlaggedCampaign, cache
from sqlalchemy.orm import joinedload

api = Api(prefix='/api')

# parser = reqparse.RequestParser()

campaign_parser = reqparse.RequestParser()
campaign_parser.add_argument('name', type=str, required=True)
campaign_parser.add_argument('description', type=str)
campaign_parser.add_argument('start_date', type=str, required=True)
campaign_parser.add_argument('end_date', type=str, required=True)
campaign_parser.add_argument('budget', type=float, required=True)
campaign_parser.add_argument('visibility', type=str, default='public')
campaign_parser.add_argument('sponsor_id', type=int, required=True)
campaign_parser.add_argument('goals', type=str)

ad_request_parser = reqparse.RequestParser()
ad_request_parser.add_argument('campaign_id', type=int, required=True)
ad_request_parser.add_argument('message', type=str)
ad_request_parser.add_argument('requirements', type=str, required=True)
ad_request_parser.add_argument('payment_amount', type=float, required=True)

requests_parser = reqparse.RequestParser()
requests_parser.add_argument('ad_id', type=int, required=True)
requests_parser.add_argument('influencer_id', type=int, required=True)
requests_parser.add_argument('created_at', type=str, required=False)
requests_parser.add_argument('negotiated_amount', type=float, required=False)
requests_parser.add_argument('status', type=str, default='Pending')

ad_request_fields = {
    'id': fields.Integer,
    'campaign_id': fields.Integer,
    'message': fields.String,
    'requirements': fields.String,
    'payment_amount': fields.Float,
    'sponsor': fields.String(attribute='campaign.sponsor.name')
}

class AdRequestsCount(fields.Raw):
    def format(self, value):
        return value.count()

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
    'ad_requests': fields.List(fields.Nested(ad_request_fields)),
    'ad_request_count': AdRequestsCount(attribute='ad_requests')
}

# detailed_ad_request_fields = {
#     **ad_request_fields,
#     'campaign': {
#         **campaign_fields,
#     }
# }

requests_fields = {
    'id': fields.Integer,
    'ad_id': fields.Integer,
    'influencer_id': fields.Integer,
    'created_at': fields.String,
    'negotiated_amount': fields.Float,
    'status': fields.String
}

class RoleNameField(fields.Raw): 
    def format(self, value):
        if value:
            return value[0].name
        return None 

user_fields = { 
    'id': fields.Integer, 
    # 'username': fields.String, 
    'email': fields.String, 
    'roles': RoleNameField(attribute='roles'), # Custom field to extract role names 
    'name': fields.String, 
    # Sponsor
    'industry': fields.String, 
    'annual_revenue': fields.Float, 
    # Influencer
    'category': fields.String, 
    'niche': fields.String, 
    'followers': fields.Integer,
    'active': fields.Boolean
}

class UserResource(Resource):
    @auth_required('token', 'session')
    @marshal_with(user_fields)
    # @cache.cached(timeout=5)
    def get(self, id=None):
        if id:
            user = User.query.options(joinedload(User.roles)).filter_by(id=id).first()
            if not user:
                return {'message': 'User not found'}, 404
            return user
        
        users = User.query.options(db.joinedload(User.roles)).all()
        return users

    def put(self, id):
        user = User.query.get(id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()

        user.email = data.get('email', user.email)
        if 'password' in data and data['password']:
            user.password = data['password']
        user.name = data.get('name', user.name)

        # Sponsor fields
        if user.roles[0].name == 'sponsor':
            user.industry = data.get('industry', user.industry)
            user.annual_revenue = data.get('annual_revenue', user.annual_revenue)

        # Influencer fields
        if user.roles[0].name == 'influencer':
            user.category = data.get('category', user.category)
            user.niche = data.get('niche', user.niche)
            user.followers = data.get('followers', user.followers)

        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': 'Failed to update user'}), 500

        return {'message': 'Profile Edited'}, 200


api.add_resource(UserResource, '/users', '/users/<int:id>')


class RequestsTableResource(Resource):
    @auth_required('token', 'session')
    def get(self, id):
        user_type = request.args.get('user_type')  # Get the user type query parameter

        if user_type not in ['influencer', 'sponsor']:
            return {'message': 'Invalid user type'}, 400

        if user_type == 'influencer':
            requests = Requests.query.filter_by(influencer_id=id).all()
        else:  # user_type == 'sponsor'
            requests = Requests.query.join(AdRequest, Requests.ad_id == AdRequest.id) \
                                     .join(Campaign, AdRequest.campaign_id == Campaign.id) \
                                     .filter(Campaign.sponsor_id == id) \
                                     .all()

        detailed_requests = []
        for req in requests:
            ad = req.ad_request
            campaign = ad.campaign
            sponsor = campaign.sponsor
            influencer = req.influencer  # Assuming there's a relationship defined for influencer

            detailed_request = {
                'id': req.id,
                'ad_id': req.ad_id,
                'influencer_id': req.influencer_id,
                'negotiated_amount': req.negotiated_amount,
                'status': req.status,
                'created_at': req.created_at.isoformat() if req.created_at else None,
                'message': ad.message,
                'requirements': ad.requirements,
                'payment_amount': ad.payment_amount,
                'campaign_id': campaign.id,
                'campaign_name': campaign.name,
                'sponsor_id': campaign.sponsor_id,
            }

            if user_type == 'sponsor':
                detailed_request.update({
                    'name': influencer.name,
                    'category': influencer.category,
                    'niche': influencer.niche,
                    'followers': influencer.followers
                })
            elif user_type == 'influencer':
                detailed_request.update({
                    'name': sponsor.name,
                    # 'company_name': sponsor.company_name,
                    'industry': sponsor.industry,
                    'annual_revenue': sponsor.annual_revenue,
                })

            detailed_requests.append(detailed_request)

        return detailed_requests, 200

api.add_resource(RequestsTableResource, '/requests-table/<int:id>')





    # @auth_required('token', 'session')
    # def get(self, id):
    #     # influencer_id = request.args.get('influencer_id')

    #     # Get all requests for the influencer
    #     requests = Requests.query.filter_by(influencer_id=id).all()

    #     detailed_requests = []
    #     for req in requests:
    #         ad = AdRequest.query.get(req.ad_id)
    #         campaign = Campaign.query.get(ad.campaign_id)
    #         sponsor = User.query.get(campaign.sponsor_id)

    #         detailed_request = {
    #             'id': req.id,
    #             'ad_id': req.ad_id,
    #             'influencer_id': req.influencer_id,
    #             'status': req.status,
    #             'created_at': req.created_at.isoformat() if req.created_at else None,
    #             'message': ad.message,
    #             'requirements': ad.requirements,
    #             'payment_amount': ad.payment_amount,
    #             'campaign_id': campaign.id,
    #             'campaign_name': campaign.name,
    #             'sponsor_id': campaign.sponsor_id,
    #             'company_name': sponsor.company_name,
    #             'industry': sponsor.industry,
    #             'budget': sponsor.budget,
    #             'username': sponsor.username,
    #             'category': sponsor.category,
    #             'niche': sponsor.niche,
    #             'followers': sponsor.followers
    #         }

    #         detailed_requests.append(detailed_request)

    #     return detailed_requests, 200




def request_to_dict(req): 
    return { 
        'id': req.id, 
        'ad_id': req.ad_id, 
        'influencer_id': req.influencer_id, 
        'status': req.status, # Add other necessary fields here 
        }

class RequestsResource(Resource):
    @auth_required('token', 'session')
    def get(self, id=None):
        ad_id = request.args.get('ad_id')
        influencer_id = request.args.get('influencer_id')
        ad_ids = request.args.getlist('ad_ids')  # For multiple ad_ids
        influencer_ids = request.args.getlist('influencer_ids')  # For multiple influencer_ids

        print(f"ad_id: {ad_id}, influencer_id: {influencer_id}, ad_ids: {ad_ids}, influencer_ids: {influencer_ids}")

        if id:
            requests = Requests.query.filter_by(ad_id=id).all()
            if not request:
                return {'message': 'Request not found'}, 404
            # return requests
            return [request_to_dict(req) for req in requests], 200

        # Case 1: Batch fetch for single ad_id and multiple influencers (SearchInfluencers Page)
        if ad_id and influencer_ids:
            requests = Requests.query.filter(
                Requests.ad_id == ad_id, 
                Requests.influencer_id.in_(influencer_ids)
            ).all()

            results = {
                req.influencer_id: req.status for req in requests
            }
            return results, 200

        # Case 2: Batch fetch for single influencer_id and multiple ad_ids (AdRequests Page)
        if influencer_id and ad_ids:
            requests = Requests.query.filter(
                Requests.influencer_id == influencer_id,
                Requests.ad_id.in_(ad_ids)
            ).all()

            results = {
                req.ad_id: req.status for req in requests
            }
            return results, 200

        # Fallback: Fetch all requests (default behavior)
        requests = Requests.query.all()
        return [marshal(req, requests_fields) for req in requests], 200
    
        # requests = Requests.query.all()
        # return requests
    
    # @marshal_with(requests_fields)
    # def get(self, id=None):
    #     ad_id = request.args['ad_id']
    #     influencer_id = request.args['influencer_id']

    #     if id:
    #         requests = Requests.query.filter_by(ad_id=id).all()
    #         if not request:
    #             return {'message': 'Request not found'}, 404
    #         return requests
    #     requests = Requests.query.all()
    #     return requests
    

    
    @auth_required('token', 'session')
    def post(self):
        args = requests_parser.parse_args()
        # print(datetime.now())
        # print("Received POST request with data:", args)

        # try: 
        #     created_at = datetime.strptime(args['created_at'], '%Y-%m-%dT%H:%M:%S.%fZ') 
        # except ValueError: 
        #     created_at = datetime.strptime(args['created_at'], '%Y-%m-%dT%H:%M:%S.%f')

        request = Requests(
            ad_id=args['ad_id'],
            influencer_id=args['influencer_id'],
            created_at=datetime.now(),
            status=args['status']
        )

        try:
            db.session.add(request)
            db.session.commit()
            print("everything is fine here")
            return {'message': 'Request sent'}, 200
        except Exception as e: 
            db.session.rollback() 
            return {'message': str(e)}, 400

    @auth_required('token', 'session')
    def put(self, id):
        args = requests_parser.parse_args()
        print(args)

        # try:
        #     created_at = datetime.strptime(args['created_at'], '%Y-%m-%dT%H:%M:%S.%fZ')
        # except ValueError:
        #     try:
        #         created_at = datetime.strptime(args['created_at'], '%Y-%m-%dT%H:%M:%S.%f')
        #     except ValueError:
        #         created_at = datetime.strptime(args['created_at'], '%Y-%m-%d %H:%M:%S.%f')
        # if args['created_at']:
        #     date_formats = [ 
        #         '%Y-%m-%dT%H:%M:%S.%fZ', 
        #         '%Y-%m-%dT%H:%M:%S.%f', 
        #         '%Y-%m-%d %H:%M:%S.%f', 
        #         '%Y-%m-%dT%H:%M:%S', 
        #         '%Y-%m-%d %H:%M:%S', 
        #         ] 
        #     created_at = None 
        #     for date_format in date_formats: 
        #         try: 
        #             created_at = datetime.strptime(args['created_at'], date_format) 
        #             break 
        #         except ValueError: 
        #             continue 
                
            # if created_at is None: 
            #     return {'message': 'Invalid date format'}, 400
            
            # created_at = created_at.replace(tzinfo=timezone.utc)

        created_at = datetime.now()
        new_status = args['status']
        request = Requests.query.get(id)
        if not request:
            return {'message': 'Request not found'}, 404
        
        request.ad_id = args['ad_id']
        request.influencer_id = args['influencer_id']
        request.created_at = created_at
        # if args['created_at']:
        #     request.created_at = created_at
        # else:
        #     request.created_at = datetime.now()

        if args['negotiated_amount']:
            request.negotiated_amount = args['negotiated_amount']

        try:
            if new_status == "Accepted":
                requests = Requests.query.filter_by(ad_id = request.ad_id).all()
                for req in requests:
                    req.status = "Rejected"
                request.status = "Accepted"
            else:
                request.status = new_status
            db.session.commit()
            return {'message': 'Request status updated'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 400
    

api.add_resource(RequestsResource, '/requests', '/requests/<int:id>')

class CheckRequest(Resource):
    @auth_required('token', 'session')
    def get(self):
        ad_id = request.args.get('ad_id')
        # influencer_id = request.args.get('influencer_id')

        # Check if `ad_id` is missing
        if not ad_id:
            return {'message': 'ad_id is required'}, 400

        # Case 1: Both `ad_id` and `influencer_id` are provided
        # if influencer_id:
        #     existing_request = Requests.query.filter_by(ad_id=ad_id, influencer_id=influencer_id).order_by(Requests.id.desc()).first()
        #     if existing_request:
        #         # Return status if request exists
        #         if existing_request.status in ['Pending_I', 'Pending_S', 'Accepted_I', 'Accepted_S', 'Negotiation']:
        #             return {'exists': True, 'status': existing_request.status}, 200
        #         else:  # Status is 'Rejected'
        #             return {'exists': False}, 200
        #     else:
        #         return {'exists': False}, 200

        # Case 2: Only `ad_id` is provided
        # else:
        existing_requests = Requests.query.filter_by(ad_id=ad_id).all()
        # Check if any accepted request exists
        for req in existing_requests:
            if req.status in ['Accepted_I', 'Accepted_S']:
                return {'exists': True}, 200

        # No accepted requests found
        return {'exists': False}, 200


# Add the resource to the API
api.add_resource(CheckRequest, '/check-request')


class MyCampaigns(Resource):
    @auth_required('token', 'session')
    @marshal_with(campaign_fields)
    def get(self, id):
        if not id:
            return {'message': 'No Id provided'}, 404
        
        campaigns = Campaign.query.filter_by(sponsor_id=id).all()
        return campaigns
    

api.add_resource(MyCampaigns, '/my-campaigns/<int:id>')


class FlagCampaign(Resource):
    @auth_required('token', 'session')
    def post(self, id):
        campaign = Campaign.query.get(id)
        if not campaign:
            return {'message': 'Campaign not found'}, 404

        data = request.get_json()
        reason = data.get('reason')
        if not reason:
            return {'message': 'Reason is required'}, 400

        flagged_campaign = FlaggedCampaign(campaign_id=id, reason=reason)
        db.session.add(flagged_campaign)
        db.session.commit()

        return {'message': 'Campaign flagged successfully'}, 200

    def delete(self, id):
        campaign = Campaign.query.get(id)
        if not campaign:
            return {'message': 'Campaign not found'}, 404

        flag = FlaggedCampaign.query.filter_by(campaign_id=id).first()
        if not flag:
            return {'message': 'Campaign not found'}, 404

        db.session.delete(flag)
        db.session.commit()
        return {'message': 'Flag Removed'}, 200

api.add_resource(FlagCampaign, '/flag-campaign/<int:id>')


class CheckFlag(Resource):
    @auth_required('token', 'session')
    def get(self, id):
        if not id:
            return {'message': 'Provide Campaign ID'}, 404

        is_flagged = FlaggedCampaign.query.filter_by(campaign_id=id).first()
        if is_flagged is None:
            return {'exists': False}, 200
        else:
            return {'exists': True, 'reason': is_flagged.reason}, 200
        # return jsonify(is_flagged is not None), 200

api.add_resource(CheckFlag, '/check-flag/<int:id>')


class UnapprovedSponsors(Resource):
    @auth_required('token', 'session')
    def get(self):
        users = User.query.all()

        unapproved_sponsors = [sponsor for sponsor in users if not sponsor.active and any(role.name=='sponsor' for role in sponsor.roles)]
        results = [
            {
                'id': sponsor.id,
                'email': sponsor.email,
            }
            for sponsor in unapproved_sponsors
        ]

        return jsonify(results)

api.add_resource(UnapprovedSponsors, '/unapproved-sponsors')


class CampaignResource(Resource):
    @auth_required('token', 'session')
    # @cache.cached(timeout=120)
    def get(self, id=None):
        try:
            # args = parser.parse_args()
            include_details = request.args['include_details']

            if id:
                campaign = Campaign.query.options(joinedload(Campaign.sponsor)).filter_by(id=id).first()
                if not campaign:
                    return {'message': 'Campaign not found'}, 404
                
                campaign_data = marshal(campaign, campaign_fields)
                campaign_data['ad_request_count'] = campaign.ad_requests.count()

                if include_details:
                    sponsor = User.query.filter_by(id=campaign.sponsor_id).first()
                    sponsor_details = {
                        # 'company_name': sponsor.company_name,
                        'company_name': sponsor.name,
                        'industry': sponsor.industry,
                        'annual_revenue': sponsor.annual_revenue
                    }
                    campaign_data['sponsor_details'] = sponsor_details
                return campaign_data, 200
            
            campaigns = Campaign.query.options(joinedload(Campaign.sponsor)).all()
            detailed_campaigns = []
            for campaign in campaigns:
                campaign_data = marshal(campaign, campaign_fields)
                campaign_data['ad_request_count'] = campaign.ad_requests.count()

                if include_details:
                    sponsor = User.query.filter_by(id=campaign.sponsor_id).first()
                    sponsor_details = {
                        'company_name': sponsor.name,
                        'industry': sponsor.industry,
                        'annual_revenue': sponsor.annual_revenue
                    }
                    campaign_data['sponsor_details'] = sponsor_details
                detailed_campaigns.append(campaign_data)
            # print(json.dumps(detailed_campaigns))
            return detailed_campaigns, 200
    
        except Exception as e: 
            print(f"Error in CampaignResource: {e}") 
            return {'message': str(e)}, 500


    # @marshal_with(campaign_fields)
    # def get(self, id=None):
    #     if id:
    #         campaign = Campaign.query.get(id)
    #         if not campaign:
    #             return {'message': 'Campaign not found'}, 404
    #         return campaign
    #     else:
    #         campaigns = Campaign.query.all()
    #         # print(type(campaigns))
    #         return campaigns
    
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
    # @cache.cached(timeout=120)
    def get(self, id=None):
        if id:
            # print("I get this", id)
            ad_request = AdRequest.query.get(id)
            if not ad_request:
                return {'message': 'Ad Request not found'}, 404
            return ad_request
        else:
            ad_requests = AdRequest.query.all()
            # print(type(campaigns))
            # for ad_request in ad_requests:
            #     ad_request.sponsor = ad_request.campaign.sponsor
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
        
        # if args['influencer_id']:
        #     ad_request.influencer_id = args['influencer_id']

        # ad_request.status = args['status']
        ad_request.message = args['message']
        ad_request.requirements = args['requirements']
        ad_request.payment_amount = args['payment_amount']

        db.session.commit()
        return {'message': 'Ad Request updated'}, 200
        

api.add_resource(AdRequestResource, '/ad-requests', '/ad-requests/<int:id>')