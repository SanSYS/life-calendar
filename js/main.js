function Calendar(yearsInPage, weeksInRows){
    var self = this,
     pk = 'kC';
 
    self.Years = ko.observableArray([]);
    self.BornDate = ko.observable(new Date());
    self.StartFromZero = ko.observable(window.localStorage.getItem("StartFromZero") || 0);
 
             self.StartFromZero.subscribe(function (val) {
                 window.localStorage.setItem("StartFromZero", Number(val));
             });
 
 
    var Week = function(year, weekNumber){
     this.Year = year;
     this.Number = weekNumber;
     this.Record = ko.observable('');
 
     var key = pk + year.Number + '_' + this.Number;
 
     this.IsLost = ko.observable( window.localStorage.getItem(key) || false );
     this.Record = ko.observable( window.localStorage.getItem(key + '-record') || '' );
 
     this.IsLost.subscribe(function(val){
      window.localStorage.setItem(key, val);
     });
 
     this.Record.subscribe(function(val){
      window.localStorage.setItem(key + '-record', val);
     });
    };
 
    var Year = function(number){
     this.Number = number;
     this.Weeks = ko.observableArray([]);
 
     for (var i = 0; i < weeksInRows; ) {
      this.Weeks.push(new Week(this, ++i));
     };
 
     if (number % 7 === 0 || number === 1) {
      this.Weeks.push(new Week(this, ++i));
     }
    }
 
    for (var i = 0; i < yearsInPage; ) {
     self.Years.push(new Year(++i));
    };
 
    self.BornDate.subscribe(function(val){
     var date = new Date(+val),
      currendDate = new Date(),
      years = self.Years();
 
 window.localStorage.setItem(pk + 'BornDate', +val);
 
     for (var i = 0, year = null; year = years[i++]; ) {
      var weeks = year.Weeks();
 
      for (var j = 0, week = null; week = weeks[j++]; ) {
                         if (date >= currendDate) {
                             week.IsLost(false);
                             week.s = true;
                         }
 
                         date.setDate(date.getDate() + 7);
 
                         if (!week.s && !week.IsLost()) {
                             week.IsLost(true);
                         }
 
                         week.s = false;
 
      };
     };
    });
 
    var dte = window.localStorage.getItem(pk + 'BornDate');
 
    if (dte) {
     self.BornDate(new Date(+dte));
    }
 
 
    self.click = function(week){
     $('#textToRecord').val(week.Record());
 
     $( "#dialog" ).dialog({
           resizable: true,
           width:550,
           modal: true,
           buttons: {
             "Save": function() {
               var sender = $( this );
 
               week.Record($('#textToRecord').val());
 
               sender.dialog( "close" );
             },
             Cancel: function() {
               $( this ).dialog( "close" );
             }
           }
         });
    }
   }
 
   ko.bindingHandlers.datePicker = {
       init: function (element, valueAccessor, allBindingsAccessor, viewModel) {                    
           // Register change callbacks to update the model
           // if the control changes.       
           ko.utils.registerEventHandler(element, "change", function () {            
               var value = valueAccessor();
               value(new Date(element.value));            
           });
       },
       // Update the control whenever the view model changes
       update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
           var value =  valueAccessor()();
 
           element.value = value.getDate() + "." + (value.getMonth() + 1) + "." + value.getFullYear();
       }
   };
 
   var model = new Calendar(90, 52);
 
   $(function(){
    ko.applyBindings(model, document.getElementById('calendarContainer'));
 
             setTimeout(function () {
                 var d = new Date();
 
                 $("#calendarContainer input.date").datepicker({
                     changeMonth: true,
                     changeYear: true,
                     minDate: new Date(1910, 1 - 1, 1),
                     maxDate: new Date(),
                     yearRange: (d.getFullYear() - model.Years().length) + ":" + d.getFullYear(),
                     dateFormat: "dd.mm.yy"
                 });
 
                 $("#calendarContainer input.date").on('change', function () {
                     var val = $(this).val().split('.');
 
                     model.BornDate(new Date(val[2], val[1] - 1, val[0]));
 
                     return true;
                 })
 
                 $("#slider").slider({
                     value: 1,
                     min: 0.1,
                     max: 1.0,
                     step: 0.01,
                     slide: function slideFunc(event, ui) {
                         (slideFunc.slider || (slideFunc.slider = $('.calendar-content'))).css("zoom", ui.value);
                     }
                 });
             }, 100);
   });