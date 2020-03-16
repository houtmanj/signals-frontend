import { fromJS } from 'immutable';

import { stadsdeelList, priorityList, typesList } from 'signals/incident-management/definitions';
import statusList, {
  changeStatusOptionList,
  defaultTextsOptionList,
} from 'signals/incident-management/definitions/statusList';

import {
  SPLIT_INCIDENT_SUCCESS,
  SPLIT_INCIDENT_ERROR,
} from 'signals/incident-management/containers/IncidentSplitContainer/constants';

import {
  REQUEST_INCIDENT,
  REQUEST_INCIDENT_SUCCESS,
  REQUEST_INCIDENT_ERROR,
  DISMISS_SPLIT_NOTIFICATION,
  PATCH_INCIDENT,
  PATCH_INCIDENT_SUCCESS,
  PATCH_INCIDENT_ERROR,
  DISMISS_ERROR,
  REQUEST_ATTACHMENTS,
  REQUEST_ATTACHMENTS_SUCCESS,
  REQUEST_ATTACHMENTS_ERROR,
  REQUEST_DEFAULT_TEXTS,
  REQUEST_DEFAULT_TEXTS_SUCCESS,
  REQUEST_DEFAULT_TEXTS_ERROR,
  PATCH_TYPE_NOTES,
  PATCH_TYPE_SUBCATEGORY,
  PATCH_TYPE_STATUS,
  PATCH_TYPE_PRIORITY,
  PATCH_TYPE_THOR,
  PATCH_TYPE_LOCATION,
} from './constants';

export const initialState = fromJS({
  id: null,
  stadsdeelList,
  priorityList,
  changeStatusOptionList,
  defaultTextsOptionList,
  statusList,
  loading: false,
  error: false,
  attachments: [],
  patching: {
    [PATCH_TYPE_NOTES]: false,
    [PATCH_TYPE_SUBCATEGORY]: false,
    [PATCH_TYPE_STATUS]: false,
    [PATCH_TYPE_PRIORITY]: false,
    [PATCH_TYPE_THOR]: false,
    [PATCH_TYPE_LOCATION]: false,
  },
  split: false,
  typesList,
});

function incidentModelReducer(state = initialState, action) {
  switch (action.type) {
    case REQUEST_INCIDENT:
      return state
        .set('loading', true)
        .set('error', false)
        .set('id', action.payload)
        .set('incident', null);

    case REQUEST_INCIDENT_SUCCESS:
      return state
        .set('incident', fromJS(action.payload))
        .set('error', false)
        .set('loading', false);

    case REQUEST_INCIDENT_ERROR:
      return state.set('error', fromJS(action.payload)).set('loading', false);

    case DISMISS_SPLIT_NOTIFICATION:
      return state.set('split', false);

    case PATCH_INCIDENT:
      return state
        .set(
          'patching',
          fromJS({
            ...state.get('patching').toJS(),
            [action.payload.type]: true,
          })
        )
        .set('error', false);

    case PATCH_INCIDENT_SUCCESS:
      return state
        .set('incident', fromJS(action.payload.incident))
        .set(
          'patching',
          fromJS({
            ...state.get('patching').toJS(),
            [action.payload.type]: false,
          })
        )
        .set('error', false);

    case PATCH_INCIDENT_ERROR:
      return state
        .set(
          'patching',
          fromJS({
            ...state.get('patching').toJS(),
            [action.payload.type]: false,
          })
        )
        .set('error', fromJS(action.payload.error));

    case DISMISS_ERROR:
      return state.set('error', false);

    case REQUEST_ATTACHMENTS:
      return state.set('attachments', fromJS([]));

    case REQUEST_ATTACHMENTS_SUCCESS:
      return state.set('attachments', fromJS(action.payload));

    case REQUEST_ATTACHMENTS_ERROR:
      return state.set('attachments', fromJS([]));

    case REQUEST_DEFAULT_TEXTS:
      return state.set('defaultTexts', fromJS([]));

    case REQUEST_DEFAULT_TEXTS_SUCCESS:
      return state.set('defaultTexts', fromJS(action.payload));

    case REQUEST_DEFAULT_TEXTS_ERROR:
      return state.set('defaultTexts', fromJS([]));

    case SPLIT_INCIDENT_SUCCESS:
    case SPLIT_INCIDENT_ERROR:
      return state.set('split', action.payload);

    default:
      return state;
  }
}

export default incidentModelReducer;
