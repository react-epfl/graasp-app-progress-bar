import _ from 'lodash';
import React, { Component } from 'react';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import {
  Launch as LaunchIcon,
  Delete as DeleteIcon,
  EditLocation as EditLocationIcon,
} from '@material-ui/icons';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { withStyles, Tooltip, Slider } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import ConfirmDialog from '../../common/ConfirmDialog';
import {
  deleteAppInstanceResource,
  patchAppInstanceResource,
  postAppInstanceResource,
} from '../../../actions';
import { OBJECTIVE, PROGRESS } from '../../../config/appInstanceResourceTypes';
import FormDialog from '../../common/FormDialog';
import { showErrorToast } from '../../../utils/toasts';
import formatValueLabel from '../../../utils/formatValueLabel';

const styles = theme => ({
  inlineIcon: {
    marginLeft: theme.spacing(2),
  },
});

class Response extends Component {
  state = {
    confirmDialogOpen: false,
    objectiveDialogOpen: false,
  };

  static propTypes = {
    t: PropTypes.func.isRequired,
    activity: PropTypes.bool.isRequired,
    parentSpaceId: PropTypes.string,
    spaceId: PropTypes.string.isRequired,
    lang: PropTypes.string.isRequired,
    dispatchDeleteAppInstanceResource: PropTypes.func.isRequired,
    dispatchPostAppInstanceResource: PropTypes.func.isRequired,
    dispatchPatchAppInstanceResource: PropTypes.func.isRequired,
    student: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
    objectiveResource: PropTypes.shape({
      _id: PropTypes.string,
      data: PropTypes.string,
    }),
    classes: PropTypes.shape({
      inlineIcon: PropTypes.string,
    }).isRequired,
    progressResource: PropTypes.shape({
      _id: PropTypes.string,
      data: PropTypes.string,
    }),
  };

  static defaultProps = {
    objectiveResource: {},
    progressResource: {},
    parentSpaceId: null,
  };

  handleToggleConfirmDialog = open => () => {
    this.setState({
      confirmDialogOpen: open,
    });
  };

  handleToggleObjectiveDialog = open => () => {
    this.setState({
      objectiveDialogOpen: open,
    });
  };

  handleConfirmDelete = () => {
    const { dispatchDeleteAppInstanceResource, objectiveResource } = this.props;
    if (!_.isEmpty(objectiveResource)) {
      dispatchDeleteAppInstanceResource(objectiveResource._id);
    }
    this.handleToggleConfirmDialog(false)();
  };

  handleSubmitObjective = objective => {
    const {
      student,
      objectiveResource,
      dispatchPostAppInstanceResource,
      dispatchPatchAppInstanceResource,
    } = this.props;

    const { id } = student;

    if (!id) {
      showErrorToast(
        'Currently we do not support giving an objective to anonymous users.',
      );
    }

    // if no objective resource yet, create it, otherwise, update it
    if (_.isEmpty(objectiveResource)) {
      dispatchPostAppInstanceResource({
        data: objective,
        userId: id,
        type: OBJECTIVE,
      });
    } else {
      dispatchPatchAppInstanceResource({
        id: objectiveResource._id,
        data: objective,
      });
    }
    return this.handleToggleObjectiveDialog(false)();
  };

  render() {
    const {
      t,
      student,
      activity,
      objectiveResource,
      parentSpaceId,
      spaceId,
      lang,
      progressResource,
    } = this.props;

    const { data: progress = 0 } = progressResource;
    const { data: objective } = objectiveResource;

    const { id, name } = student;

    const { confirmDialogOpen, objectiveDialogOpen } = this.state;

    const reviewUrl = `https://viewer.graasp.eu/${lang}/pages/${parentSpaceId}/subpages/${spaceId}?revieweeId=${id}`;

    return (
      <TableRow key={id}>
        <TableCell>{activity ? <CircularProgress /> : name}</TableCell>
        <TableCell align="center">
          <Slider
            value={progress}
            valueLabelDisplay="on"
            valueLabelFormat={formatValueLabel}
            disabled
            aria-labelledby="Student Progress"
          />
        </TableCell>
        <TableCell align="center">
          {
            objective ?
            (
              <Slider
                value={objective}
                valueLabelDisplay="on"
                valueLabelFormat={formatValueLabel}
                disabled
                aria-labelledby="Student Objective"
              />
            )
            :
            (
              <Tooltip title={t('Set Objective')}>
                <IconButton
                  color="primary"
                  onClick={this.handleToggleObjectiveDialog(true)}
                >
                  <EditLocationIcon />
                </IconButton>
              </Tooltip>
            )
          }
        </TableCell>
        <TableCell align="center">
          <Tooltip title={t('Set Objective')}>
            <IconButton
              color="primary"
              onClick={this.handleToggleObjectiveDialog(true)}
            >
              <EditLocationIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('Delete Objective')}>
            <IconButton
              color="primary"
              onClick={this.handleToggleConfirmDialog(true)}
              disabled={_.isEmpty(objectiveResource)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('Review')}>
            <IconButton color="primary" href={reviewUrl} target="_blank">
              <LaunchIcon />
            </IconButton>
          </Tooltip>
          <ConfirmDialog
            open={confirmDialogOpen}
            title={t('Delete Objective')}
            text={t(
              'By clicking "Delete", you will be deleting the objective you set for the student. This action cannot be undone.',
            )}
            handleClose={this.handleToggleConfirmDialog(false)}
            handleConfirm={this.handleConfirmDelete}
            confirmText={t('Delete')}
            cancelText={t('Cancel')}
          />
          <FormDialog
            handleClose={this.handleToggleObjectiveDialog(false)}
            title={t('Objective')}
            text={t('Submit an objective that will be visible to the student.')}
            open={objectiveDialogOpen}
            initialInput={objective}
            handleSubmit={this.handleSubmitObjective}
          />
        </TableCell>
      </TableRow>
    );
  }
}

const mapStateToProps = (
  { appInstanceResources, users, context },
  ownProps,
) => {
  const {
    student: { id },
  } = ownProps;
  const { parentSpaceId, spaceId, lang } = context;
  const objectiveResource = appInstanceResources.content.find(
    ({ user, type }) => {
      return user === id && type === OBJECTIVE;
    },
  );
  return {
    lang,
    objectiveResource,
    parentSpaceId,
    spaceId,
    activity: Boolean(users.activity.length),
    progressResource: appInstanceResources.content.find(({ user, type }) => {
      return user === id && type === PROGRESS;
    }),
  };
};

// allow this component to dispatch a post
// request to create an app instance resource
const mapDispatchToProps = {
  dispatchPostAppInstanceResource: postAppInstanceResource,
  dispatchPatchAppInstanceResource: patchAppInstanceResource,
  dispatchDeleteAppInstanceResource: deleteAppInstanceResource,
};

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Response);

const TranslatedComponent = withTranslation()(ConnectedComponent);

export default withStyles(styles)(TranslatedComponent);
