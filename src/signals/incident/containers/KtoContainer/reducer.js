import { fromJS } from 'immutable';
import {
  UPDATE_KTA,
  REQUEST_KTA_ANSWERS, REQUEST_KTA_ANSWERS_SUCCESS, REQUEST_KTA_ANSWERS_ERROR,
  CHECK_KTO, CHECK_KTO_SUCCESS, CHECK_KTO_ERROR
} from './constants';

const initialState = fromJS({
  kto: {},
  loading: false,
  error: false,
  uuid: '',
  formOk: false,
  formError: false,
  answers: {}
});

function ktoContainerReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_KTA:
      return state
        .set('kto', fromJS({
          ...state.get('kto').toJS(),
          ...action.payload
        }));

    case REQUEST_KTA_ANSWERS:
      return state
        .set('kto', fromJS({
          ...state.get('kto').toJS(),
          yesNo: action.payload
        }));

    case REQUEST_KTA_ANSWERS_SUCCESS:
      return state
        .set('answers', fromJS(action.payload));

    case REQUEST_KTA_ANSWERS_ERROR:
      return state
        .set('error', fromJS(action.payload));

    case CHECK_KTO:
      return state
        .set('uuid', fromJS(action.payload))
        .set('formOk', false)
        .set('formError', false);

    case CHECK_KTO_SUCCESS:
      return state
        .set('formOk', true)
        .set('formError', false);

    case CHECK_KTO_ERROR:
      return state
        .set('formOk', false)
        .set('formError', fromJS(action.payload));


    default:
      return state;
  }
}

export default ktoContainerReducer;
