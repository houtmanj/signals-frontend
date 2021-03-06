import { fromJS } from 'immutable';

import { parseInputFormData } from 'signals/shared/filter/parse';
import {
  makeSelectMainCategories,
  makeSelectSubCategories,
} from 'models/categories/selectors';

import { createSelector } from 'reselect';
import { initialState } from './reducer';
import { FILTER_PAGE_SIZE } from './constants';

/**
 * Direct selector to the overviewPage state domain
 */
const selectIncidentManagementDomain = state =>
  (state && state.get('incidentManagement')) || fromJS(initialState);

export const makeSelectDataLists = createSelector(
  selectIncidentManagementDomain,
  state => {
    const priority = state.get('priority').toJS();
    const stadsdeel = state.get('stadsdeel').toJS();
    const status = state.get('status').toJS();
    const feedback = state.get('feedback').toJS();
    const source = state.get('source').toJS();
    const contact_details = state.get('contact_details').toJS();

    return {
      priority,
      stadsdeel,
      status,
      feedback,
      source,
      contact_details,
    };
  }
);

export const makeSelectAllFilters = createSelector(
  [
    selectIncidentManagementDomain,
    makeSelectDataLists,
    makeSelectMainCategories,
    makeSelectSubCategories,
  ],
  (stateMap, dataLists, maincategory_slug, category_slug) => {
    const filters = stateMap.get('filters').toJS();

    return filters.map(filter => {
      const { priority } = filter.options;
      const converted = (Array.isArray(priority)
        ? priority
        : [priority]
      ).filter(Boolean);
      const fltr = {
        ...filter,
        options: {
          ...filter.options,
          priority: converted,
        },
      };

      return parseInputFormData(fltr, {
        ...dataLists,
        maincategory_slug,
        category_slug,
      });
    });
  }
);

export const makeSelectActiveFilter = createSelector(
  [
    selectIncidentManagementDomain,
    makeSelectDataLists,
    makeSelectMainCategories,
    makeSelectSubCategories,
  ],
  (stateMap, dataLists, maincategory_slug, category_slug) => {
    if (!(maincategory_slug && category_slug)) {
      return {};
    }

    const state = stateMap.toJS();

    const { priority } = state.activeFilter.options;
    const converted = (Array.isArray(priority) ? priority : [priority]).filter(
      Boolean
    );
    const filter = {
      ...state.activeFilter,
      options: {
        ...state.activeFilter.options,
        priority: converted,
      },
    };

    return parseInputFormData(filter, {
      ...dataLists,
      maincategory_slug,
      category_slug,
    });
  }
);

export const makeSelectEditFilter = createSelector(
  [
    selectIncidentManagementDomain,
    makeSelectDataLists,
    makeSelectMainCategories,
    makeSelectSubCategories,
  ],
  (stateMap, dataLists, maincategory_slug, category_slug) => {
    if (!(maincategory_slug && category_slug)) {
      return {};
    }

    const state = stateMap.toJS();

    return parseInputFormData(
      state.editFilter,
      {
        ...dataLists,
        maincategory_slug,
        category_slug,
      },
      (category, value) => {
        if (category.key || category.slug) return undefined;

        return category._links.self.public.endsWith(`/${value}`);
      }
    );
  }
);

export const makeSelectFilterParams = createSelector(
  selectIncidentManagementDomain,
  incidentManagementState => {
    const incidentManagement = incidentManagementState.toJS();
    const filter = incidentManagement.activeFilter;
    const { options } = filter;
    const { page } = incidentManagement;
    let { ordering } = incidentManagement;

    if (ordering === 'days_open') {
      ordering = '-created_at';
    }

    if (ordering === '-days_open') {
      ordering = 'created_at';
    }

    const pagingOptions = {
      page,
      ordering,
      page_size: FILTER_PAGE_SIZE,
    };

    return { ...options, ...pagingOptions };
  }
);

export const makeSelectPage = createSelector(
  selectIncidentManagementDomain,
  state => {
    const obj = state.toJS();

    return obj.page;
  }
);

export const makeSelectOrdering = createSelector(
  selectIncidentManagementDomain,
  state => {
    const obj = state.toJS();

    return obj.ordering;
  }
);

export const makeSelectSearchQuery = createSelector(
  selectIncidentManagementDomain,
  state => {
    const obj = state.toJS();

    return obj.searchQuery;
  }
);

export const makeSelectIncidents = createSelector(
  selectIncidentManagementDomain,
  state => {
    const { incidents, loading } = state.toJS();

    return { ...incidents, loading };
  }
);

export const makeSelectIncidentsCount = createSelector(
  selectIncidentManagementDomain,
  state => {
    const {
      incidents: { count },
    } = state.toJS();

    return count;
  }
);
