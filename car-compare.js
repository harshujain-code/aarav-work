// Car database — 80+ cars
const cars = [
    // === HYPERCARS ===
    { name: 'Bugatti Chiron', emoji: '&#128672;', category: 'Hypercar', topSpeed: 420, hp: 1500, acceleration: 2.4, weight: 1996, engine: 'W16 8.0L Quad-Turbo', coolFactor: 100 },
    { name: 'Bugatti Veyron', emoji: '&#128672;', category: 'Hypercar', topSpeed: 408, hp: 1001, acceleration: 2.5, weight: 1888, engine: 'W16 8.0L Quad-Turbo', coolFactor: 96 },
    { name: 'Koenigsegg Jesko', emoji: '&#128672;', category: 'Hypercar', topSpeed: 480, hp: 1600, acceleration: 2.5, weight: 1420, engine: 'V8 5.0L Twin-Turbo', coolFactor: 99 },
    { name: 'Koenigsegg Agera RS', emoji: '&#128672;', category: 'Hypercar', topSpeed: 447, hp: 1160, acceleration: 2.8, weight: 1395, engine: 'V8 5.0L Twin-Turbo', coolFactor: 97 },
    { name: 'Pagani Huayra', emoji: '&#128672;', category: 'Hypercar', topSpeed: 383, hp: 730, acceleration: 2.8, weight: 1350, engine: 'V12 6.0L Twin-Turbo', coolFactor: 98 },
    { name: 'Pagani Zonda', emoji: '&#128672;', category: 'Hypercar', topSpeed: 350, hp: 650, acceleration: 3.4, weight: 1250, engine: 'V12 7.3L', coolFactor: 96 },
    { name: 'Rimac Nevera', emoji: '&#9889;', category: 'Hypercar', topSpeed: 412, hp: 1914, acceleration: 1.85, weight: 2150, engine: 'Quad-Motor Electric', coolFactor: 98 },
    { name: 'SSC Tuatara', emoji: '&#128672;', category: 'Hypercar', topSpeed: 460, hp: 1750, acceleration: 2.5, weight: 1247, engine: 'V8 5.9L Twin-Turbo', coolFactor: 95 },
    { name: 'Hennessey Venom F5', emoji: '&#128672;', category: 'Hypercar', topSpeed: 484, hp: 1817, acceleration: 2.6, weight: 1360, engine: 'V8 6.6L Twin-Turbo', coolFactor: 96 },
    { name: 'Aston Martin Valkyrie', emoji: '&#128672;', category: 'Hypercar', topSpeed: 402, hp: 1160, acceleration: 2.5, weight: 1030, engine: 'V12 6.5L Hybrid', coolFactor: 97 },

    // === SUPERCARS ===
    { name: 'Lamborghini Huracan', emoji: '&#128672;', category: 'Supercar', topSpeed: 325, hp: 631, acceleration: 2.9, weight: 1422, engine: 'V10 5.2L', coolFactor: 97 },
    { name: 'Lamborghini Aventador', emoji: '&#128672;', category: 'Supercar', topSpeed: 350, hp: 770, acceleration: 2.8, weight: 1525, engine: 'V12 6.5L', coolFactor: 98 },
    { name: 'Lamborghini Urus', emoji: '&#128665;', category: 'Super SUV', topSpeed: 305, hp: 641, acceleration: 3.6, weight: 2200, engine: 'V8 4.0L Twin-Turbo', coolFactor: 90 },
    { name: 'Lamborghini Revuelto', emoji: '&#128672;', category: 'Supercar', topSpeed: 350, hp: 1001, acceleration: 2.5, weight: 1772, engine: 'V12 6.5L Hybrid', coolFactor: 99 },
    { name: 'Ferrari F8 Tributo', emoji: '&#128672;', category: 'Supercar', topSpeed: 340, hp: 710, acceleration: 2.9, weight: 1330, engine: 'V8 3.9L Twin-Turbo', coolFactor: 98 },
    { name: 'Ferrari SF90 Stradale', emoji: '&#128672;', category: 'Supercar', topSpeed: 340, hp: 986, acceleration: 2.5, weight: 1570, engine: 'V8 4.0L Hybrid', coolFactor: 99 },
    { name: 'Ferrari 296 GTB', emoji: '&#128672;', category: 'Supercar', topSpeed: 330, hp: 818, acceleration: 2.9, weight: 1470, engine: 'V6 3.0L Hybrid', coolFactor: 95 },
    { name: 'Ferrari LaFerrari', emoji: '&#128672;', category: 'Supercar', topSpeed: 352, hp: 950, acceleration: 2.4, weight: 1255, engine: 'V12 6.3L Hybrid', coolFactor: 100 },
    { name: 'Ferrari 812 Superfast', emoji: '&#128672;', category: 'Supercar', topSpeed: 340, hp: 789, acceleration: 2.9, weight: 1525, engine: 'V12 6.5L', coolFactor: 96 },
    { name: 'McLaren 720S', emoji: '&#128672;', category: 'Supercar', topSpeed: 341, hp: 710, acceleration: 2.8, weight: 1283, engine: 'V8 4.0L Twin-Turbo', coolFactor: 95 },
    { name: 'McLaren P1', emoji: '&#128672;', category: 'Supercar', topSpeed: 350, hp: 903, acceleration: 2.8, weight: 1395, engine: 'V8 3.8L Hybrid', coolFactor: 98 },
    { name: 'McLaren 765LT', emoji: '&#128672;', category: 'Supercar', topSpeed: 330, hp: 755, acceleration: 2.7, weight: 1229, engine: 'V8 4.0L Twin-Turbo', coolFactor: 94 },
    { name: 'McLaren Artura', emoji: '&#128672;', category: 'Supercar', topSpeed: 330, hp: 671, acceleration: 3.0, weight: 1395, engine: 'V6 3.0L Hybrid', coolFactor: 90 },
    { name: 'Porsche 918 Spyder', emoji: '&#128672;', category: 'Supercar', topSpeed: 345, hp: 887, acceleration: 2.6, weight: 1634, engine: 'V8 4.6L Hybrid', coolFactor: 97 },
    { name: 'Aston Martin DBS', emoji: '&#128672;', category: 'Supercar', topSpeed: 340, hp: 715, acceleration: 3.4, weight: 1693, engine: 'V12 5.2L Twin-Turbo', coolFactor: 94 },
    { name: 'Audi R8 V10', emoji: '&#128663;', category: 'Supercar', topSpeed: 330, hp: 602, acceleration: 3.1, weight: 1680, engine: 'V10 5.2L', coolFactor: 93 },
    { name: 'Ford GT', emoji: '&#128672;', category: 'Supercar', topSpeed: 348, hp: 660, acceleration: 3.0, weight: 1385, engine: 'V6 3.5L Twin-Turbo', coolFactor: 94 },
    { name: 'Chevrolet Corvette Z06', emoji: '&#128672;', category: 'Supercar', topSpeed: 312, hp: 670, acceleration: 2.6, weight: 1560, engine: 'V8 5.5L Flat-Plane', coolFactor: 92 },

    // === SPORTS CARS ===
    { name: 'Porsche 911 GT3', emoji: '&#128663;', category: 'Sports Car', topSpeed: 318, hp: 502, acceleration: 3.2, weight: 1418, engine: 'Flat-6 4.0L', coolFactor: 92 },
    { name: 'Porsche 911 Turbo S', emoji: '&#128663;', category: 'Sports Car', topSpeed: 330, hp: 640, acceleration: 2.7, weight: 1640, engine: 'Flat-6 3.8L Twin-Turbo', coolFactor: 94 },
    { name: 'Porsche Cayman GT4', emoji: '&#128663;', category: 'Sports Car', topSpeed: 304, hp: 414, acceleration: 3.9, weight: 1415, engine: 'Flat-6 4.0L', coolFactor: 88 },
    { name: 'Porsche Taycan Turbo S', emoji: '&#9889;', category: 'Electric', topSpeed: 260, hp: 750, acceleration: 2.8, weight: 2295, engine: 'Dual-Motor Electric', coolFactor: 89 },
    { name: 'BMW M4', emoji: '&#128663;', category: 'Sports Car', topSpeed: 290, hp: 503, acceleration: 3.5, weight: 1680, engine: 'I6 3.0L Twin-Turbo', coolFactor: 85 },
    { name: 'BMW M3', emoji: '&#128663;', category: 'Sports Car', topSpeed: 290, hp: 503, acceleration: 3.5, weight: 1730, engine: 'I6 3.0L Twin-Turbo', coolFactor: 84 },
    { name: 'BMW M5 CS', emoji: '&#128663;', category: 'Sports Car', topSpeed: 305, hp: 627, acceleration: 2.9, weight: 1825, engine: 'V8 4.4L Twin-Turbo', coolFactor: 88 },
    { name: 'BMW i8', emoji: '&#9889;', category: 'Hybrid', topSpeed: 250, hp: 369, acceleration: 4.4, weight: 1535, engine: 'I3 1.5L Hybrid', coolFactor: 85 },
    { name: 'Mercedes-AMG GT', emoji: '&#128663;', category: 'Sports Car', topSpeed: 318, hp: 577, acceleration: 3.1, weight: 1615, engine: 'V8 4.0L Twin-Turbo', coolFactor: 90 },
    { name: 'Mercedes-AMG GT Black Series', emoji: '&#128672;', category: 'Supercar', topSpeed: 325, hp: 720, acceleration: 3.1, weight: 1550, engine: 'V8 4.0L Twin-Turbo', coolFactor: 95 },
    { name: 'Mercedes-AMG One', emoji: '&#128672;', category: 'Hypercar', topSpeed: 352, hp: 1049, acceleration: 2.9, weight: 1695, engine: 'V6 1.6L F1 Hybrid', coolFactor: 99 },
    { name: 'Nissan GT-R Nismo', emoji: '&#128663;', category: 'Sports Car', topSpeed: 315, hp: 600, acceleration: 2.5, weight: 1720, engine: 'V6 3.8L Twin-Turbo', coolFactor: 89 },
    { name: 'Nissan GT-R', emoji: '&#128663;', category: 'Sports Car', topSpeed: 315, hp: 565, acceleration: 2.7, weight: 1752, engine: 'V6 3.8L Twin-Turbo', coolFactor: 88 },
    { name: 'Toyota Supra', emoji: '&#128663;', category: 'Sports Car', topSpeed: 250, hp: 382, acceleration: 3.9, weight: 1540, engine: 'I6 3.0L Turbo', coolFactor: 86 },
    { name: 'Toyota GR86', emoji: '&#128663;', category: 'Sports Car', topSpeed: 226, hp: 228, acceleration: 6.1, weight: 1270, engine: 'Flat-4 2.4L', coolFactor: 78 },
    { name: 'Mazda MX-5 Miata', emoji: '&#128663;', category: 'Sports Car', topSpeed: 219, hp: 181, acceleration: 5.8, weight: 1060, engine: 'I4 2.0L', coolFactor: 76 },
    { name: 'Subaru BRZ', emoji: '&#128663;', category: 'Sports Car', topSpeed: 226, hp: 228, acceleration: 6.1, weight: 1275, engine: 'Flat-4 2.4L', coolFactor: 75 },
    { name: 'Honda NSX', emoji: '&#128663;', category: 'Supercar', topSpeed: 307, hp: 573, acceleration: 3.0, weight: 1725, engine: 'V6 3.5L Hybrid', coolFactor: 88 },
    { name: 'Lexus LFA', emoji: '&#128663;', category: 'Supercar', topSpeed: 326, hp: 552, acceleration: 3.7, weight: 1480, engine: 'V10 4.8L', coolFactor: 94 },
    { name: 'Alpine A110', emoji: '&#128663;', category: 'Sports Car', topSpeed: 250, hp: 292, acceleration: 4.2, weight: 1098, engine: 'I4 1.8L Turbo', coolFactor: 82 },
    { name: 'Lotus Emira', emoji: '&#128663;', category: 'Sports Car', topSpeed: 290, hp: 400, acceleration: 4.2, weight: 1405, engine: 'V6 3.5L Supercharged', coolFactor: 84 },

    // === MUSCLE CARS ===
    { name: 'Ford Mustang GT', emoji: '&#128663;', category: 'Muscle Car', topSpeed: 250, hp: 450, acceleration: 4.2, weight: 1735, engine: 'V8 5.0L', coolFactor: 82 },
    { name: 'Ford Mustang Shelby GT500', emoji: '&#128663;', category: 'Muscle Car', topSpeed: 290, hp: 760, acceleration: 3.3, weight: 1916, engine: 'V8 5.2L Supercharged', coolFactor: 92 },
    { name: 'Dodge Challenger Hellcat', emoji: '&#128663;', category: 'Muscle Car', topSpeed: 328, hp: 717, acceleration: 3.4, weight: 2025, engine: 'V8 6.2L Supercharged', coolFactor: 91 },
    { name: 'Dodge Challenger Demon', emoji: '&#128663;', category: 'Muscle Car', topSpeed: 270, hp: 840, acceleration: 2.3, weight: 1894, engine: 'V8 6.2L Supercharged', coolFactor: 95 },
    { name: 'Chevrolet Camaro ZL1', emoji: '&#128663;', category: 'Muscle Car', topSpeed: 318, hp: 650, acceleration: 3.5, weight: 1790, engine: 'V8 6.2L Supercharged', coolFactor: 88 },
    { name: 'Chevrolet Corvette Stingray', emoji: '&#128663;', category: 'Sports Car', topSpeed: 312, hp: 490, acceleration: 2.9, weight: 1527, engine: 'V8 6.2L', coolFactor: 90 },

    // === ELECTRIC ===
    { name: 'Tesla Model S Plaid', emoji: '&#9889;', category: 'Electric', topSpeed: 322, hp: 1020, acceleration: 1.99, weight: 2162, engine: 'Tri-Motor Electric', coolFactor: 91 },
    { name: 'Tesla Model 3', emoji: '&#9889;', category: 'Electric', topSpeed: 261, hp: 480, acceleration: 3.1, weight: 1830, engine: 'Dual-Motor Electric', coolFactor: 80 },
    { name: 'Tesla Model X Plaid', emoji: '&#9889;', category: 'Electric', topSpeed: 262, hp: 1020, acceleration: 2.5, weight: 2455, engine: 'Tri-Motor Electric', coolFactor: 86 },
    { name: 'Tesla Cybertruck', emoji: '&#9889;', category: 'Electric Truck', topSpeed: 209, hp: 845, acceleration: 2.6, weight: 3104, engine: 'Tri-Motor Electric', coolFactor: 88 },
    { name: 'Tesla Roadster (2025)', emoji: '&#9889;', category: 'Electric', topSpeed: 400, hp: 1000, acceleration: 1.9, weight: 1800, engine: 'Tri-Motor Electric', coolFactor: 96 },
    { name: 'Lucid Air Sapphire', emoji: '&#9889;', category: 'Electric', topSpeed: 330, hp: 1234, acceleration: 1.89, weight: 2360, engine: 'Tri-Motor Electric', coolFactor: 92 },
    { name: 'Rivian R1T', emoji: '&#9889;', category: 'Electric Truck', topSpeed: 201, hp: 835, acceleration: 3.0, weight: 3075, engine: 'Quad-Motor Electric', coolFactor: 82 },
    { name: 'Hyundai Ioniq 5 N', emoji: '&#9889;', category: 'Electric', topSpeed: 260, hp: 601, acceleration: 3.4, weight: 2190, engine: 'Dual-Motor Electric', coolFactor: 83 },
    { name: 'BMW iX M60', emoji: '&#9889;', category: 'Electric SUV', topSpeed: 250, hp: 610, acceleration: 3.8, weight: 2580, engine: 'Dual-Motor Electric', coolFactor: 80 },

    // === LUXURY ===
    { name: 'Rolls-Royce Ghost', emoji: '&#128663;', category: 'Luxury', topSpeed: 250, hp: 563, acceleration: 4.6, weight: 2490, engine: 'V12 6.75L Twin-Turbo', coolFactor: 88 },
    { name: 'Rolls-Royce Phantom', emoji: '&#128663;', category: 'Luxury', topSpeed: 250, hp: 563, acceleration: 5.1, weight: 2560, engine: 'V12 6.75L Twin-Turbo', coolFactor: 90 },
    { name: 'Rolls-Royce Spectre', emoji: '&#9889;', category: 'Electric Luxury', topSpeed: 250, hp: 577, acceleration: 4.5, weight: 2975, engine: 'Dual-Motor Electric', coolFactor: 89 },
    { name: 'Bentley Continental GT', emoji: '&#128663;', category: 'Luxury', topSpeed: 333, hp: 650, acceleration: 3.6, weight: 2164, engine: 'W12 6.0L Twin-Turbo', coolFactor: 87 },
    { name: 'Mercedes-Maybach S680', emoji: '&#128663;', category: 'Luxury', topSpeed: 250, hp: 621, acceleration: 4.5, weight: 2345, engine: 'V12 6.0L Twin-Turbo', coolFactor: 86 },

    // === SUVs ===
    { name: 'Range Rover Sport SVR', emoji: '&#128665;', category: 'SUV', topSpeed: 283, hp: 575, acceleration: 4.3, weight: 2310, engine: 'V8 5.0L Supercharged', coolFactor: 84 },
    { name: 'Mercedes-AMG G63', emoji: '&#128665;', category: 'SUV', topSpeed: 220, hp: 577, acceleration: 4.5, weight: 2560, engine: 'V8 4.0L Twin-Turbo', coolFactor: 88 },
    { name: 'BMW X5 M', emoji: '&#128665;', category: 'SUV', topSpeed: 290, hp: 617, acceleration: 3.8, weight: 2370, engine: 'V8 4.4L Twin-Turbo', coolFactor: 82 },
    { name: 'Porsche Cayenne Turbo GT', emoji: '&#128665;', category: 'SUV', topSpeed: 300, hp: 631, acceleration: 3.3, weight: 2220, engine: 'V8 4.0L Twin-Turbo', coolFactor: 86 },
    { name: 'Jeep Grand Cherokee Trackhawk', emoji: '&#128665;', category: 'SUV', topSpeed: 290, hp: 707, acceleration: 3.5, weight: 2433, engine: 'V8 6.2L Supercharged', coolFactor: 85 },
    { name: 'Ferrari Purosangue', emoji: '&#128665;', category: 'Super SUV', topSpeed: 310, hp: 715, acceleration: 3.3, weight: 2033, engine: 'V12 6.5L', coolFactor: 93 },
    { name: 'Aston Martin DBX707', emoji: '&#128665;', category: 'Super SUV', topSpeed: 310, hp: 697, acceleration: 3.3, weight: 2245, engine: 'V8 4.0L Twin-Turbo', coolFactor: 89 },

    // === INDIAN FAVOURITES ===
    { name: 'Mahindra Thar', emoji: '&#128665;', category: 'Off-Road', topSpeed: 155, hp: 150, acceleration: 11.5, weight: 1750, engine: 'I4 2.0L Turbo', coolFactor: 78 },
    { name: 'Mahindra Scorpio N', emoji: '&#128665;', category: 'SUV', topSpeed: 180, hp: 175, acceleration: 9.5, weight: 1857, engine: 'I4 2.0L Turbo', coolFactor: 72 },
    { name: 'Mahindra XUV700', emoji: '&#128665;', category: 'SUV', topSpeed: 200, hp: 200, acceleration: 8.5, weight: 1755, engine: 'I4 2.0L Turbo', coolFactor: 74 },
    { name: 'Tata Safari', emoji: '&#128665;', category: 'SUV', topSpeed: 180, hp: 170, acceleration: 10.0, weight: 1755, engine: 'I4 2.0L Turbo Diesel', coolFactor: 70 },
    { name: 'Tata Harrier', emoji: '&#128665;', category: 'SUV', topSpeed: 180, hp: 170, acceleration: 10.2, weight: 1685, engine: 'I4 2.0L Turbo Diesel', coolFactor: 71 },
    { name: 'Tata Nexon EV', emoji: '&#9889;', category: 'Electric', topSpeed: 140, hp: 143, acceleration: 9.0, weight: 1400, engine: 'Single-Motor Electric', coolFactor: 68 },
    { name: 'Hyundai Creta', emoji: '&#128665;', category: 'SUV', topSpeed: 185, hp: 158, acceleration: 9.5, weight: 1350, engine: 'I4 1.5L Turbo', coolFactor: 65 },
    { name: 'Maruti Swift', emoji: '&#128663;', category: 'Hatchback', topSpeed: 170, hp: 82, acceleration: 12.0, weight: 880, engine: 'I4 1.2L', coolFactor: 55 },
    { name: 'Maruti Baleno', emoji: '&#128663;', category: 'Hatchback', topSpeed: 180, hp: 89, acceleration: 11.5, weight: 960, engine: 'I4 1.2L', coolFactor: 58 },

    // === F1 / RACE INSPIRED ===
    { name: 'Mercedes-AMG Project One', emoji: '&#128672;', category: 'Hypercar', topSpeed: 352, hp: 1049, acceleration: 2.9, weight: 1695, engine: 'V6 1.6L F1 Hybrid', coolFactor: 99 },
    { name: 'Red Bull RB17', emoji: '&#128672;', category: 'Hypercar', topSpeed: 370, hp: 1200, acceleration: 2.5, weight: 900, engine: 'V8 Cosworth Hybrid', coolFactor: 98 },
    { name: 'Gordon Murray T.50', emoji: '&#128672;', category: 'Supercar', topSpeed: 340, hp: 654, acceleration: 2.8, weight: 986, engine: 'V12 3.9L', coolFactor: 97 },

    // === CLASSIC LEGENDS ===
    { name: 'DeLorean DMC-12', emoji: '&#128663;', category: 'Classic', topSpeed: 195, hp: 130, acceleration: 10.5, weight: 1230, engine: 'V6 2.85L', coolFactor: 90 },
    { name: 'Toyota AE86', emoji: '&#128663;', category: 'Classic', topSpeed: 190, hp: 128, acceleration: 8.5, weight: 940, engine: 'I4 1.6L', coolFactor: 85 },
    { name: 'Nissan Skyline R34 GT-R', emoji: '&#128663;', category: 'Classic', topSpeed: 310, hp: 276, acceleration: 4.8, weight: 1540, engine: 'I6 2.6L Twin-Turbo', coolFactor: 95 },
    { name: 'Mitsubishi Lancer Evo IX', emoji: '&#128663;', category: 'Classic', topSpeed: 252, hp: 286, acceleration: 4.3, weight: 1410, engine: 'I4 2.0L Turbo', coolFactor: 88 },
];

// API config
const API_KEY = 'wYrTciIzNnNLNOZTaEY6VAECURSYirLGeRHKYsmq';
const API_URL = 'https://api.api-ninjas.com/v1/cars';

// Selected cars (can be local DB object or API-fetched object)
let selectedCar = { car1: null, car2: null };
let highlightIndex = { car1: -1, car2: -1 };
let searchTimers = { car1: null, car2: null };

// Setup search for both pickers
setupSearch('car1');
setupSearch('car2');

function setupSearch(prefix) {
    const input = document.getElementById(`${prefix}-search`);
    const resultsEl = document.getElementById(`${prefix}-results`);

    input.addEventListener('focus', () => {
        showResults(prefix, input.value.trim(), []);
    });

    input.addEventListener('input', () => {
        highlightIndex[prefix] = -1;
        const query = input.value.trim();

        if (query === '') {
            selectedCar[prefix] = null;
            clearCard(prefix);
            updateComparison();
            showResults(prefix, '', []);
            return;
        }

        // Show local results immediately
        const localMatches = filterLocalCars(query);
        showResults(prefix, query, localMatches);

        // Debounce API search
        clearTimeout(searchTimers[prefix]);
        if (query.length >= 2) {
            searchTimers[prefix] = setTimeout(() => {
                searchAPI(prefix, query, localMatches);
            }, 400);
        }
    });

    input.addEventListener('keydown', (e) => {
        const items = resultsEl.querySelectorAll('.search-result-item[data-index], .search-result-item[data-api]');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            highlightIndex[prefix] = Math.min(highlightIndex[prefix] + 1, items.length - 1);
            updateHighlight(prefix, items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            highlightIndex[prefix] = Math.max(highlightIndex[prefix] - 1, 0);
            updateHighlight(prefix, items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightIndex[prefix] >= 0 && highlightIndex[prefix] < items.length) {
                items[highlightIndex[prefix]].click();
            }
        } else if (e.key === 'Escape') {
            resultsEl.classList.remove('open');
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest(`#${prefix}-picker`)) {
            resultsEl.classList.remove('open');
        }
    });
}

async function searchAPI(prefix, query, localMatches) {
    // Try searching by make (first word) and model (rest)
    const words = query.toLowerCase().split(/\s+/);
    const make = words[0];
    const model = words.slice(1).join(' ');

    let url = `${API_URL}?make=${encodeURIComponent(make)}`;
    if (model) url += `&model=${encodeURIComponent(model)}`;

    try {
        const res = await fetch(url, {
            headers: { 'X-Api-Key': API_KEY }
        });
        if (!res.ok) return;

        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return;

        // Check if input hasn't changed while we were fetching
        const currentQuery = document.getElementById(`${prefix}-search`).value.trim();
        if (currentQuery.toLowerCase() !== query.toLowerCase()) return;

        // De-duplicate: remove API results that match local DB entries
        const localNames = new Set(localMatches.map(m => m.car.name.toLowerCase()));
        const apiResults = [];
        const seen = new Set();

        data.forEach(item => {
            const name = capitalize(item.make) + ' ' + capitalize(item.model);
            const key = name.toLowerCase();
            if (!localNames.has(key) && !seen.has(key)) {
                seen.add(key);
                apiResults.push(apiToCar(item));
            }
        });

        // Re-render with local + API results
        showResults(prefix, query, localMatches, apiResults);
    } catch (err) {
        // Silently fail — local results are still shown
    }
}

function apiToCar(item) {
    const name = capitalize(item.make) + ' ' + capitalize(item.model);
    const engineSize = item.displacement ? `${item.displacement}L` : '';
    const cylStr = item.cylinders ? `${item.cylinders}-cyl` : '';
    const engineParts = [cylStr, engineSize].filter(Boolean).join(' ');

    return {
        name: name,
        emoji: item.fuel_type === 'electricity' ? '&#9889;' : '&#128663;',
        category: capitalize(item.class || item.fuel_type || 'Car'),
        engine: engineParts || 'N/A',
        cylinders: item.cylinders || null,
        displacement: item.displacement || null,
        drive: item.drive ? item.drive.toUpperCase() : 'N/A',
        fuelType: capitalize(item.fuel_type || ''),
        transmission: item.transmission === 'a' ? 'Automatic' : item.transmission === 'm' ? 'Manual' : 'N/A',
        year: item.year || null,
        // These are not available from the API
        hp: null,
        topSpeed: null,
        acceleration: null,
        weight: null,
        coolFactor: null,
        isAPI: true,
    };
}

function capitalize(str) {
    if (!str) return '';
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function showResults(prefix, query, localMatches, apiResults) {
    const resultsEl = document.getElementById(`${prefix}-results`);
    apiResults = apiResults || [];

    if (!query) {
        // Show all local cars
        localMatches = cars.map((car, index) => ({ car, index, highlighted: car.name }));
    }

    if (localMatches.length === 0 && apiResults.length === 0) {
        resultsEl.innerHTML = '<div class="search-result-item" style="opacity:0.5;cursor:default">No cars found</div>';
        resultsEl.classList.add('open');
        return;
    }

    let html = '';

    // Local results
    if (localMatches.length > 0) {
        if (apiResults.length > 0) {
            html += '<div class="results-section-label">&#11088; Full Specs</div>';
        }
        html += localMatches.map(({ car, index, highlighted }) => `
            <div class="search-result-item" data-index="${index}">
                <span>${highlighted}</span>
                <span class="car-category">${car.category}</span>
            </div>
        `).join('');
    }

    // API results
    if (apiResults.length > 0) {
        html += '<div class="results-section-label">&#127760; From Internet</div>';
        html += apiResults.map((car, i) => `
            <div class="search-result-item" data-api="${i}">
                <span>${car.name}</span>
                <span class="car-category">${car.category}${car.year ? ' · ' + car.year : ''}</span>
            </div>
        `).join('');
    }

    resultsEl.innerHTML = html;

    // Attach click handlers for local results
    resultsEl.querySelectorAll('.search-result-item[data-index]').forEach(item => {
        item.addEventListener('click', () => {
            const idx = parseInt(item.dataset.index);
            selectLocalCar(prefix, idx);
        });
    });

    // Attach click handlers for API results
    resultsEl.querySelectorAll('.search-result-item[data-api]').forEach(item => {
        item.addEventListener('click', () => {
            const idx = parseInt(item.dataset.api);
            selectAPICar(prefix, apiResults[idx]);
        });
    });

    resultsEl.classList.add('open');
}

function filterLocalCars(query) {
    if (!query) return cars.map((car, index) => ({ car, index, highlighted: car.name }));

    const lower = query.toLowerCase();
    const results = [];

    cars.forEach((car, index) => {
        const name = car.name.toLowerCase();
        const catMatch = car.category.toLowerCase().includes(lower);
        const nameMatch = name.includes(lower);

        if (nameMatch || catMatch) {
            let highlighted = car.name;
            if (nameMatch) {
                const matchStart = name.indexOf(lower);
                highlighted =
                    car.name.slice(0, matchStart) +
                    '<span class="match-highlight">' +
                    car.name.slice(matchStart, matchStart + query.length) +
                    '</span>' +
                    car.name.slice(matchStart + query.length);
            }
            results.push({ car, index, highlighted });
        }
    });

    return results;
}

function updateHighlight(prefix, items) {
    items.forEach((item, i) => {
        item.classList.toggle('highlighted', i === highlightIndex[prefix]);
    });
    if (highlightIndex[prefix] >= 0) {
        items[highlightIndex[prefix]].scrollIntoView({ block: 'nearest' });
    }
}

function selectLocalCar(prefix, index) {
    selectedCar[prefix] = cars[index];
    const car = cars[index];
    const input = document.getElementById(`${prefix}-search`);
    const resultsEl = document.getElementById(`${prefix}-results`);

    input.value = car.name;
    resultsEl.classList.remove('open');
    highlightIndex[prefix] = -1;

    renderCarCard(car, prefix);
    updateComparison();
}

function selectAPICar(prefix, car) {
    selectedCar[prefix] = car;
    const input = document.getElementById(`${prefix}-search`);
    const resultsEl = document.getElementById(`${prefix}-results`);

    input.value = car.name;
    resultsEl.classList.remove('open');
    highlightIndex[prefix] = -1;

    renderCarCard(car, prefix);
    updateComparison();
}

function renderCarCard(car, prefix) {
    document.getElementById(`${prefix}-emoji`).innerHTML = car.emoji;
    document.getElementById(`${prefix}-name`).textContent = car.name;
    document.getElementById(`${prefix}-card`).classList.add('active');

    const statsEl = document.getElementById(`${prefix}-stats`);

    if (car.isAPI) {
        // Show API-available data
        let rows = '';
        rows += `<div class="stat-row"><span class="stat-label">Category</span><span class="stat-value">${car.category}</span></div>`;
        if (car.year) rows += `<div class="stat-row"><span class="stat-label">Year</span><span class="stat-value">${car.year}</span></div>`;
        rows += `<div class="stat-row"><span class="stat-label">Engine</span><span class="stat-value">${car.engine}</span></div>`;
        rows += `<div class="stat-row"><span class="stat-label">Drive</span><span class="stat-value">${car.drive}</span></div>`;
        rows += `<div class="stat-row"><span class="stat-label">Fuel</span><span class="stat-value">${car.fuelType}</span></div>`;
        rows += `<div class="stat-row"><span class="stat-label">Transmission</span><span class="stat-value">${car.transmission}</span></div>`;
        statsEl.innerHTML = rows;
    } else {
        statsEl.innerHTML = `
            <div class="stat-row"><span class="stat-label">Category</span><span class="stat-value">${car.category}</span></div>
            <div class="stat-row"><span class="stat-label">Engine</span><span class="stat-value">${car.engine}</span></div>
            <div class="stat-row"><span class="stat-label">Power</span><span class="stat-value">${car.hp} HP</span></div>
            <div class="stat-row"><span class="stat-label">Top Speed</span><span class="stat-value">${car.topSpeed} km/h</span></div>
            <div class="stat-row"><span class="stat-label">0-100 km/h</span><span class="stat-value">${car.acceleration}s</span></div>
            <div class="stat-row"><span class="stat-label">Weight</span><span class="stat-value">${car.weight} kg</span></div>
        `;
    }
}

function clearCard(prefix) {
    document.getElementById(`${prefix}-emoji`).innerHTML = '';
    document.getElementById(`${prefix}-name`).textContent = '-';
    document.getElementById(`${prefix}-card`).classList.remove('active');
    document.getElementById(`${prefix}-stats`).innerHTML = '';
}

function updateComparison() {
    const compSection = document.getElementById('comparison');
    const c1 = selectedCar.car1;
    const c2 = selectedCar.car2;

    if (!c1 || !c2) {
        compSection.classList.remove('active');
        return;
    }

    compSection.classList.add('active');
    renderBars(c1, c2);
    renderVerdict(c1, c2);
}

function renderBars(c1, c2) {
    const container = document.getElementById('bars-container');

    // Full comparison metrics (when both have data)
    const allMetrics = [
        { label: 'Horsepower', key: 'hp', unit: ' HP', higherBetter: true },
        { label: 'Top Speed', key: 'topSpeed', unit: ' km/h', higherBetter: true },
        { label: '0-100 km/h', key: 'acceleration', unit: 's', higherBetter: false },
        { label: 'Weight', key: 'weight', unit: ' kg', higherBetter: false },
        { label: 'Cool Factor', key: 'coolFactor', unit: '/100', higherBetter: true },
    ];

    // Basic metrics for API cars
    const basicMetrics = [
        { label: 'Cylinders', key: 'cylinders', unit: '', higherBetter: true },
        { label: 'Engine Size', key: 'displacement', unit: 'L', higherBetter: true },
    ];

    const bothHaveFullData = !c1.isAPI && !c2.isAPI;

    let metrics;
    if (bothHaveFullData) {
        metrics = allMetrics;
    } else {
        // Use only metrics both cars have
        metrics = [];
        allMetrics.forEach(m => {
            if (c1[m.key] != null && c2[m.key] != null) metrics.push(m);
        });
        basicMetrics.forEach(m => {
            if (c1[m.key] != null && c2[m.key] != null) metrics.push(m);
        });
    }

    if (metrics.length === 0) {
        container.innerHTML = '<p style="text-align:center;opacity:0.6">Not enough shared data to compare these cars visually. Try picking a car from the &#11088; Full Specs list for the best comparison!</p>';
        return;
    }

    let html = '';

    metrics.forEach(m => {
        const v1 = c1[m.key];
        const v2 = c2[m.key];
        const total = v1 + v2;

        let w1 = (m.higherBetter ? (v1 / total) : (v2 / total)) * 100;
        let w2 = 100 - w1;

        const winner1 = m.higherBetter ? v1 > v2 : v1 < v2;
        const winner2 = m.higherBetter ? v2 > v1 : v2 < v1;
        const tie = v1 === v2;

        html += `
            <div class="bar-item">
                <div class="bar-label">${m.label}</div>
                <div class="bar-track">
                    <div class="bar-left${winner1 && !tie ? ' winner' : ''}" style="width:${w1}%">${v1}${m.unit}</div>
                    <div class="bar-right${winner2 && !tie ? ' winner' : ''}" style="width:${w2}%">${v2}${m.unit}</div>
                </div>
                <div class="bar-names">
                    <span>${c1.name.split(' ').slice(-1)}</span>
                    <span>${c2.name.split(' ').slice(-1)}</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderVerdict(c1, c2) {
    const el = document.getElementById('verdict');

    const checks = [
        { key: 'hp', higher: true },
        { key: 'topSpeed', higher: true },
        { key: 'acceleration', higher: false },
        { key: 'weight', higher: false },
        { key: 'coolFactor', higher: true },
        { key: 'cylinders', higher: true },
        { key: 'displacement', higher: true },
    ];

    let score1 = 0, score2 = 0, compared = 0;

    checks.forEach(({ key, higher }) => {
        const v1 = c1[key], v2 = c2[key];
        if (v1 == null || v2 == null) return;
        compared++;
        if (higher) {
            if (v1 > v2) score1++; else if (v2 > v1) score2++;
        } else {
            if (v1 < v2) score1++; else if (v2 < v1) score2++;
        }
    });

    if (compared === 0) {
        el.innerHTML = '<h3>&#129300; Can\'t decide!</h3><p>Not enough data to pick a winner. Try cars from the Full Specs list!</p>';
    } else if (score1 > score2) {
        el.innerHTML = `<h3>&#127942; <span class="winner-name">${c1.name}</span> wins!</h3><p>Winning ${score1} out of ${compared} categories</p>`;
    } else if (score2 > score1) {
        el.innerHTML = `<h3>&#127942; <span class="winner-name">${c2.name}</span> wins!</h3><p>Winning ${score2} out of ${compared} categories</p>`;
    } else {
        el.innerHTML = `<h3>&#129309; It's a tie!</h3><p>Both cars are equally matched!</p>`;
    }
}
