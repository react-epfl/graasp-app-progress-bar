import $ from 'jquery';
import Qs from 'qs';
import noUiSlider from 'nouislider';
import 'nouislider/distribute/nouislider.css';
import './styles.css';

// defaults
const DEFAULT_API_HOST = '';
// const DEFAULT_LANG = 'en';
const DEFAULT_MODE = 'default';
// const DEFAULT_VIEW = 'normal';

// ####### Init

const {
  sessionId,
  apiHost = DEFAULT_API_HOST,
  // lang = DEFAULT_LANG,
  mode = DEFAULT_MODE,
  // view = DEFAULT_VIEW,
  offline = false,
  appInstanceId,
  spaceId,
  // subSpaceId,
  userId,
} = Qs.parse(window.location.search, { ignoreQueryPrefix: true });

if (!offline) {
  if (!apiHost || !appInstanceId || !spaceId) {
    throw new Error('missing context');
  }
}

if ((!(userId || sessionId) && mode !== 'admin')) {
  throw new Error('missing user');
}

const rejectNotOkResponse = (response) => {
  if (!response.ok) {
    return Promise
      .reject(new Error(`unable to complete the request: ${response.status} (${response.statusText})`));
  }

  return response;
};

// const postMessage = data => {
//   const message = JSON.stringify(data);
//   if (window.parent.postMessage) {
//     window.parent.postMessage(message, '*');
//   } else {
//     console.error('unable to find postMessage');
//   }
// };

const getAppInstanceResources = () => {
  let url = `//${apiHost}/app-instance-resources?appInstanceId=${appInstanceId}`;

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

const createAppInstanceResource = (appInstance, data) => {
  const object = { appInstance, data };

  return fetch(
    `//${apiHost}/app-instance-resources`,
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

const updateAppInstanceResource = (appInstanceResourceId, data) => {
  const object = { data };

  return fetch(
    `//${apiHost}/app-instance-resources/${appInstanceResourceId}`,
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

const refreshAppInstanceResources = () => {
  getAppInstanceResources()
    .then((resources) => {
      const table = $('tbody');
      table.empty();
      resources.forEach(({
        user,
        // eslint-disable-next-line no-shadow
        sessionId,
        data,
        updatedAt,
      }) => table
        .append(`<tr><td>${user || sessionId}</td><td>${data.progress}%</td><td>${updatedAt}</td></tr>`));
    })
    .catch(console.error);
};

const initUI = () => {
  switch (mode) {
    case 'admin':
      $('.view-select').addClass('active');
      $('.view-teacher').addClass('active');
      $('.teacher-content').addClass('active');

      $('.view-teacher').click(() => {
        $('.view-teacher, .teacher-content').toggleClass('active', true);
        $('.view-student, .slider-content').toggleClass('active', false);
        refreshAppInstanceResources(appInstanceId);
      });

      $('.view-student').click(() => {
        $('.view-teacher, .teacher-content').toggleClass('active', false);
        $('.view-student, .slider-content').toggleClass('active', true);
      });

      $('.refresh-button').click(() => refreshAppInstanceResources(appInstanceId));

      refreshAppInstanceResources(appInstanceId);
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

initUI();

let resourceId;

// GET data
let promise = getAppInstanceResources(appInstanceId, userId, sessionId);

if (mode === 'default') {
  promise = promise
    .then((resource) => {
      if (!resource) {
        const initData = { progress: 0 };
        return createAppInstanceResource(appInstanceId, initData);
      }

      return resource;
    })
    .then((resource) => {
      resourceId = resource._id;
      updateSlider(resource.data.progress);
    });
}

if (mode !== 'default') { // 'admin' or 'review'
  promise = promise
    .then((resource) => {
      if (resource) {
        resourceId = resource._id;
        updateSlider(resource.data.progress);
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
    updateAppInstanceResource(resourceId, data)
      .catch(console.error);
  });
}
