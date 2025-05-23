import {select, settings, templates, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
    constructor(element){
        const thisBooking = this;

        thisBooking.tableSelected = null;
        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.getData();
    }

    getData(){
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

        const params = {
            booking: [
                startDateParam,
                endDateParam,
            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,
            ],
            eventsRepeat: [
                settings.db.repeatParam,
                endDateParam,
            ],
        };


        const urls = {
            booking: settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
            eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
        };

        //console.log('getData urls: ',urls);

        Promise.all([
            fetch(urls.booking),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
          ])
            .then(function(allResponse){
              const bookingsResponse = allResponse[0];
              const eventsCurrentResponse = allResponse[1];
              const eventsRepeatResponse = allResponse[2];
              return Promise.all([
                bookingsResponse.json(),
                eventsCurrentResponse.json(),
                eventsRepeatResponse.json(),
              ])
            })
            .then(function([bookings, eventsCurrent, eventsRepeat]){
              thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
              //console.log(thisBooking.booked)
            })
            .catch(function(error){
              console.error('Error fetching data:', error);
            });

    }

    parseData(bookings, eventsCurrent, eventsRepeat){
      const thisBooking = this;

      thisBooking.booked = {};

      for(let item of bookings){
        thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
      }

      for(let item of eventsCurrent){
        thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
      }

      const minDate = thisBooking.datePicker.minDate;
      const maxDate = thisBooking.datePicker.maxDate;

      for(let item of eventsRepeat){
        if(item.repeat == 'daily'){
          for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
            thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
          }

        }

      }

      //console.log('thisBooking.booked: ', thisBooking.booked);
      thisBooking.updateDOM();

    }

    makeBooked(date, hour, duration, table){
      const thisBooking = this;

      if(typeof thisBooking.booked[date] == 'undefined'){
        thisBooking.booked[date] = {};
      }

      const startHour = utils.hourToNumber(hour);

      for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){

        if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
          thisBooking.booked[date][hourBlock] = [];
        }
  
        thisBooking.booked[date][hourBlock].push(table);

      }
    }

    updateDOM(){
      const thisBooking = this;
      thisBooking.date = thisBooking.datePicker.value;
      thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

      let allAvailable = false;

      if(
        typeof thisBooking.booked[thisBooking.date] == 'undefined' 
        ||
        typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
      ){
        allAvailable = true;
      }

      for(let table of thisBooking.dom.tables){
        let tableId = table.getAttribute(settings.booking.tableIdAttribute);

        if(!isNaN(tableId)){
          tableId = parseInt(tableId);
        }

        if(
          !allAvailable 
          &&
          thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
        ){
          table.classList.add(classNames.booking.tableBooked);
        }else{
          table.classList.remove(classNames.booking.tableBooked);
        }
      }

    }

    sendBooking(){

      const thisBooking = this;
  
      const url = settings.db.url + '/' + settings.db.bookings;

      const payload = {
         "date": thisBooking.datePicker.value,
         "hour": this.hourPicker.value,
         "table": parseInt(thisBooking.tableSelected),
         "duration": parseInt(thisBooking.dom.duration.value),
         "ppl": parseInt(thisBooking.dom.ppl.value),
         "starters": [],
         "phone": thisBooking.dom.phone.value,
         "address": thisBooking.dom.address.value,
      }
      
      for(let starter of thisBooking.dom.starters){ 
          if(starter.checked){
            payload.starters.push(starter.value);
          }
      }

      //console.log(payload);

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(payload),
      };

      if(thisBooking.tableSelected != null){

        fetch(url, options)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
          thisBooking.updateDOM();
          thisBooking.unselectTables();
          return response.json();
        })
        .catch(error => {
          console.error('Fetch error:', error);
        });
        
      }
      
    }

    unselectTables(){
      const thisBooking = this;
      for (let selectedTable of thisBooking.dom.tables) {
        selectedTable.classList.remove(classNames.booking.tableSelected);
      }
    }


    render(element){
        const thisBooking = this;
        /* generate HTML based on template */
        const generatedHTML = templates.bookingWidget();
        thisBooking.dom = {};
        /* create element using utils.createElementFromHTML */
        thisBooking.dom.wrapper = element;
        thisBooking.dom.wrapper.innerHTML = generatedHTML;
        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
        thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

        thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);

        thisBooking.dom.ppl = thisBooking.dom.wrapper.querySelector(select.booking.ppl);
        thisBooking.dom.duration = thisBooking.dom.wrapper.querySelector(select.booking.duration);
        thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
        thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
        thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);

    }
    initWidgets(){
        const thisBooking = this;
        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.wrapper.addEventListener('updated', function(){
          thisBooking.updateDOM();
          for (let selectedTable of thisBooking.dom.tables) {
            selectedTable.classList.remove(classNames.booking.tableSelected);
          }
        });

        thisBooking.dom.tables.forEach((table) => {
          table.addEventListener('click', (event) => {
            event.preventDefault();
  
            if (table.classList.contains(classNames.booking.tableSelected)) {
              table.classList.remove(classNames.booking.tableSelected);
            } else if (!table.classList.contains(classNames.booking.tableBooked)) {
              thisBooking.unselectTables();
              table.classList.add(classNames.booking.tableSelected);
              thisBooking.tableSelected = parseInt(table.getAttribute(settings.booking.tableIdAttribute));
            }
          });
        });

        thisBooking.dom.form.addEventListener('submit', function(event){
          event.preventDefault();
          thisBooking.sendBooking();
        })

    }
}
export default Booking;
