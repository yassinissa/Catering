"""Option lists. The ids must match frontend/src/content/site.js."""

EVENT_TYPES = [
    ('wedding', 'Weddings & engagements'),
    ('corporate', 'Corporate & banking'),
    ('gathering', 'Family gatherings'),
    ('hotel', 'Hotels & venues'),
    ('chalet', 'Chalets & outdoor'),
    ('ramadan', 'Ramadan'),
    ('party', 'Private parties'),
    ('conference', 'Conferences & exhibitions'),
]

SERVICE_STYLES = [
    ('buffet', 'Open buffet'),
    ('plated', 'Plated service'),
    ('live', 'Live stations'),
    ('lifestyle', 'Lifestyle & boxes'),
    ('unsure', 'Help me choose'),
]

CUISINES = [
    ('arabic', 'Arabic'),
    ('lebanese', 'Lebanese'),
    ('chinese', 'Chinese'),
    ('japanese', 'Japanese'),
    ('mediterranean', 'Mediterranean'),
]

BUDGETS = [
    ('', '—'),
    ('lt10', 'Under 10 KWD / guest'),
    ('10-20', '10 – 20 KWD / guest'),
    ('20-35', '20 – 35 KWD / guest'),
    ('gt35', '35 KWD + / guest'),
    ('unsure', 'Not sure yet'),
]

VENUES = [
    ('home', 'Home'),
    ('chalet', 'Chalet / camp'),
    ('hotel', 'Hotel'),
    ('hall', 'Wedding hall'),
    ('office', 'Office / bank'),
    ('other', 'Other'),
]

GOVERNORATES = [
    ('capital', 'Capital'),
    ('hawalli', 'Hawalli'),
    ('farwaniya', 'Farwaniya'),
    ('mubarak', 'Mubarak Al-Kabeer'),
    ('ahmadi', 'Ahmadi'),
    ('jahra', 'Jahra'),
]

EXTRAS = [
    ('waiters', 'Waiters & hosts'),
    ('setup', 'Setup & decor'),
    ('tableware', 'Tableware & linen'),
    ('chef', 'Live chef'),
    ('drinks', 'Coffee, tea & juices'),
    ('cake', 'Cake & sweets table'),
]

CONTACT_METHODS = [
    ('call', 'Phone call'),
    ('whatsapp', 'WhatsApp'),
    ('email', 'Email'),
]

STATUSES = [
    ('new', 'New'),
    ('contacted', 'Contacted'),
    ('quoted', 'Quote sent'),
    ('confirmed', 'Confirmed'),
    ('completed', 'Completed'),
    ('cancelled', 'Cancelled'),
]

LANGUAGES = [('en', 'English'), ('ar', 'Arabic')]


def label(choices, value):
    return dict(choices).get(value, value)
