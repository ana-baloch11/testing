/* ==========================================================================
   Mosque Website Javascript - Masjid Al-Noor
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Theme Toggle (Dark/Light Mode) ---
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  // Check saved theme or system preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    body.classList.add('light-theme');
  }

  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
  });


  // --- 2. Mobile Menu (Hamburger Navigation) ---
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navMenu.classList.toggle('open');
  });

  // Close menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Manage active visual state
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      hamburger.classList.remove('open');
      navMenu.classList.remove('open');
    });
  });


  // --- 3. Dynamic Prayer Times & Countdown Setup ---
  // Configurations for Namaz timings in 24-hour format (hours, minutes)
  const prayerConfig = [
    { name: 'Fajr', id: 'fajr', hour: 4, minute: 15, adhanDisp: '04:15 AM', iqamahDisp: '04:45 AM' },
    { name: 'Dhuhr', id: 'dhuhr', hour: 12, minute: 30, adhanDisp: '12:30 PM', iqamahDisp: '01:30 PM' },
    { name: 'Asr', id: 'asr', hour: 16, minute: 45, adhanDisp: '04:45 PM', iqamahDisp: '05:15 PM' },
    { name: 'Maghrib', id: 'maghrib', hour: 19, minute: 20, adhanDisp: '07:20 PM', iqamahDisp: '07:25 PM' },
    { name: 'Isha', id: 'isha', hour: 21, minute: 0, adhanDisp: '09:00 PM', iqamahDisp: '09:15 PM' }
  ];

  const nextPrayerNameEl = document.getElementById('nextPrayerName');
  const nextPrayerTimeEl = document.getElementById('nextPrayerTime');
  const nextPrayerCountdownEl = document.getElementById('nextPrayerCountdown');
  const prayerTableRows = {
    fajr: document.getElementById('row-fajr'),
    dhuhr: document.getElementById('row-dhuhr'),
    asr: document.getElementById('row-asr'),
    maghrib: document.getElementById('row-maghrib'),
    isha: document.getElementById('row-isha')
  };

  function updatePrayerTimer() {
    const now = new Date();
    let nextPrayer = null;
    let nextPrayerTime = null;

    // Loop through config to find the upcoming prayer
    for (let i = 0; i < prayerConfig.length; i++) {
      const p = prayerConfig[i];
      const pDate = new Date();
      pDate.setHours(p.hour, p.minute, 0, 0);

      // If prayer is in the future today
      if (pDate > now) {
        nextPrayer = p;
        nextPrayerTime = pDate;
        break;
      }
    }

    // If all daily prayers passed (it is late night), the next prayer is Fajr tomorrow
    if (!nextPrayer) {
      nextPrayer = prayerConfig[0]; // Fajr
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(nextPrayer.hour, nextPrayer.minute, 0, 0);
      nextPrayerTime = tomorrow;
    }

    // Highlight the active row in the table
    Object.values(prayerTableRows).forEach(row => {
      if (row) row.classList.remove('active-prayer-row');
    });
    const activeRow = prayerTableRows[nextPrayer.id];
    if (activeRow) {
      activeRow.classList.add('active-prayer-row');
    }

    // Calculate time differences
    const diffMs = nextPrayerTime - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    // Update Hero UI Panel
    nextPrayerNameEl.textContent = nextPrayer.name;
    nextPrayerTimeEl.textContent = nextPrayer.adhanDisp;

    // Formatting string
    let countdownStr = 'Starts in ';
    if (diffHours > 0) {
      countdownStr += `${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
    } else if (diffMinutes > 0) {
      countdownStr += `${diffMinutes}m ${diffSeconds}s`;
    } else {
      countdownStr += `${diffSeconds}s`;
    }
    nextPrayerCountdownEl.textContent = countdownStr;
  }

  // Initial call and interval refresh every second
  updatePrayerTimer();
  setInterval(updatePrayerTimer, 1000);


  // --- 4. Interactive Donation Form Logic ---
  const amountBtns = document.querySelectorAll('.amount-btn');
  const customAmountWrapper = document.getElementById('customAmountWrapper');
  const customAmountInput = document.getElementById('customAmount');
  const donationForm = document.getElementById('donationForm');
  let selectedAmount = '500'; // Default active amount button is 500

  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Manage active CSS classes
      amountBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const amountVal = btn.getAttribute('data-amount');
      selectedAmount = amountVal;

      if (amountVal === 'custom') {
        customAmountWrapper.style.display = 'block';
        customAmountInput.focus();
      } else {
        customAmountWrapper.style.display = 'none';
        customAmountInput.value = '';
      }
    });
  });

  donationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const donorEmail = document.getElementById('donorEmail').value;
    const donorName = document.getElementById('donorName').value || 'Anonymous';
    let finalAmount = selectedAmount;

    if (selectedAmount === 'custom') {
      finalAmount = customAmountInput.value;
      if (!finalAmount || finalAmount < 100) {
        alert('Please enter a valid amount (Minimum ₨ 100).');
        return;
      }
    }

    // Visual feedback of processing donation
    const submitBtn = donationForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Redirecting to Safepay... 🔒';

    // Build Safepay checkout URL and redirect
    const params = new URLSearchParams({
      merchant_id: SAFEPAY_MERCHANT_ID,
      order_id: `donation-${Date.now()}`,
      amount: finalAmount.toString(),
      currency: 'PKR',
      return_url: SAFEPAY_RETURN_URL,
      cancel_url: SAFEPAY_CANCEL_URL,
    });
    if (donorName && donorName !== 'Anonymous') params.set('customer_name', donorName);
    if (donorEmail) params.set('customer_email', donorEmail);

    setTimeout(() => {
      window.location.href = `https://checkout.safepay.pk/pay?${params.toString()}`;
    }, 800);
  });


  // --- 5. Interactive Contact Form Submission ---
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subjectSelect = document.getElementById('subject');
    const subjectText = subjectSelect.options[subjectSelect.selectedIndex].text;
    const message = document.getElementById('message').value;

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending Message...';

    // Mock API request
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      
      // Show beautiful success banner
      formFeedback.className = 'form-feedback success';
      formFeedback.textContent = `JazakAllah, ${name}! Your inquiry about "${subjectText}" has been sent. We will contact you at ${email} shortly.`;
      
      // Reset contact form
      contactForm.reset();

      // Clear banner after 6 seconds
      setTimeout(() => {
        formFeedback.className = 'form-feedback';
        formFeedback.textContent = '';
      }, 6000);

    }, 1500);
  });

});
