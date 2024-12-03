from models import User, db, Campaign, Requests, AdRequest, FlaggedCampaign, cache
from flask import jsonify, render_template, render_template_string, request, send_file
from flask_security import auth_required, current_user, roles_required
from flask_security.utils import hash_password, verify_password
from tasks import create_csv
from datetime import datetime
from celery.result import AsyncResult


def create_routes(app, user_datastore, cache):
#     @app.route('/celerydemo')
#     def celery_demo():
#         task = add.delay(10,25)
#         # return "Celery Demo"
#         return jsonify({'task_id' : task.id})

    # @app.route('/get-task/<task_id>')
    # def get_task(task_id):
    #     result = AsyncResult(task_id)

    #     if result.ready():
    #         return jsonify({'result': result.result}), 200
    #     else:
    #         return "Task not ready", 405

    @app.route('/start-export', methods=['POST'])
    def start_export():
        sponsor_id = request.json.get('sponsor_id')
        task = create_csv.delay(sponsor_id)
        return jsonify({'task_id': task.id})

    @app.route('/get-csv/<task_id>', methods=['GET'])
    def get_csv(task_id):
        result = AsyncResult(task_id)

        if result.ready():
            return send_file('./user-downloads/file.csv')
        else:
            return "Task not ready", 405

    @app.route('/cachedemo')
    @cache.cached(timeout=15)
    def cacheDemo():
        return jsonify({"Time": datetime.datetime.now()})

    @app.route('/')
    def home():
        return render_template('index.html')
    
    @app.route('/user-login', methods=['POST'])
    def user_login():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # print(email, password)
        if not email or not password:
            return jsonify({'message': 'email or password absent'}), 400
        
        user = user_datastore.find_user(email=email)

        # print(user.email, user.password)

        if not user:
            return jsonify({'message': 'invalid user'}), 400
        
        if verify_password(password, user.password):
            return jsonify({'token': user.get_auth_token(), 'email': user.email, 'role': user.roles[0].name, 'id': user.id}), 200
        else:
            return jsonify({'message': 'invalid password'}), 400

    @app.route('/signup', methods=['POST'])
    def signup():
        data = request.get_json()

        email = data.get('email')
        # username = data.get('username')
        password = data.get('password')
        role = data.get('role')

        # Check for missing required fields
        if not email or not password or role not in ['influencer', 'sponsor']:
            return jsonify({'message': "Invalid input"}), 400

        # Check if email or username already exists
        if user_datastore.find_user(email=email):
            return jsonify({'message': "Email already registered"}), 409
        # if user_datastore.find_user(username=username):
        #     return jsonify({'message': "Username already taken"}), 409

        # Determine active status based on role
        active = role == "influencer"

        # Additional fields for sponsor or influencer roles
        sponsor_details = {}
        influencer_details = {}

        if role == "sponsor":
            # Extract sponsor-specific fields
            name = data.get('name')
            industry = data.get('industry')
            annual_revenue = data.get('annual_revenue')

            # Check for required sponsor fields
            if not name or not industry or annual_revenue is None:
                return jsonify({'message': "Missing sponsor details"}), 400

            # Set sponsor details
            sponsor_details = {
                "name": name,
                "industry": industry,
                "annual_revenue": annual_revenue
            }

        elif role == "influencer":
            # Extract influencer-specific fields
            name = data.get('name')
            category = data.get('category')
            niche = data.get('niche')
            followers = data.get('followers')

            # Check for required influencer fields
            if not name or not category or not niche or followers is None:
                return jsonify({'message': "Missing influencer details"}), 400

            # Set influencer details
            influencer_details = {
                "name": name,
                "category": category,
                "niche": niche,
                "followers": followers
            }

        try:
            # Create user with additional sponsor or influencer details
            user = user_datastore.create_user(
                email=email,
                # username=username,
                password=hash_password(password),
                roles=[role],
                active=active,
                **sponsor_details,
                **influencer_details
            )
            
            # Save to the database
            db.session.commit()
        except Exception as e:
            print(f'Error while creating user: {e}')
            db.session.rollback()
            return jsonify({'message': "Error while creating user"}), 500

        return jsonify({'message': "User created successfully"}), 200




    @app.route('/profile')
    @auth_required('token', 'session')
    def profile():
        # <p> Welcome, {{current_user.username}}</p>
        return render_template_string(
            """
                <h1> this is homepage </h1>
                
                <p> Role :  {{current_user.roles[0].description}}</p>
                <p><a href="/logout">Logout</a></p>
            """
        )

    @app.route('/dashboard/sponsor')
    @roles_required('sponsor')
    def sponsor_dashboard():
        return render_template_string(
            """
                <h1>this is sponsor dashboard</h1>
                <p>This should only be accessable to sponsor</p>
            """
        )

    @app.route('/dashboard/influencer')
    @roles_required('influencer')
    def influencer_dashboard():
        return render_template_string(
            """
                <h1>this is influencer dashboard</h1>
                <p>This should only be accessable to influencer</p>
            """
        )

    @roles_required('admin')
    @app.route('/approve-sponsor/<id>')
    @auth_required('token', 'session')
    def approve_sponsor(id):
        user = user_datastore.find_user(id=id)
        
        if not user:
            return jsonify({'message': 'Sponsor already approved'}), 400
        
        user.active = True
        db.session.commit()
        return jsonify({'message': 'Sponsor is approved'}), 200
    
    # @roles_required('admin')
    # @app.route('/unapproved-sponsors', methods=['GET'])
    # @auth_required('token', 'session')
    # def get_unapproved_sponsors():
    #     sponsors = user_datastore.user_model().query.all()

    #     if not sponsors:
    #         return jsonify([
    #             {
    #                 'id': 'nothing',
    #             }
    #         ]), 200

    #     unapproved_sponsors = [sponsor for sponsor in sponsors if not sponsor.active and any(role.name=='sponsor' for role in sponsor.roles)]

    #     results = [
    #         {
    #             'id': sponsor.id,
    #             'email': sponsor.email,
    #         }
    #         for sponsor in unapproved_sponsors
    #     ]
    #     return jsonify(results), 200

    @roles_required('admin')
    @app.route('/flag-user/<id>')
    @auth_required('token', 'session')
    def flag_user(id):
        user = user_datastore.find_user(id=id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 400
        
        user.active = False
        db.session.commit()
        return jsonify({'message': 'User is flagged'}), 200

    @roles_required('admin')
    @app.route('/unflag-user/<id>')
    @auth_required('token', 'session')
    def unflag_user(id):
        user = user_datastore.find_user(id=id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 400
        
        user.active = True
        db.session.commit()
        return jsonify({'message': 'User is unflagged'}), 200

    @roles_required('admin')
    @app.route('/flag-campaign/<id>')
    @auth_required('token', 'session')
    def flag_campaign(id):
        user = user_datastore.find_user(id=id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 400
        
        user.active = True
        db.session.commit()
        return jsonify({'message': 'User is unflagged'}), 200


    @roles_required('admin')
    @app.route('/admin/statistics/')
    @auth_required('token', 'session')
    @cache.cached(timeout=300)
    def admin_statistics():
        total_users = User.query.filter_by(active=True).count()
        total_sponsors = User.query.filter(User.active == True, User.roles.any(name='sponsor')).count()
        total_influencers = User.query.filter(User.active == True, User.roles.any(name='influencer')).count()

        total_campaigns = Campaign.query.count()
        active_campaigns = Campaign.query.filter(Campaign.end_date >= datetime.utcnow().date()).count()

        public_campaigns = Campaign.query.filter(Campaign.end_date >= datetime.utcnow().date(), Campaign.visibility == 'public').count()
        private_campaigns = Campaign.query.filter(Campaign.end_date >= datetime.utcnow().date(), Campaign.visibility == 'private').count()

        campaign_ads = db.session.query(Campaign.name, db.func.count(AdRequest.id)).join(AdRequest).group_by(Campaign.id).all()
        campaign_ads = [{"campaign_name": name, "ad_count": count} for name, count in campaign_ads]

        accepted_requests = Requests.query.filter(Requests.status.in_(['Accepted_I', 'Accepted_S'])).count()
        rejected_requests = Requests.query.filter_by(status='Rejected').count()

        pendingI_requests = Requests.query.filter_by(status='Pending_I').count()
        pendingS_requests = Requests.query.filter_by(status='Pending_S').count()

        negotiation_requests = Requests.query.filter_by(status='Negotiation').count()

        statistics = {
            'totalUsers': total_users,
            'totalSponsors': total_sponsors,
            'totalInfluencers': total_influencers,
            'totalCampaigns': total_campaigns,
            'activeCampaigns': active_campaigns,
            'userDistribution': {
                'sponsors': total_sponsors,
                'influencers': total_influencers
            },
            'campaignVisibility': {
                'public': public_campaigns,
                'private': private_campaigns
            },
            'campaignAds': campaign_ads,
            'acceptedRequests': accepted_requests,
            'rejectedRequests': rejected_requests,
            'pendingIRequests': pendingI_requests,
            'pendingSRequests': pendingS_requests,
            'negotiationRequests': negotiation_requests
        }

        return jsonify(statistics)

    @roles_required('influencer')
    @app.route('/influencer/statistics/<int:influencer_id>/')
    @auth_required('token', 'session')
    @cache.cached(timeout=300)
    def influencer_statistics(influencer_id):
        total_requests = Requests.query.filter_by(influencer_id=influencer_id).count()
        accepted_requests = Requests.query.filter(Requests.influencer_id == influencer_id, Requests.status.in_(['Accepted_I', 'Accepted_S'])).count()
        rejected_requests = Requests.query.filter_by(influencer_id=influencer_id, status='Rejected').count()
        negotiation_requests = Requests.query.filter_by(influencer_id=influencer_id, status='Negotiation').count()
        pending_requests = Requests.query.filter(Requests.influencer_id == influencer_id, Requests.status.in_(['Pending_I', 'Pending_S'])).count()

        statistics = {
            'totalRequests': total_requests,
            'acceptedRequests': accepted_requests,
            'rejectedRequests': rejected_requests,
            'negotiationRequests': negotiation_requests,
            'pendingRequests': pending_requests,
        }

        return jsonify(statistics)



    @roles_required('sponsor')
    @app.route('/sponsor/statistics/<int:sponsor_id>/')
    @auth_required('token', 'session')
    @cache.cached(timeout=300)
    def sponsor_statistics(sponsor_id):
        total_campaigns = Campaign.query.filter_by(sponsor_id=sponsor_id).count()
        active_campaigns = Campaign.query.filter(
            Campaign.sponsor_id == sponsor_id,
            Campaign.end_date >= datetime.utcnow().date(),
            ~Campaign.flagged.any()
        ).count()
        flagged_campaigns = FlaggedCampaign.query.join(Campaign).filter(Campaign.sponsor_id == sponsor_id).count()

        campaign_ads = db.session.query(Campaign.name, db.func.count(AdRequest.id)).join(AdRequest).filter(
            Campaign.sponsor_id == sponsor_id,
            ~Campaign.flagged.any()
        ).group_by(Campaign.id).all()
        campaign_ads = [{"campaign_name": name, "ad_count": count} for name, count in campaign_ads]

        public_campaigns = Campaign.query.filter(
            Campaign.sponsor_id == sponsor_id,
            Campaign.end_date >= datetime.utcnow().date(),
            Campaign.visibility == 'public',
            ~Campaign.flagged.any()
        ).count()
        private_campaigns = Campaign.query.filter(
            Campaign.sponsor_id == sponsor_id,
            Campaign.end_date >= datetime.utcnow().date(),
            Campaign.visibility == 'private',
            ~Campaign.flagged.any()
        ).count()

        total_requests = Requests.query.join(AdRequest).join(Campaign).filter(Campaign.sponsor_id == sponsor_id).count()
        accepted_requests = Requests.query.join(AdRequest).join(Campaign).filter(Campaign.sponsor_id == sponsor_id, Requests.status.in_(['Accepted_I', 'Accepted_S'])).count()
        rejected_requests = Requests.query.join(AdRequest).join(Campaign).filter(Campaign.sponsor_id == sponsor_id, Requests.status == 'Rejected').count()
        negotiation_requests = Requests.query.join(AdRequest).join(Campaign).filter(Campaign.sponsor_id == sponsor_id, Requests.status == 'Negotiation').count()

        statistics = {
            'totalCampaigns': total_campaigns,
            'activeCampaigns': active_campaigns,
            'flaggedCampaigns': flagged_campaigns,
            'campaignAds': campaign_ads,
            'campaignVisibility': {
                'public': public_campaigns,
                'private': private_campaigns
            },
            'totalRequests': total_requests,
            'acceptedRequests': accepted_requests,
            'rejectedRequests': rejected_requests,
            'negotiationRequests': negotiation_requests
        }

        return jsonify(statistics)

