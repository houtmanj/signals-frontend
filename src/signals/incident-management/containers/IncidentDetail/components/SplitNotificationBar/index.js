import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Button, themeColor } from '@datapunt/asc-ui';
import styled from 'styled-components';
import {
  Close,
} from '@datapunt/asc-assets';

const StyledWrapper = styled.div`
  flex-basis: 100%;
  color: ${themeColor('bright', 'main')};
  a {
    color: ${themeColor('bright', 'main')};
  }
  `;

const StyledSuccess = styled.div`
  background-color: ${themeColor('support', 'valid')};
  padding: 6px 10px;
`;

const StyledError = styled.div`
  background-color: ${themeColor('support', 'invalid')};
  padding: 6px 10px;
`;

const StyledCloseButton = styled(Button)`
  float: right;
  background-color: transparent;

  &:hover {
    background-color: transparent;
  }

  svg path {
    fill: ${themeColor('bright', 'main')};
    ;
  }
`;

const getErrorMessage = status => {
  switch (status) {
    case 403:
      return 'U bent niet bevoegd om deze melding te splitsen.';

    case 412:
      return 'U kunt geen meldingen splitsen die al gesplitst zijn.';

    default:
      return 'Er is een onbekende fout ontstaan.';
  }
};

const getDelimiter = (key, length) => {
  if (key === length - 2) {
    return ' en ';
  }
  return key < length - 1 ? ', ' : '';
};

const renderCloseButton = onDismissSplitNotification => (
  <StyledCloseButton
    size={20}
    variant="blank"
    icon={<Close />}
    data-testid="splitNotificationBarCloseButton"
    onClick={onDismissSplitNotification}
  />
);

const SplitNotificationBar = ({ data, onDismissSplitNotification }) => (
  <StyledWrapper data-testid="splitNotificationBar">
    {data && data.id && data.created && data.created.children && Array.isArray(data.created.children) ?
      <StyledSuccess>
        {renderCloseButton(onDismissSplitNotification)}

        Melding {data.id} is gesplitst in&nbsp;
        {data.created.children.map((item, key) =>
          (<span key={item.id}>
            <NavLink to={`/manage/incident/${item.id}`}>{item.id}</NavLink>
            {getDelimiter(key, data.created.children.length)}
          </span>)
        )}
      </StyledSuccess>
      : ''}
    {data && data.response && data.response.status ?
      <StyledError>
        {renderCloseButton(onDismissSplitNotification)}

        De melding is helaas niet gesplitst.&nbsp;
        {getErrorMessage(data.response.status)}
      </StyledError>
      : ''}
  </StyledWrapper>
);

SplitNotificationBar.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
    PropTypes.array,
  ]),
  onDismissSplitNotification: PropTypes.func.isRequired,
};

export default SplitNotificationBar;
