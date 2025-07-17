document.addEventListener('DOMContentLoaded', function () {
  const verticalSwiperEl = document.querySelector('.detail-gallery-swiper');
  const horizontalSwiperEl = document.querySelector('.main-gallery-swiper');

  if (!verticalSwiperEl || !horizontalSwiperEl) return;

  const verticalSwiper = new Swiper(verticalSwiperEl, {
    direction: 'vertical',
    spaceBetween: 15,
    slidesPerView: 4,
    allowTouchMove: true,
    watchOverflow: true,
  });

  const horizontalSwiper = new Swiper(horizontalSwiperEl, {
    direction: 'horizontal',
    slidesPerView: 1,
    allowTouchMove: true,
    watchOverflow: true,
  });

  const nextBtn = document.querySelector('.custom-swiper-button-next');
  const prevBtn = document.querySelector('.custom-swiper-button-prev');

  function updateButtons() {
    const isAtBeginning = verticalSwiper.isBeginning && horizontalSwiper.isBeginning;
    const isAtEnd = verticalSwiper.isEnd && horizontalSwiper.isEnd;

    prevBtn.disabled = isAtBeginning;
    nextBtn.disabled = isAtEnd;

    prevBtn.classList.toggle('swiper-button-disabled', isAtBeginning);
    nextBtn.classList.toggle('swiper-button-disabled', isAtEnd);
  }

  nextBtn.addEventListener('click', () => {
    verticalSwiper.slideNext();
    horizontalSwiper.slideNext();
    updateButtons();
  });

  prevBtn.addEventListener('click', () => {
    verticalSwiper.slidePrev();
    horizontalSwiper.slidePrev();
    updateButtons();
  });

  verticalSwiper.on('slideChange', updateButtons);
  horizontalSwiper.on('slideChange', updateButtons);

  updateButtons();
});
