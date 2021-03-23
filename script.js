
//!Slider dots

const slider = function () {
    const slides = document.querySelectorAll('.slide');
    const dotContainer = document.querySelector('.dots');   
    let curSlide = 0;
    const maxSlide = slides.length;
  
    // Functions
    const createDots = function () {
      slides.forEach(function (_, i) {
        dotContainer.insertAdjacentHTML(
          'beforeend',
          `<button class="dots__dot" data-slide="${i}"></button>`
        );
      });
    };
  
    const activateDot = function (slide) {
      document
        .querySelectorAll('.dots__dot')
        .forEach(dot => dot.classList.remove('dots__dot--active'));
  
      document
        .querySelector(`.dots__dot[data-slide="${slide}"]`)
        .classList.add('dots__dot--active');
    };
  
    const goToSlide = function (slide) {
      slides.forEach(
        (s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`)
      );
    };
  
    // Next slide
    const nextSlide = function () {
      if (curSlide === maxSlide - 1) {
        curSlide = 0;
      } else {
        curSlide++;
      }
  
      goToSlide(curSlide);
      activateDot(curSlide);
    };
  
    const prevSlide = function () {
      if (curSlide === 0) {
        curSlide = maxSlide - 1;
      } else {
        curSlide--;
      }
      goToSlide(curSlide);
      activateDot(curSlide);
    };
  
    const init = function () {
      goToSlide(0);
      createDots();
  
      activateDot(0);
    };
    init();
  
  
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') prevSlide();
      e.key === 'ArrowRight' && nextSlide();
    });
  
    dotContainer.addEventListener('click', function (e) {
      if (e.target.classList.contains('dots__dot')) {
        const { slide } = e.target.dataset;
        goToSlide(slide);
        activateDot(slide);
      }
    });
  };
 
 slider();

//!  End of slider
 

const cartDOM = document.querySelector('.cart');
const addToCartButtons = document.querySelectorAll('[data-action="ADD_TO_CART"]');


let cart = (JSON.parse(localStorage.getItem('cart-section')) || []);

if(cart.length > 0){
    cart.forEach(cartItem => {
        const product = cartItem;
        insertItemToDOM(product);
        countCartTotal();

        addToCartButtons.forEach(addToCartButtonDOM => {
            const productDOM = addToCartButtonDOM.parentNode;
            console.log(productDOM);

            if(productDOM.querySelector('.product__name').innerText === product.name){
                handleActionButtons(addToCartButtonDOM, product);
            }
        });
    });
}

addToCartButtons.forEach(addToCartButtonDOM => {
    addToCartButtonDOM.addEventListener('click', () => {
        const productDOM = addToCartButtonDOM.parentNode;
        const product = {
            image: productDOM.querySelector('.product__image').getAttribute('src'),
            name: productDOM.querySelector('.product__name').innerText,
            price: productDOM.querySelector('.product__price').innerText,
            quantity: 1,
        };

        const isInCart = (cart.filter(cartItem => (cartItem.name === product.name)).length > 0);

        if(!isInCart){
            insertItemToDOM(product);
            cart.push(product);
            saveCart();
            handleActionButtons(addToCartButtonDOM, product)
        }
        
    });
});


function insertItemToDOM(product){
    cartDOM.insertAdjacentHTML('beforeend', `
        <div class="cart__item">
            <img class="cart__item__image" src="${product.image}" alt="${product.name}">
            <h3 class="cart__item__name">${product.name}</h3>
            <h3 class="cart__item__price">${product.price}</h3>
            <button class="btn btn--primary btn--small${(product.quantity === 1 ? ' btn--danger' : '')}" data-action="DECREASE_ITEM">&minus;</button>
            <h3 class="cart__item__quantity">${product.quantity}</h3>
            <button class="btn btn--primary btn--small" data-action="INCREASE_ITEM">&plus;</button>
            <button class="btn btn--danger btn--small" data-action="REMOVE_ITEM">&times;</button>
        </div>
    `);

    addCartFooter();
}

function handleActionButtons(addToCartButtonDOM, product){
    addToCartButtonDOM.innerText = "In Cart"; 
    addToCartButtonDOM.disabled = true;

    const cartItemsDOM = cartDOM.querySelectorAll('.cart__item');
    cartItemsDOM.forEach(cartItemDOM => {                
        if(cartItemDOM.querySelector('.cart__item__name').innerText === product.name){
            
            cartItemDOM.querySelector('[data-action="INCREASE_ITEM"]').addEventListener('click', () => increaseItem(product, cartItemDOM));
            cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').addEventListener('click', () => decreaseItem(product, cartItemDOM, addToCartButtonDOM));
            cartItemDOM.querySelector('[data-action="REMOVE_ITEM"]').addEventListener('click', () => removeItem(product, cartItemDOM, addToCartButtonDOM));
        }
    });
}
let count = 0;
function increaseItem(product, cartItemDOM){
    cart.forEach(cartItem => {
        if(cartItem.name === product.name){
            
            cartItemDOM.querySelector('.cart__item__quantity').innerText = ++cartItem.quantity;
            
            cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').classList.remove('btn--danger');
            saveCart();
        }
    });
}

function decreaseItem(product, cartItemDOM, addToCartButtonDOM){
    cart.forEach(cartItem => {
        if(cartItem.name === product.name){
            if(cartItem.quantity > 1){

                cartItemDOM.querySelector('.cart__item__quantity').innerText = --cartItem.quantity;
               
                saveCart();
            }else{
                    removeItem(product, cartItemDOM, addToCartButtonDOM)
            }
            if(cartItem.quantity === 1){
                cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').classList.add('btn--danger');
            }
        }
    });
}

function removeItem(product, cartItemDOM, addToCartButtonDOM){
    cartItemDOM.classList.add('cart__item--removed')
    setTimeout(() => cartItemDOM.remove(), 300);
    cart = cart.filter(cartItem => cartItem.name !== product.name);
    saveCart();
    addToCartButtonDOM.innerText = 'Add To Cart';
    addToCartButtonDOM.disabled = false;

    if(cart.length < 1){
        document.querySelector('.cart-footer').remove();
    }
}

function addCartFooter(){
    if(document.querySelector('.cart-footer') === null){
        cartDOM.insertAdjacentHTML('afterend', `
        <div class="cart-footer">
            <button class="btn btn--danger" data-action="CLEAR_CART">Clear Cart</button>
            <button class="btn btn--primary" data-action="CHECKOUT">Pay</button>
        </div>
    `);

    document.querySelector('[data-action="CLEAR_CART"]').addEventListener('click', () => clearCart());
    document.querySelector('[data-action="CHECKOUT"]').addEventListener('click', () => checkout());
    }

}

function clearCart(){
    cartDOM.querySelectorAll('.cart__item').forEach(cartItemDOM => {
        cartItemDOM.classList.add('cart__item--removed');
        setTimeout(() => cartItemDOM.remove(), 300);
    });
    cart = [];
    localStorage.removeItem('cart');
    document.querySelector('.cart-footer').remove();

    addToCartButtonsDOM.forEach(addToCartButtonDOM => {
        addToCartButtonDOM.innerText = 'Add To Cart';
        addToCartButtonDOM.disabled = false;
    });
}
let cartTotal = 0;
function countCartTotal(){
       
    cart.forEach(cartItem => cartTotal += cartItem.quantity * cartItem.price);
    document.querySelector('[data-action="CHECKOUT"]').innerText = `Pay kr ${cartTotal}`;
    
}

function saveCart(){
    localStorage.setItem('cart', JSON.stringify(cart));
    countCartTotal();
}
 
 //!!currency converter!!//
    
const input_currency = document.querySelector('#input_currency');
const output_currency = document.querySelector('#output_currency');
const input_amount = document.querySelector('#input_amount');
const output_amount = document.querySelector('#output_amount');
const exchange = document.querySelector('#exchange');
const rate = document.querySelector('#rate');

input_currency.addEventListener('change', compute);
output_currency.addEventListener('change', compute);
input_amount.addEventListener('input', compute);
output_amount.addEventListener('input', compute);

exchange.addEventListener('click', ()=>{
   
  compute();
  
});

function compute(){
    const input_currency1 = input_currency.value;
    const output_currency1 = output_currency.value;

    fetch(`https://api.exchangerate-api.com/v4/latest/${input_currency1}`)
    .then(res => res.json())
    .then(res => {
        const new_rate = res.rates[output_currency1];
        rate.innerText = `1 ${input_currency1} = ${new_rate} ${output_currency1}`;
        output_amount.value = (input_amount.value * new_rate).toFixed(2);
    })
}

compute();

