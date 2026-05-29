// Booking Modal Logic
(function () {
    var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwlSRpJGCgK_B142YmpMl0YR1XDmjm6BZbrAbjT36MAKyKhOMk2tvAhJUjvGHAUj3eN/exec';

    var form = document.getElementById('bookingForm');
    if (!form) return;

    var successDiv = document.getElementById('bookingSuccess');
    var submitBtn = document.getElementById('submitBookingBtn');
    var checkinInput = document.getElementById('bookingCheckin');
    var checkoutInput = document.getElementById('bookingCheckout');
    var adultsInput = document.getElementById('bookingAdults');
    var childrenInput = document.getElementById('bookingChildren');
    var capacityWarning = document.getElementById('capacityWarning');
    var capacityWarningText = document.getElementById('capacityWarningText');
    var roomCapacityInput = document.getElementById('bookingRoomCapacity');

    // Set minimum date to today
    var today = new Date().toISOString().split('T')[0];
    checkinInput.setAttribute('min', today);
    checkoutInput.setAttribute('min', today);

    // When check-in changes, set check-out min to day after check-in
    checkinInput.addEventListener('change', function () {
        if (this.value) {
            var nextDay = new Date(this.value);
            nextDay.setDate(nextDay.getDate() + 1);
            var nextDayStr = nextDay.toISOString().split('T')[0];
            checkoutInput.setAttribute('min', nextDayStr);
            if (checkoutInput.value && checkoutInput.value <= this.value) {
                checkoutInput.value = nextDayStr;
            }
        }
    });

    // Check guest capacity
    function checkCapacity() {
        var capacity = parseInt(roomCapacityInput.value) || 99;
        var adults = parseInt(adultsInput.value) || 1;
        var children = parseInt(childrenInput.value) || 0;
        var total = adults + children;

        if (total > capacity) {
            capacityWarning.style.display = 'block';
            capacityWarningText.textContent = 'Total guests (' + total + ') exceeds room capacity (' + capacity + '). Please reduce guest count or choose a different room.';
            return false;
        } else {
            capacityWarning.style.display = 'none';
            return true;
        }
    }

    adultsInput.addEventListener('change', checkCapacity);
    childrenInput.addEventListener('change', checkCapacity);

    // Open modal with room data
    window.openBookingModal = function (roomName, roomType, roomCapacity, roomPrice) {
        // Reset form first
        form.reset();
        form.classList.remove('was-validated');
        capacityWarning.style.display = 'none';
        successDiv.style.display = 'none';
        form.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Submit Booking';

        // Set room data
        document.getElementById('bookingRoomType').value = roomName + ' (' + roomType + ')';
        document.getElementById('bookingRoomCapacity').value = roomCapacity;
        document.getElementById('bookingRoomPrice').value = roomPrice;
        document.getElementById('bookingPriceDisplay').textContent = '₹' + parseFloat(roomPrice).toFixed(2) + ' / night';
        document.getElementById('bookingAdults').value = 1;
        document.getElementById('bookingChildren').value = 0;

        // Show modal
        var modal = new bootstrap.Modal(document.getElementById('bookingModal'));
        modal.show();
    };

    // Form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Validate capacity
        if (!checkCapacity()) {
            return;
        }

        // Check-out must be after check-in
        if (checkinInput.value && checkoutInput.value && checkoutInput.value <= checkinInput.value) {
            checkoutInput.setCustomValidity('Check-out must be after check-in');
        } else {
            checkoutInput.setCustomValidity('');
        }

        // Bootstrap validation
        form.classList.add('was-validated');
        if (!form.checkValidity()) {
            return;
        }

        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...';

        // Build form data
        var formData = new FormData();
        formData.append('formType', 'booking');
        formData.append('roomType', document.getElementById('bookingRoomType').value);
        formData.append('checkinDate', checkinInput.value);
        formData.append('checkoutDate', checkoutInput.value);
        formData.append('guestName', document.getElementById('bookingGuestName').value);
        formData.append('mobile', document.getElementById('bookingMobile').value);
        formData.append('email', document.getElementById('bookingEmail').value || 'N/A');
        formData.append('adults', adultsInput.value);
        formData.append('children', childrenInput.value);
        formData.append('arrivalTime', document.getElementById('bookingArrivalTime').value || 'Not specified');
        formData.append('paymentOption', document.getElementById('bookingPayment').value);
        formData.append('specialRequest', document.getElementById('bookingRequest').value || 'None');
        formData.append('roomPrice', document.getElementById('bookingRoomPrice').value);

        // Submit to Google Apps Script
        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        })
        .then(function () {
            form.style.display = 'none';
            successDiv.style.display = 'block';
        })
        .catch(function () {
            form.style.display = 'none';
            successDiv.style.display = 'block';
        });
    });

    // Reset modal when closed
    var bookingModal = document.getElementById('bookingModal');
    bookingModal.addEventListener('hidden.bs.modal', function () {
        form.reset();
        form.classList.remove('was-validated');
        form.style.display = 'block';
        successDiv.style.display = 'none';
        capacityWarning.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Submit Booking';
    });
})();
