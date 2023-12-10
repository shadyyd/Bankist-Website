'use strict';

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.getElementById('section--1');
const tabs = document.querySelectorAll('.operations__tab');
const tabsContent = document.querySelectorAll('.operations__content');
const tabsContainer = document.querySelector('.operations__tab-container');
const nav = document.querySelector('.nav');
const header = document.querySelector('.header');

///////////////////////////////////////
// Modal window

const openModal = function (e) {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
});

///////////////////////////////////////
// Button Scrolling
btnScrollTo.addEventListener('click', function (e) {
  //scrolling the old way

  // const s1coords = section1.getBoundingClientRect();
  // console.log(s1coords);

  // console.log(e.target.getBoundingClientRect());
  // console.log('Current scroll (X/Y)', window.scrollX, window.scrollY);

  // window.scrollTo({
  //   left: s1coords.left + window.scrollX,
  //   top: s1coords.top + window.scrollY,
  //   behavior: 'smooth',
  // });

  //scrolling the new way
  section1.scrollIntoView({ behavior: 'smooth' }); //new easy and better way
});
///////////////////////////////////////
// Page navigation
//naive approch : add an event to every link in ypur nav like this :
/*
  document.querySelectorAll('.nav__link').forEach(function (el) {
  el.addEventListener('click', function (e) {
    e.preventDefault();
    const id = this.getAttribute('href');
    console.log(id);
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  });
});
*/
//but this way might be slow if the number of links is high so instead we use a teqniqe named event delegation
//Event Delegation :
// 1. Add event listener to common parent element
// 2. Determine what element originated the event
document.querySelector('.nav__links').addEventListener('click', function (e) {
  e.preventDefault();
  if (
    e.target.classList.contains('nav__link') &&
    !e.target.classList.contains('nav__link--btn')
  ) {
    const id = e.target.getAttribute('href');
    // console.log(id);
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
}); //now we have added one event for all links in thier parent container , more effeicent way

///////////////////////////////////////
//Tabbed component
// Again here we used Event Delegation
tabsContainer.addEventListener('click', function (e) {
  const clicked = e.target.closest('.operations__tab');
  if (!clicked) return;
  console.log(clicked);
  //Removing active classes
  tabs.forEach(t => t.classList.remove('operations__tab--active'));
  tabsContent.forEach(t => t.classList.remove('operations__content--active'));

  // Active Tab
  clicked.classList.add('operations__tab--active');

  // Active Content Area
  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active');
});

///////////////////////////////////////
// Menu Fade Animation

//it will be the same function so
const navHover = function (e) {
  if (e.target.classList.contains('nav__link')) {
    const link = e.target;
    const siblings = link.closest('.nav').querySelectorAll('.nav__link');
    const logo = link.closest('.nav').querySelector('img');

    siblings.forEach(el => {
      if (el !== link) el.style.opacity = this;
    });
    logo.style.opacity = this;
    // 'this' is the bind method argument
  }
};
//we have used the bind method to pass an argument to a callback function
// Passing "argument" into handler
nav.addEventListener('mouseover', navHover.bind(0.5));
nav.addEventListener('mouseout', navHover.bind(1));

///////////////////////////////////////
// Sticky navigation
// 1st way
/*
const initialCoords = section1.getBoundingClientRect();
window.addEventListener('scroll', function () {
  if (this.window.scrollY > initialCoords.top) nav.classList.add('sticky');
  else nav.classList.remove('sticky');
}); */
// This way is not effiecent becuase of the scroll event is fired a lot

//
//

// the 2nd way
// Sticky navigation: Intersection Observer API
const navHeight = nav.getBoundingClientRect().height;

const obsCallback = function (entries, observer) {
  const [entry] = entries;
  // console.log(entry);
  if (!entry.isIntersecting) nav.classList.add('sticky');
  else nav.classList.remove('sticky');
};
const opsOptions = {
  root: null, // null makes the root is the window view in the browser
  threshold: 0, // an array of intersection percentage that i want to take actions on
  rootMargin: `-${navHeight}px`, // Margin
};
//          new IntersectionObserver(callback function , options object)
const observer = new IntersectionObserver(obsCallback, opsOptions);

// observer.observe(target)
observer.observe(header); // header is the target
///////////////////////////////////////
// Reveal Sections : using the Intersectin Observer API

const sections = document.querySelectorAll('.section'); // 1st : select all sections

const revealSection = function (entries, observer) {
  const [entry] = entries;

  // console.log(entry);

  if (!entry.isIntersecting) return;
  // console.log(entry.target);
  entry.target.classList.remove('section--hidden'); // remove the hidden class
  observer.unobserve(entry.target); // clear observer , we only need it to show it once
};

// observer object
const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
});

//loop over sections and make them hidden and add an observer for each section
sections.forEach(sec => {
  sectionObserver.observe(sec);
  sec.classList.add('section--hidden');
});
///////////////////////////////////////
// Lazy loading images
const imgTargets = document.querySelectorAll('img[data-src]');

const loadImg = function (entries, observer) {
  const [entry] = entries;

  if (!entry.isIntersecting) return;

  entry.target.src = entry.target.dataset.src; // change the src attribute to the full image size

  entry.target.addEventListener('load', () => {
    entry.target.classList.remove('lazy-img');
  }); // load the image first then remove the lazy-img class

  observer.unobserve(entry.target);
};

const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  rootMargin: '-200px',
});

imgTargets.forEach(img => imgObserver.observe(img));

///////////////////////////////////////
// Slider
const slider = (function () {
  const slides = document.querySelectorAll('.slide');
  const btnLeft = document.querySelector('.slider__btn--left');
  const btnRight = document.querySelector('.slider__btn--right');
  const dotContainer = document.querySelector('.dots');

  let curSlide = 0;
  let sliderSize = slides.length;

  const createDots = function () {
    slides.forEach((_, i) => {
      dotContainer.insertAdjacentHTML(
        'beforeend',
        `<button class="dots__dot" data-slide="${i}" ></button>`
      );
    });
  };

  const goToSlide = slide =>
    slides.forEach(
      (s, i) => (s.style.transform = `translateX(${(i - slide) * 100}%)`)
    );

  const nextSlide = function () {
    if (curSlide === sliderSize - 1) curSlide = 0;
    else curSlide++;
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  const prevSlide = function () {
    if (curSlide === 0) curSlide = sliderSize - 1;
    else curSlide--;
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  const activateDot = function (slide) {
    document
      .querySelectorAll('.dots__dot')
      .forEach(dot => dot.classList.remove('dots__dot--active'));

    document
      .querySelector(`.dots__dot[data-slide="${slide}"]`)
      .classList.add('dots__dot--active');
  };

  const init = (function () {
    createDots();

    goToSlide(curSlide);

    activateDot(curSlide);
  })();

  // Event Listeners
  btnLeft.addEventListener('click', prevSlide);
  btnRight.addEventListener('click', nextSlide);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') nextSlide();
    e.key === 'ArrowLeft' && prevSlide();
  });

  dotContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('dots__dot')) {
      // const slide = e.target.dataset.slide;
      //or using destructoring
      const { slide } = e.target.dataset;
      goToSlide(slide);
      activateDot(slide);
    }
  });
})();

///////////////////////////////////////

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////

// Practice
//rgb(255,255,255)
// const randomInt = (min, max) =>
//   Math.floor(Math.random() * (max - min + 1) + min);
// const randomColor = () =>
//   `rgb(${randomInt(0, 255)},${randomInt(0, 255)},${randomInt(0, 255)})`;

// document.querySelector('.nav__link').addEventListener('click', function () {
//   this.style.backgroundColor = randomColor();
// });

// document.querySelector('.nav__links').addEventListener('click', function () {
//   // this.style.backgroundColor = randomColor();
//   console.log('bla bla');
// });

//////////////////////////////////////
// DOM Traversing
// const h1 = document.querySelector('h1');

// // Going downwards: child
// console.log(h1.querySelectorAll('.highlight')); //querySelector() works with elements
// console.log(h1.childNodes);
// console.log(h1.children);
// h1.firstElementChild.style.color = 'white';
// h1.lastElementChild.style.color = 'orangered';

// // Going upwards: parents
// console.log(h1.parentNode);
// console.log(h1.parentElement);
// //closest() is the oppiste function of querySelector()
// //closest() searches for parents , querySelector() searches for childern
// h1.closest('.header').style.background = 'var(--gradient-secondary)';

// h1.closest('h1').style.background = 'var(--gradient-primary)';

// // Going sideways: siblings
// console.log(h1.previousElementSibling);
// console.log(h1.nextElementSibling);

// console.log(h1.previousSibling);
// console.log(h1.nextSibling);

// console.log(h1.parentElement.children);
// [...h1.parentElement.children].forEach(function (el) {
//   if (el !== h1) el.style.transform = 'scale(0.5)';
// });
