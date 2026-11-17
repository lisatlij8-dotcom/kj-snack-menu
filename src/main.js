// KJ SNACK — entry point
import '@fontsource/lalezar/arabic-400.css';
import '@fontsource/lalezar/latin-400.css';
import '@fontsource-variable/baloo-bhaijaan-2';
import '@fontsource/kanit/latin-900-italic.css';
import '@fontsource/bangers/latin-400.css';
import 'lenis/dist/lenis.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { hydrateBursts } from './js/burst.js';
import { mountLogos, logoIntro, logoWiggle } from './js/logo.js';
import { createBurger, fallbackBurgerSVG } from './js/burger.js';
import { renderMenu, initMenu } from './js/menu.js';
import { initTicker, initCursor, initMagnetic, initReveals, initHeader, renderOffer, renderFooter } from './js/fx.js';

gsap.registerPlugin(ScrollTrigger);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s) => document.querySelector(s);

// ---------------------------------------------------------------- content
hydrateBursts();
mountLogos();
renderMenu();
renderOffer();
renderFooter();
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ---------------------------------------------------------------- smooth scroll
const lenis = new Lenis({ lerp: reduced ? 1 : 0.1, smoothWheel: !reduced, wheelMultiplier: 1 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop();

const stage = $('.stage');
function scrollTo(target, offset = 0) {
  lenis.scrollTo(target, { offset, duration: reduced ? 0 : 1.5, easing: (t) => 1 - Math.pow(1 - t, 4) });
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-scroll], a[href^="#"]');
  if (!a) return;
  const href = a.getAttribute('href');
  if (!href || !href.startsWith('#')) return;
  e.preventDefault();
  if (href === '#top') return scrollTo(0);
  if (href === '#anatomy') {
    const y = stage.offsetTop + (stage.offsetHeight - window.innerHeight) * 0.6;
    return scrollTo(document.documentElement.classList.contains('no-webgl') ? '#menu' : y);
  }
  const el = document.querySelector(href);
  if (el) scrollTo(el, href.startsWith('#cat-') ? -(($('#menu-bar')?.offsetHeight || 0) + 90) : -10);
});

// ---------------------------------------------------------------- burger scene
const burger = createBurger({
  canvas: $('#burger-canvas'),
  heroSpot: $('#hero-spot'),
  anatomySpot: $('#anatomy-spot'),
  labelsRoot: $('#anatomy-labels'),
  reduced,
});
if (!burger) {
  document.documentElement.classList.add('no-webgl');
  $('#hero-spot').insertAdjacentHTML('beforeend', fallbackBurgerSVG);
}

// ---------------------------------------------------------------- scroll story (pinned stage)
function initStage() {
  if (!burger) return;
  gsap.set('#anatomy-head', { y: 30 });
  gsap.set('#anatomy-outro', { y: 40 });
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: 'bottom bottom',
      scrub: reduced ? true : 0.5,
      onUpdate: (self) => {
        burger.setProgress(self.progress);
        stage.classList.toggle('is-dark', self.progress > 0.12);
      },
    },
  });
  tl.to('.hero__copy', { opacity: 0, y: -90, duration: 0.12, ease: 'power1.in' }, 0.015)
    .to('.scrollhint', { opacity: 0, duration: 0.04 }, 0)
    .to('#hero-burst', { opacity: 0, duration: 0.1 }, 0.04)
    .to(['#sticker-meat', '#sticker-count', '#wow'], { opacity: 0, y: -50, duration: 0.07, stagger: 0.01 }, 0.02)
    .to('.stage__ink', { opacity: 1, duration: 0.12 }, 0.08)
    .to('#anatomy-head', { opacity: 1, y: 0, duration: 0.07 }, 0.2)
    .to('#anatomy-head', { opacity: 0, y: -30, duration: 0.06 }, 0.8)
    .to('#anatomy-outro', { autoAlpha: 1, y: 0, duration: 0.06 }, 0.88)
    .to({}, { duration: 0 }, 1);
}

// ---------------------------------------------------------------- hero entrance
function heroIntro() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  const d = reduced ? 0.4 : 1;
  tl.from('#site-header', { yPercent: -140, duration: 1 * d }, 0.1)
    .from('.lockup__kj .ch', { yPercent: 120, rotation: (i) => (i ? 14 : -14), opacity: 0, duration: 0.9 * d, stagger: 0.07, ease: 'back.out(2)' }, 0.15)
    .from('.lockup__snack .ch', { yPercent: 130, opacity: 0, duration: 0.8 * d, stagger: 0.045, ease: 'back.out(2.2)' }, 0.3)
    .from('.lockup__tag span', { scale: 0, rotation: -25, duration: 0.8 * d, ease: 'back.out(2.4)' }, 0.65)
    .from('.hero__headline .line > span', { yPercent: 115, duration: 1 * d, stagger: 0.12 }, 0.55)
    .from('.hero__sub', { y: 30, opacity: 0, duration: 1 * d }, 0.75)
    .from('.hero__cta > *', { y: 40, opacity: 0, duration: 1 * d, stagger: 0.08 }, 0.85)
    .from('.scrollhint > *', { y: 20, opacity: 0, duration: 0.8 * d, stagger: 0.08 }, 1.2)
    .from('#hero-burst', { scale: 0, rotation: -120, duration: 1.2 * d, ease: 'back.out(1.4)', transformOrigin: '50% 50%' }, 0.05);

  if (burger) {
    tl.add(burger.intro({ onLand: landed }).timeScale(2), 0.05);
  } else {
    tl.from('.fallback-burger', { y: -300, duration: 1, ease: 'bounce.out', onComplete: landed }, 0.3);
  }
  return tl;
}

function landed() {
  const t = gsap.timeline();
  t.fromTo('#impact', { scale: 0.3, opacity: 1, borderWidth: 14 }, { scale: 1.7, opacity: 0, borderWidth: 1, duration: 0.8, ease: 'expo.out' }, 0)
    .fromTo('#wow', { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.9, ease: 'elastic.out(1.1, 0.4)' }, 0.05)
    .fromTo('#sticker-meat', { scale: 0, rotation: 30 }, { scale: 1, rotation: -8, duration: 0.8, ease: 'back.out(2.5)' }, 0.25)
    .fromTo('#sticker-count', { scale: 0, rotation: -30 }, { scale: 1, rotation: 10, duration: 0.8, ease: 'back.out(2.5)' }, 0.38);
  if (!reduced) {
    t.fromTo('#stage-sticky', { x: -7, y: 5 }, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1.4, 0.2)', clearProps: 'transform' }, 0);
    gsap.to('#wow', { rotation: 6, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 });
  }
}

// ---------------------------------------------------------------- preloader
async function preload() {
  const countEl = $('#preloader-count');
  const barEl = $('#preloader-bar');
  const loaderLogo = $('#loader-logo');
  const navLogo = $('#nav-logo');
  gsap.set(navLogo, { opacity: 0 });

  const logoTl = logoIntro(loaderLogo);
  logoTl.timeScale(reduced ? 4 : 2.2);

  const c = { v: 0 };
  const render = () => { countEl.textContent = Math.round(c.v); barEl.style.transform = `scaleX(${c.v / 100})`; };
  const minTime = new Promise((r) => gsap.to(c, { v: 86, duration: reduced ? 0.2 : 0.6, ease: 'power2.inOut', onUpdate: render, onComplete: r }));
  const fonts = (document.fonts?.ready || Promise.resolve()).catch(() => {});
  const timeout = new Promise((r) => setTimeout(r, 1200));
  await Promise.all([minTime, Promise.race([fonts, timeout])]);
  await new Promise((r) => gsap.to(c, { v: 100, duration: 0.15, ease: 'power2.out', onUpdate: render, onComplete: r }));

  // logo flies into the navbar, curtain lifts, hero builds itself
  const exit = gsap.timeline({
    onComplete: () => {
      gsap.set(navLogo, { opacity: 1 });
      logoWiggle(navLogo);
      loaderLogo.remove();
      $('#preloader').remove();
      document.body.classList.remove('is-loading');
      lenis.start();
      ScrollTrigger.refresh();
    },
  });
  const lr = loaderLogo.getBoundingClientRect();
  const nr = navLogo.getBoundingClientRect();
  exit.to('.preloader__meta, .preloader__bar', { opacity: 0, y: 20, duration: 0.25, ease: 'power2.in' }, 0)
    .to('#preloader', { clipPath: 'inset(0% 0% 100% 0%)', duration: reduced ? 0.3 : 0.65, ease: 'expo.inOut' }, 0.05)
    .to(loaderLogo, {
      x: nr.left + nr.width / 2 - (lr.left + lr.width / 2),
      y: nr.top + nr.height / 2 - (lr.top + lr.height / 2),
      scale: nr.width / lr.width,
      rotation: 360,
      duration: reduced ? 0.3 : 0.7,
      ease: 'expo.inOut',
    }, 0.05)
    .add(heroIntro(), reduced ? 0.15 : 0.2);
}

// ---------------------------------------------------------------- boot
initStage();
initHeader();
initMenu({ scrollTo });
initTicker();
initReveals();
initMagnetic();
initCursor();

$('#nav-logo').closest('a').addEventListener('mouseenter', () => logoWiggle($('#nav-logo')));
ScrollTrigger.create({ trigger: '#contact', start: 'top 85%', once: true, onEnter: () => logoIntro($('#footer-logo')) });

preload();

window.addEventListener('load', () => ScrollTrigger.refresh());
