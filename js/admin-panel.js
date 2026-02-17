// ========================================
// TravelGo Admin Panel (Entity Pages)
// ========================================

(function () {
    const KEY = 'travelgo_custom_content';
    const mode = document.body.dataset.adminMode || '';
    if (!mode) return;

    const collectionMap = {
        destination: 'destinations',
        tour: 'tours',
        hotel: 'stays',
        resort: 'stays'
    };

    const fixedStayType = mode === 'hotel' ? 'hotel' : mode === 'resort' ? 'resort' : '';

    const form = document.getElementById('adminEntityForm');
    const list = document.getElementById('adminEntityList');

    if (!form || !list) return;
    let editingId = '';
    const submitBtn = form.querySelector('button[type="submit"]');
    const defaultSubmitText = submitBtn ? submitBtn.textContent.trim() : 'Save';
    const cancelEditBtn = document.createElement('button');
    cancelEditBtn.type = 'button';
    cancelEditBtn.className = 'btn btn-outline';
    cancelEditBtn.style.marginLeft = '8px';
    cancelEditBtn.style.display = 'none';
    cancelEditBtn.textContent = 'Cancel Edit';
    if (submitBtn && submitBtn.parentNode) submitBtn.parentNode.appendChild(cancelEditBtn);

    function notify(msg, type) {
        if (typeof showNotification === 'function') showNotification(msg, type || 'success');
        else alert(msg);
    }

    function getStore() {
        try {
            const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
            return {
                destinations: Array.isArray(parsed.destinations) ? parsed.destinations : [],
                tours: Array.isArray(parsed.tours) ? parsed.tours : [],
                stays: Array.isArray(parsed.stays) ? parsed.stays : []
            };
        } catch (e) {
            return { destinations: [], tours: [], stays: [] };
        }
    }

    function saveStore(data) {
        localStorage.setItem(KEY, JSON.stringify(data));
    }

    function uid(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    }

    function esc(v) {
        return String(v || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function readField(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }

    function setField(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value == null ? '' : String(value);
    }

    function buildEntityFromForm() {
        if (mode === 'destination') {
            return {
                id: editingId || uid('dest'),
                type: readField('type') || 'domestic',
                name: readField('name'),
                location: readField('location'),
                badge: readField('badge') || 'Popular',
                price: parseInt(readField('price') || '0', 10),
                originalPrice: parseInt(readField('originalPrice') || '0', 10),
                rating: parseFloat(readField('rating') || '4.7'),
                image: readField('image'),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }

        if (mode === 'tour') {
            return {
                id: editingId || uid('tour'),
                name: readField('name'),
                category: readField('category') || 'adventure',
                route: readField('route'),
                durationText: readField('durationText'),
                durationDays: parseInt(readField('durationDays') || '4', 10),
                price: parseInt(readField('price') || '0', 10),
                originalPrice: parseInt(readField('originalPrice') || '0', 10),
                rating: parseFloat(readField('rating') || '4.8'),
                reviews: readField('reviews') || '100',
                includes: readField('includes'),
                badge: readField('badge') || 'Custom',
                image: readField('image'),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }

        return {
            id: editingId || uid('stay'),
            stayType: fixedStayType,
            category: readField('category') || 'luxury',
            name: readField('name'),
            route: readField('route'),
            price: parseInt(readField('price') || '0', 10),
            originalPrice: parseInt(readField('originalPrice') || '0', 10),
            rating: parseFloat(readField('rating') || '4.6'),
            reviews: readField('reviews') || '100',
            includes: readField('includes'),
            badge: readField('badge') || (fixedStayType === 'resort' ? 'Resort' : 'Hotel'),
            image: readField('image'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    function validateEntity(entity) {
        if (!entity.name || !entity.image || !entity.price || !entity.originalPrice) {
            return 'Please fill all required fields.';
        }
        if (mode === 'destination' && (!entity.location || !entity.type)) return 'Destination type and location are required.';
        if (mode === 'tour' && (!entity.route || !entity.durationText || !entity.includes)) return 'Route, duration and includes are required.';
        if ((mode === 'hotel' || mode === 'resort') && (!entity.route || !entity.includes)) return 'Location and amenities are required.';
        return '';
    }

    function render() {
        const store = getStore();
        let items = store[collectionMap[mode]] || [];

        if (mode === 'hotel' || mode === 'resort') {
            items = items.filter(i => i.stayType === fixedStayType);
        }

        if (!items.length) {
            list.innerHTML = '<div class="admin-empty">No items added yet.</div>';
            return;
        }

        list.innerHTML = items.map(item => {
            const meta = mode === 'destination'
                ? `${esc(item.type)} | ${esc(item.location)}`
                : mode === 'tour'
                    ? `${esc(item.category)} | ${esc(item.route)}`
                    : `${esc(item.category)} | ${esc(item.route)}`;
            return `
                <div class="admin-item">
                    <div>
                        <strong>${esc(item.name)}</strong>
                        <div class="meta">${meta}</div>
                    </div>
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-outline btn-sm" data-edit-id="${esc(item.id)}">Edit</button>
                        <button class="btn btn-outline btn-sm" data-delete-id="${esc(item.id)}">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function resetFormDefaults() {
        form.reset();
        setField('rating', mode === 'destination' ? '4.7' : mode === 'tour' ? '4.8' : '4.6');
        setField('durationDays', '4');
        setField('includes', mode === 'tour' ? 'Hotels,Meals,Transport,Guide' : 'Free WiFi,Breakfast,Pool');
        setField('type', 'domestic');
        setField('category', mode === 'tour' ? 'adventure' : 'luxury');
    }

    function setEditingState(isEditing) {
        if (submitBtn) submitBtn.textContent = isEditing ? 'Update Item' : defaultSubmitText;
        cancelEditBtn.style.display = isEditing ? '' : 'none';
    }

    function fillFormForEdit(item) {
        if (!item) return;
        if (mode === 'destination') {
            setField('type', item.type || 'domestic');
            setField('name', item.name || '');
            setField('location', item.location || '');
            setField('badge', item.badge || 'Popular');
            setField('price', item.price || '');
            setField('originalPrice', item.originalPrice || '');
            setField('rating', item.rating || '4.7');
            setField('image', item.image || '');
            return;
        }
        if (mode === 'tour') {
            setField('name', item.name || '');
            setField('category', item.category || 'adventure');
            setField('route', item.route || '');
            setField('durationText', item.durationText || '');
            setField('durationDays', item.durationDays || '4');
            setField('price', item.price || '');
            setField('originalPrice', item.originalPrice || '');
            setField('rating', item.rating || '4.8');
            setField('reviews', item.reviews || '100');
            setField('includes', item.includes || 'Hotels,Meals,Transport,Guide');
            setField('badge', item.badge || 'Custom');
            setField('image', item.image || '');
            return;
        }
        setField('name', item.name || '');
        setField('category', item.category || 'luxury');
        setField('route', item.route || '');
        setField('price', item.price || '');
        setField('originalPrice', item.originalPrice || '');
        setField('rating', item.rating || '4.6');
        setField('reviews', item.reviews || '100');
        setField('includes', item.includes || 'Free WiFi,Breakfast,Pool');
        setField('badge', item.badge || (fixedStayType === 'resort' ? 'Resort' : 'Hotel'));
        setField('image', item.image || '');
    }

    function findItemById(id) {
        const store = getStore();
        let items = store[collectionMap[mode]] || [];
        if (mode === 'hotel' || mode === 'resort') {
            items = items.filter(i => i.stayType === fixedStayType);
        }
        return items.find(i => i.id === id) || null;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const entity = buildEntityFromForm();
        const error = validateEntity(entity);
        if (error) {
            notify(error, 'error');
            return;
        }

        const store = getStore();
        const collection = collectionMap[mode];
        const wasEditing = Boolean(editingId);
        if (editingId) {
            store[collection] = (store[collection] || []).map(item => {
                if (item.id !== editingId) return item;
                const createdAt = item.createdAt || entity.createdAt;
                return { ...item, ...entity, createdAt };
            });
        } else {
            store[collection].push(entity);
        }
        saveStore(store);
        editingId = '';
        resetFormDefaults();
        setEditingState(false);

        render();
        notify(wasEditing ? 'Item updated successfully!' : 'Item added successfully!', 'success');
    });

    list.addEventListener('click', function (e) {
        const editBtn = e.target.closest('button[data-edit-id]');
        const btn = e.target.closest('button[data-delete-id]');
        if (editBtn) {
            const id = editBtn.dataset.editId;
            const item = findItemById(id);
            if (!item) return;
            editingId = id;
            fillFormForEdit(item);
            setEditingState(true);
            notify('Editing mode enabled.', 'info');
            return;
        }

        if (!btn) return;
        const id = btn.dataset.deleteId;
        const store = getStore();
        const collection = collectionMap[mode];
        store[collection] = (store[collection] || []).filter(item => item.id !== id);
        saveStore(store);
        if (editingId === id) {
            editingId = '';
            resetFormDefaults();
            setEditingState(false);
        }
        render();
        notify('Item removed.', 'info');
    });

    cancelEditBtn.addEventListener('click', function () {
        editingId = '';
        resetFormDefaults();
        setEditingState(false);
        notify('Edit cancelled.', 'info');
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('userFullName');
            window.location.href = 'login.html';
        });
    }

    resetFormDefaults();
    setEditingState(false);
    render();
})();
