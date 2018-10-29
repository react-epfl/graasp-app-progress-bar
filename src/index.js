import Qs from 'qs';
import noUiSlider from 'nouislider';
import $ from 'jquery';
import './styles.css';
import { GRAASP_HOST } from './config';

const graaspUserViewer = /viewer\.([a-z]+\.)*graasp\.eu/;
const shortLivedSessionUserViewer = /cloud\.([a-z]+\.)*graasp\.eu/;
const getApiSubdomain = () => {
  let apiSubdomain = '';
  // TODO: there should be a fallback for when the app does not load embedded
  const { hostname } = window.parent.location;

  if (graaspUserViewer.test(hostname)) {
    apiSubdomain = 'graasp-users';
  } else if (shortLivedSessionUserViewer.test(hostname)) {
    apiSubdomain = 'light-users';
  } else {
    // TODO: should it fallback to something?
    throw new Error(`Unexpected host: ${hostname}`);
  }

  return apiSubdomain;
};

const API_HOST = `${getApiSubdomain()}.api.${GRAASP_HOST}`;

const rejectNotOkResponse = (response) => {
  if (!response.ok) {
    return Promise
      .reject(new Error(`Unable to fetch app data: ${response.status} (${response.statusText})`));
  }

  return response;
};

const getAppInstances = (appId, userId, sessionId) => {
  let url = `//${API_HOST}/app-instances?appId=${appId}`;

  if (userId) {
    url += `&userId=${userId}`;
  } else if (sessionId) {
    url += `&sessionId=${sessionId}`;
  }

  return fetch(
    url,
    {
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
    },
  )
    .then(rejectNotOkResponse)
    .then(response => response.json())
    // if userId is set, return only the element
    .then(array => ((userId || sessionId) ? array[0] : array));
};

const createAppInstance = (app, data) => {
  const object = { app, data };

  return fetch(
    `//${API_HOST}/app-instances`,
    {
      body: JSON.stringify(object),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
      credentials: 'include',
    },
  )
    .then(rejectNotOkResponse)
    .then(response => response.json());
};

const updateAppInstance = (instanceId, data) => {
  const object = { data };

  return fetch(
    `//${API_HOST}/app-instances/${instanceId}`,
    {
      body: JSON.stringify(object),
      headers: { 'content-type': 'application/json' },
      method: 'PATCH',
      credentials: 'include',
    },
  )
    .then(rejectNotOkResponse)
    .then(response => response.json());
};

const refreshInstances = (appId) => {
  getAppInstances(appId)
    .then((instances) => {
      const table = $('tbody');
      table.empty();
      instances.forEach(({
        user,
        sessionId,
        data,
        updatedAt,
      }) => table
        .append(`<tr><td>${user || sessionId}</td><td>${data.progress}%</td><td>${updatedAt}</td></tr>`));
    });
};

const initUI = (mode, appId) => {
  switch (mode) {
    case 'admin':
      $('.view-select').addClass('active');
      $('.view-teacher').addClass('active');
      $('.teacher-content').addClass('active');

      $('.view-teacher').click(() => {
        $('.view-teacher, .teacher-content').toggleClass('active', true);
        $('.view-student, .slider-content').toggleClass('active', false);
        refreshInstances(appId);
      });

      $('.view-student').click(() => {
        $('.view-teacher, .teacher-content').toggleClass('active', false);
        $('.view-student, .slider-content').toggleClass('active', true);
      });

      $('.refresh-button').click(() => refreshInstances(appId));

      refreshInstances(appId);
      break;
    case 'review':
      $('#progressSlider').attr('disabled', true);
      $('.view-select').removeClass('active');
      $('.slider-content').addClass('active');
      break;
    default:
      $('.view-select').removeClass('active');
      $('.slider-content').addClass('active');
  }
};

// ####### Init

const {
  appId,
  userId,
  sessionId,
  mode = 'default',
} =
  Qs.parse(window.location.search, { ignoreQueryPrefix: true });

if (!appId || (!(userId || sessionId) && mode !== 'admin')) {
  throw new Error('Missing context');
}

const sliderElement = document.getElementById('progressSlider');
const updateSlider = value => sliderElement.noUiSlider.set([value]);

noUiSlider.create(
  sliderElement,
  {
    start: 0,
    connect: [true, false],
    step: 1,
    tooltips: true,
    range: {
      min: 0,
      max: 100,
    },
    format: {
      to: value => `${value}%`,
      from: value => value,
    },
  },
);

initUI(mode, appId);

let instanceId;

// GET data
let promise = getAppInstances(appId, userId, sessionId);

if (mode === 'default') {
  promise = promise
    .then((instance) => {
      if (!instance) {
        const initData = { progress: 0 };
        return createAppInstance(appId, initData);
      }

      return instance;
    })
    .then((instance) => {
      instanceId = instance._id;
      updateSlider(instance.data.progress);
    });
}

if (mode !== 'default') { // 'admin' or 'review'
  promise = promise
    .then((instance) => {
      if (instance) {
        instanceId = instance._id;
        updateSlider(instance.data.progress);
      }
    });
}

promise
  .catch(console.error);

if (mode === 'default') {
  sliderElement.noUiSlider.on('change', (value) => {
    const progress = parseInt(value[0].slice(0, -1), 10);
    const data = { progress };

    // UPDATE data
    updateAppInstance(instanceId, data)
      .catch(console.error);
  });
}
