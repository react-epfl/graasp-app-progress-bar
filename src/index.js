import Qs from 'qs';
import noUiSlider from 'nouislider';
import './styles.css';

const rejectNotOkResponse = (response) => {
  if (!response.ok) {
    return Promise
      .reject(new Error(`Unable to fetch app data: ${response.status} (${response.statusText})`));
  }

  return response;
};

const getAppInstance = (appId, userId) =>
  fetch(
    `http://localhost:7000/app-instances?appId=${appId}&userId=${userId}`,
    { headers: { 'content-type': 'application/json' } },
  )
    .then(rejectNotOkResponse)
    .then(response => response.json())
    .then(array => array[0]);

const createAppInstance = (appId, userId, data) => {
  const object = { appId, userId, data };

  return fetch(
    'http://localhost:7000/app-instances',
    {
      body: JSON.stringify(object),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    },
  )
    .then(rejectNotOkResponse)
    .then(response => response.json());
};

const updateAppInstance = (instanceId, data) => {
  const object = { data };

  return fetch(
    `http://localhost:7000/app-instances/${instanceId}`,
    {
      body: JSON.stringify(object),
      headers: { 'content-type': 'application/json' },
      method: 'PATCH',
    },
  )
    .then(rejectNotOkResponse)
    .then(response => response.json());
};

const { appId, userId } = Qs.parse(window.location.search, { ignoreQueryPrefix: true });

if (!appId || !userId) {
  console.error('Missing context');
} else {
  const sliderElement = document.getElementById('progressSlider');

  const updateSlider = (value) => {
    sliderElement.noUiSlider.set([value]);
    sliderElement.removeAttribute('disabled');
  };

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

  sliderElement.setAttribute('disabled', true);

  let instanceId;

  getAppInstance(appId, userId)
    .then((instance) => {
      if (!instance) {
        const initData = { progress: 0 };
        return createAppInstance(appId, userId, initData);
      }

      return instance;
    })
    .then((instance) => {
      instanceId = instance._id;
      updateSlider(instance.data.progress);
    })
    .catch(console.error);

  sliderElement.noUiSlider.on('change', (value) => {
    const progress = parseInt(value[0].slice(0, -1), 10);
    const data = { progress };

    updateAppInstance(instanceId, data)
      .catch(console.error);
  });
}
