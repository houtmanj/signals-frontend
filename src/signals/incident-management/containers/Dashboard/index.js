import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose, bindActionCreators } from 'redux';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectDashboard from './selectors';
import reducer from './reducer';
import saga from './saga';
import './style.scss';

import StatusGraph from './components/StatusGraph';
import CategoryGraph from './components/CategoryGraph';

import { requestDashboard } from './actions';

export class Dashboard extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    this.props.onRequestDashboard();
  }

  render() {
    const { dashboard } = this.props.incidentDashboard;

    return (
      <div className="dashboard">
        <StatusGraph data={dashboard.status} />
        <CategoryGraph data={dashboard.category} />
      </div>
    );
  }
}

Dashboard.defaultProps = {
  incidentDashboard: {
    dashboard: {}
  }
};

Dashboard.propTypes = {
  incidentDashboard: PropTypes.shape({
    dashboard: PropTypes.object
  }),
  onRequestDashboard: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  incidentDashboard: makeSelectDashboard()
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
  onRequestDashboard: requestDashboard
}, dispatch);

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'incidentDashboard', reducer });
const withSaga = injectSaga({ key: 'incidentDashboard', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(Dashboard);
