(function () { 
  "use strict";

  // Restore scroll after closing Preline modal
  // function restoreScroll() {
  //   document.body.classList.remove("overflow-hidden");
  //   document.documentElement.classList.remove("overflow-hidden");

  //   // Hide any leftover Preline backdrops
  //   document.querySelectorAll(".hs-overlay-backdrop").forEach(el => {
  //     el.classList.add("hidden");
  //   });
  // }
function restoreScroll() {
  // Remove classes (backup)
  document.body.classList.remove("overflow-hidden");
  document.documentElement.classList.remove("overflow-hidden");

  // Remove INLINE overflow hidden (THIS FIXES THE ISSUE)
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";

  // Hide leftover backdrop elements
  document.querySelectorAll(".hs-overlay-backdrop").forEach(el => {
    el.classList.add("hidden");
  });
}

  // Initialize the FullCalendar with updated events
  var curYear = moment().format('YYYY');
  var curMonth = moment().format('MM');
  var calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    defaultView: 'month',
    navLinks: true,
    businessHours: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    droppable: true,
    events: [
      {
        title: 'Annual School Day',
        start: moment(curYear + '-' + curMonth + '-02').format('YYYY-MM-DD'),
        end: moment(curYear + '-' + curMonth + '-03').format('YYYY-MM-DD'),
        className: "bg-secondary! text-white",
        description: 'A celebration of the school year with various events and activities for students and staff.',
      },
      {
        title: 'Science Fair',
        start: moment(curYear + '-' + curMonth + '-17').format('YYYY-MM-DD'),
        end: moment(curYear + '-' + curMonth + '-17').format('YYYY-MM-DD'),
        className: "!bg-sky-500 text-white",
        description: 'Students will showcase their science projects. Open to all parents and students.',
      },
      {
        title: 'Parent-Teacher Meeting',
        start: '2025-03-15',
        end: '2025-03-15',
        className: "bg-info! text-white",
        description: 'An important event where parents meet teachers to discuss the progress of their children.',
      },
      {
        title: 'Spring Break',
        start: moment(curYear + '-' + curMonth + '-13').format('YYYY-MM-DD'),
        end: moment(curYear + '-' + curMonth + '-13').format('YYYY-MM-DD'),
        className: "bg-primary! text-white",
        description: 'The students get a break for the spring holidays. No school during this period.',
      },
      {
        title: 'Sports Day',
        start: moment(curYear + '-' + curMonth + '-21').format('YYYY-MM-DD'),
        end: moment(curYear + '-' + curMonth + '-21').format('YYYY-MM-DD'),
        className: "bg-warning! text-white",
        description: 'A day full of sports activities and competitions. Parents and teachers are welcome to join in.',
      },
      {
        title: 'Exam Week',
        start: '2025-04-10',
        end: '2025-04-14',
        className: "bg-success! text-white",
        description: 'A week where students will sit for their final exams.',
      },
      {
        title: 'Holiday Celebrations',
        start: moment(curYear + '-' + curMonth + '-04T10:00:00').format('YYYY-MM-DD'),
        end: moment(curYear + '-' + curMonth + '-06T15:00:00').format('YYYY-MM-DD'),
        className: "bg-success! text-white",
        description: 'Celebrating the upcoming national holiday with various cultural activities and festivities.',
      },
      {
        title: 'School Play: Romeo & Juliet',
        start: moment(curYear + '-' + curMonth + '-23T13:00:00').format('YYYY-MM-DD'),
        end: moment(curYear + '-' + curMonth + '-25T18:30:00').format('YYYY-MM-DD'),
        className: "bg-info! text-white",
        description: 'A special performance by the school’s drama club. All students and families are invited to watch.',
      },
      {
        title: 'Career Day',
        start: moment(curYear + '-' + curMonth + '-04').format('YYYY-MM-DD'),
        end: moment(curYear + '-' + curMonth + '-04').format('YYYY-MM-DD'),
        className: "!bg-danger text-white",
        description: 'Students will learn about various career paths with guest speakers from various professions.',
      },
      {
        title: 'Teacher Appreciation Day',
        start: moment(curYear + '-' + curMonth + '-28').format('YYYY-MM-DD'),
        end: moment(curYear + '-' + curMonth + '-28').format('YYYY-MM-DD'),
        className: "bg-success! text-white",
        description: 'A day to appreciate the hard work and dedication of the school’s teachers.',
      },
      {
        title: 'School Picnic',
        start: moment(curYear + '-' + curMonth + '-31').format('YYYY-MM-DD'),
        end: moment(curYear + '-' + curMonth + '-31').format('YYYY-MM-DD'),
        className: "!bg-teal text-white",
        description: 'A fun outdoor picnic for all students, teachers, and families to enjoy together.',
      },
      {
        title: 'Summer Vacation Starts',
        start: moment(curYear + '-' + '11' + '-11').format('YYYY-MM-DD'),
        end: moment(curYear + '-' + '11' + '-11').format('YYYY-MM-DD'),
        className: "!bg-pink text-white",
        description: 'The last day of school before the summer holidays begin.',
      }
    ],

    eventRender: function (info) {
      const event = info.event;
      const formattedStart = moment(event.start).format('DD MMMM, YYYY');
      const formattedEnd = moment(event.end).format('DD MMMM, YYYY');
      var eventElement = info.el.querySelector('.fc-title');
      if (eventElement) {
        eventElement.innerHTML += `<br><small>From: ${formattedStart} To: ${formattedEnd}</small>`;
      }
    },

    // Open modal
    dateClick: function (info) {
      const modal = document.getElementById('addEvent');
      modal.classList.remove('hidden');

      restoreScroll(); // ensure scroll is not locked

      document.getElementById('fromDate').value = '';
      document.getElementById('toDate').value = '';
      document.getElementById('eventName').focus();
    },

    // Open event modal
    eventClick: function (info) {
      var event = info.event;
      document.getElementById('modalEventName').textContent = event.title;
      document.getElementById('modalEventDescription').textContent = event.extendedProps.description;
      document.getElementById('modalEventStart').textContent = moment(event.start).format("DD MMM, YYYY");
      document.getElementById('modalEventEnd').textContent = event.end ? moment(event.end).format("DD MMM, YYYY") : 'N/A';

      const modal = document.getElementById('eventModal');
      modal.classList.remove('hidden');

      restoreScroll(); // fix scroll lock

      document.getElementById('deleteEventButton').onclick = function () {
        event.remove();
        modal.classList.add('hidden');
        restoreScroll(); // unlock scroll again
        alert('Event deleted successfully!');
      };
    }
  });

  calendar.render();

  // External Events
  var containerEl = document.getElementById('external-events');
  new FullCalendar.Draggable(containerEl, {
    itemSelector: '.fc-event',
    eventData: function (eventEl) {
      return {
        title: eventEl.innerText.trim(),
        className: eventEl.className + ' overflow-hidden '
      };
    }
  });

  // Add Event Button
  document.getElementById('addEventButton').addEventListener('click', function () {
    var eventName = document.getElementById('eventName').value.trim();
    var fromDateStr = document.getElementById('fromDate').value.trim();
    var toDateStr = document.getElementById('toDate').value.trim();
    var eventDescription = document.getElementById('event-description').value.trim();
    var eventType = document.getElementById('eventType').value.trim();

    if (!eventName || !fromDateStr || !toDateStr || !eventType) {
      alert('Please fill in all fields before adding the event.');
      return;
    }

    var fromDate = moment(fromDateStr, "DD MMMM, YYYY").format("YYYY-MM-DD");
    var toDate = moment(toDateStr, "DD MMMM, YYYY").format("YYYY-MM-DD");

    var newEvent = {
      title: eventName,
      start: fromDate,
      end: toDate,
      description: eventDescription,
      className: eventType,
      id: Date.now()
    };

    calendar.addEvent(newEvent);
    alert('Event added successfully!');

    // clear
    document.getElementById('eventName').value = '';
    document.getElementById('fromDate').value = '';
    document.getElementById('toDate').value = '';
    document.getElementById('event-description').value = '';
    document.getElementById('eventType').value = '';

    const addEventModal = document.getElementById('addEvent');
    const backdrop = document.getElementById('addEvent-backdrop');

    if (addEventModal) addEventModal.classList.add('hidden');
    if (backdrop) backdrop.classList.add('hidden');

    restoreScroll(); // ← FIX HERE
  });

  // flatpickr
  flatpickr("#fromDate", {
    disableMobile: true,
    minDate: "today",
    dateFormat: "d F, Y",
    disable: [function (date) { return date < new Date(); }],
    onOpen: function (selectedDates, dateStr, instance) { instance.clear(); }
  });

  flatpickr("#toDate", {
    disableMobile: true,
    minDate: "today",
    dateFormat: "d F, Y",
    disable: [function (date) { return date < new Date(); }],
    onOpen: function (selectedDates, dateStr, instance) { instance.clear(); }
  });

  // scroll
  var myElement1 = document.getElementById('full-calendar-activity');
  new SimpleBar(myElement1, { autoHide: true });

})();
