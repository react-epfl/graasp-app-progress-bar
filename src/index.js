import $ from 'jquery';
import './styles.css';
import QueryString from 'query-string';

$(document).ready(function() {
  var spinTimeout;

  const parsed = QueryString.parse(location.search);
  console.log(parsed);

  function AnimateRotate(angle, repeat) {
    var duration = 1400;
    spinTimeout = setTimeout(function() {
      if (repeat && repeat == "infinite") {
        AnimateRotate(angle, repeat);
      } else if (repeat && repeat > 1) {
        AnimateRotate(angle, repeat - 1);
      }
    }, duration);
    var $elem = $('.loader');
    $({ deg: 0 }).animate({ deg: angle }, {
      duration: duration,
      easing: 'linear',
      step: function(now) {
        $elem.css({
          'transform': 'rotate(' + now + 'deg)'
        });
      }
    });
  }
  AnimateRotate(360, "infinite");
  var teacherViewLoaded = false;
  $('.view-select .view-teacher').click(function() {
    if (!$(this).hasClass('active')) {
      $('.view-teacher, .teacher-content').addClass('active');
      $('.view-student, .slider-content').removeClass('active');
      if (!teacherViewLoaded) {
        $('table tbody').empty();
        $('.teacher-content').append('<div class="loader"></div>');
        if (spinTimeout) clearTimeout(spinTimeout);
        AnimateRotate(360, "infinite");
        getStudentPercentages();
      }
      // TODO: figure out how to adapt window height
      gadgets.window.adjustHeight();
    }
  });
  $('.view-select .view-student').click(function() {
    if (!$(this).hasClass('active')) {
      $('.view-teacher, .teacher-content').removeClass('active');
      $('.view-student, .slider-content').addClass('active');
      // TODO: figure out how to adapt window height
      gadgets.window.adjustHeight();
    }
  });

  // TODO: figure out how to adapt window height
  gadgets.window.adjustHeight();
  var progressSlider = document.getElementById('progressSlider');
  noUiSlider.create(progressSlider, {
    start: 0,
    connect: [true, false],
    step: 1,
    tooltips: true,
    range: {
      'min': 0,
      'max': 100
    },
    format: {
      to: function(value) {
        return value + '%';
      },
      from: function(value) {
        return value.replace('%', '');
      }
    }
  });
  progressSlider.setAttribute('disabled', true);
  var metadata;
  var actionLogger;
  var vaultFile;
  var loadingStudents = false;
  var getStudentPercentages = function() {
    loadingStudents = true;
    // TODO 1
    ils.filterVault(metadata.storageId, null, metadata.generator.id, null, null, null, null, null, function(resources) {
      if (resources.error) {
        loadingStudents = false;
        return console.error(resources.error);
      }
      teacherViewLoaded = true;
      if (resources.length) {
        // TODO: Use lodash
        resources.sort(function(a, b) {
          return a.metadata.actor.displayName.toUpperCase().localeCompare(b.metadata.actor.displayName.toUpperCase());
        });
        // TODO: Use native
        $.each(resources, function(index, vaultFile) {
          if (vaultFile.metadata.actor.objectType == "graasp_student") {
            var displayName = vaultFile.metadata.actor.displayName;
            var actorId = vaultFile.metadata.actor.id;
            var date = new Date(vaultFile.updated);
            date = date.toLocaleString('en-GB');
            var progress = "";
            try {
              progress = JSON.parse(vaultFile.content).progress;
            } catch (e) {
              console.error(e);
            }
            $('table tbody').append('<tr><td>' + displayName + '</td><td>' + progress + '%</td><td>' + date + '</td></tr>');
          }
        });
      }
      if (spinTimeout) clearTimeout(spinTimeout);
      $('.loader').remove();
      // TODO: figure out how to adapt window height
      gadgets.window.adjustHeight();
      loadingStudents = false;
    });
  };
  $('.refresh-button').click(function() {
    if (loadingStudents) return;
    $('table tbody').empty();
    $('.teacher-content').append('<div class="loader"></div>');
    if (spinTimeout) clearTimeout(spinTimeout);
    AnimateRotate(360, "infinite");
    getStudentPercentages();
  });
  // TODO 2
  ils.getAppContextParameters(function(data) {
    if (data.error) return console.error(data.error);
    metadata = data;
    metadata.target = {
      displayName: "Progress Bar",
      objectType: "Progress Bar"
    };
    // TODO 3
    new window.golab.ils.metadata.GoLabMetadataHandler(metadata, function(err, metadataHandler) {
      // TODO 4
      actionLogger = new window.ut.commons.actionlogging.ActionLogger(metadataHandler);
      // TODO 4.1
      actionLogger.setLoggingTarget("opensocial");
      progressSlider.removeAttribute('disabled');
    });
    if (metadata.actor.objectType == "graasp_editor" && !metadata.contextualActor) {
      $('.view-select').addClass('active');
    }
    var userId = (metadata.contextualActor) ? metadata.contextualActor.id : metadata.actor.id;
    // TODO 5
    ils.filterVault(metadata.storageId, userId, metadata.generator.id, null, null, null, null, null, function(resources) {
      if (resources.length) {
        vaultFile = resources[0];
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
    });
  });
  var saveTimeout;
  progressSlider.noUiSlider.on('change', function(value) {
    var newValue = parseInt(value[0].replace('%', ''), 10);
    var fileContent = {
      "progress": newValue
    };
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(function() {
      if (!metadata) return;
      // save to vault
      if (vaultFile) {
        // TODO 6
        ils.updateResource(vaultFile.id, fileContent, metadata, function(resource) {
          if (resource.error) return console.error(resource.error);
        });
      } else {
        // TODO 7
        ils.createResource('progress', fileContent, metadata, function(resource) {
          if (resource.error) return console.error(resource.error)
          vaultFile = resource;
        });
      }
      // create action
      var logObject = {
        "objectType": "progressBar",
        "content": newValue
      };
      // TODO 4.2
      actionLogger.logChange(logObject);
    }, 1000);
  });
});
