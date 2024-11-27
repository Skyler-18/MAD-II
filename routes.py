from models import User, db
from flask import jsonify, render_template, render_template_string, request
from flask_security import auth_required, current_user, roles_required
from flask_security.utils import hash_password, verify_password


def create_routes(app, user_datastore):
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
    
    @roles_required('admin')
    @app.route('/unapproved-sponsors', methods=['GET'])
    @auth_required('token', 'session')
    def get_unapproved_sponsors():
        sponsors = user_datastore.user_model().query.all()

        if not sponsors:
            return jsonify([
                {
                    'id': 'nothing',
                }
            ]), 200

        unapproved_sponsors = [sponsor for sponsor in sponsors if not sponsor.active and any(role.name=='sponsor' for role in sponsor.roles)]

        results = [
            {
                'id': sponsor.id,
                'email': sponsor.email,
            }
            for sponsor in unapproved_sponsors
        ]
        return jsonify(results), 200