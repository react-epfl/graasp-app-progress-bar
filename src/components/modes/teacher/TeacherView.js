import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import Fab from '@material-ui/core/Fab';
import { Settings as SettingsIcon } from '@material-ui/icons';
import {
  patchAppInstanceResource,
  postAppInstanceResource,
  deleteAppInstanceResource,
  getUsers,
  openSettings,
} from '../../../actions';
import Responses from './Responses';
import Settings from './Settings';

export class TeacherView extends Component {
  static propTypes = {
    classes: PropTypes.shape({
      root: PropTypes.string,
      main: PropTypes.string,
      fab: PropTypes.string,
    }).isRequired,
    t: PropTypes.func.isRequired,
    dispatchGetUsers: PropTypes.func.isRequired,
    dispatchOpenSettings: PropTypes.func.isRequired,
    // this is the shape of the select options for students
    students: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
      }),
    ).isRequired,
  };

  static styles = theme => ({
    root: {
      width: '100%',
      marginTop: theme.spacing(3),
      paddingBottom: theme.spacing(10),
    },
    main: {
      textAlign: 'center',
      margin: theme.spacing(),
      padding: theme.spacing(),
      overflowX: 'hidden',
    },
    fab: {
      margin: theme.spacing(),
      position: 'fixed',
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  });

  constructor(props) {
    super(props);
    const { dispatchGetUsers } = this.props;
    dispatchGetUsers();
  }

  render() {
    // extract properties from the props object
    const {
      t,
      students,
      dispatchOpenSettings,
      // this property allows us to do styling and is injected by withStyles
      classes,
    } = this.props;
    return (
      <div>
        <Grid container spacing={0} className={classes.root}>
          <Grid item xs={12} className={classes.main}>
            <Responses students={students} />
          </Grid>
        </Grid>
        <Settings />
        <Fab
          color="primary"
          aria-label={t('Settings')}
          className={classes.fab}
          onClick={dispatchOpenSettings}
        >
          <SettingsIcon />
        </Fab>
      </div>
    );
  }
}

// get the app instance resources that are saved in the redux store
const mapStateToProps = ({ users }) => ({
  students: users.content,
});

// allow this component to dispatch a post
// request to create an app instance resource
const mapDispatchToProps = {
  dispatchGetUsers: getUsers,
  dispatchPostAppInstanceResource: postAppInstanceResource,
  dispatchPatchAppInstanceResource: patchAppInstanceResource,
  dispatchDeleteAppInstanceResource: deleteAppInstanceResource,
  dispatchOpenSettings: openSettings,
};

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TeacherView);

const StyledComponent = withStyles(TeacherView.styles)(ConnectedComponent);

export default withTranslation()(StyledComponent);
