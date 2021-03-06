import { fromJS } from 'immutable';
import * as definitions from 'signals/incident-management/definitions';
import {
  mainCategories as maincategory_slug,
  subCategories as category_slug,
} from 'utils/__tests__/fixtures';
import {
  makeSelectFilterParams,
  makeSelectDataLists,
  makeSelectAllFilters,
  makeSelectActiveFilter,
  makeSelectEditFilter,
  makeSelectPage,
  makeSelectOrdering,
  makeSelectIncidents,
  makeSelectIncidentsCount,
} from '../selectors';
import { FILTER_PAGE_SIZE } from '../constants';

import { initialState } from '../reducer';

const dataLists = {
  priority: definitions.priorityList,
  status: definitions.statusList,
  feedback: definitions.feedbackList,
  stadsdeel: definitions.stadsdeelList,
  source: definitions.sourceList,
  contact_details: definitions.contactDetailsList,
};

const filters = [
  {
    _links: {
      self: {
        href: 'https://signals/v1/private/me/filters/219',
      },
    },
    id: 219,
    options: {
      maincategory_slug: ['afval'],
    },
    name: 'Foo Bar',
  },
  {
    _links: {
      self: {
        href: 'https://signals/v1/private/me/filters/220',
      },
    },
    id: 220,
    options: {
      stadsdeel: ['B', 'E'],
    },
    name: 'Foo Bar',
  },
  {
    _links: {
      self: {
        href: 'https://signals/v1/private/me/filters/221',
      },
    },
    id: 221,
    options: {
      status: ['m'],
    },
    name: 'Foo Bar',
  },
];

describe('signals/incident-management/selectors', () => {
  it('should select data lists', () => {
    expect(makeSelectDataLists()).toEqual({
      priority: definitions.priorityList,
      stadsdeel: definitions.stadsdeelList,
      status: definitions.statusList,
      feedback: definitions.feedbackList,
      source: definitions.sourceList,
      contact_details: definitions.contactDetailsList,
    });
  });

  it('should select all filters', () => {
    const state = fromJS({ ...initialState.toJS(), filters });
    const allFilters = makeSelectAllFilters.resultFunc(
      state,
      dataLists,
      maincategory_slug,
      category_slug
    );

    expect(allFilters.length).toEqual(filters.length);
    expect(allFilters[0].options.maincategory_slug).not.toEqual(
      filters[0].options.maincategory_slug,
    );
  });

  it('should select active filter', () => {
    expect(
      makeSelectActiveFilter.resultFunc(
        initialState,
        dataLists,
        maincategory_slug,
        category_slug
      )
    ).toEqual(initialState.toJS().activeFilter);

    const state = fromJS({ ...initialState.toJS(), activeFilter: filters[0] });

    expect(
      makeSelectActiveFilter.resultFunc(
        state,
        dataLists,
        maincategory_slug,
        category_slug
      ).id
    ).toEqual(filters[0].id);
  });

  it('should select edit filter', () => {
    expect(
      makeSelectEditFilter.resultFunc(
        initialState,
        dataLists,
        maincategory_slug,
        category_slug
      )
    ).toEqual(initialState.toJS().editFilter);

    const state = fromJS({ ...initialState.toJS(), editFilter: filters[2] });

    expect(
      makeSelectEditFilter.resultFunc(
        state,
        dataLists,
        maincategory_slug,
        category_slug
      ).id
    ).toEqual(filters[2].id);
  });

  it('should select page', () => {
    const emptState = fromJS({
      incidentManagement: { ...initialState.toJS() },
    });
    expect(makeSelectPage(emptState)).toEqual(initialState.toJS().page);

    const state = fromJS({
      incidentManagement: { ...initialState.toJS(), page: 100 },
    });

    expect(makeSelectPage(state)).toEqual(100);
  });

  it('should select ordering', () => {
    const emptState = fromJS({
      incidentManagement: { ...initialState.toJS() },
    });
    expect(makeSelectOrdering(emptState)).toEqual(initialState.toJS().ordering);

    const state = fromJS({
      incidentManagement: { ...initialState.toJS(), ordering: 'some-ordering-type' },
    });

    expect(makeSelectOrdering(state)).toEqual('some-ordering-type');
  });

  it('should select incidents', () => {
    const results = [...new Array(10).keys()].map(index => ({
      id: index + 1,
    }));

    const incidents = { count: 100, results };

    const stateLoading = fromJS({
      incidentManagement: { ...initialState.toJS(), loading: true, incidents },
    });

    expect(makeSelectIncidents(stateLoading)).toEqual({ ...incidents, loading: true });

    const state = fromJS({
      incidentManagement: { ...initialState.toJS(), incidents },
    });

    expect(makeSelectIncidents(state)).toEqual({ ...incidents, loading: false });
  });

  it('should select incidents count', () => {
    const emptState = fromJS({
      incidentManagement: { ...initialState.toJS() },
    });

    expect(makeSelectIncidentsCount(emptState)).toEqual(initialState.toJS().incidents.count);

    const count = 909;
    const state = fromJS({
      incidentManagement: { ...initialState.toJS(), incidents: { count } },
    });

    expect(makeSelectIncidentsCount(state)).toEqual(count);
  });

  describe('makeSelectFilterParams', () => {
    it('should select filter params', () => {
      const emptyState = fromJS({
        incidentManagement: { ...initialState.toJS(), editFilter: filters[1], searchQuery: '' },
      });

      expect(makeSelectFilterParams(emptyState)).toEqual({
        ordering: '-created_at',
        page: 1,
        page_size: FILTER_PAGE_SIZE,
        priority: [],
      });

      const state = fromJS({
        incidentManagement: { ...initialState.toJS(), activeFilter: filters[1] },
      });

      expect(makeSelectFilterParams(state)).toEqual({
        ordering: '-created_at',
        page: 1,
        stadsdeel: ['B', 'E'],
        page_size: FILTER_PAGE_SIZE,
      });
    });

    it('should reformat days_open', () => {
      const state1 = fromJS({
        incidentManagement: { ...initialState.toJS(), ordering: 'days_open' },
      });

      expect(makeSelectFilterParams(state1)).toEqual({
        ordering: '-created_at',
        page: 1,
        page_size: FILTER_PAGE_SIZE,
        priority: [],
      });

      const state2 = fromJS({
        incidentManagement: { ...initialState.toJS(), ordering: '-days_open' },
      });

      expect(makeSelectFilterParams(state2)).toEqual({
        ordering: 'created_at',
        page: 1,
        page_size: FILTER_PAGE_SIZE,
        priority: [],
      });
    });
  });
});
