/**
 * @file Module that contains everything that is needed for Skybrush Sidekick only
 * when it is being run as a desktop application.
 */

import React from 'react';
import { render } from 'react-dom';

import App from './app';

// Render the application
const root = document.querySelector('#root');
render(<App />, root);
