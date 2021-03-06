import { testSaga } from 'redux-saga-test-plan';
import { takeLatest } from 'redux-saga/effects';
import * as Sentry from '@sentry/browser';

import { authCall, authPostCall, getErrorMessage } from 'shared/services/api/api';
import { VARIANT_ERROR, TYPE_LOCAL } from 'containers/Notification/constants';
import * as actions from 'containers/App/actions';

import CONFIGURATION from 'shared/services/configuration/configuration';
import watchDefaultTextsAdminSaga,
{
  fetchDefaultTexts,
  storeDefaultTexts,
} from './saga';
import { FETCH_DEFAULT_TEXTS, STORE_DEFAULT_TEXTS } from './constants';

import {
  fetchDefaultTextsSuccess,
  fetchDefaultTextsError,
  storeDefaultTextsSuccess,
  storeDefaultTextsError,
} from './actions';

describe('/signals/incident-management/containers/DefaultTextsAdmin/saga', () => {
  const requestURL = `${CONFIGURATION.TERMS_ENDPOINT}afval/sub_categories/asbest-accu/status-message-templates`;
  const category_url = `${CONFIGURATION.CATEGORIES_ENDPOINT}afval/sub_categories/asbest-accu`;
  const payload = {
    main_slug: 'afval',
    sub_slug: 'asbest-accu',
    state: 'm',
    category_url,
  };
  const action = { payload };

  it('should watch watchDefaultTextsAdminSaga', () => {
    testSaga(watchDefaultTextsAdminSaga)
      .next()
      .all([
        takeLatest(FETCH_DEFAULT_TEXTS, fetchDefaultTexts),
        takeLatest(STORE_DEFAULT_TEXTS, storeDefaultTexts),
      ])
      .next()
      .isDone();
  });

  describe('fetchDefaultTexts', () => {
    it('should dispatch success', () => {
      const result = [
        {
          state: 'm',
          templates: [{ title: 'gemend', text: 'foo' }],
        },
        {
          state: 'i',
          templates: [{ title: 'in behandeling', text: 'bar' }],
        },
      ];

      testSaga(fetchDefaultTexts, action)
        .next()
        .call(authCall, requestURL)
        .next(result)
        .put(fetchDefaultTextsSuccess(result[0].templates))
        .next()
        .isDone();
    });

    it('should dispatch success empty list with missing template', () => {
      const result = [
        {
          state: 'm',
        },
        {
          state: 'i',
        },
      ];

      testSaga(fetchDefaultTexts, action)
        .next()
        .call(authCall, requestURL)
        .next(result)
        .put(fetchDefaultTextsSuccess([]))
        .next()
        .isDone();
    });

    it('should dispatch error', () => {
      const error = new Error('Something bad happened');
      error.response = {
        status: 500,
      };

      testSaga(fetchDefaultTexts, action)
        .next()
        .throw(error)
        .put(fetchDefaultTextsError('Internal server error'))
        .next()
        .put(actions.showGlobalNotification({
          title: getErrorMessage(error),
          message: 'Het standaard teksten overzicht kon niet opgehaald worden',
          variant: VARIANT_ERROR,
          type: TYPE_LOCAL,
        }))
        .next()
        .call([Sentry, 'captureException'], error)
        .next()
        .isDone();
    });
  });

  describe('storeDefaultTexts', () => {
    action.payload.post = {
      state: 'i',
      templates: [{ title: 'nieuwed', text: 'text' }],
    };

    it('should dispatch success', () => {
      const result = [
        {
          state: 'm',
          templates: [{ title: 'gemend', text: 'foo' }],
        },
        {
          state: 'i',
          templates: [{ title: 'in behandeling', text: 'bar' }],
        },
      ];

      testSaga(storeDefaultTexts, action)
        .next()
        .call(authPostCall, requestURL, [payload.post])
        .next(result)
        .put(storeDefaultTextsSuccess(result[1].templates))
        .next()
        .isDone();
    });

    it('should dispatch success empty list with missing template', () => {
      const result = [
        {
          state: 'm',
        },
        {
          state: 'i',
        },
      ];

      testSaga(storeDefaultTexts, action)
        .next()
        .call(authPostCall, requestURL, [payload.post])
        .next(result)
        .put(storeDefaultTextsSuccess([]))
        .next()
        .isDone();
    });

    it('should dispatch error', () => {
      const error = new Error('Something bad happened');
      error.response = {
        status: 500,
      };

      testSaga(storeDefaultTexts, action)
        .next()
        .throw(error)
        .put(storeDefaultTextsError('Internal server error'))
        .next()
        .put(actions.showGlobalNotification({
          title: getErrorMessage(error),
          message: 'De standaard teksten konden niet opgeslagen worden',
          variant: VARIANT_ERROR,
          type: TYPE_LOCAL,
        }))
        .next()
        .call([Sentry, 'captureException'], error)
        .next()
        .isDone();
    });
  });
});
