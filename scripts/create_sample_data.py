#!/usr/bin/env python3
"""
Sample data creation script
Creates sample users and tickets in the database
"""
import requests

BASE_URL = "http://localhost:5001/api"
AUTH_EMAIL = "sample.admin@company.com"
AUTH_PASSWORD = "password123"


def get_auth_headers():
    auth_user = {
        "name": "Sample Admin",
        "email": AUTH_EMAIL,
        "password": AUTH_PASSWORD,
        "role": "admin",
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=auth_user)
    if response.status_code not in [200, 201]:
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": AUTH_EMAIL,
            "password": AUTH_PASSWORD,
        })
    response.raise_for_status()
    token = response.json()["token"]
    return {"Authorization": f"Bearer {token}"}

def create_sample_data():
    """Create sample users and ticket"""
    headers = get_auth_headers()

    # Create users
    print("=" * 60)
    print("Creating sample users...")
    print("=" * 60)

    user1_data = {
        "name": "John Smith",
        "email": "john.smith@company.com",
        "role": "support_engineer"
    }

    user2_data = {
        "name": "Sarah Johnson",
        "email": "sarah.johnson@company.com",
        "role": "customer"
    }

    r1 = requests.post(f"{BASE_URL}/users", json=user1_data, headers=headers)
    r2 = requests.post(f"{BASE_URL}/users", json=user2_data, headers=headers)

    print(f"✓ John Smith created: Status {r1.status_code}")
    if r1.status_code != 201:
        print(f"  Error: {r1.text}")
    print(f"✓ Sarah Johnson created: Status {r2.status_code}")
    if r2.status_code != 201:
        print(f"  Error: {r2.text}")

    # Get users to find IDs
    print("\n" + "=" * 60)
    print("Fetching user IDs...")
    print("=" * 60)

    users = requests.get(f"{BASE_URL}/users", headers=headers).json()
    print(f"Total users in system: {len(users)}")

    if len(users) >= 2:
        user1_id = users[-2]['id']
        user2_id = users[-1]['id']
        
        print(f"User 1 (Assignee): {users[-2]['name']} (ID: {user1_id})")
        print(f"User 2 (Reporter): {users[-1]['name']} (ID: {user2_id})")
        
        # Create a high-priority ticket
        print("\n" + "=" * 60)
        print("Creating sample ticket...")
        print("=" * 60)
        
        ticket_data = {
            "title": "Database Connection Timeout",
            "description": "The application is experiencing intermittent database connection timeouts during peak hours. Users report 'unable to connect' errors between 2-4 PM EST. This is causing revenue loss.",
            "priority": 3,  # High
            "status": 1,    # Open
            "assignee": user1_id,
            "reporter": user2_id
        }
        
        r = requests.post(f"{BASE_URL}/tickets", json=ticket_data, headers=headers)
        
        if r.status_code in [200, 201]:
            print(f"✓ Ticket created successfully!")
            print(f"  Status Code: {r.status_code}")
            print(f"  Response: {r.json()}")
        else:
            print(f"✗ Error creating ticket: {r.status_code}")
            print(f"  Response: {r.json()}")
        
        # Fetch and display all tickets
        print("\n" + "=" * 60)
        print("All Tickets in System:")
        print("=" * 60)
        
        tickets = requests.get(f"{BASE_URL}/tickets", headers=headers).json()
        
        for i, ticket in enumerate(tickets, 1):
            status_map = {1: "Open", 2: "In Progress", 3: "Resolved"}
            priority_map = {1: "Low", 2: "Medium", 3: "High"}
            
            print(f"\n{i}. [{ticket['id']}] {ticket['title']}")
            print(f"   Status: {status_map.get(ticket['status'], 'Unknown')}")
            print(f"   Priority: {priority_map.get(ticket['priority'], 'Unknown')}")
            print(f"   Assigned to: User {ticket['assigned_to']}")
            print(f"   Created by: User {ticket['created_by']}")
            if ticket.get('description'):
                desc = ticket['description'][:60] + "..." if len(ticket['description']) > 60 else ticket['description']
                print(f"   Description: {desc}")
    else:
        print("Error: Could not create users")

if __name__ == "__main__":
    create_sample_data()
