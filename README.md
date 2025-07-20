# blicksolutions coding challenge


## Table of Contents:

1. [Introduction](#introduction)
2. [Media-gallery](#media-gallery)
3. [Product-card](#product-card)
4. [Badge-section](#badge-section)
5. [Customization](#customization)


## Introduction:

Thank you for taking your time to review my coding challenge. This document provides a brief overview of my solution, with explanations
instead of the full code. Please refer to the provided pull request for the complete solution. 

Goal of the coding challenge was to implement a cutom product page. The product page should contain a custom media gallery, a custom product card
and a custom banner consisting of badges. It should also be possible to customize all elements from the shopify admin panel.

After researching the options shopify provides, I outlined multiple possible solutions for the challenge. Since I was free to decide how the implementation should look like,
I decided to create a custom product template in addition to the general product template. Like this, the merchant would be able to change the used theme on the product level.
This way each product can get an individual template, without replacing the original product template. This approach ensures full flexibility and scalability.

As a base for my solution I used the 'Dawn' theme.


## Media-gallery:

### Desktop


The media gallery should consist of two elements, one big item to the right (main gallery) and one small detail preview (detail gallery), showcasing the next gallery items.
It should be possible to swipe through by two buttons, which should be disabled as soon as the gallery reaches the first/last slide.
This implies that the gallery should not loop through.

This was implemented by using two swipers. The main swiper is implemented horizontally and the detail swiper is implemented vertically. Both are synced. 

<pre> ```


<div class="custom-media-gallery">
  <div class="swiper detail-gallery-swiper" data-slides-per-view="4" data-direction="vertical">
    <div class="swiper-wrapper">
      {%- if product.selected_or_first_available_variant.featured_media != null -%}
        {%- assign featured_media = product.selected_or_first_available_variant.featured_media -%}
        <div class="swiper-slide main-swiper-thumbnail" data-media-id="{{ featured_media.id }}">
          {% render 'custom-product-thumbnail',
            media: featured_media,
            media_count: media_count,
            position: 1,
            desktop_layout: section.settings.gallery_layout,
            mobile_layout: section.settings.mobile_thumbnails,
            loop: section.settings.enable_video_looping,
            modal_id: section.id,
            xr_button: true,
            media_width: media_width,
            media_fit: section.settings.media_fit,
            constrain_to_viewport: section.settings.constrain_to_viewport,
            lazy_load: false
          %}
        </div>
      {%- endif -%}
      
      {%- for media in product.media -%}
        {%- unless media.id == product.selected_or_first_available_variant.featured_media.id -%}
          <div class="swiper-slide detail-swiper-thumbnail" data-media-id="{{ media.id }}">
            {% render 'custom-product-thumbnail',
              media: media,
              media_count: media_count,
              position: forloop.index,
              desktop_layout: section.settings.gallery_layout,
              mobile_layout: section.settings.mobile_thumbnails,
              loop: section.settings.enable_video_looping,
              modal_id: section.id,
              xr_button: true,
              media_width: media_width,
              media_fit: section.settings.media_fit,
              constrain_to_viewport: section.settings.constrain_to_viewport,
              lazy_load: true
            %}
          </div>
        {%- endunless -%}
      {%- endfor -%}
    </div>
  </div>

  <div class="custom-main-gallery-container">
    <div class="swiper main-gallery-swiper" data-direction="horizontal">
      <div class="swiper-wrapper">
        {% for media in product.media %}
          <div class="swiper-slide" data-media-id="{{ media.id }}">
            {% render 'custom-product-thumbnail',
              media: media,
              media_count: forloop.length,
              position: forloop.index,
              desktop_layout: section.settings.gallery_layout,
              mobile_layout: section.settings.mobile_thumbnails,
              loop: section.settings.enable_video_looping,
              modal_id: section.id,
              xr_button: true,
              media_width: media_width,
              media_fit: section.settings.media_fit,
              constrain_to_viewport: section.settings.constrain_to_viewport,
              lazy_load: false
            %}
          </div>
        {% endfor %}
      </div>
    </div>

    [...]



``` </pre>


### Mobile

The mobile view only has one slider. The tricky part here was, different to the desktop version, to enable looping through. Also the previous and next item in the slider
have to be previewed left and right from the main element. I decided to leverage the existing main swiper, since it already has a horizontal direction.
Another option would be to implement a third swiper, which is only visible on mobile. 

The easiest way to ensure that looping through is possible on mobile but not on desktop for the main swiper, was to use a variable which checks the screen width:

<pre> ```

const isMobile = window.matchMedia('(max-width: 767px)').matches;

  {...]

  const horizontalSwiper = new Swiper(horizontalSwiperEl, {
    direction: 'horizontal',
    slidesPerView: 'auto',
    spaceBetween: 7,
    centeredSlides: true,
    allowTouchMove: true,
    watchOverflow: true,
    loop: isMobile,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  });

  [...]

``` </pre>


Unfortunately this breaks the layout for disabling the swiper buttons on the desktop view. We fixed that with custom diabling/enabling logic:


<pre> ```

    [...]

  const nextBtn = document.querySelector('.custom-swiper-button-next');
  const prevBtn = document.querySelector('.custom-swiper-button-prev');

  function updateButtons() {
    if (isMobile) return;

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

  [...]

``` </pre>


When ensuring the next and previous slide were partially displayed on mobile, we had to deal with shopify setting the page-width.
To avoid the default page width, while still having the opportuntiy to center content we added a couple css classes in the base.css file.


<pre> ```

.custom-product-container {
    width: 100vw;
    display:flex;
    justify-content:center;



}
.custom-product-center {
    width:100%;
    margin-left:auto;
    margin-right:auto;



}

.custom-product-overview{
    margin-left: auto;
    margin-right: auto;
    display:flex;

}


@media (max-width: 768px) {

    .custom-product-overview{
        margin-left: auto;
        margin-right: auto;
        display:flex;
        flex-direction: column;
    }
}

``` </pre>

the rest of the css is managed in section-custom-gallery.css


### Additional information:

Since There was no modal specified in the challenge description, it was not implemented. If it is required, the default dawn product modal could be utilized and/or modified to satisfy given requirements.

Also for QA testing it is important to note that the swiper initialization is triggered by an event listener on the document, listening for the DOMContentLoaded event like this:

<pre> ```

document.addEventListener('DOMContentLoaded', function () {

[...]
 
});

``` </pre>

This means that changing the viewport (for example to a mobile view) will not cause re-initialization and therefore will not allow looping, since isMobile won't get updated.

Manual reload is necessary after switching viewports. For real-world use cases this is not relevant. 


## Product-card:

The product card was very straight forward. This was solved by creating custom snippets for each element within the product card, wrapping all of them and looping through section.blocks.
In the for-loop each snippet gets rendered **when** its present. This ensures modularity and allows merchants to customize the layout through shopifys theme editor.


<pre> ```


<section
  id="ProductInfo-{{ section.id }}"
  class="product__info-container custom-product-card"
>
  {%- assign product_form_id = 'product-form-' | append: section.id -%}

  {%- for block in section.blocks -%}
    {%- case block.type -%}
      {%- when '@app' -%}
        {% render block %}

      {%- when 'title' -%}
        <div class="product__title" {{ block.shopify_attributes }}>
          <h1 class="custom-product-title">{{ product.title | escape }}</h1>
          <a href="{{ product.url }}" class="product__title">
            <h2 class="h1">{{ product.title | escape }}</h2>
          </a>
        </div>

      {%- when 'description' -%}
        {%- if product.description != blank -%}
          <div class="custom-product-description rte quick-add-hidden" {{ block.shopify_attributes }}>
            {{ product.description }}
          </div>
        {%- endif -%}

      {%- when 'price' -%}
        <div class="custom-price-container">
          <div id="price-{{ section.id }}" role="status" {{ block.shopify_attributes }}>
            {%- render 'custom-price',
              product: product,
              use_variant: true,
              show_badges: false
            -%}
          </div>

          {%- if product.quantity_price_breaks_configured? -%}
            <div class="volume-pricing-note" id="Volume-Note-{{ section.id }}">
              <span>{{ 'products.product.volume_pricing.note' | t }}</span>
            </div>
          {%- endif -%}

          {%- if cart.taxes_included or cart.duties_included or shop.shipping_policy.body != blank -%}
            <div class="custom-product-tax caption rte">
              {%- if cart.duties_included and cart.taxes_included -%}
                {{ 'products.product.duties_and_taxes_included' | t }}
              {%- elsif cart.taxes_included -%}
                {{ 'products.product.taxes_included' | t }}
              {%- elsif cart.duties_included -%}
                {{ 'products.product.duties_included' | t }}
              {%- endif -%}
              {%- if shop.shipping_policy.body != blank -%}
                {{ 'products.product.shipping_policy_html' | t: link: shop.shipping_policy.url }}
              {%- endif -%}
            </div>
          {%- endif -%}

          <div {{ block.shopify_attributes }}>
            {%- assign product_form_installment_id = 'product-form-installment-' | append: section.id -%}
            {%- form 'product', product, id: product_form_installment_id, class: 'installment caption-large' -%}
              <input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}">
              {{ form | payment_terms }}
            {%- endform -%}
          </div>
        </div>

      {% when 'availability_text' %}
        {% if product.available %}
          <span class="custom-product-available">
            <div class="custom-green-dot"></div>
            <div class="custom-product-available-text">
              {{ block.settings.available_text }}
            </div>
          </span>
        {% else %}
          <span class="custom-product-not-available">
            <div class="custom-red-dot"></div>
            <div class="custom-product-not-available-text">
              {{ block.settings.sold_out_text }}
            </div>
          </span>
        {% endif %}

      {%- when 'buy_buttons' -%}
        {%- render 'custom-buy-buttons',
          block: block,
          product: product,
          product_form_id: product_form_id,
          section_id: section.id,
          show_pickup_availability: true
        -%}
    {%- endcase -%}
  {%- endfor -%}
</section>


``` </pre>


The mobile view was created through media queries within the css. The css is managed within section-custom-product-card.css.


## Badge-section:

The badges were the most straight-forward feature. The implementation was done by looping through section.blocks and rendering a custom snippet if the type is 'custom_badge', like this:


<pre> ```

 <div class="custom-badge-container">
    <div class="custom-badge-wrapper">
      {% for block in section.blocks %}
        {% if block.type == 'custom_badge' %}
          <div class="custom-badge">
            {% render 'custom-badge',
              image: block.settings.image,
              headline: block.settings.headline,
              description: block.settings.description
            %}
          </div>
        {% endif %}
      {% endfor %}
    </div>
  </div>

``` </pre>


The custom-badge snippet is taking an image, a headline and a description, which can be set by the merchant in the admin panel. The css is contained in section-custom-badge.css and mobile friendlyness is
provided through mediaqueries.


## Customization:

All content on the product page can be set through the admin panel. The pictures in the media gallery, as well as the product title, price and description, need to be set in **home > products > [choose product]**.
The other information needs to be changed through shopifys theme customization in **online store > themes > [choose theme]+customize > [choose product] > product information > [choose item]**.

This was made possible by adding the customizable elements in the json template as well as the section schema. 
