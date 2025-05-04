import {select, classNames, templates, settings} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart{
    constructor(element){
      const thisCart = this;
  
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
      //console.log('new Cart:', thisCart);
    }
  
    getElements(element){
      const thisCart = this;
  
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
      
    }
  
    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      })
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      })
      thisCart.dom.productList.addEventListener('remove', function(event){
        const cartProduct = event.detail.cartProduct;
        thisCart.remove(cartProduct);
      })
      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
      })
    }
    add(menuProduct){
      const thisCart = this;
      /* generate HTML based on template */
      const generatedHTML = templates.cartProduct(menuProduct);
      /* create element using utils.createElementFromHTML */
      thisCart.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = thisCart.dom.productList;
      /* add element to menu */
      menuContainer.appendChild(thisCart.element);
      thisCart.products.push(new CartProduct(menuProduct, thisCart.element));
      thisCart.update();
    }
  
    update(){
      const thisCart = this;
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
  
      for(let product of thisCart.products){
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;
      }
      if(thisCart.totalNumber > 0){
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      }
  
      if(thisCart.products.length > 0){
        thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
        thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
        for(let priceDom of thisCart.dom.totalPrice){
          priceDom.innerHTML = thisCart.totalPrice;
        }
        thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      }else if(thisCart.products.length == 0){
        thisCart.dom.deliveryFee.innerHTML = 0;
        thisCart.dom.subtotalPrice.innerHTML = 0;
        for(let priceDom of thisCart.dom.totalPrice){
          priceDom.innerHTML = 0;
        }
        thisCart.dom.totalNumber.innerHTML = 0;
      }
  }
  
    remove(cartProduct){
      const thisCart = this;
      const index = thisCart.products.indexOf(cartProduct);
      thisCart.products.splice(index, 1);
      cartProduct.dom.wrapper.remove();
      thisCart.update();
    }
  
    removeAll(){
      const thisCart = this;
      for(let product of thisCart.products){
        product.dom.wrapper.remove();
      }
      thisCart.products = [];
      if(thisCart.products.length == 0){
        thisCart.dom.deliveryFee.innerHTML = 0;
        thisCart.dom.subtotalPrice.innerHTML = 0;
        thisCart.dom.phone.value = '';
        thisCart.dom.address.value = '';
        for(let priceDom of thisCart.dom.totalPrice){
          priceDom.innerHTML = 0;
        }
        thisCart.dom.totalNumber.innerHTML = 0;
      }
      thisCart.update();
    }
  
    sendOrder(){
      const thisCart = this;
  
      const url = settings.db.url + '/' + settings.db.orders;
  
      const payload = {
        address: thisCart.dom.phone.value,
        phone: thisCart.dom.address.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: [],
      }
  
      for(let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }
  
      //console.log(payload);
  
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      if(this.products.length > 0){
        fetch(url, options)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          thisCart.removeAll();
        })
        .catch(error => {
          console.error('Fetch error:', error);
        });
      }
    }
  
  }
  
  export default Cart;