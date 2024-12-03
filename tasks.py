from celery import shared_task
import time
from flask_excel import make_response_from_query_sets
from mail_service import send_email
from models import User, Role, Requests, Campaign, AdRequest, cache
from datetime import datetime, timedelta

# @shared_task()
# def add(x,y):
#     time.sleep(15)
#     return x+y

@shared_task(ignore_result=False)
# @cache.cached(timeout=300)
def create_csv(sponsor_id):
    resource = Campaign.query.filter_by(sponsor_id=sponsor_id).with_entities(Campaign.name, Campaign.description, Campaign.start_date, Campaign.end_date, Campaign.budget, Campaign.visibility, Campaign.goals).all()

    csv_out = make_response_from_query_sets(resource, ['name', 'description', 'start_date', 'end_date', 'budget', 'visibility', 'goals'], 'csv', filename="file.csv")

    with open('./user-downloads/file.csv', 'wb') as file:
        file.write(csv_out.data)

    return 'file.csv'


@shared_task
def daily_reminder():
    # Fetch all requests with status 'Pending_I'
    pending_requests = Requests.query.filter_by(status='Pending_I').all()
    
    # Get the influencer ids from these requests
    influencer_ids = [request.influencer_id for request in pending_requests]
    
    # Fetch the influencer emails
    influencers = User.query.filter(User.id.in_(influencer_ids)).all()
    
    # Send reminder emails to influencers with pending requests
    for influencer in influencers:
        send_email(influencer.email, "REMINDER: New Campaigns & Ad Requests", "<h1>Login to your account and checkout the latest campaigns and ad requests.</h1>")
    
    return "OK"


@shared_task
def monthly_reminder():
    # Get the current date and calculate the first and last day of the month
    now = datetime.now()
    first_day_of_month = datetime(now.year, now.month, 1)
    last_day_of_month = first_day_of_month + timedelta(days=31)
    last_day_of_month = last_day_of_month.replace(day=1) - timedelta(days=1)

    # Fetch all sponsors
    sponsors = User.query.filter(User.roles.any(name='sponsor')).all()

    for sponsor in sponsors:
        # Fetch campaigns for the current month
        campaigns = Campaign.query.filter(
            Campaign.sponsor_id == sponsor.id,
            Campaign.start_date >= first_day_of_month
        ).all()

        # Generate the HTML content
        html_content = render_monthly_report(sponsor, campaigns, first_day_of_month, last_day_of_month)

        # Send the email
        send_email(sponsor.email, "Monthly Report", html_content)

    return "OK"

def render_monthly_report(sponsor, campaigns, first_day_of_month, last_day_of_month):
    total_campaigns = len(campaigns)
    total_requests = sum(campaign.ad_requests.count() for campaign in campaigns)
    total_spent = sum(request.payment_amount for campaign in campaigns for request in campaign.ad_requests)

    html = f"""
    <html>
    <body>
        <h1>Monthly Report for {sponsor.name}</h1>
        <p><strong>Report Period:</strong> {first_day_of_month.strftime('%B %d, %Y')} - {last_day_of_month.strftime('%B %d, %Y')}</p>
        <p><strong>Total Campaigns:</strong> {total_campaigns}</p>
        <p><strong>Total Ads:</strong> {total_requests}</p>
        <p><strong>Total Amount Spent:</strong> Rs. {total_spent:.2f}</p>
        
        <h2>Campaign Details</h2>
        <table border="1" cellpadding="5">
            <tr>
                <th>Campaign Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Budget</th>
                <th>Ad Requests</th>
            </tr>
    """

    for campaign in campaigns:
        html += f"""
            <tr>
                <td>{campaign.name}</td>
                <td>{campaign.start_date.strftime('%B %d, %Y')}</td>
                <td>{campaign.end_date.strftime('%B %d, %Y')}</td>
                <td>Rs. {campaign.budget:.2f}</td>
                <td>
                    <ul>
        """
        for i, request in enumerate(campaign.ad_requests.all(), start=1):
            html += f"<li>{i}: Rs. {request.payment_amount:.2f}</li>"

        html += """
                    </ul>
                </td>
            </tr>
        """
    
    html += """
        </table>
        
        <p>Thank you for your continued support and partnership. We look forward to achieving even greater success together in the coming months.</p>
        <p>If you have any questions or need further assistance, please feel free to reach out to us.</p>
        <p>Best Regards,<br>SpIn</p>
    </body>
    </html>
    """

    return html