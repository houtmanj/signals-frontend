import {
  REQUEST_INCIDENT, REQUEST_INCIDENT_SUCCESS, REQUEST_INCIDENT_ERROR,
  DISMISS_SPLIT_NOTIFICATION, DOWNLOAD_PDF,
  PATCH_INCIDENT, PATCH_INCIDENT_SUCCESS, PATCH_INCIDENT_ERROR
} from './constants';

export function requestIncident(id) {
  return {
    type: REQUEST_INCIDENT,
    payload: id
  };
}

export function requestIncidentSuccess(incident) {
  return {
    type: REQUEST_INCIDENT_SUCCESS,
    payload: incident
  };
}

export function requestIncidentError(error) {
  return {
    type: REQUEST_INCIDENT_ERROR,
    payload: error
  };
}

export function dismissSplitNotification() {
  return {
    type: DISMISS_SPLIT_NOTIFICATION
  };
}

export function downloadPdf(id) {
  return {
    type: DOWNLOAD_PDF,
    payload: id
  };
}

export function patchIncident(patch) {
  return {
    type: PATCH_INCIDENT,
    payload: patch
  };
}

export function patchIncidentSuccess(incident) {
  return {
    type: PATCH_INCIDENT_SUCCESS,
    payload: incident
  };
}

export function patchIncidentError(error) {
  return {
    type: PATCH_INCIDENT_ERROR,
    payload: error
  };
}
