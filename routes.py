from models import db
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

        if not email or not password:
            return jsonify({'message': 'email or password absent'}), 400
        
        user = user_datastore.find_user(email=email)

        if not user:
            return jsonify({'message': 'invalid user'}), 400
        
        if verify_password(password, user.password):
            return jsonify({'token': user.get_auth_token(), 'user': user.email, 'role': user.roles[0].name}), 200
        else:
            return jsonify({'message': 'invalid password'}), 400

    @app.route('/signup', methods=['POST'])
    def signup():
        data = request.get_json()

        email = data.get('email')
        username = data.get('username')
        password = data.get('password')
        role = data.get('role')

        if not email or not username or not password or role not in ['influencer', 'sponsor']:
            return jsonify({'message': "invalid input"})
        
        if user_datastore.find_user(email=email):
            return jsonify({'message': "user already exists"})
        
        #inst active = false
        if role == "sponsor":
            active = False
        elif role == "influencer":
            active = True

        try:
            user_datastore.create_user(email=email, username=username, password=hash_password(password), roles=[role], active=active)
            db.session.commit()
        except:
            print('Error while creating')
            db.session.rollback()
            return jsonify({'message': "error while creating user"}), 408
        
        return jsonify({'message': "user created"}), 200


    @app.route('/profile')
    @auth_required('token', 'session')
    def profile():
        return render_template_string(
            """
                <h1> this is homepage </h1>
                <p> Welcome, {{current_user.username}}</p>
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