
   export const select = {
        templateOf: {
            menuProduct: "#template-menu-product",
            cartProduct: '#template-cart-product', // CODE ADDED
            bookingWidget: '#template-booking-widget',
            homePage: '#template-home-page',
        },
        containerOf: {
            menu: '#product-list',
            cart: '#cart',
            pages: '#pages',
            booking: '.booking-wrapper',
            home: '.home-wrapper',
            homeLinks: '.home-page .options',
        },
        all: {
            menuProducts: '#product-list > .product',
            menuProductsActive: '#product-list > .product.active',
            formInputs: 'input, select',
        },
        menuProduct: {
            clickable: '.product__header',
            form: '.product__order',
            priceElem: '.product__total-price .price',
            imageWrapper: '.product__images',
            amountWidget: '.widget-amount',
            cartButton: '[href="#add-to-cart"]',
        },
        widgets: {
            amount: {
            input: 'input.amount', // CODE CHANGED
            linkDecrease: 'a[href="#less"]',
            linkIncrease: 'a[href="#more"]',
            },
            datePicker: {
                wrapper: '.date-picker',
                input: `input[name="date"]`,
            },
            hourPicker: {
                wrapper: '.hour-picker',
                input: 'input[type="range"]',
                output: '.output',
            }, 
        },
        booking: {
            peopleAmount: '.people-amount',
            hoursAmount: '.hours-amount',
            tables: '.floor-plan .table',
            phone: '.order-confirmation input[name="phone"]',
            address: '.order-confirmation input[name="address"]',
            starters: '.booking-options input[name="starter"]',
            ppl: '.people-amount .amount',
            duration: '.hours-amount .amount',
            form: '.booking-form',
        },
        nav: {
            links: '.main-nav a',
        },
        // CODE ADDED START
        cart: {
            productList: '.cart__order-summary',
            toggleTrigger: '.cart__summary',
            totalNumber: `.cart__total-number`,
            totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
            subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
            deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
            form: '.cart__order',
            formSubmit: '.cart__order [type="submit"]',
            phone: '[name="phone"]',
            address: '[name="address"]',
        },
        cartProduct: {
            amountWidget: '.widget-amount',
            price: '.cart__product-price',
            edit: '[href="#edit"]',
            remove: '[href="#remove"]',
        },
        
        // CODE ADDED END
        
        };
    
    export const classNames = {
        menuProduct: {
        wrapperActive: 'active',
        imageVisible: 'active',
        },
            // CODE ADDED START
        cart: {
        wrapperActive: 'active',
        },
        // CODE ADDED END
        booking: {
            loading: 'loading',
            tableBooked: 'booked',
            tableSelected: 'selected',
        },
        nav: {
            active: 'active',
        },
        pages: {
            active: 'active',
        }
        };
  
    export const settings = {
      amountWidget: {
        defaultValue: 1,
        defaultMin: 1,
        defaultMax: 10,
      },
        // CODE ADDED START
      cart: {
        defaultDeliveryFee: 20,
      },
      db: {
        url: '//' + window.location.hostname + (window.location.hostname=='localhost' ? ':3131' : ''),
        products: 'products',
        orders: 'orders',
        bookings: 'bookings',
        events: 'events',
        dateStartParamKey: 'date_gte',
        dateEndParamKey: 'date_lte',
        notRepeatParam: 'repeat=false',
        repeatParam: 'repeat_ne=false',
      },
      hours: {
        open: 12,
        close: 24,
    },
    datePicker: {
        maxDaysInFuture: 14,
    },
    booking: {
        tableIdAttribute: 'data-table',
    },
    // CODE ADDED END
    };
  
    export const templates = {
      menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
      // CODE ADDED START
      cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
      // CODE ADDED END
      bookingWidget: Handlebars.compile(document.querySelector(select.templateOf.bookingWidget).innerHTML),
      homePage: Handlebars.compile(document.querySelector(select.templateOf.homePage).innerHTML),
    };