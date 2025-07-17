document.addEventListener('DOMContentLoaded', function () {

  document.querySelectorAll('.custom__price-item').forEach(el => {
    const price = el.dataset.price;
    const symbol = el.dataset.currencySymbol;
    if (price && symbol) {
      el.textContent = `${price}${symbol}`;
    }
  });
});
