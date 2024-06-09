"use strict";

import App from './app.js';

const appContainer = document.querySelector('#app-container');
const navLink = document.querySelector('#nav-link');

const app = new App(appContainer, navLink);