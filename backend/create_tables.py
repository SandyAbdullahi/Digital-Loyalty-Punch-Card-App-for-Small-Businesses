from app.db.base import Base
from app.db.session import engine
from app.models.user import User
from app.models.merchant import Merchant
from app.models.location import Location
from app.models.loyalty_program import LoyaltyProgram
from app.models.customer_program_membership import CustomerProgramMembership
from app.models.ledger_entry import LedgerEntry

# Create all tables
Base.metadata.create_all(bind=engine)