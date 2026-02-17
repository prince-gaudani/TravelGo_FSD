// ========================================
// TravelGo - Main JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    initAuth();
    initNavbar();
    initForms();
    initPasswordToggle();
    setMinDates();
    loadMyBookings();
    initHeroSlider();
    initReviewCarousel();
});



// ========================================
// Authentication Functions
// ========================================

function initAuth() {
    // Mandatory login gate - redirect to login if not on auth pages
    const currentPage = window.location.href.toLowerCase();
    const isAuthPage = currentPage.includes('login.html') || currentPage.includes('signup.html');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!isAuthPage && !isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }

    // If logged in and on auth page, redirect to index
    if (isAuthPage && isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    checkLoginState();

    // Login Form Handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const loginPhoneInput = document.querySelector('#loginForm input[type="tel"]');

            if (loginPhoneInput) {
                const loginPhone = loginPhoneInput.value.trim();
                if (loginPhone && !validatePhone(loginPhone)) {
                    showNotification('Please enter a valid phone number (10 digits, first digit cannot be 0).', 'error');
                    return;
                }
            }

            // Get stored users
            const users = JSON.parse(localStorage.getItem('travelgo_users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('userName', user.firstName);
                localStorage.setItem('userFullName', user.firstName + ' ' + user.lastName);

                showNotification('Login Successful! Welcome back, ' + user.firstName + '!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showNotification('Invalid email or password!', 'error');
            }
        });
    }

    // Logout Handling
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            handleLogout();
        });
    }

    // Profile Dropdown Toggle
    const profileTrigger = document.getElementById('profileTrigger');
    const profileDropdown = document.querySelector('.profile-dropdown');

    if (profileTrigger && profileDropdown) {
        profileTrigger.addEventListener('click', function (e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });

        document.addEventListener('click', function (e) {
            if (!profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });
    }
}

function checkLoginState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    updateAuthUI(isLoggedIn);
}

function updateAuthUI(isLoggedIn) {
    const authButtons = document.getElementById('authButtons');
    const navProfile = document.getElementById('navProfile');
    const profileName = document.querySelector('.profile-name');
    const profileImg = document.querySelector('.profile-img');

    if (isLoggedIn) {
        if (authButtons) authButtons.style.display = 'none';
        if (navProfile) {
            navProfile.style.display = 'block';
            const userName = localStorage.getItem('userName') || 'User';
            if (profileName) profileName.textContent = userName;
            if (profileImg) profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4f46e5&color=fff`;
        }
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (navProfile) navProfile.style.display = 'none';
    }
}

function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userFullName');

    showNotification('Logged out successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// ========================================
// Booking Wizard Data
// ========================================

let bookingData = {
    destination: '',
    destinationType: 'domestic',
    basePrice: 0,
    transportType: '',
    fromCity: '',
    travelDate: '',
    numTravelers: 1,
    selectedOption: null,
    travelers: [],
    idProofs: []
};

// Available Flights Data
const flightsData = [
    { id: 'FL001', airline: 'IndiGo', logo: '6E', departure: '06:00', arrival: '08:30', duration: '2h 30m', price: 4599, seats: 12, type: 'Non-Stop' },
    { id: 'FL002', airline: 'Air India', logo: 'AI', departure: '08:15', arrival: '10:45', duration: '2h 30m', price: 5299, seats: 8, type: 'Non-Stop' },
    { id: 'FL003', airline: 'SpiceJet', logo: 'SG', departure: '10:30', arrival: '13:15', duration: '2h 45m', price: 3999, seats: 15, type: 'Non-Stop' },
    { id: 'FL004', airline: 'Vistara', logo: 'UK', departure: '14:00', arrival: '16:30', duration: '2h 30m', price: 6199, seats: 5, type: 'Non-Stop' },
    { id: 'FL005', airline: 'Go First', logo: 'G8', departure: '16:45', arrival: '19:30', duration: '2h 45m', price: 3599, seats: 20, type: 'Non-Stop' },
    { id: 'FL006', airline: 'Akasa Air', logo: 'QP', departure: '19:00', arrival: '21:30', duration: '2h 30m', price: 4199, seats: 10, type: 'Non-Stop' },
    { id: 'FL007', airline: 'IndiGo', logo: '6E', departure: '21:30', arrival: '00:15', duration: '2h 45m', price: 3799, seats: 18, type: 'Non-Stop' },
    { id: 'FL008', airline: 'Air India Express', logo: 'IX', departure: '05:30', arrival: '09:00', duration: '3h 30m', price: 3299, seats: 25, type: '1 Stop' }
];

// Available Buses Data
const busesData = [
    { id: 'BUS001', operator: 'VRL Travels', type: 'Volvo Multi-Axle', departure: '18:00', arrival: '06:00', duration: '12h', price: 1499, seats: 20, amenities: ['AC', 'Sleeper', 'Charging'] },
    { id: 'BUS002', operator: 'SRS Travels', type: 'AC Sleeper', departure: '19:00', arrival: '07:30', duration: '12h 30m', price: 1299, seats: 15, amenities: ['AC', 'Sleeper'] },
    { id: 'BUS003', operator: 'Orange Travels', type: 'Volvo AC Seater', departure: '20:00', arrival: '08:00', duration: '12h', price: 999, seats: 30, amenities: ['AC', 'Seater', 'WiFi'] },
    { id: 'BUS004', operator: 'Neeta Travels', type: 'AC Sleeper 2+1', departure: '21:00', arrival: '09:00', duration: '12h', price: 1799, seats: 10, amenities: ['AC', 'Sleeper', 'Charging', 'Blanket'] },
    { id: 'BUS005', operator: 'Paulo Travels', type: 'Mercedes Multi-Axle', departure: '22:00', arrival: '10:00', duration: '12h', price: 2199, seats: 8, amenities: ['AC', 'Sleeper', 'WiFi', 'Entertainment'] },
    { id: 'BUS006', operator: 'Shrinath Travels', type: 'AC Seater', departure: '23:00', arrival: '11:00', duration: '12h', price: 799, seats: 35, amenities: ['AC', 'Seater'] },
    { id: 'BUS007', operator: 'KSRTC', type: 'Airavat Club Class', departure: '17:00', arrival: '05:00', duration: '12h', price: 1599, seats: 12, amenities: ['AC', 'Sleeper', 'Charging'] },
    { id: 'BUS008', operator: 'RedBus Prima', type: 'Volvo Sleeper', departure: '16:00', arrival: '04:00', duration: '12h', price: 1899, seats: 6, amenities: ['AC', 'Sleeper', 'WiFi', 'Snacks'] }
];

// Available Trains Data
const trainsData = [
    { id: 'TR001', name: 'Rajdhani Express', number: '12951', departure: '16:55', arrival: '08:35', duration: '15h 40m', price: 2150, class: '3A', seats: 50 },
    { id: 'TR002', name: 'Shatabdi Express', number: '12002', departure: '06:00', arrival: '14:00', duration: '8h', price: 1550, class: 'CC', seats: 40 },
    { id: 'TR003', name: 'Duronto Express', number: '12213', departure: '23:00', arrival: '11:00', duration: '12h', price: 1850, class: '2A', seats: 30 },
    { id: 'TR004', name: 'Garib Rath', number: '12909', departure: '17:30', arrival: '07:30', duration: '14h', price: 750, class: '3A', seats: 80 },
    { id: 'TR005', name: 'Jan Shatabdi', number: '12051', departure: '05:30', arrival: '14:30', duration: '9h', price: 650, class: 'CC', seats: 60 },
    { id: 'TR006', name: 'Superfast Express', number: '12627', departure: '22:00', arrival: '10:00', duration: '12h', price: 550, class: 'SL', seats: 100 }
];

// ========================================
// Navbar Functionality
// ========================================

function initNavbar() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navButtons = document.querySelector('.nav-buttons');

    if (hamburger) {
        hamburger.addEventListener('click', function () {
            const isOpen = navLinks?.classList.toggle('active');
            navButtons?.classList.toggle('active');
            hamburger.classList.toggle('active');
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function () {
            navLinks?.classList.remove('active');
            navButtons?.classList.remove('active');
            hamburger?.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    window.addEventListener('scroll', function () {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.boxShadow = window.scrollY > 50
                ? '0 4px 20px rgba(0, 0, 0, 0.1)'
                : '0 4px 6px -1px rgb(0 0 0 / 0.1)';
        }
    });
}

// ========================================
// Booking Wizard Functions
// ========================================

function startBooking(button) {
    const card = button.closest('.destination-card') || button.closest('.tour-card');
    bookingData.destination = card.dataset.name;
    bookingData.basePrice = parseInt(card.dataset.price);
    bookingData.destinationType = card.dataset.type === 'international' ? 'international' : 'domestic';

    document.getElementById('wizardDestination').textContent = bookingData.destination;
    document.getElementById('bookingWizard').classList.add('active');
    document.body.style.overflow = 'hidden';

    // Reset wizard
    resetWizard();
}

function resetWizard() {
    bookingData.transportType = '';
    bookingData.selectedOption = null;
    bookingData.travelers = [];
    bookingData.idProofs = [];

    applyTransportOptionsByDestinationType();

    document.querySelectorAll('.transport-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('step1Next').disabled = true;
    document.getElementById('step2Next').disabled = true;

    goToStep(1);
}

function closeWizard() {
    document.getElementById('bookingWizard').classList.remove('active');
    document.body.style.overflow = '';
}

function selectTransport(type) {
    if (bookingData.destinationType === 'international' && type !== 'flight') {
        showNotification('For international trips, only flight booking is available.', 'info');
        return;
    }

    bookingData.transportType = type;

    const cards = document.querySelectorAll('.transport-card');
    cards.forEach(c => c.classList.remove('selected'));
    const types = ['flight', 'bus', 'train'];
    const index = types.indexOf(type);
    if (index !== -1 && cards[index]) cards[index].classList.add('selected');

    const fromCity = document.getElementById('fromCity').value;
    const travelDate = document.getElementById('travelDate').value;

    if (fromCity && travelDate) {
        document.getElementById('step1Next').disabled = false;
    }
}

function applyTransportOptionsByDestinationType() {
    const cards = Array.from(document.querySelectorAll('.transport-card'));
    if (!cards.length) return;

    cards.forEach((card, index) => {
        const transportType = index === 0 ? 'flight' : index === 1 ? 'bus' : 'train';
        const shouldShow = bookingData.destinationType !== 'international' || transportType === 'flight';
        card.style.display = shouldShow ? '' : 'none';
        card.classList.remove('selected');
    });

    if (bookingData.destinationType === 'international' && bookingData.transportType !== 'flight') {
        bookingData.transportType = '';
    }
}

function goToStep(step) {
    // Validate before proceeding
    if (step === 2) {
        const fromCity = document.getElementById('fromCity').value;
        const travelDate = document.getElementById('travelDate').value;
        const numTravelers = document.getElementById('numTravelers').value;

        if (!bookingData.transportType || !fromCity || !travelDate) {
            showNotification('Please select transport type, departure city, and travel date', 'error');
            return;
        }

        // Validate date is not in the past
        const today = new Date();
        const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        
        if (travelDate < todayStr) {
            showNotification('Travel date cannot be in the past!', 'error');
            return;
        }

        bookingData.fromCity = fromCity;
        bookingData.travelDate = travelDate;
        bookingData.numTravelers = parseInt(numTravelers);

        populateAvailableOptions();
    }

    if (step === 3) {
        if (!bookingData.selectedOption) {
            showNotification('Please select a ' + bookingData.transportType, 'error');
            return;
        }
        populateTravelerForms();
    }

    if (step === 4) {
        if (!validateTravelerForms()) {
            return;
        }
        saveTravelerData();
        populateIdUpload();
    }

    if (step === 5) {
        generatePreview();
    }

    // Update UI
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step' + step).classList.add('active');

    document.querySelectorAll('.progress-step').forEach((s, i) => {
        s.classList.remove('active', 'completed');
        if (i + 1 < step) s.classList.add('completed');
        if (i + 1 === step) s.classList.add('active');
    });
}

function populateAvailableOptions() {
    const container = document.getElementById('availableOptions');
    const titleEl = document.getElementById('transportTypeTitle');
    const routeEl = document.getElementById('routeInfo');

    const dateFormatted = new Date(bookingData.travelDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    routeEl.textContent = `${bookingData.fromCity} → ${bookingData.destination} | ${dateFormatted}`;

    let options = [];
    let html = '';

    if (bookingData.transportType === 'flight') {
        titleEl.textContent = 'Flights';
        options = flightsData;

        html = options.map(f => `
            <div class="option-card flight-card" onclick="selectOption('${f.id}', ${f.price})" data-id="${f.id}">
                <div class="option-main">
                    <div class="airline-info">
                        <div class="airline-logo">${f.logo}</div>
                        <div class="airline-name">${f.airline}</div>
                    </div>
                    <div class="timing-info">
                        <div class="time-block">
                            <span class="time">${f.departure}</span>
                            <span class="city">${bookingData.fromCity}</span>
                        </div>
                        <div class="duration-block">
                            <span class="duration">${f.duration}</span>
                            <div class="duration-line"><i class="fas fa-plane"></i></div>
                            <span class="stops">${f.type}</span>
                        </div>
                        <div class="time-block">
                            <span class="time">${f.arrival}</span>
                            <span class="city">${bookingData.destination}</span>
                        </div>
                    </div>
                    <div class="price-info">
                        <span class="price">₹${f.price.toLocaleString('en-IN')}</span>
                        <span class="per-person">per person</span>
                        <span class="seats-left">${f.seats} seats left</span>
                    </div>
                </div>
            </div>
        `).join('');

    } else if (bookingData.transportType === 'bus') {
        titleEl.textContent = 'Buses';
        options = busesData;

        html = options.map(b => `
            <div class="option-card bus-card" onclick="selectOption('${b.id}', ${b.price})" data-id="${b.id}">
                <div class="option-main">
                    <div class="operator-info">
                        <div class="operator-name">${b.operator}</div>
                        <div class="bus-type">${b.type}</div>
                        <div class="amenities">
                            ${b.amenities.map(a => `<span class="amenity">${a}</span>`).join('')}
                        </div>
                    </div>
                    <div class="timing-info">
                        <div class="time-block">
                            <span class="time">${b.departure}</span>
                            <span class="city">${bookingData.fromCity}</span>
                        </div>
                        <div class="duration-block">
                            <span class="duration">${b.duration}</span>
                            <div class="duration-line"><i class="fas fa-bus"></i></div>
                        </div>
                        <div class="time-block">
                            <span class="time">${b.arrival}</span>
                            <span class="city">${bookingData.destination}</span>
                        </div>
                    </div>
                    <div class="price-info">
                        <span class="price">₹${b.price.toLocaleString('en-IN')}</span>
                        <span class="per-person">per person</span>
                        <span class="seats-left">${b.seats} seats left</span>
                    </div>
                </div>
            </div>
        `).join('');

    } else {
        titleEl.textContent = 'Trains';
        options = trainsData;

        html = options.map(t => `
            <div class="option-card train-card" onclick="selectOption('${t.id}', ${t.price})" data-id="${t.id}">
                <div class="option-main">
                    <div class="train-info">
                        <div class="train-name">${t.name}</div>
                        <div class="train-number">#${t.number}</div>
                        <div class="train-class">Class: ${t.class}</div>
                    </div>
                    <div class="timing-info">
                        <div class="time-block">
                            <span class="time">${t.departure}</span>
                            <span class="city">${bookingData.fromCity}</span>
                        </div>
                        <div class="duration-block">
                            <span class="duration">${t.duration}</span>
                            <div class="duration-line"><i class="fas fa-train"></i></div>
                        </div>
                        <div class="time-block">
                            <span class="time">${t.arrival}</span>
                            <span class="city">${bookingData.destination}</span>
                        </div>
                    </div>
                    <div class="price-info">
                        <span class="price">₹${t.price.toLocaleString('en-IN')}</span>
                        <span class="per-person">per person</span>
                        <span class="seats-left">${t.seats} seats left</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    container.innerHTML = html;
}

function selectOption(id, price) {
    bookingData.selectedOption = { id, price };

    document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`.option-card[data-id="${id}"]`).classList.add('selected');
    document.getElementById('step2Next').disabled = false;
}

function populateTravelerForms() {
    const tabsContainer = document.getElementById('travelerTabs');
    const formContainer = document.getElementById('travelerFormContainer');

    // Initialize travelers array
    bookingData.travelers = [];
    for (let i = 0; i < bookingData.numTravelers; i++) {
        bookingData.travelers.push({
            name: '', age: '', gender: '', email: '', phone: '', passport: ''
        });
    }

    // Create tabs
    let tabsHtml = '';
    for (let i = 1; i <= bookingData.numTravelers; i++) {
        tabsHtml += `
            <button class="traveler-tab ${i === 1 ? 'active' : ''}" onclick="showTravelerForm(${i})" data-traveler="${i}">
                <i class="fas fa-user"></i> Traveler ${i}
                <span class="tab-status" id="status${i}"><i class="fas fa-circle"></i></span>
            </button>
        `;
    }
    tabsContainer.innerHTML = tabsHtml;

    // Show first traveler form
    showTravelerForm(1);
}

function showTravelerForm(num) {
    // Save current form data before switching
    const currentTab = document.querySelector('.traveler-tab.active');
    if (currentTab) {
        const currentNum = parseInt(currentTab.dataset.traveler);
        saveSingleTravelerData(currentNum);
    }

    // Update tabs
    document.querySelectorAll('.traveler-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.traveler-tab[data-traveler="${num}"]`).classList.add('active');

    const traveler = bookingData.travelers[num - 1] || {};
    const isInternational = bookingData.destinationType === 'international';

    const formHtml = `
        <div class="traveler-form" id="travelerForm${num}">
            <h3>Traveler ${num} Details</h3>
            <div class="form-row">
                <div class="form-group" id="nameGroup_${num}">
                    <label>Full Name (as per ID) <span class="required">*</span></label>
                    <input type="text" id="name_${num}" value="${traveler.name || ''}" placeholder="Enter full name (letters only)" required onblur="validateFieldOnBlur('name', ${num})">
                    <div class="error-message" id="nameError_${num}" style="display: none;"><i class="fas fa-exclamation-circle"></i> <span></span></div>
                </div>
                <div class="form-group" id="ageGroup_${num}">
                    <label>Age <span class="required">*</span></label>
                    <input type="number" id="age_${num}" value="${traveler.age || ''}" placeholder="Age (1-120)" min="1" max="120" required onblur="validateFieldOnBlur('age', ${num})">
                    <div class="error-message" id="ageError_${num}" style="display: none;"><i class="fas fa-exclamation-circle"></i> <span></span></div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group" id="genderGroup_${num}">
                    <label>Gender <span class="required">*</span></label>
                    <select id="gender_${num}" required>
                        <option value="">Select Gender</option>
                        <option value="Male" ${traveler.gender === 'Male' ? 'selected' : ''}>Male</option>
                        <option value="Female" ${traveler.gender === 'Female' ? 'selected' : ''}>Female</option>
                        <option value="Other" ${traveler.gender === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="form-group" id="emailGroup_${num}">
                    <label>Email ${num === 1 ? '<span class="required">*</span>' : ''}</label>
                    <input type="email" id="email_${num}" value="${traveler.email || ''}" placeholder="example@gmail.com" ${num === 1 ? 'required' : ''} onblur="validateFieldOnBlur('email', ${num})">
                    <div class="error-message" id="emailError_${num}" style="display: none;"><i class="fas fa-exclamation-circle"></i> <span></span></div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group" id="phoneGroup_${num}">
                    <label>Phone ${num === 1 ? '<span class="required">*</span>' : ''}</label>
                    <input type="tel" id="phone_${num}" value="${traveler.phone || ''}" placeholder="10-digit number" ${num === 1 ? 'required' : ''} onblur="validateFieldOnBlur('phone', ${num})">
                    <div class="error-message" id="phoneError_${num}" style="display: none;"><i class="fas fa-exclamation-circle"></i> <span></span></div>
                </div>
                ${isInternational ? `
                <div class="form-group">
                    <label>Passport Number <span class="required">*</span></label>
                    <input type="text" id="passport_${num}" value="${traveler.passport || ''}" placeholder="Passport number" required>
                </div>
                ` : ''}
            </div>
            <div class="form-navigation">
                ${num > 1 ? `<button type="button" class="btn btn-outline" onclick="showTravelerForm(${num - 1})"><i class="fas fa-arrow-left"></i> Previous</button>` : '<div></div>'}
                ${num < bookingData.numTravelers
            ? `<button type="button" class="btn btn-primary" onclick="saveAndNext(${num})">Save & Next <i class="fas fa-arrow-right"></i></button>`
            : `<button type="button" class="btn btn-success" onclick="saveAndNext(${num})"><i class="fas fa-check"></i> All Done</button>`
        }
            </div>
        </div>
    `;

    document.getElementById('travelerFormContainer').innerHTML = formHtml;
}

function validateFieldOnBlur(fieldType, num) {
    const field = document.getElementById(`${fieldType}_${num}`);
    const errorDiv = document.getElementById(`${fieldType}Error_${num}`);
    const group = document.getElementById(`${fieldType}Group_${num}`);

    if (!field || !errorDiv) return;

    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (fieldType) {
        case 'name':
            if (value && !validateName(value)) {
                isValid = false;
                errorMessage = 'Name must contain only letters (min 2 characters)';
            }
            break;
        case 'age':
            if (value && !validateAge(value)) {
                isValid = false;
                errorMessage = 'Age must be between 1 and 120';
            }
            break;
        case 'email':
            if (value && !validateEmail(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
        case 'phone':
            if (value && !validatePhone(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid 10-digit phone number (first digit cannot be 0)';
            }
            break;
    }

    if (!isValid) {
        field.classList.add('error');
        errorDiv.querySelector('span').textContent = errorMessage;
        errorDiv.style.display = 'flex';
        if (group) group.classList.add('has-error');
    } else {
        field.classList.remove('error');
        errorDiv.style.display = 'none';
        if (group) group.classList.remove('has-error');
    }
}

function saveSingleTravelerData(num) {
    const nameEl = document.getElementById(`name_${num}`);
    if (!nameEl) return;

    bookingData.travelers[num - 1] = {
        name: nameEl.value,
        age: document.getElementById(`age_${num}`)?.value || '',
        gender: document.getElementById(`gender_${num}`)?.value || '',
        email: document.getElementById(`email_${num}`)?.value || '',
        phone: document.getElementById(`phone_${num}`)?.value || '',
        passport: document.getElementById(`passport_${num}`)?.value || ''
    };

    // Update tab status
    const isComplete = nameEl.value && document.getElementById(`age_${num}`)?.value && document.getElementById(`gender_${num}`)?.value;
    const statusEl = document.getElementById(`status${num}`);
    if (statusEl) {
        statusEl.innerHTML = isComplete
            ? '<i class="fas fa-check-circle" style="color: #10b981;"></i>'
            : '<i class="fas fa-circle"></i>';
    }
}

function saveAndNext(num) {
    const name = document.getElementById(`name_${num}`)?.value?.trim();
    const age = document.getElementById(`age_${num}`)?.value?.trim();
    const gender = document.getElementById(`gender_${num}`)?.value;
    const email = document.getElementById(`email_${num}`)?.value?.trim();
    const phone = document.getElementById(`phone_${num}`)?.value?.trim();

    // Check required fields
    if (!name || !age || !gender) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Validate name
    if (!validateName(name)) {
        showNotification('Name must contain only letters (min 2 characters)', 'error');
        highlightError(`name_${num}`);
        return;
    }

    // Validate age
    if (!validateAge(age)) {
        showNotification('Age must be between 1 and 120', 'error');
        highlightError(`age_${num}`);
        return;
    }

    // For primary traveler, validate email and phone
    if (num === 1) {
        if (!email || !validateEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            highlightError(`email_${num}`);
            return;
        }
        if (!phone || !validatePhone(phone)) {
            showNotification('Please enter a valid 10-digit phone number (first digit cannot be 0)', 'error');
            highlightError(`phone_${num}`);
            return;
        }
    } else {
        // For other travelers, validate if provided
        if (email && !validateEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            highlightError(`email_${num}`);
            return;
        }
        if (phone && !validatePhone(phone)) {
            showNotification('Please enter a valid 10-digit phone number (first digit cannot be 0)', 'error');
            highlightError(`phone_${num}`);
            return;
        }
    }

    saveSingleTravelerData(num);

    if (num < bookingData.numTravelers) {
        showTravelerForm(num + 1);
    } else {
        showNotification('All traveler details saved!', 'success');
    }
}

function validateTravelerForms() {
    saveSingleTravelerData(parseInt(document.querySelector('.traveler-tab.active')?.dataset.traveler || 1));

    for (let i = 0; i < bookingData.numTravelers; i++) {
        const t = bookingData.travelers[i];
        const travelerNum = i + 1;

        // Validate required fields
        if (!t.name || !t.age || !t.gender) {
            showNotification(`Please complete details for Traveler ${travelerNum}`, 'error');
            showTravelerForm(travelerNum);
            return false;
        }

        // Validate name (only letters and spaces, min 2 chars)
        if (!validateName(t.name)) {
            showNotification(`Please enter a valid name for Traveler ${travelerNum} (letters only, min 2 characters)`, 'error');
            showTravelerForm(travelerNum);
            highlightError(`name_${travelerNum}`);
            return false;
        }

        // Validate age (1-120)
        if (!validateAge(t.age)) {
            showNotification(`Please enter a valid age for Traveler ${travelerNum} (1-120)`, 'error');
            showTravelerForm(travelerNum);
            highlightError(`age_${travelerNum}`);
            return false;
        }

        // Primary traveler must have email and phone
        if (i === 0) {
            if (!t.email || !validateEmail(t.email)) {
                showNotification('Please provide a valid email for primary traveler', 'error');
                showTravelerForm(1);
                highlightError('email_1');
                return false;
            }
            if (!t.phone || !validatePhone(t.phone)) {
                showNotification('Please provide a valid 10-digit phone number for primary traveler (first digit cannot be 0)', 'error');
                showTravelerForm(1);
                highlightError('phone_1');
                return false;
            }
        } else {
            // For other travelers, validate if provided
            if (t.email && !validateEmail(t.email)) {
                showNotification(`Please enter a valid email for Traveler ${travelerNum}`, 'error');
                showTravelerForm(travelerNum);
                highlightError(`email_${travelerNum}`);
                return false;
            }
            if (t.phone && !validatePhone(t.phone)) {
                showNotification(`Please enter a valid phone number for Traveler ${travelerNum} (first digit cannot be 0)`, 'error');
                showTravelerForm(travelerNum);
                highlightError(`phone_${travelerNum}`);
                return false;
            }
        }

        if (bookingData.destinationType === 'international' && !t.passport) {
            showNotification(`Please provide passport number for Traveler ${travelerNum}`, 'error');
            showTravelerForm(travelerNum);
            return false;
        }
    }
    return true;
}

// Validation Helper Functions
function validateName(name) {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name.trim());
}

function validateAge(age) {
    const ageNum = parseInt(age);
    return !isNaN(ageNum) && ageNum >= 1 && ageNum <= 120;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

function validatePhone(phone) {
    const phoneRegex = /^[1-9][0-9]{9}$/;
    return phoneRegex.test(phone.replace(/[\s\-]/g, ''));
}

function highlightError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('error');
        field.focus();

        // Remove error class on input
        field.addEventListener('input', function removeError() {
            field.classList.remove('error');
            field.removeEventListener('input', removeError);
        }, { once: true });
    }
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.remove('error');
    }
}

function saveTravelerData() {
    saveSingleTravelerData(parseInt(document.querySelector('.traveler-tab.active')?.dataset.traveler || 1));
}

function populateIdUpload() {
    const container = document.getElementById('idUploadSection');

    let html = '';
    for (let i = 1; i <= bookingData.numTravelers; i++) {
        const traveler = bookingData.travelers[i - 1];
        html += `
            <div class="id-upload-card">
                <div class="upload-header">
                    <i class="fas fa-user"></i>
                    <span>${traveler.name || 'Traveler ' + i}</span>
                </div>
                <div class="upload-body">
                    <label class="upload-area" id="uploadArea${i}">
                        <input type="file" accept="image/*,.pdf" onchange="handleFileUpload(${i}, this)" hidden>
                        <div class="upload-placeholder" id="placeholder${i}">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Click to upload ID proof</p>
                            <span>Aadhar, PAN, Passport, Driving License</span>
                        </div>
                        <div class="upload-preview" id="preview${i}" style="display:none;">
                            <img src="" alt="ID Preview" id="previewImg${i}">
                            <span class="file-name" id="fileName${i}"></span>
                        </div>
                    </label>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

function handleFileUpload(num, input) {
    const file = input.files[0];
    if (!file) return;

    bookingData.idProofs[num - 1] = file;

    const placeholder = document.getElementById(`placeholder${num}`);
    const preview = document.getElementById(`preview${num}`);
    const previewImg = document.getElementById(`previewImg${num}`);
    const fileName = document.getElementById(`fileName${num}`);

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        previewImg.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234f46e5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/></svg>';
    }

    fileName.textContent = file.name;
    placeholder.style.display = 'none';
    preview.style.display = 'flex';

    showNotification(`ID proof uploaded for ${bookingData.travelers[num - 1]?.name || 'Traveler ' + num}`, 'success');
}

function generatePreview() {
    const container = document.getElementById('previewContent');

    const transportPrice = bookingData.selectedOption?.price || 0;
    const totalTransport = transportPrice * bookingData.numTravelers;
    const packagePrice = bookingData.basePrice * bookingData.numTravelers;
    const taxes = Math.round((totalTransport + packagePrice) * 0.18);
    const grandTotal = totalTransport + packagePrice + taxes;

    document.getElementById('finalTotal').textContent = grandTotal.toLocaleString('en-IN');

    // Get selected option details
    let optionDetails = '';
    const optionData = getSelectedOptionData();
    if (optionData) {
        if (bookingData.transportType === 'flight') {
            optionDetails = `${optionData.airline} | ${optionData.departure} - ${optionData.arrival}`;
        } else if (bookingData.transportType === 'bus') {
            optionDetails = `${optionData.operator} (${optionData.type}) | ${optionData.departure} - ${optionData.arrival}`;
        } else {
            optionDetails = `${optionData.name} #${optionData.number} | ${optionData.departure} - ${optionData.arrival}`;
        }
    }

    let travelersHtml = bookingData.travelers.map((t, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${t.name}</td>
            <td>${t.age}</td>
            <td>${t.gender}</td>
            <td>${bookingData.destinationType === 'international' ? t.passport : 'N/A'}</td>
            <td>${bookingData.idProofs[i] ? '<i class="fas fa-check-circle" style="color:#10b981;"></i>' : '<i class="fas fa-times-circle" style="color:#ef4444;"></i>'}</td>
        </tr>
    `).join('');

    container.innerHTML = `
        <div class="preview-section">
            <h4><i class="fas fa-map-marker-alt"></i> Journey Details</h4>
            <div class="preview-grid">
                <div class="preview-item">
                    <label>Destination</label>
                    <span>${bookingData.destination} (${bookingData.destinationType})</span>
                </div>
                <div class="preview-item">
                    <label>From</label>
                    <span>${bookingData.fromCity}</span>
                </div>
                <div class="preview-item">
                    <label>Travel Date</label>
                    <span>${new Date(bookingData.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div class="preview-item">
                    <label>Transport</label>
                    <span>${bookingData.transportType.charAt(0).toUpperCase() + bookingData.transportType.slice(1)}</span>
                </div>
            </div>
        </div>
        
        <div class="preview-section">
            <h4><i class="fas fa-${bookingData.transportType}"></i> Selected ${bookingData.transportType.charAt(0).toUpperCase() + bookingData.transportType.slice(1)}</h4>
            <div class="selected-transport-preview">
                <p>${optionDetails}</p>
            </div>
        </div>
        
        <div class="preview-section">
            <h4><i class="fas fa-users"></i> Travelers (${bookingData.numTravelers})</h4>
            <table class="preview-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Passport</th>
                        <th>ID Proof</th>
                    </tr>
                </thead>
                <tbody>${travelersHtml}</tbody>
            </table>
        </div>
        
        <div class="preview-section price-summary">
            <h4><i class="fas fa-rupee-sign"></i> Price Breakdown</h4>
            <div class="price-breakdown">
                <div class="price-row">
                    <span>Package Price (${bookingData.numTravelers} × ₹${bookingData.basePrice.toLocaleString('en-IN')})</span>
                    <span>₹${packagePrice.toLocaleString('en-IN')}</span>
                </div>
                <div class="price-row">
                    <span>${bookingData.transportType.charAt(0).toUpperCase() + bookingData.transportType.slice(1)} Fare (${bookingData.numTravelers} × ₹${transportPrice.toLocaleString('en-IN')})</span>
                    <span>₹${totalTransport.toLocaleString('en-IN')}</span>
                </div>
                <div class="price-row">
                    <span>Taxes & GST (18%)</span>
                    <span>₹${taxes.toLocaleString('en-IN')}</span>
                </div>
                <div class="price-row total">
                    <span>Grand Total</span>
                    <span>₹${grandTotal.toLocaleString('en-IN')}</span>
                </div>
            </div>
        </div>
    `;
}

function getSelectedOptionData() {
    if (!bookingData.selectedOption) return null;

    const id = bookingData.selectedOption.id;

    if (bookingData.transportType === 'flight') {
        return flightsData.find(f => f.id === id);
    } else if (bookingData.transportType === 'bus') {
        return busesData.find(b => b.id === id);
    } else {
        return trainsData.find(t => t.id === id);
    }
}

function confirmBooking() {
    const transportPrice = bookingData.selectedOption?.price || 0;
    const totalTransport = transportPrice * bookingData.numTravelers;
    const packagePrice = bookingData.basePrice * bookingData.numTravelers;
    const taxes = Math.round((totalTransport + packagePrice) * 0.18);
    const grandTotal = totalTransport + packagePrice + taxes;

    const invoiceNumber = 'TG' + Date.now().toString().slice(-8);
    const optionData = getSelectedOptionData();

    const bookingDetails = {
        invoiceNumber,
        destination: bookingData.destination,
        destinationType: bookingData.destinationType,
        fromCity: bookingData.fromCity,
        travelDate: bookingData.travelDate,
        transportType: bookingData.transportType,
        transportDetails: optionData,
        travelers: bookingData.travelers,
        packagePrice,
        transportPrice: totalTransport,
        taxes,
        grandTotal,
        bookingDate: new Date().toISOString()
    };

    saveBookingToHistory(bookingDetails);

    // Close wizard and show invoice
    closeWizard();
    generateInvoice(bookingDetails);
}

function generateInvoiceContent(data) {
    let transportInfo = '';
    let transportIcon = '';
    if (data.transportType === 'flight' && data.transportDetails) {
        transportInfo = `${data.transportDetails.airline} | ${data.transportDetails.departure} - ${data.transportDetails.arrival}`;
        transportIcon = 'fa-plane';
    } else if (data.transportType === 'bus' && data.transportDetails) {
        transportInfo = `${data.transportDetails.operator} (${data.transportDetails.type}) | ${data.transportDetails.departure} - ${data.transportDetails.arrival}`;
        transportIcon = 'fa-bus';
    } else if (data.transportType === 'train' && data.transportDetails) {
        transportInfo = `${data.transportDetails.name} #${data.transportDetails.number} | ${data.transportDetails.departure} - ${data.transportDetails.arrival}`;
        transportIcon = 'fa-train';
    }

    let travelersHtml = data.travelers.map((t, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${t.name}</td>
            <td>${t.age}</td>
            <td>${t.gender}</td>
            <td>${data.destinationType === 'international' ? t.passport : 'N/A'}</td>
        </tr>
    `).join('');

    const ticketHtml = `
        <div class="ticket-container" style="border: 2px dashed #e2e8f0; padding: 20px; border-radius: 12px; background: #f8fafc; margin-bottom: 25px;">
            <div class="ticket-header" style="display: flex; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 15px;">
                <div style="font-weight: 700; color: #4f46e5; font-size: 18px;">
                    <i class="fas ${transportIcon}"></i> ${data.transportType.toUpperCase()} TICKET
                </div>
                <div style="font-weight: 600; color: #64748b;">${new Date(data.travelDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
            <div class="ticket-body" style="display: flex; justify-content: space-between; align-items: center;">
                <div class="ticket-route">
                    <div style="font-size: 24px; font-weight: 700; color: #1e293b;">${data.fromCity}</div>
                    <div style="font-size: 12px; color: #64748b;">Departure</div>
                </div>
                <div class="ticket-arrow" style="color: #94a3b8; font-size: 20px;">
                    <i class="fas fa-long-arrow-alt-right"></i>
                </div>
                <div class="ticket-route" style="text-align: right;">
                    <div style="font-size: 24px; font-weight: 700; color: #1e293b;">${data.destination}</div>
                    <div style="font-size: 12px; color: #64748b;">Arrival</div>
                </div>
            </div>
            <div class="ticket-details" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #cbd5e1; font-size: 13px; color: #334155;">
                <div><strong>Transport:</strong> ${transportInfo}</div>
                <div><strong>Passengers:</strong> ${data.travelers.length} Person(s)</div>
            </div>
        </div>
    `;

    return `
        <div class="invoice-section">
            <h4><i class="fas fa-ticket-alt"></i> Your E-Ticket</h4>
            ${ticketHtml}
        </div>
        <div class="invoice-section">
            <h4>Booking Details</h4>
            <table class="invoice-table">
                <tr><td><strong>Booking ID</strong></td><td>${data.invoiceNumber}</td></tr>
                <tr><td><strong>Destination</strong></td><td>${data.destination} (${data.destinationType})</td></tr>
                <tr><td><strong>Booking Date</strong></td><td>${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td></tr>
                <tr><td><strong>Status</strong></td><td><span style="color: #10b981; font-weight: 600;">Confirmed</span></td></tr>
            </table>
        </div>
        
        <div class="invoice-section">
            <h4>Traveler Details</h4>
            <table class="invoice-table">
                <thead>
                    <tr><th>#</th><th>Name</th><th>Age</th><th>Gender</th><th>Passport</th></tr>
                </thead>
                <tbody>${travelersHtml}</tbody>
            </table>
        </div>
        
        <div class="invoice-section">
            <h4>Payment Bill</h4>
            <table class="invoice-table">
                <tr><td>Package Price</td><td>₹${data.packagePrice.toLocaleString('en-IN')}</td></tr>
                <tr><td>${data.transportType.charAt(0).toUpperCase() + data.transportType.slice(1)} Fare</td><td>₹${data.transportPrice.toLocaleString('en-IN')}</td></tr>
                <tr><td>Taxes & GST (18%)</td><td>₹${data.taxes.toLocaleString('en-IN')}</td></tr>
            </table>
            <div class="invoice-total">
                Total Paid: ₹${data.grandTotal.toLocaleString('en-IN')}
            </div>
        </div>
        
        <div class="invoice-section" style="text-align: center; color: #10b981; margin-top: 30px;">
            <i class="fas fa-check-circle" style="font-size: 48px; margin-bottom: 15px;"></i>
            <h3>Booking Confirmed!</h3>
            <p>Confirmation sent to ${data.travelers[0]?.email || 'your email'}</p>
        </div>
    `;
}

function generateInvoice(data) {
    document.getElementById('invoiceNumber').textContent = data.invoiceNumber;
    document.getElementById('invoiceBody').innerHTML = generateInvoiceContent(data);
    
    document.getElementById('invoiceModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeInvoiceModal() {
    document.getElementById('invoiceModal').classList.remove('active');
    document.body.style.overflow = '';
}

function downloadInvoice() {
    const invoiceNumber = document.getElementById('invoiceNumber')?.textContent || 'TG000000';
    const invoiceContent = document.getElementById('invoiceBody')?.innerHTML || '';
    
    const invoiceHTML = `<!DOCTYPE html><html><head><title>Invoice - ${invoiceNumber}</title>
    <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #334155; }
    .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    .inv-header { background: linear-gradient(135deg, #4f46e5, #06b6d4); color: white; padding: 30px; display: flex; justify-content: space-between; align-items: center; }
    .inv-logo { font-size: 28px; font-weight: 700; } .inv-title { text-align: right; }
    .inv-body { padding: 30px; } table { width: 100%; border-collapse: collapse; } th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    th { background: #f8fafc; font-weight: 600; } .invoice-total { text-align: right; font-size: 20px; font-weight: 700; color: #10b981; padding: 15px; background: #f0fdf4; border-radius: 8px; }
    .invoice-section { margin-bottom: 20px; } .invoice-section h4 { margin-bottom: 10px; } @media print { body { padding: 0; } }</style></head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <body>
    <div class="invoice-container"><div class="inv-header"><div class="inv-logo">✈ TravelGo</div><div class="inv-title"><h2>Booking Invoice</h2><p>#${invoiceNumber}</p></div></div>
    <div class="inv-body">${invoiceContent}</div></div></body></html>`;
    
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TravelGo_Invoice_' + invoiceNumber + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Invoice downloaded successfully!', 'success');
}

function saveBookingToHistory(data) {
    const bookings = JSON.parse(localStorage.getItem('travelgo_bookings') || '[]');
    bookings.unshift(data);
    localStorage.setItem('travelgo_bookings', JSON.stringify(bookings));
}

function loadMyBookings() {
    const container = document.getElementById('myBookingsContainer');
    if (!container) return;

    const bookings = JSON.parse(localStorage.getItem('travelgo_bookings') || '[]');

    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="no-bookings">
                <i class="fas fa-ticket-alt"></i>
                <h3>No bookings found</h3>
                <p>You haven't made any bookings yet.</p>
                <a href="index.html#destinations" class="btn btn-primary" style="margin-top: 15px;">Explore Destinations</a>
            </div>`;
        return;
    }

    container.innerHTML = bookings.map((b, index) => {
        if (b.type === 'Tour Package' || b.type === 'Stay Booking') {
            const typeLabel = b.type === 'Stay Booking' ? (b.stayType === 'resort' ? 'Resort' : 'Hotel') : 'Tour Package';
            // Tour package booking format
            return `
        <div class="booking-card">
            <div class="booking-card-header">
                <span class="booking-id"><i class="fas fa-ticket-alt"></i> ${b.id}</span>
                <span class="booking-status confirmed">${b.status || 'Confirmed'}</span>
            </div>
            <div class="booking-card-body">
                <div class="booking-details-grid">
                    <div class="booking-detail-item">
                        <label>${typeLabel}</label>
                        <span>${b.destination}</span>
                    </div>
                    <div class="booking-detail-item">
                        <label>${b.type === 'Stay Booking' ? 'Location' : 'Route'}</label>
                        <span>${b.route || 'N/A'}</span>
                    </div>
                    <div class="booking-detail-item">
                        <label>Duration</label>
                        <span>${b.duration || 'N/A'}</span>
                    </div>
                    <div class="booking-detail-item">
                        <label>Travel Date</label>
                        <span>${b.date ? new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                    </div>
                </div>
                <div class="booking-travelers">
                    <h4><i class="fas fa-users"></i> Travelers: ${b.travelers} Person(s)</h4>
                    <p style="font-size: 13px; color: var(--text-light); margin-top: 4px;">Booked by: ${b.travelerName || 'N/A'}</p>
                </div>
                <div class="booking-detail-item" style="margin-bottom: 15px;">
                    <label>Total Amount</label>
                    <span style="color: var(--success-color); font-size: 18px;">${b.total}</span>
                </div>
                <div class="booking-card-actions">
                    <button class="btn btn-outline" onclick="viewTourInvoice(${index})"><i class="fas fa-eye"></i> View Invoice</button>
                    <button class="btn btn-primary" onclick="downloadTourInvoice(${index})"><i class="fas fa-download"></i> Download</button>
                </div>
            </div>
        </div>`;
        } else {
            // Destination booking format
            return `
        <div class="booking-card">
            <div class="booking-card-header">
                <span class="booking-id"><i class="fas fa-ticket-alt"></i> ${b.invoiceNumber}</span>
                <span class="booking-status confirmed">Confirmed</span>
            </div>
            <div class="booking-card-body">
                <div class="booking-details-grid">
                    <div class="booking-detail-item">
                        <label>Destination</label>
                        <span>${b.destination}</span>
                    </div>
                    <div class="booking-detail-item">
                        <label>From</label>
                        <span>${b.fromCity}</span>
                    </div>
                    <div class="booking-detail-item">
                        <label>Travel Date</label>
                        <span>${new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div class="booking-detail-item">
                        <label>Transport</label>
                        <span>${b.transportType.charAt(0).toUpperCase() + b.transportType.slice(1)}</span>
                    </div>
                </div>
                <div class="booking-travelers">
                    <h4><i class="fas fa-users"></i> Travelers: ${b.travelers.length} Person(s)</h4>
                </div>
                <div class="booking-detail-item" style="margin-bottom: 15px;">
                    <label>Total Amount</label>
                    <span style="color: var(--success-color); font-size: 18px;">₹${b.grandTotal.toLocaleString('en-IN')}</span>
                </div>
                <div class="booking-card-actions">
                    <button class="btn btn-outline" onclick="viewHistoryInvoice(${index})"><i class="fas fa-eye"></i> View Invoice</button>
                    <button class="btn btn-primary" onclick="downloadHistoryInvoice(${index})"><i class="fas fa-download"></i> Download</button>
                </div>
            </div>
        </div>`;
        }
    }).join('');
}

function viewTourInvoice(index) {
    const bookings = JSON.parse(localStorage.getItem('travelgo_bookings') || '[]');
    const b = bookings[index];
    if (!b) return;

    document.getElementById('invoiceNumber').textContent = b.id;
    document.getElementById('invoiceBody').innerHTML = `
        <div class="invoice-section">
            <h4>Tour Package Details</h4>
            <table class="invoice-table">
                <tr><td><strong>Booking ID</strong></td><td>${b.id}</td></tr>
                <tr><td><strong>Tour Package</strong></td><td>${b.destination}</td></tr>
                <tr><td><strong>Route</strong></td><td>${b.route || 'N/A'}</td></tr>
                <tr><td><strong>Duration</strong></td><td>${b.duration || 'N/A'}</td></tr>
                <tr><td><strong>Travel Date</strong></td><td>${b.date ? new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</td></tr>
                <tr><td><strong>Status</strong></td><td><span style="color: #10b981; font-weight: 600;">${b.status || 'Confirmed'}</span></td></tr>
            </table>
        </div>
        <div class="invoice-section">
            <h4>Traveler Info</h4>
            <table class="invoice-table">
                <tr><td><strong>Name</strong></td><td>${b.travelerName || 'N/A'}</td></tr>
                <tr><td><strong>Email</strong></td><td>${b.email || 'N/A'}</td></tr>
                <tr><td><strong>Phone</strong></td><td>${b.phone || 'N/A'}</td></tr>
                <tr><td><strong>Travelers</strong></td><td>${b.travelers} Person(s)</td></tr>
                <tr><td><strong>Special Requests</strong></td><td>${b.requests || 'None'}</td></tr>
            </table>
        </div>
        ${b.includes && b.includes.length ? `
        <div class="invoice-section">
            <h4>Package Includes</h4>
            <p>${b.includes.map(i => '<span style="display:inline-block;background:#eef2ff;color:#4f46e5;padding:4px 12px;border-radius:20px;margin:3px;font-size:13px;"><i class="fas fa-check-circle"></i> ' + i.trim() + '</span>').join('')}</p>
        </div>` : ''}
        <div class="invoice-section">
            <h4>Payment</h4>
            <div class="invoice-total">Total Paid: ${b.total}</div>
        </div>
        <div class="invoice-section" style="text-align: center; color: #10b981; margin-top: 30px;">
            <i class="fas fa-check-circle" style="font-size: 48px; margin-bottom: 15px;"></i>
            <h3>Booking Confirmed!</h3>
            <p>Confirmation sent to ${b.email || 'your email'}</p>
        </div>
    `;

    document.getElementById('invoiceModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function downloadTourInvoice(index) {
    const bookings = JSON.parse(localStorage.getItem('travelgo_bookings') || '[]');
    const b = bookings[index];
    if (!b) return;

    const invoiceNumber = b.id;
    const invoiceContent = `
        <div class="invoice-section">
            <h4>Tour Package Details</h4>
            <table class="invoice-table">
                <tr><td><strong>Booking ID</strong></td><td>${b.id}</td></tr>
                <tr><td><strong>Tour Package</strong></td><td>${b.destination}</td></tr>
                <tr><td><strong>Route</strong></td><td>${b.route || 'N/A'}</td></tr>
                <tr><td><strong>Duration</strong></td><td>${b.duration || 'N/A'}</td></tr>
                <tr><td><strong>Travel Date</strong></td><td>${b.date ? new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</td></tr>
                <tr><td><strong>Status</strong></td><td><span style="color: #10b981; font-weight: 600;">${b.status || 'Confirmed'}</span></td></tr>
            </table>
        </div>
        <div class="invoice-section">
            <h4>Traveler Info</h4>
            <table class="invoice-table">
                <tr><td><strong>Name</strong></td><td>${b.travelerName || 'N/A'}</td></tr>
                <tr><td><strong>Email</strong></td><td>${b.email || 'N/A'}</td></tr>
                <tr><td><strong>Phone</strong></td><td>${b.phone || 'N/A'}</td></tr>
                <tr><td><strong>Travelers</strong></td><td>${b.travelers} Person(s)</td></tr>
                <tr><td><strong>Special Requests</strong></td><td>${b.requests || 'None'}</td></tr>
            </table>
        </div>
        <div class="invoice-section">
            <h4>Payment</h4>
            <div class="invoice-total">Total Paid: ${b.total}</div>
        </div>`;

    const invoiceHTML = `<!DOCTYPE html><html><head><title>Invoice - ${invoiceNumber}</title>
    <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #334155; }
    .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    .inv-header { background: linear-gradient(135deg, #4f46e5, #06b6d4); color: white; padding: 30px; display: flex; justify-content: space-between; align-items: center; }
    .inv-logo { font-size: 28px; font-weight: 700; } .inv-title { text-align: right; }
    .inv-body { padding: 30px; } table { width: 100%; border-collapse: collapse; } th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    th { background: #f8fafc; font-weight: 600; } .invoice-total { text-align: right; font-size: 20px; font-weight: 700; color: #10b981; padding: 15px; background: #f0fdf4; border-radius: 8px; }
    .invoice-section { margin-bottom: 20px; } .invoice-section h4 { margin-bottom: 10px; } @media print { body { padding: 0; } }</style></head>
    <body>
    <div class="invoice-container"><div class="inv-header"><div class="inv-logo">✈ TravelGo</div><div class="inv-title"><h2>Tour Booking Invoice</h2><p>#${invoiceNumber}</p></div></div>
    <div class="inv-body">${invoiceContent}</div></div></body></html>`;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TravelGo_Tour_Invoice_' + invoiceNumber + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Tour invoice downloaded successfully!', 'success');
}

function viewHistoryInvoice(index) {
    const bookings = JSON.parse(localStorage.getItem('travelgo_bookings') || '[]');
    if (bookings[index]) {
        generateInvoice(bookings[index]);
    }
}

function downloadHistoryInvoice(index) {
    const bookings = JSON.parse(localStorage.getItem('travelgo_bookings') || '[]');
    const data = bookings[index];
    if (!data) return;

    // Temporarily populate the modal to use the existing download logic, or construct HTML manually
    // Since downloadInvoice reads from DOM, we can just reuse the logic by constructing the HTML string directly
    const invoiceContent = generateInvoiceContent(data);
    const invoiceNumber = data.invoiceNumber;

    const invoiceHTML = `<!DOCTYPE html><html><head><title>Invoice - ${invoiceNumber}</title>
    <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #334155; }
    .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    .inv-header { background: linear-gradient(135deg, #4f46e5, #06b6d4); color: white; padding: 30px; display: flex; justify-content: space-between; align-items: center; }
    .inv-logo { font-size: 28px; font-weight: 700; } .inv-title { text-align: right; }
    .inv-body { padding: 30px; } table { width: 100%; border-collapse: collapse; } th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    th { background: #f8fafc; font-weight: 600; } .invoice-total { text-align: right; font-size: 20px; font-weight: 700; color: #10b981; padding: 15px; background: #f0fdf4; border-radius: 8px; }
    .invoice-section { margin-bottom: 20px; } .invoice-section h4 { margin-bottom: 10px; } @media print { body { padding: 0; } }</style></head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <body>
    <div class="invoice-container"><div class="inv-header"><div class="inv-logo">✈ TravelGo</div><div class="inv-title"><h2>Booking Invoice</h2><p>#${invoiceNumber}</p></div></div>
    <div class="inv-body">${invoiceContent}</div></div></body></html>`;
    
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TravelGo_Invoice_' + invoiceNumber + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Invoice downloaded successfully!', 'success');
}

// ========================================
function initForms() {

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleSignup(this);
        });
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleContact(this);
        });
    }
}

function handleBookingSubmit(type, form) {
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        showNotification(`Found 15+ ${type}s matching your search!`, 'success');
    }, 2000);
}

function handleSignup(form) {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const btn = form.querySelector('button[type="submit"]');

    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters!', 'error');
        return;
    }

    if (!phone || !validatePhone(phone)) {
        showNotification('Please enter a valid phone number (10 digits, first digit cannot be 0).', 'error');
        return;
    }

    // Check if email already exists
    const users = JSON.parse(localStorage.getItem('travelgo_users') || '[]');
    if (users.find(u => u.email === email)) {
        showNotification('An account with this email already exists!', 'error');
        return;
    }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    btn.disabled = true;

    setTimeout(() => {
        // Save user to localStorage
        users.push({ firstName, lastName, email, phone, password });
        localStorage.setItem('travelgo_users', JSON.stringify(users));

        btn.innerHTML = 'Create Account';
        btn.disabled = false;
        showNotification('Account created successfully! Please login.', 'success');
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    }, 1500);
}

function handleContact(form) {
    const btn = form.querySelector('button[type="submit"]');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = 'Send Message';
        btn.disabled = false;
        showNotification('Message sent successfully!', 'success');
        form.reset();
    }, 1500);
}

function initPasswordToggle() {
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });
}

function setMinDates() {
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + 1);
    const maxDateStr = maxDate.getFullYear() + '-' + String(maxDate.getMonth() + 1).padStart(2, '0') + '-' + String(maxDate.getDate()).padStart(2, '0');

    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.setAttribute('min', todayStr);
        input.setAttribute('max', maxDateStr);
    });
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    notification.style.cssText = `
        position: fixed; top: 80px; right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white; padding: 15px 20px; border-radius: 10px;
        display: flex; align-items: center; gap: 15px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 9999;
        animation: slideIn 0.3s ease; max-width: 400px;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);

    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = 'background: none; border: none; color: white; cursor: pointer;';
    closeBtn.onclick = () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    };

    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Enable step 1 next button when all fields are filled
document.addEventListener('change', function (e) {
    if (e.target.id === 'fromCity' || e.target.id === 'travelDate' || e.target.id === 'numTravelers') {
        const fromCity = document.getElementById('fromCity')?.value;
        const travelDate = document.getElementById('travelDate')?.value;
        const nextBtn = document.getElementById('step1Next');

        if (fromCity && travelDate && bookingData.transportType && nextBtn) {
            nextBtn.disabled = false;
        }
    }
});
// ========================================
// Hero Slider Functionality
// ========================================

function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slider .slide');
    if (!slides.length) return;

    let currentSlide = 0;

    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000); // Change slide every 5 seconds
}

// ========================================
// Favourites Functionality
// ========================================

function toggleFavourite(btn) {
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');

    const card = btn.closest('.destination-card') || btn.closest('.tour-card');
    const name = card?.dataset.name || card?.querySelector('h3')?.textContent || 'Item';

    let favourites = JSON.parse(localStorage.getItem('travelgo_favourites') || '[]');

    if (btn.classList.contains('active')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        if (!favourites.find(f => f.name === name)) {
            const type = card?.classList.contains('tour-card') ? 'Tour' : (card?.dataset.type || 'destination');
            favourites.push({ name, type });
        }
        showNotification(`${name} added to favourites!`, 'success');
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        favourites = favourites.filter(f => f.name !== name);
        showNotification(`${name} removed from favourites`, 'info');
    }

    localStorage.setItem('travelgo_favourites', JSON.stringify(favourites));
}

function initFavourites() {
    const favourites = JSON.parse(localStorage.getItem('travelgo_favourites') || '[]');
    document.querySelectorAll('.btn-favourite').forEach(btn => {
        const card = btn.closest('.destination-card') || btn.closest('.tour-card');
        const name = card?.dataset.name || card?.querySelector('h3')?.textContent;
        if (name && favourites.find(f => f.name === name)) {
            btn.classList.add('active');
            const icon = btn.querySelector('i');
            icon.classList.remove('far');
            icon.classList.add('fas');
        }
    });
}

function showFavourites() {
    const favourites = JSON.parse(localStorage.getItem('travelgo_favourites') || '[]');

    let modal = document.getElementById('favouritesModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'favouritesModal';
        modal.innerHTML = `
            <div class="modal-content favourites-modal-content">
                <span class="modal-close" onclick="closeFavouritesModal()">&times;</span>
                <div class="favourites-header">
                    <h2><i class="fas fa-heart"></i> My Favourites</h2>
                </div>
                <div class="favourites-body" id="favouritesBody"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const body = document.getElementById('favouritesBody');
    if (favourites.length === 0) {
        body.innerHTML = `
            <div class="no-favourites">
                <i class="far fa-heart"></i>
                <h3>No favourites yet</h3>
                <p>Start adding destinations and tours to your favourites!</p>
            </div>
        `;
    } else {
        body.innerHTML = favourites.map((f, i) => `
            <div class="favourite-item">
                <div class="favourite-item-info">
                    <i class="fas fa-heart"></i>
                    <div>
                        <div class="favourite-item-name">${f.name}</div>
                        <div class="favourite-item-type">${f.type}</div>
                    </div>
                </div>
                <button class="favourite-remove" onclick="removeFavourite(${i})" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFavouritesModal() {
    document.getElementById('favouritesModal')?.classList.remove('active');
    document.body.style.overflow = '';
}

function removeFavourite(index) {
    let favourites = JSON.parse(localStorage.getItem('travelgo_favourites') || '[]');
    const removed = favourites[index];
    favourites.splice(index, 1);
    localStorage.setItem('travelgo_favourites', JSON.stringify(favourites));

    // Update UI buttons
    document.querySelectorAll('.btn-favourite').forEach(btn => {
        const card = btn.closest('.destination-card') || btn.closest('.tour-card');
        const name = card?.dataset.name || card?.querySelector('h3')?.textContent;
        if (name === removed?.name) {
            btn.classList.remove('active');
            const icon = btn.querySelector('i');
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
    });

    showFavourites();
    showNotification(`${removed?.name} removed from favourites`, 'info');
}

// Initialize favourites on page load
document.addEventListener('DOMContentLoaded', function() {
    initFavourites();
    initTourFilters();
    initReviewCarousel();
});

// ========================================
// Tour Page: Filters, Search, Sort
// ========================================

let currentCategory = 'all';
let currentSearch = '';
let currentBudget = 'all';

function initTourFilters() {
    const toursGrid = document.getElementById('toursGrid');
    if (!toursGrid) return;

    // Set min date for travel date
    const today = new Date();
    const tbDate = document.getElementById('tbDate');
    if (tbDate) {
        const todayStr = today.toISOString().split('T')[0];
        tbDate.setAttribute('min', todayStr);
    }

    // Pre-fill logged-in user info
    const tbName = document.getElementById('tbName');
    const tbEmail = document.getElementById('tbEmail');
    if (tbName && localStorage.getItem('userFullName')) {
        tbName.value = localStorage.getItem('userFullName');
    }
    if (tbEmail && localStorage.getItem('userEmail')) {
        tbEmail.value = localStorage.getItem('userEmail');
    }

    // Category filter buttons
    document.querySelectorAll('.tour-filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.tour-filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            filterAndSort();
        });
    });

    // Search
    const searchInput = document.getElementById('tourSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentSearch = this.value.toLowerCase().trim();
            filterAndSort();
        });
    }

    // Sort
    const sortSelect = document.getElementById('tourSort');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            filterAndSort();
        });
    }

    const budgetSelect = document.getElementById('tourBudget');
    if (budgetSelect) {
        budgetSelect.addEventListener('change', function () {
            currentBudget = this.value || 'all';
            filterAndSort();
        });
    }

    const resetBtn = document.getElementById('tourResetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            currentCategory = 'all';
            currentSearch = '';
            currentBudget = 'all';

            document.querySelectorAll('.tour-filter-btn').forEach(b => b.classList.remove('active'));
            const allBtn = document.querySelector('.tour-filter-btn[data-category="all"]');
            if (allBtn) allBtn.classList.add('active');

            if (searchInput) searchInput.value = '';
            if (sortSelect) sortSelect.value = 'default';
            if (budgetSelect) budgetSelect.value = 'all';

            filterAndSort();
        });
    }

    updateCounts();
}

function filterAndSort() {
    const cards = Array.from(document.querySelectorAll('#toursGrid .tour-card'));
    const sortVal = document.getElementById('tourSort')?.value || 'default';
    let visible = 0;

    cards.forEach(card => {
        const category = card.dataset.category || '';
        const name = card.dataset.name?.toLowerCase() || '';
        const route = card.dataset.route?.toLowerCase() || '';
        const includes = card.dataset.includes?.toLowerCase() || '';
        const price = parseInt(card.dataset.price || '0', 10);

        const matchCategory = currentCategory === 'all' || category === currentCategory;
        const matchSearch = !currentSearch ||
            name.includes(currentSearch) ||
            route.includes(currentSearch) ||
            includes.includes(currentSearch) ||
            category.includes(currentSearch);
        const matchBudget = matchesBudgetRange(price, currentBudget);

        if (matchCategory && matchSearch && matchBudget) {
            card.style.display = '';
            visible++;
        } else {
            card.style.display = 'none';
        }
    });

    // Sort visible cards
    const grid = document.getElementById('toursGrid');
    const visibleCards = cards.filter(c => c.style.display !== 'none');

    visibleCards.sort((a, b) => {
        const priceA = parseInt(a.dataset.price);
        const priceB = parseInt(b.dataset.price);
        const durA = parseInt(a.dataset.duration);
        const durB = parseInt(b.dataset.duration);

        switch (sortVal) {
            case 'price-low': return priceA - priceB;
            case 'price-high': return priceB - priceA;
            case 'duration-short': return durA - durB;
            case 'duration-long': return durB - durA;
            default: return 0;
        }
    });

    visibleCards.forEach(card => grid.appendChild(card));
    cards.filter(c => c.style.display === 'none').forEach(card => grid.appendChild(card));

    document.getElementById('visibleCount').textContent = visible;
    document.getElementById('noResults').style.display = visible === 0 ? 'block' : 'none';
}

function matchesBudgetRange(price, range) {
    if (!range || range === 'all') return true;
    const parts = range.split('-');
    if (parts.length !== 2) return true;
    const min = parseInt(parts[0], 10);
    const max = parseInt(parts[1], 10);
    if (Number.isNaN(min) || Number.isNaN(max)) return true;
    return price >= min && price <= max;
}

function updateCounts() {
    const cards = document.querySelectorAll('#toursGrid .tour-card');
    const total = cards.length;
    const countAllEl = document.getElementById('countAll');
    const visibleCountEl = document.getElementById('visibleCount');
    if (countAllEl) countAllEl.textContent = total;
    if (visibleCountEl) visibleCountEl.textContent = total;

    // Update per-category counts
    const categories = {};
    cards.forEach(card => {
        const cat = card.dataset.category || '';
        if (cat) categories[cat] = (categories[cat] || 0) + 1;
    });

    document.querySelectorAll('.tour-filter-btn').forEach(btn => {
        const cat = btn.dataset.category;
        if (cat && cat !== 'all') {
            let countSpan = btn.querySelector('.count');
            const count = categories[cat] || 0;
            if (!countSpan) {
                countSpan = document.createElement('span');
                countSpan.className = 'count';
                btn.appendChild(countSpan);
            }
            countSpan.textContent = count;
        }
    });
}

// ========================================
// Tour Booking Functions (shared)
// ========================================

var currentTourData = {};

function openTourBooking(btn) {
    const card = btn.closest('.tour-card');
    if (!card) return;

    currentTourData = {
        name: card.dataset.name,
        price: parseInt(card.dataset.price),
        originalPrice: parseInt(card.dataset.originalPrice),
        discount: parseInt(card.dataset.discount),
        duration: card.dataset.durationText,
        route: card.dataset.route,
        image: card.dataset.image,
        rating: card.dataset.rating,
        reviews: card.dataset.reviews,
        includes: card.dataset.includes?.split(',') || [],
        bookingType: 'Tour Package'
    };

    populateBookingModal(currentTourData);
}

function openStayBooking(btn) {
    const card = btn.closest('.hotel-card');
    if (!card) return;

    const price = parseInt(card.dataset.price || '0');
    const originalPrice = parseInt(card.dataset.originalPrice || String(Math.round(price * 1.2)));
    const discount = parseInt(card.dataset.discount || String(Math.max(0, Math.round(((originalPrice - price) / Math.max(originalPrice, 1)) * 100))));
    const defaultIncludes = card.dataset.category === 'resort'
        ? 'Breakfast,Pool Access,Evening Activities,Free Wi-Fi'
        : 'Breakfast,Free Wi-Fi,Housekeeping,Front Desk Support';

    currentTourData = {
        name: card.dataset.name || card.querySelector('h3')?.textContent || 'Premium Stay',
        price: price,
        originalPrice: originalPrice,
        discount: discount,
        duration: card.dataset.durationText || '1 Night Stay',
        route: card.dataset.route || 'Location not specified',
        image: card.dataset.image || card.querySelector('img')?.src || '',
        rating: card.dataset.rating || '4.7',
        reviews: card.dataset.reviews || '500+',
        includes: (card.dataset.includes || defaultIncludes).split(','),
        bookingType: card.dataset.category === 'resort' ? 'Resort Stay' : 'Hotel Stay'
    };

    populateBookingModal(currentTourData);
}

function populateBookingModal(data) {
    document.getElementById('tourBookingImg').src = currentTourData.image;
    document.getElementById('tourBookingName').textContent = currentTourData.name;
    document.getElementById('tourBookingRoute').textContent = currentTourData.route;

    document.getElementById('tourBookingDetails').innerHTML = `
        <div class="tour-detail-item">
            <i class="fas fa-clock"></i>
            <div class="detail-text">
                <span class="detail-label">Duration</span>
                <span class="detail-value">${currentTourData.duration}</span>
            </div>
        </div>
        <div class="tour-detail-item">
            <i class="fas fa-star"></i>
            <div class="detail-text">
                <span class="detail-label">Rating</span>
                <span class="detail-value">${currentTourData.rating} ★ (${currentTourData.reviews} reviews)</span>
            </div>
        </div>
        <div class="tour-detail-item">
            <i class="fas fa-tag"></i>
            <div class="detail-text">
                <span class="detail-label">Price Per Person</span>
                <span class="detail-value">₹${currentTourData.price.toLocaleString('en-IN')}</span>
            </div>
        </div>
        <div class="tour-detail-item">
            <i class="fas fa-percent"></i>
            <div class="detail-text">
                <span class="detail-label">Discount</span>
                <span class="detail-value" style="color: var(--success-color);">${currentTourData.discount}% OFF</span>
            </div>
        </div>
    `;

    const includesHTML = currentTourData.includes.map(item =>
        '<span><i class="fas fa-check-circle"></i> ' + item.trim() + '</span>'
    ).join('');
    document.getElementById('tourBookingIncludes').innerHTML = includesHTML;

    const tbName = document.getElementById('tbName');
    const tbEmail = document.getElementById('tbEmail');
    if (tbName && localStorage.getItem('userFullName')) tbName.value = localStorage.getItem('userFullName');
    if (tbEmail && localStorage.getItem('userEmail')) tbEmail.value = localStorage.getItem('userEmail');

    updateTourPrice();

    document.getElementById('tourBookingModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeTourBooking() {
    document.getElementById('tourBookingModal').classList.remove('active');
    document.body.style.overflow = '';
}

function updateTourPrice() {
    const travelers = parseInt(document.getElementById('tbTravelers').value) || 2;
    const basePrice = currentTourData.originalPrice || 0;
    const discountedPrice = currentTourData.price || 0;
    const subtotal = basePrice * travelers;
    const discountAmt = (basePrice - discountedPrice) * travelers;
    const afterDiscount = subtotal - discountAmt;
    const gst = Math.round(afterDiscount * 0.05);
    const total = afterDiscount + gst;

    document.getElementById('tbBasePrice').textContent = '₹' + basePrice.toLocaleString('en-IN');
    document.getElementById('tbTravelerCount').textContent = travelers;
    document.getElementById('tbDiscountAmt').textContent = '- ₹' + discountAmt.toLocaleString('en-IN');
    document.getElementById('tbGST').textContent = '₹' + gst.toLocaleString('en-IN');
    document.getElementById('tbTotal').textContent = '₹' + total.toLocaleString('en-IN');
}

function submitTourBooking(e) {
    e.preventDefault();

    const name = document.getElementById('tbName').value.trim();
    const email = document.getElementById('tbEmail').value.trim();
    const phone = document.getElementById('tbPhone').value.trim();
    const date = document.getElementById('tbDate').value;
    const travelers = parseInt(document.getElementById('tbTravelers').value);
    const requests = document.getElementById('tbRequests').value.trim();

    if (!name || !email || !phone || !date) {
        showNotification('Please fill all required fields!', 'error');
        return;
    }

    const totalText = document.getElementById('tbTotal').textContent;
    const invoiceNum = 'TG' + Date.now().toString().slice(-6);

    const booking = {
        id: invoiceNum,
        type: currentTourData.bookingType || 'Tour Package',
        destination: currentTourData.name,
        route: currentTourData.route,
        duration: currentTourData.duration,
        date: date,
        travelers: travelers,
        travelerName: name,
        email: email,
        phone: phone,
        requests: requests,
        total: totalText,
        includes: currentTourData.includes,
        bookedAt: new Date().toISOString(),
        status: 'Confirmed'
    };

    const bookings = JSON.parse(localStorage.getItem('travelgo_bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('travelgo_bookings', JSON.stringify(bookings));

    closeTourBooking();

    document.getElementById('invoiceNumber').textContent = invoiceNum;
    document.getElementById('invoiceBody').innerHTML = `
        <div style="padding: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <h4 style="margin-bottom: 8px; color: #4f46e5;">${currentTourData.bookingType || 'Tour Package'} Details</h4>
                    <p><strong>Package:</strong> ${currentTourData.name}</p>
                    <p><strong>Route:</strong> ${currentTourData.route}</p>
                    <p><strong>Duration:</strong> ${currentTourData.duration}</p>
                    <p><strong>Travel Date:</strong> ${new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div>
                    <h4 style="margin-bottom: 8px; color: #4f46e5;">Traveler Info</h4>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Travelers:</strong> ${travelers} Person(s)</p>
                </div>
            </div>
            <div style="text-align: right; font-size: 20px; font-weight: 700; color: #10b981; padding: 15px; background: #f0fdf4; border-radius: 8px;">
                Total Paid: ${totalText}
            </div>
            <div style="text-align: center; color: #10b981; margin-top: 30px;">
                <i class="fas fa-check-circle" style="font-size: 48px; margin-bottom: 15px;"></i>
                <h3>${currentTourData.bookingType || 'Tour Package'} Confirmed!</h3>
                <p>Confirmation sent to ${email}</p>
            </div>
        </div>
    `;

    document.getElementById('invoiceModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    showNotification((currentTourData.bookingType || 'Tour Package') + ' booked successfully!', 'success');
}

// ========================================
// Reviews Carousel
// ========================================

function initReviewCarousel() {
    const track = document.getElementById('reviewsTrack');
    if (!track) return;

    const slides = Array.from(track.children);
    const prevBtn = document.getElementById('reviewPrev');
    const nextBtn = document.getElementById('reviewNext');
    let current = 0;

    function render() {
        track.style.transform = `translateX(-${current * 100}%)`;
    }

    prevBtn?.addEventListener('click', function () {
        current = (current - 1 + slides.length) % slides.length;
        render();
    });

    nextBtn?.addEventListener('click', function () {
        current = (current + 1) % slides.length;
        render();
    });

    setInterval(() => {
        current = (current + 1) % slides.length;
        render();
    }, 4500);
}



