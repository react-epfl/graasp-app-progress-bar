import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Slider, Typography } from '@material-ui/core';
import formatValueLabel from '../../../utils/formatValueLabel';
import { OBJECTIVE, PROGRESS } from '../../../config/appInstanceResourceTypes';
import { patchAppInstanceResource, postAppInstanceResource } from '../../../actions';

const styles = theme => ({
  main: {
    margin: theme.spacing(3),
    padding: theme.spacing(2),
    overflow: 'hidden',
  },
  horizontalGrid: {
    justifyContent: 'flex-start',
    display: 'flex',
    alignItems: 'center',
  },
  grid: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slider: {
    marginTop: theme.spacing(5),
    marginRight: theme.spacing(),
  }
});

const marks = [
  {
    value: 0,
    label: '0%',
  },
  {
    value: 25,
    label: '25%',
  },
  {
    value: 50,
    label: '50%',
  },
  {
    value: 75,
    label: '75%',
  },
  {
    value: 100,
    label: '100%',
  },
];

export const StudentView = ({
  t,
  tool,
  activity,
  classes,
  progressResource,
  objectiveResource,
  userId,
  dispatchPostAppInstanceResource,
  dispatchPatchAppInstanceResource,
}) => {
  const progressResourceId = progressResource && (progressResource.id || progressResource._id);
  const progressResourceData = progressResourceId ? progressResource.data : 0;

  const objectiveResourceId = objectiveResource && (objectiveResource.id || objectiveResource._id);
  const objectiveResourceData = objectiveResourceId ? objectiveResource.data : 0;

  const [progress, setProgress] = useState(progressResourceData);

  const VERTICAL_HEIGHT = '300px';

  useEffect(() => {
    setProgress(progressResourceData);
  }, [progressResourceData]);

  const handleChangeCommitted = (event, data) => {
    // if there is a resource id already, update, otherwise create
    if (progressResourceId) {
      dispatchPatchAppInstanceResource({
        data,
        id: progressResourceId,
      });
    } else {
      dispatchPostAppInstanceResource({
        data,
        userId,
        type: PROGRESS,
      });
    }
  };

  return (
    <div className={classes.main}>
      <Grid container spacing={0}>
        {
          tool &&
            (
              <>
                <Grid item xs={objectiveResourceId ? 6 : 12} className={classes.grid}>
                  <Typography id="progress" gutterBottom>
                    {t('My Progress')}
                  </Typography>
                </Grid>
                {
                  objectiveResourceId &&
                  (
                    <Grid item xs={6} className={classes.grid}>
                      <Typography id="progress" gutterBottom>
                        {t('Objective')}
                      </Typography>
                    </Grid>
                  )
                }
              </>
            )
        }
        {
         !tool && (
           <Grid item xs={2} className={classes.horizontalGrid}>
             <Typography id="progress" gutterBottom>
               {t('My Progress')}
             </Typography>
           </Grid>
         )
        }
        {/* eslint-disable-next-line no-nested-ternary */}
        <Grid item xs={tool ? (objectiveResourceId ? 6 : 12) : 10} className={classes.grid}>
          <Slider
            style={tool ? { height: VERTICAL_HEIGHT } : {}}
            orientation={tool ? 'vertical' : 'horizontal'}
            className={classes.slider}
            disabled={activity}
            value={progress}
            getAriaValueText={formatValueLabel}
            aria-labelledby={t('My Progress')}
            step={1}
            valueLabelDisplay="on"
            valueLabelFormat={formatValueLabel}
            marks={marks}
            onChange={(event, value) => setProgress(value)}
            onChangeCommitted={handleChangeCommitted}
          />
        </Grid>
        {
          objectiveResourceId &&
          (
            <>
              {
                !tool && (
                  <Grid item xs={2} className={classes.horizontalGrid}>
                    <Typography id="progress" gutterBottom>
                      {t('Objective')}
                    </Typography>
                  </Grid>
                )
              }
              <Grid item xs={tool ? 6 : 10} className={classes.grid}>
                <Slider
                  style={tool ? { height: VERTICAL_HEIGHT } : {}}
                  orientation={tool ? 'vertical' : 'horizontal'}
                  className={classes.slider}
                  value={objectiveResourceData}
                  getAriaValueText={formatValueLabel}
                  aria-labelledby={t('Objective')}
                  valueLabelDisplay="on"
                  valueLabelFormat={formatValueLabel}
                  marks={marks}
                  disabled
                />
              </Grid>
            </>
          )
        }
      </Grid>
    </div>
  );
};

const mapStateToProps = ({ appInstanceResources, context }) => {
  const { userId, tool } = context;
  const objectiveResource = appInstanceResources.content.find(
    ({ user, type }) => {
      return user === userId && type === OBJECTIVE;
    },
  );
  const progressResource = appInstanceResources.content.find(
    ({ user, type }) => {
      return user === userId && type === PROGRESS;
    },
  );
  return {
    userId,
    tool,
    progressResource,
    objectiveResource,
    activity: Boolean(appInstanceResources.activity.length),
  };
};

const mapDispatchToProps = {
  dispatchPostAppInstanceResource: postAppInstanceResource,
  dispatchPatchAppInstanceResource: patchAppInstanceResource,
};

StudentView.propTypes = {
  t: PropTypes.func.isRequired,
  activity: PropTypes.bool.isRequired,
  tool: PropTypes.bool.isRequired,
  progressResource: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    data: PropTypes.string,
  }),
  objectiveResource: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    data: PropTypes.string,
  }),
  userId: PropTypes.string,
  dispatchPostAppInstanceResource: PropTypes.func.isRequired,
  dispatchPatchAppInstanceResource: PropTypes.func.isRequired,
  classes: PropTypes.shape({
    main: PropTypes.string,
    slider: PropTypes.string,
    grid: PropTypes.string,
    horizontalGrid: PropTypes.string,
  }).isRequired,
};

StudentView.defaultProps = {
  userId: null,
  progressResource: {},
  objectiveResource: {},
};

const StyledComponent = withStyles(styles)(StudentView);

const TranslatedComponent = withTranslation()(StyledComponent);

export default connect(mapStateToProps, mapDispatchToProps)(TranslatedComponent);
