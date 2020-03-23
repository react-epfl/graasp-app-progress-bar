import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';
import { Slider, withStyles } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import formatValueLabel from '../../utils/formatValueLabel';

class FormDialog extends Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    text: PropTypes.string,
    submitText: PropTypes.string,
    cancelText: PropTypes.string,
    initialInput: PropTypes.string,
    classes: PropTypes.shape({
      slider: PropTypes.string,
    }).isRequired,
  };

  static defaultProps = {
    text: '',
    submitText: 'Submit',
    cancelText: 'Cancel',
    initialInput: '',
  };

  static styles = theme => ({
    slider: {
      marginTop: theme.spacing(5),
    },
  });

  state = {
    input: 0,
  };

  componentDidMount() {
    const { initialInput } = this.props;
    if (initialInput !== '') {
      this.setState({
        input: initialInput,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { initialInput } = this.props;
    const { initialInput: prevInitialInput } = prevProps;
    const { input: prevInput } = prevState;

    // only update state if it is sure to not trigger a infinite render loop
    if (prevInitialInput !== initialInput && prevInput !== initialInput) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ input: initialInput });
    }
  }

  handleChangeSlider = (event, value) => {
    this.setState({
      input: value,
    });
  };

  render() {
    const {
      t,
      open,
      handleClose,
      classes,
      handleSubmit,
      title,
      text,
      submitText,
      cancelText,
    } = this.props;

    const { input } = this.state;

    return (
      <div>
        <Dialog
          fullScreen
          open={open}
          onClose={handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">{title}</DialogTitle>
          <DialogContent>
            <DialogContentText>{text}</DialogContentText>
            <Slider
              value={input}
              className={classes.slider}
              getAriaValueText={formatValueLabel}
              aria-labelledby={t('My Progress')}
              step={1}
              valueLabelDisplay="on"
              valueLabelFormat={formatValueLabel}
              onChange={this.handleChangeSlider}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              {cancelText}
            </Button>
            <Button
              variant="contained"
              onClick={() => handleSubmit(input)}
              color="primary"
            >
              {submitText}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const StyledComponent = withStyles(FormDialog.styles)(FormDialog);

export default withTranslation()(StyledComponent);
