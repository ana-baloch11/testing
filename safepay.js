// safepay.js – Safepay checkout integration
// NOTE: Your Safepay merchant/public ID is the same as the secret key you provided.
// Replace the value below if you ever receive a distinct public merchant ID.
const SAFEPAY_MERCHANT_ID = 'sec_0a0f630c-ea2c-47dd-be68-030dccfc3ae8';

// You can customize these URLs, or leave them as defaults pointing to the same site.
const SAFEPAY_RETURN_URL = 'https://testing-d4kwlxvwp-ana-baloch11s-projects.vercel.app/thankyou.html';
const SAFEPAY_CANCEL_URL = 'https://testing-d4kwlxvwp-ana-baloch11s-projects.vercel.app/cancel.html';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('donate-form');
  const errorBox = document.getElementById('donate-error');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorBox.textContent = '';

    const amount = Number(form.amount.value);
    if (isNaN(amount) || amount < 10) {
      errorBox.textContent = 'Please enter a valid amount (minimum PKR 10).';
      return;
    }

    const params = new URLSearchParams({
      merchant_id: SAFEPAY_MERCHANT_ID,
      order_id: `donation-${Date.now()}`,
      amount: amount.toString(),
      currency: 'PKR',
      return_url: SAFEPAY_RETURN_URL,
      cancel_url: SAFEPAY_CANCEL_URL,
      ...(form.name?.value && { customer_name: form.name.value }),
      ...(form.email?.value && { customer_email: form.email.value }),
    });

    const checkoutUrl = `https://checkout.safepay.pk/pay?${params.toString()}`;
    window.location.href = checkoutUrl;
  });
});
