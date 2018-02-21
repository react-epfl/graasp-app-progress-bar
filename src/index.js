import $ from 'jquery';
import QueryString from 'query-string';
import noUiSlider from 'nouislider';
import './styles.css';

// todo: remove these objects
const ils = {};
const gadgets = {};

$(document).ready(() => {
  let spinTimeout;

  const parsed = QueryString.parse(window.location.search);
  console.log(parsed);

  function AnimateRotate(angle, repeat) {
    const duration = 1400;
    spinTimeout = setTimeout(() => {
      if (repeat && repeat === 'infinite') {
        AnimateRotate(angle, repeat);
      } else if (repeat && repeat > 1) {
        AnimateRotate(angle, repeat - 1);
      }
    }, duration);
    const $elem = $('.loader');
    $({ deg: 0 }).animate({ deg: angle }, {
      duration,
      easing: 'linear',
      step(now) {
        $elem.css({
          transform: `rotate(${now}deg)`,
        });
      },
    });
  }
  AnimateRotate(360, 'infinite');
  let teacherViewLoaded = false;

  let metadata;
  let actionLogger;
  let vaultFile;
  let loadingStudents = false;
  const getStudentPercentages = () => {
    loadingStudents = true;
    // TODO 1
    ils.filterVault(
      metadata.storageId,
      null,
      metadata.generator.id,
      null,
      null,
      null,
      null,
      null,
      (resources) => {
        if (resources.error) {
          loadingStudents = false;
          return console.error(resources.error);
        }
        teacherViewLoaded = true;
        if (resources.length) {
          // TODO: Use lodash
          resources.sort((a, b) => a.metadata.actor.displayName
            .toUpperCase()
            .localeCompare(b.metadata.actor.displayName.toUpperCase()));
          // TODO: Use native
          $.each(resources, (index, vault) => {
            if (vault.metadata.actor.objectType === 'graasp_student') {
              const { displayName } = vault.metadata.actor;
              let date = new Date(vault.updated);
              date = date.toLocaleString('en-GB');
              let progress = '';
              try {
                ({ progress } = { progress: JSON.parse(vault.content) });
              } catch (e) {
                console.error(e);
              }
              $('table tbody').append(`<tr><td>${displayName}</td><td>${progress}%</td><td>${date}</td></tr>`);
            }
          });
        }
        if (spinTimeout) clearTimeout(spinTimeout);
        $('.loader').remove();
        // TODO: figure out how to adapt window height
        gadgets.window.adjustHeight();
        loadingStudents = false;
        return true;
      },
    );
  };

  $('.view-select .view-teacher').click(function handleClick() {
    if (!$(this).hasClass('active')) {
      $('.view-teacher, .teacher-content').addClass('active');
      $('.view-student, .slider-content').removeClass('active');
      if (!teacherViewLoaded) {
        $('table tbody').empty();
        $('.teacher-content').append('<div class="loader"></div>');
        if (spinTimeout) clearTimeout(spinTimeout);
        AnimateRotate(360, 'infinite');
        getStudentPercentages();
      }
      // TODO: figure out how to adapt window height
      gadgets.window.adjustHeight();
    }
  });
  $('.view-select .view-student').click(function handleViewClick() {
    if (!$(this).hasClass('active')) {
      $('.view-teacher, .teacher-content').removeClass('active');
      $('.view-student, .slider-content').addClass('active');
      // TODO: figure out how to adapt window height
      gadgets.window.adjustHeight();
    }
  });

  // TODO: figure out how to adapt window height
  gadgets.window.adjustHeight();
  const progressSlider = document.getElementById('progressSlider');
  noUiSlider.create(progressSlider, {
    start: 0,
    connect: [true, false],
    step: 1,
    tooltips: true,
    range: {
      min: 0,
      max: 100,
    },
    format: {
      to(value) {
        return `${value}%`;
      },
      from(value) {
        return value.replace('%', '');
      },
    },
  });
  progressSlider.setAttribute('disabled', true);

  $('.refresh-button').click(() => {
    if (loadingStudents) return;
    $('table tbody').empty();
    $('.teacher-content').append('<div class="loader"></div>');
    if (spinTimeout) clearTimeout(spinTimeout);
    AnimateRotate(360, 'infinite');
    getStudentPercentages();
  });
  // TODO 2
  ils.getAppContextParameters((data) => {
    if (data.error) {
      return console.error(data.error);
    }
    metadata = data;
    metadata.target = {
      displayName: 'Progress Bar',
      objectType: 'Progress Bar',
    };
    // TODO 3
    window.golab.ils.metadata.GoLabMetadataHandler(metadata, ((err, metadataHandler) => {
      // TODO 4
      actionLogger = new window.ut.commons.actionlogging.ActionLogger(metadataHandler);
      // TODO 4.1
      actionLogger.setLoggingTarget('opensocial');
      progressSlider.removeAttribute('disabled');
    }));
    if (metadata.actor.objectType === 'graasp_editor' && !metadata.contextualActor) {
      $('.view-select').addClass('active');
    }
    const userId = (metadata.contextualActor) ? metadata.contextualActor.id : metadata.actor.id;
    // TODO 5
    return ils.filterVault(
      metadata.storageId,
      userId,
      metadata.generator.id,
      null,
      null,
      null,
      null,
      null,
      (resources) => {
        if (resources.length) {
          [vaultFile] = [resources];
          metadata.target.displayName = vaultFile.displayName;
          metadata.target.id = vaultFile.id;
          try {
            progressSlider.noUiSlider.set(JSON.parse(vaultFile.content).progress);
          } catch (e) {
            console.error(e);
          }
        }
        $('.loading').removeClass('active');
        $('.slider-content').addClass('active');
        // TODO: figure out how to adapt window height
        gadgets.window.adjustHeight();
        if (spinTimeout) clearTimeout(spinTimeout);
      },
    );
  });
  let saveTimeout;
  progressSlider.noUiSlider.on('change', (value) => {
    const newValue = parseInt(value[0].replace('%', ''), 10);
    const fileContent = {
      progress: newValue,
    };
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      if (!metadata) return;
      // save to vault
      if (vaultFile) {
        // TODO 6
        ils.updateResource(vaultFile.id, fileContent, metadata, (resource) => {
          if (resource.error) {
            console.error(resource.error);
          }
        });
      } else {
        // TODO 7
        ils.createResource('progress', fileContent, metadata, (resource) => {
          if (resource.error) {
            return console.error(resource.error);
          }
          vaultFile = resource;
          return resource;
        });
      }
      // create action
      const logObject = {
        objectType: 'progressBar',
        content: newValue,
      };
      // TODO 4.2
      actionLogger.logChange(logObject);
    }, 1000);
  });
});
