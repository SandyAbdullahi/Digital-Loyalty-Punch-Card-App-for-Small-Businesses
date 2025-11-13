from backend.app.db.session import SessionLocal
from backend.app.models.loyalty_program import LoyaltyProgram
from backend.app.models.user import User
from backend.app.models.merchant import Merchant
from backend.app.models.customer_program_membership import CustomerProgramMembership
from backend.app.models.reward import Reward

db = SessionLocal()

# Get all users
users = db.query(User).all()
print("Users:")
for u in users:
    print(f"  {u.id}: {u.email}: {u.role}")

# Get all merchants
merchants = db.query(Merchant).all()
print("\nMerchants:")
for m in merchants:
    print(f"  {m.id}: display_name={m.display_name}, legal_name={m.legal_name}, owner: {m.owner_user_id}")

# Get all programs
programs = db.query(LoyaltyProgram).all()
print("\nPrograms:")
for p in programs:
    print(f"  {p.id}: {p.name}, merchant: {p.merchant_id}, logic_type: {p.logic_type}, stamps_required: {p.stamps_required}")
    print(f"    earn_rule: {p.earn_rule}")
    print(f"    redeem_rule: {p.redeem_rule}")

# Get all memberships
memberships = db.query(CustomerProgramMembership).all()
print("\nMemberships:")
for m in memberships:
    print(f"  {m.id}: customer {m.customer_user_id}, program {m.program_id}, balance {m.current_balance}, cycle {m.current_cycle}")

# Get all rewards
rewards = db.query(Reward).all()
print("\nRewards:")
for r in rewards:
    print(f"  {r.id}: enrollment {r.enrollment_id}, cycle {r.cycle}, status {r.status}, voucher {r.voucher_code}")

# Change role to merchant
user = db.query(User).filter(User.email == "abcafe@example.com").first()
if user:
    user.role = "merchant"
    db.commit()
    print(f"Changed role of {user.email} to {user.role}")

# Update program stamps_required
program = db.query(LoyaltyProgram).filter(LoyaltyProgram.name == "Free Coffee").first()
if program:
    program.stamps_required = 2
    db.commit()
    print(f"Updated stamps_required to {program.stamps_required}")

# Update membership cycle to 2 since redeemed once
membership = db.query(CustomerProgramMembership).filter(CustomerProgramMembership.id == "6cc99f2c-a749-4a49-91ee-61944c91fa0c").first()
if membership:
    membership.current_cycle = 2
    db.commit()
    print(f"Updated membership cycle to {membership.current_cycle}")

# Update merchant display_name
merchant = db.query(Merchant).filter(Merchant.id == "b5abff79-ee42-4d3e-8135-41490ed6ebcd").first()
if merchant:
    merchant.display_name = "Abcafe"
    merchant.legal_name = "Abcafe"
    db.commit()
    print(f"Set merchant display_name to {merchant.display_name}")

db.close()