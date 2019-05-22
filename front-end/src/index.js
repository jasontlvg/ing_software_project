const x= require('./scss/main.scss');

import Vue from './js/vue';
window.Vue = Vue;
window.card= null;
window.header= null;

import { headerTime } from './js/script';
import { vueWeatherCard } from './js/vueWeatherCard';

headerTime();
vueWeatherCard();
