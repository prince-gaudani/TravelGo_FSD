// ========================================
// TravelGo - Main JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    initAuth();
    initNavbar();
    initBookingTabs();
    initForms();
    initPasswordToggle();
    initTripTypeToggle();
    setMinDates();
    initHeroSlider();
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
    const card = button.closest('.destination-card');
    bookingData.destination = card.dataset.name;
    bookingData.basePrice = parseInt(card.dataset.price);
    bookingData.destinationType = card.dataset.type;

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
                errorMessage = 'Please enter a valid 10-digit phone number';
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
            showNotification('Please enter a valid 10-digit phone number', 'error');
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
            showNotification('Please enter a valid 10-digit phone number', 'error');
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
                showNotification('Please provide a valid 10-digit phone number for primary traveler', 'error');
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
                showNotification(`Please enter a valid phone number for Traveler ${travelerNum}`, 'error');
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
    const phoneRegex = /^[0-9]{10}$/;
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

    // Close wizard and show invoice
    closeWizard();
    generateInvoice({
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
        grandTotal
    });
}

function generateInvoice(data) {
    document.getElementById('invoiceNumber').textContent = data.invoiceNumber;

    let transportInfo = '';
    if (data.transportType === 'flight' && data.transportDetails) {
        transportInfo = `${data.transportDetails.airline} | ${data.transportDetails.departure} - ${data.transportDetails.arrival}`;
    } else if (data.transportType === 'bus' && data.transportDetails) {
        transportInfo = `${data.transportDetails.operator} (${data.transportDetails.type}) | ${data.transportDetails.departure} - ${data.transportDetails.arrival}`;
    } else if (data.transportType === 'train' && data.transportDetails) {
        transportInfo = `${data.transportDetails.name} #${data.transportDetails.number} | ${data.transportDetails.departure} - ${data.transportDetails.arrival}`;
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

    document.getElementById('invoiceBody').innerHTML = `
        <div class="invoice-section">
            <h4>Booking Details</h4>
            <table class="invoice-table">
                <tr><td><strong>Destination</strong></td><td>${data.destination} (${data.destinationType})</td></tr>
                <tr><td><strong>From</strong></td><td>${data.fromCity}</td></tr>
                <tr><td><strong>Travel Date</strong></td><td>${new Date(data.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td></tr>
                <tr><td><strong>Transport</strong></td><td>${data.transportType.charAt(0).toUpperCase() + data.transportType.slice(1)}</td></tr>
                <tr><td><strong>${data.transportType.charAt(0).toUpperCase() + data.transportType.slice(1)} Details</strong></td><td>${transportInfo}</td></tr>
                <tr><td><strong>Booking Date</strong></td><td>${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td></tr>
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
            <h4>Payment Summary</h4>
            <table class="invoice-table">
                <tr><td>Package Price</td><td>₹${data.packagePrice.toLocaleString('en-IN')}</td></tr>
                <tr><td>${data.transportType.charAt(0).toUpperCase() + data.transportType.slice(1)} Fare</td><td>₹${data.transportPrice.toLocaleString('en-IN')}</td></tr>
                <tr><td>Taxes & GST (18%)</td><td>₹${data.taxes.toLocaleString('en-IN')}</td></tr>
            </table>
            <div class="invoice-total">
                Total Paid: ₹${data.grandTotal.toLocaleString('en-IN')}
            </div>
        </div>
        
        <div class="invoice-section" style="text-align: center; color: #10b981;">
            <i class="fas fa-check-circle" style="font-size: 48px; margin-bottom: 15px;"></i>
            <h3>Booking Confirmed!</h3>
            <p>Confirmation sent to ${data.travelers[0]?.email || 'your email'}</p>
            <p style="color: #64748b; font-size: 13px;">Invoice #${data.invoiceNumber}</p>
        </div>
    `;

    document.getElementById('invoiceModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeInvoiceModal() {
    document.getElementById('invoiceModal').classList.remove('active');
    document.body.style.overflow = '';
}

function downloadInvoice() {
    showNotification('Invoice download started!', 'success');
    window.print();
}

// ========================================
// Booking Tabs (bookings.html)
// ========================================

function initBookingTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');

    // Only run on bookings page
    if (tabBtns.length === 0) return;

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const tabId = this.dataset.tab;
            switchToTab(tabId);
        });
    });

    // Check URL parameter for tab selection
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['flight', 'bus', 'hotel', 'resort', 'train'].includes(tabParam)) {
        switchToTab(tabParam);
    }
}

function switchToTab(tabId) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Remove active from all
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    // Add active to target
    const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    const targetContent = document.getElementById(tabId);

    if (targetBtn) {
        targetBtn.classList.add('active');
    }
    if (targetContent) {
        targetContent.classList.add('active');
    }

    // Scroll to booking section
    const bookingSection = document.querySelector('.booking-section');
    if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function swapLocations(type) {
    const fromInput = document.getElementById(`${type}From`);
    const toInput = document.getElementById(`${type}To`);
    if (fromInput && toInput) {
        const temp = fromInput.value;
        fromInput.value = toInput.value;
        toInput.value = temp;
    }
}

function initTripTypeToggle() {
    const tripTypeRadios = document.querySelectorAll('input[name="tripType"]');
    const returnDateGroup = document.querySelector('.return-date');

    tripTypeRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (returnDateGroup) {
                returnDateGroup.style.display = this.value === 'roundtrip' ? 'block' : 'none';
                const input = returnDateGroup.querySelector('input');
                if (input) input.required = this.value === 'roundtrip';
            }
        });
    });
}

function initForms() {
    ['flightForm', 'trainForm', 'busForm', 'hotelForm', 'resortForm'].forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                handleBookingSubmit(formId.replace('Form', ''), this);
            });
        }
    });

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
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.setAttribute('min', today);
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
