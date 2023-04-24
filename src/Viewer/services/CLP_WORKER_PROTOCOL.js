let CLP_WORKER_PROTOCOL = {
    LOADING_MESSAGES: 0,
    LOAD_FILE: 1,
    UPDATE_VERBOSITY: 2,
    GET_LINE_FROM_EVENT: 3,
    GET_EVENT_FROM_LINE: 4,
    CHANGE_PAGE: 5,
    LOAD_LOGS: 6,
    REDRAW_PAGE: 7,
    PRETTY_PRINT: 8,
    UPDATE_STATE: 9,
    UPDATE_FILE_INFO: 10,
    JUMP_TIMESTAMP: 11,
    ERROR: 12,
};
CLP_WORKER_PROTOCOL = Object.freeze(CLP_WORKER_PROTOCOL);

export default CLP_WORKER_PROTOCOL;
