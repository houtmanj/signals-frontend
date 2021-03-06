import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';
import {
  makeSelectMainCategories,
  makeSelectSubCategories,
} from 'models/categories/selectors';
import { makeSelectDataLists } from 'signals/incident-management/selectors';
import { Tag } from '@datapunt/asc-ui';
import moment from 'moment';
import * as types from 'shared/types';

const FilterWrapper = styled.div`
  margin-top: 10px;
`;

const StyledTag = styled(Tag)`
  display: inline-block;
  margin: 0 5px 5px 0;
  white-space: nowrap;
  :first-letter {
    text-transform: capitalize;
  }
`;

export const allLabelAppend = ': Alles';

export const mapKeys = key => {
  switch (key) {
    case 'source':
      return 'bron';

    case 'priority':
      return 'urgentie';

    case 'contact_details':
      return 'contact';

    default:
      return key;
  }
};
const renderItem = (display, key) => (
  <StyledTag
    colorType="tint"
    colorSubtype="level3"
    key={key}
    data-testid="filterTagListTag"
  >
    {display}
  </StyledTag>
);

const renderGroup = (tag, main, list, tagKey) => {
  if (tag.length === list.length) {
    return renderItem(`${mapKeys(tagKey)}${allLabelAppend}`, tagKey);
  }

  return tag.map(item => renderTag(item.key, main, list));
};

const renderTag = (key, mainCategories, list) => {
  let found = false;

  if (list) {
    found = list.find(i => i.key === key || i.slug === key);
  }

  let display = (found && found.value) || key;
  if (!display) {
    return null;
  }

  const foundMain = mainCategories.find(i => i.key === key);

  display += foundMain ? allLabelAppend : '';
  // eslint-disable-next-line consistent-return
  return renderItem(display, key);
};

export const FilterTagListComponent = props => {
  const {
    tags,
    dataLists,
    mainCategories,
    subCategories,
  } = props;

  const map = {
    ...dataLists,
    maincategory_slug: mainCategories,
    category_slug: subCategories,
  };

  const tagsList = { ...tags };

  // piece together date strings into one tag
  const dateRange = useMemo(() => {
    if (!tagsList.created_after && !tagsList.created_before) return undefined;

    return [
      'Datum:',
      tagsList.created_after && moment(tagsList.created_after).format('DD-MM-YYYY'),
      't/m',
      (tagsList.created_before &&
        moment(tagsList.created_before).format('DD-MM-YYYY')) ||
      'nu',
    ]
      .filter(Boolean)
      .join(' ');
  }, [tagsList.created_after, tagsList.created_before]);

  if (dateRange) {
    delete tagsList.created_after;
    delete tagsList.created_before;

    tagsList.dateRange = dateRange;
  }

  return mainCategories && subCategories ? (
    <FilterWrapper className="incident-overview-page__filter-tag-list">
      {Object.entries(tagsList).map(([tagKey, tag]) =>
        Array.isArray(tag)
          ? renderGroup(tag, mainCategories, map[tagKey], tagKey)
          : renderTag(tag, mainCategories, map[tagKey])
      )}
    </FilterWrapper>
  ) : null;
};

FilterTagListComponent.propTypes = {
  tags: types.filterType,
  mainCategories: types.dataListType,
  subCategories: types.dataListType,
  dataLists: types.dataListsType.isRequired,
};

FilterTagListComponent.defaultProps = {
  tags: {},
};

const mapStateToProps = createStructuredSelector({
  mainCategories: makeSelectMainCategories,
  subCategories: makeSelectSubCategories,
  dataLists: makeSelectDataLists,
});

const withConnect = connect(mapStateToProps);

export default withConnect(FilterTagListComponent);
