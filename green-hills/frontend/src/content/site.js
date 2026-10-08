/*
 * ─────────────────────────────────────────────────────────────
 *  GREEN HILLS — SITE CONTENT
 *  Edit text, dishes, events, locations and contact details here.
 *  Every visible text has an English (en) and Arabic (ar) version.
 *
 *  To change a photo: drop the new file in /public/media/img/
 *  and change the file name below (e.g. img('my-photo.jpg')).
 * ─────────────────────────────────────────────────────────────
 */

const BASE = import.meta.env.BASE_URL
export const img = (name) => `${BASE}media/img/${name}`
export const vid = (name) => `${BASE}media/videos/${name}`

/* ── Contact ── leave a value empty ('') to hide it on the site */
export const CONTACT = {
  phone: '',            // TODO: e.g. '+965 1234 5678'
  whatsapp: '',         // TODO: digits only with country code, e.g. '96512345678'
  email: '',            // TODO: e.g. 'events@greenhills.com.kw'
  instagram: '',        // TODO: Green Hills' own Instagram link, if you have one
  instagramHandle: '',
}

/* ── Reels (short videos) ── */
export const REELS = [
  { id: 'r3', src: vid('reel3.mp4'), poster: vid('reel3.jpg'), label: { en: 'Mezze spread', ar: 'تشكيلة المازة' } },
  { id: 'r6', src: vid('reel6.mp4'), poster: vid('reel6.jpg'), label: { en: 'Teppanyaki live', ar: 'تيبانياكي حي' } },
  { id: 'r2', src: vid('reel2.mp4'), poster: vid('reel2.jpg'), label: { en: 'Charcoal grill', ar: 'مشاوي على الفحم' } },
  { id: 'r4', src: vid('reel4.mp4'), poster: vid('reel4.jpg'), label: { en: 'Breakfast boards', ar: 'ألواح الفطور' } },
  { id: 'r5', src: vid('reel5.mp4'), poster: vid('reel5.jpg'), label: { en: 'Wok station', ar: 'محطة الووك' } },
  { id: 'r1', src: vid('reel1.mp4'), poster: vid('reel1.jpg'), label: { en: 'Fresh fatayer', ar: 'فطائر طازجة' } },
]

/* ── Cuisines & sample menus ── */
export const CUISINES = [
  {
    id: 'arabic',
    name: { en: 'Arabic', ar: 'عربي' },
    tagline: { en: 'Generous trays, slow-cooked rice and the smell of charcoal.', ar: 'صوانٍ عامرة، أرز مطهو على مهل، ورائحة الفحم.' },
    image: img('grill.jpg'),
    dishes: [
      { en: 'Lamb ouzi on spiced rice', ar: 'قوزي لحم على أرز متبّل' },
      { en: 'Chicken machboos', ar: 'مجبوس دجاج' },
      { en: 'Harees with ghee', ar: 'هريس بالسمن' },
      { en: 'Mixed charcoal grill', ar: 'مشاوي مشكلة على الفحم' },
      { en: 'Luqaimat with date syrup', ar: 'لقيمات بدبس التمر' },
    ],
  },
  {
    id: 'lebanese',
    name: { en: 'Lebanese', ar: 'لبناني' },
    tagline: { en: 'A mezze table that keeps arriving.', ar: 'مائدة مازة لا تنتهي.' },
    image: img('mezze.jpg'),
    dishes: [
      { en: 'Hummus, moutabal & muhammara', ar: 'حمص، متبل ومحمرة' },
      { en: 'Tabbouleh & fattoush', ar: 'تبولة وفتوش' },
      { en: 'Cheese & meat fatayer', ar: 'فطائر بالجبنة واللحم' },
      { en: 'Fried kibbeh', ar: 'كبة مقلية' },
      { en: 'Knafeh with ashta', ar: 'كنافة بالقشطة' },
    ],
  },
  {
    id: 'chinese',
    name: { en: 'Chinese', ar: 'صيني' },
    tagline: { en: 'Wok fire, glossy sauces, noodles tossed to order.', ar: 'نار الووك، صلصات لامعة، ونودلز تُحضّر حسب الطلب.' },
    image: img('noodles.jpg'),
    dishes: [
      { en: 'Wok-tossed noodles', ar: 'نودلز مقلبة بالووك' },
      { en: 'Kung pao chicken', ar: 'دجاج كونغ باو' },
      { en: 'Black pepper beef', ar: 'لحم بالفلفل الأسود' },
      { en: 'Dim sum baskets', ar: 'سلال ديم سم' },
      { en: 'Sweet & sour prawns', ar: 'روبيان حلو وحامض' },
    ],
  },
  {
    id: 'japanese',
    name: { en: 'Japanese', ar: 'ياباني' },
    tagline: { en: 'Teppanyaki theatre and clean, precise plates.', ar: 'عرض تيبانياكي حي وأطباق دقيقة ونظيفة.' },
    image: img('teppanyaki.jpg'),
    dishes: [
      { en: 'Live teppanyaki station', ar: 'محطة تيبانياكي حية' },
      { en: 'Sushi & maki platters', ar: 'صواني سوشي وماكي' },
      { en: 'Glazed beef skewers', ar: 'أسياخ لحم مُلمّعة' },
      { en: 'Ebi tempura', ar: 'تمبورا روبيان' },
      { en: 'Mochi selection', ar: 'تشكيلة موتشي' },
    ],
  },
  {
    id: 'mediterranean',
    name: { en: 'Mediterranean', ar: 'متوسطي' },
    tagline: { en: 'Olive oil, citrus and crisp golden bites.', ar: 'زيت زيتون، حمضيات ولقمات ذهبية مقرمشة.' },
    image: img('croquettes.jpg'),
    dishes: [
      { en: 'Crispy croquettes, romesco dip', ar: 'كروكيت مقرمش مع صلصة روميسكو' },
      { en: 'Grilled halloumi & watermelon', ar: 'حلومي مشوي مع البطيخ' },
      { en: 'Chicken souvlaki', ar: 'سوفلاكي دجاج' },
      { en: 'Burrata, tomato & basil', ar: 'بوراتا مع الطماطم والريحان' },
      { en: 'Pomegranate & pistachio jelly', ar: 'جيلي الرمان بالفستق' },
    ],
  },
]

/* ── Service styles ── */
export const SERVICES = [
  {
    id: 'buffet',
    icon: 'buffet',
    name: { en: 'Open buffet', ar: 'بوفيه مفتوح' },
    text: { en: 'Hot and cold lines, carving and dessert tables, set up and kept full by our team.', ar: 'أركان ساخنة وباردة، وطاولات للتقطيع والحلويات، نجهّزها ونحافظ عليها عامرة طوال المناسبة.' },
    image: img('mezze.jpg'),
  },
  {
    id: 'plated',
    icon: 'plated',
    name: { en: 'Plated service', ar: 'خدمة الأطباق' },
    text: { en: 'Course by course at the table, with trained waiters in uniform.', ar: 'طبقًا تلو الآخر على الطاولة، مع طاقم ضيافة مدرّب بزيّ موحّد.' },
    image: img('skewer.jpg'),
  },
  {
    id: 'live',
    icon: 'live',
    name: { en: 'Live stations', ar: 'محطات طبخ مباشرة' },
    text: { en: 'Teppanyaki, wok, saj and charcoal grill cooked in front of your guests.', ar: 'تيبانياكي، ووك، صاج ومشاوي على الفحم تُطهى أمام ضيوفك.' },
    image: img('teppanyaki.jpg'),
  },
  {
    id: 'lifestyle',
    icon: 'lifestyle',
    name: { en: 'Lifestyle & boxes', ar: 'لايف ستايل وصناديق الضيافة' },
    text: { en: 'Breakfast boards, grazing tables, coffee breaks and individual boxes for meetings.', ar: 'ألواح فطور، طاولات تشكيلة، استراحات قهوة، وصناديق فردية للاجتماعات.' },
    image: img('boards.jpg'),
  },
]

/* ── Event types ── (the id is saved with each booking) */
export const EVENTS = [
  { id: 'wedding', icon: 'rings', name: { en: 'Weddings & engagements', ar: 'أعراس وملكات' }, text: { en: 'From the malka to the wedding night.', ar: 'من الملكة إلى ليلة الزفاف.' } },
  { id: 'corporate', icon: 'building', name: { en: 'Corporate & banking', ar: 'شركات وبنوك' }, text: { en: 'Board meetings, launches, staff days.', ar: 'اجتماعات، إطلاقات، أيام موظفين.' } },
  { id: 'gathering', icon: 'users', name: { en: 'Family gatherings', ar: 'تجمعات عائلية' }, text: { en: 'Diwaniyas, reunions, weekend lunches.', ar: 'دواوين، لقاءات عائلية، وغداء نهاية الأسبوع.' } },
  { id: 'hotel', icon: 'hotel', name: { en: 'Hotels & venues', ar: 'فنادق وقاعات' }, text: { en: 'Partner kitchen for halls and hotels.', ar: 'مطبخ شريك للقاعات والفنادق.' } },
  { id: 'chalet', icon: 'sun', name: { en: 'Chalets & outdoor', ar: 'شاليهات ومخيمات' }, text: { en: 'Grills by the sea or in the desert camp.', ar: 'مشاوي على البحر أو في المخيم.' } },
  { id: 'ramadan', icon: 'moon', name: { en: 'Ramadan', ar: 'رمضان' }, text: { en: 'Iftar, ghabga and suhoor.', ar: 'فطور، غبقة وسحور.' } },
  { id: 'party', icon: 'party', name: { en: 'Private parties', ar: 'حفلات خاصة' }, text: { en: 'Birthdays, graduations, celebrations.', ar: 'أعياد ميلاد، تخرّج، مناسبات.' } },
  { id: 'conference', icon: 'mic', name: { en: 'Conferences & exhibitions', ar: 'مؤتمرات ومعارض' }, text: { en: 'Coffee breaks and lunches for hundreds.', ar: 'استراحات قهوة وغداء للمئات.' } },
]

/* ── Ramadan packages ── */
export const RAMADAN = [
  {
    id: 'iftar',
    name: { en: 'Iftar', ar: 'فطور رمضان' },
    time: { en: 'At sunset', ar: 'عند المغرب' },
    text: { en: 'Dates, laban and soup to break the fast, then harees, machboos and the grill.', ar: 'تمر ولبن وشوربة لكسر الصيام، ثم هريس ومجبوس ومشاوٍ.' },
    image: img('shakshuka.jpg'),
  },
  {
    id: 'ghabga',
    name: { en: 'Ghabga', ar: 'غبقة' },
    time: { en: 'Late evening', ar: 'في ساعات المساء' },
    text: { en: 'A relaxed spread for the office or family majlis, with sweets and karak.', ar: 'مائدة مريحة للمكتب أو مجلس العائلة، مع الحلويات والكرك.' },
    image: img('pomegranate.jpg'),
  },
  {
    id: 'suhoor',
    name: { en: 'Suhoor', ar: 'سحور' },
    time: { en: 'Before dawn', ar: 'قبل الفجر' },
    text: { en: 'Light mezze, fatayer, eggs and fresh juices before the fast.', ar: 'مازة خفيفة، فطائر، بيض وعصائر طازجة قبل الإمساك.' },
    image: img('honey.jpg'),
  },
]

/* ── Our restaurants ("Visit our brands") ──
 * phone: digits as dialled in Kuwait (8 digits). hours: leave '' if unknown.
 * logo: file in /public/media/brands/
 */
const maps = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q + ', Kuwait')}`
const H_12_1130 = { en: '12 PM – 11:30 PM', ar: '١٢ ظهرًا – ١١:٣٠ مساءً' }

export const BRANDS = [
  {
    id: 'woknroll',
    name: 'Wok n Roll',
    logo: `${BASE}media/brands/woknroll.jpg`,
    color: '#1f6fd1',
    instagram: 'https://www.instagram.com/woknrollkw',
    handle: '@woknrollkw',
    hotline: ['25310857', '25310858'],
    branches: [
      { name: { en: 'Jabriya', ar: 'الجابرية' }, hours: H_12_1130, phone: '25314240', maps: maps('Wok n Roll Jabriya') },
      { name: { en: 'Abu Halifa – Light Complex', ar: 'أبو حليفة – مجمع لايت' }, hours: H_12_1130, phone: '90996868', maps: maps('Wok n Roll Abu Halifa Light Complex') },
      { name: { en: 'The Avenues', ar: 'الأفنيوز' }, hours: { en: '12 PM – 10:30 PM', ar: '١٢ ظهرًا – ١٠:٣٠ مساءً' }, phone: '22597046', maps: maps('Wok n Roll The Avenues') },
    ],
  },
  {
    id: 'dine',
    name: 'Dine',
    logo: `${BASE}media/brands/dine.jpg`,
    color: '#a64d25',
    instagram: 'https://www.instagram.com/dine_kw',
    handle: '@dine_kw',
    branches: [
      { name: { en: 'Al Bidea – Dhai Complex', ar: 'البدع – مجمع ضي' }, hours: { en: '8 AM – 11:30 PM', ar: '٨ صباحًا – ١١:٣٠ مساءً' }, phone: '94137770', maps: maps('Dine Al Bidea Dhai Complex') },
      { name: { en: 'Jabriya – Block 3A', ar: 'الجابرية – قطعة 3أ' }, hours: { en: '1 PM – 11 PM', ar: '١ ظهرًا – ١١ مساءً' }, phone: '50508544', maps: maps('Dine Jabriya Block 3A') },
      { name: { en: 'Abu Halifa – Light Complex', ar: 'أبو حليفة – مجمع لايت' }, hours: '', phone: '97444045', maps: maps('Dine Abu Halifa Light Complex') },
    ],
  },
  {
    id: 'luma',
    name: 'Luma',
    logo: `${BASE}media/brands/luma.jpg`,
    color: '#ffffff',
    instagram: 'https://www.instagram.com/luma.kwt',
    handle: '@luma.kwt',
    branches: [
      { name: { en: 'Jabriya – Block 1A, Street 5, Parcel 103', ar: 'الجابرية – قطعة 1أ، شارع 5، قسيمة 103' }, hours: '', phone: '', maps: maps('Luma Jabriya Block 1A Street 5') },
    ],
  },
]

export const GOVERNORATES = [
  { id: 'capital', name: { en: 'Capital', ar: 'العاصمة' } },
  { id: 'hawalli', name: { en: 'Hawalli', ar: 'حولي' } },
  { id: 'farwaniya', name: { en: 'Farwaniya', ar: 'الفروانية' } },
  { id: 'mubarak', name: { en: 'Mubarak Al-Kabeer', ar: 'مبارك الكبير' } },
  { id: 'ahmadi', name: { en: 'Ahmadi', ar: 'الأحمدي' } },
  { id: 'jahra', name: { en: 'Jahra', ar: 'الجهراء' } },
]

export const VENUES = [
  { id: 'home', name: { en: 'Home', ar: 'منزل' } },
  { id: 'chalet', name: { en: 'Chalet / camp', ar: 'شاليه / مخيم' } },
  { id: 'hotel', name: { en: 'Hotel', ar: 'فندق' } },
  { id: 'hall', name: { en: 'Wedding hall', ar: 'قاعة أفراح' } },
  { id: 'office', name: { en: 'Office / bank', ar: 'مكتب / بنك' } },
  { id: 'other', name: { en: 'Other', ar: 'أخرى' } },
]

export const EXTRAS = [
  { id: 'waiters', name: { en: 'Waiters & hosts', ar: 'طاقم ضيافة' } },
  { id: 'setup', name: { en: 'Setup & decor', ar: 'تجهيز وديكور' } },
  { id: 'tableware', name: { en: 'Tableware & linen', ar: 'أواني ومفارش' } },
  { id: 'chef', name: { en: 'Live chef', ar: 'شيف مباشر' } },
  { id: 'drinks', name: { en: 'Coffee, tea & juices', ar: 'قهوة، شاي وعصائر' } },
  { id: 'cake', name: { en: 'Cake & sweets table', ar: 'طاولة كيك وحلويات' } },
]

export const BUDGETS = [
  { id: 'lt10', name: { en: 'Under 10 KWD', ar: 'أقل من ١٠ د.ك' } },
  { id: '10-20', name: { en: '10 – 20 KWD', ar: '١٠ – ٢٠ د.ك' } },
  { id: '20-35', name: { en: '20 – 35 KWD', ar: '٢٠ – ٣٥ د.ك' } },
  { id: 'gt35', name: { en: '35 KWD +', ar: '+٣٥ د.ك' } },
  { id: 'unsure', name: { en: 'Not sure yet', ar: 'لم أحدد بعد' } },
]

export const CONTACT_METHODS = [
  { id: 'call', name: { en: 'Phone call', ar: 'اتصال' } },
  { id: 'whatsapp', name: { en: 'WhatsApp', ar: 'واتساب' } },
  { id: 'email', name: { en: 'Email', ar: 'البريد الإلكتروني' } },
]
