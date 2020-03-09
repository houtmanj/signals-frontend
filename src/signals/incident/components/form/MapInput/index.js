import React from 'react';
import PropTypes from 'prop-types';

import { getLocation } from 'shared/services/map-location';
import MapEditor from 'components/MapEditor';

import Header from '../Header';

const MapInput = ({
  handler, touched, hasError, meta, parent, getError, validatorsOrOpts,
}) => {
  const value = handler().value || {};

  /* istanbul ignore next */
  const onLocationChange = l => {
    parent.meta.updateIncident({ location: getLocation(l) });
  };

  return (
    <div className={`${meta && meta.isVisible ? 'row' : ''}`}>
      {meta && meta.isVisible
        ? (
          <div className={`${meta.className || 'col-12'} mode_input`}>
            <Header
              meta={meta}
              options={validatorsOrOpts}
              touched={touched}
              hasError={hasError}
              getError={getError}
            >
              <div className="invoer">
                <MapEditor onLocationChange={onLocationChange} location={value} />
              </div>
            </Header>
          </div>
        )
        : ''}
    </div>
  );
};

MapInput.propTypes = {
  handler: PropTypes.func,
  touched: PropTypes.bool,
  getError: PropTypes.func.isRequired,
  hasError: PropTypes.func.isRequired,
  meta: PropTypes.object,
  parent: PropTypes.object,
  validatorsOrOpts: PropTypes.object,
};

export default MapInput;
