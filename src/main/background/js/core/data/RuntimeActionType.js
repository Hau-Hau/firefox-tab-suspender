class RuntimeActionType {
  constructor () {
    this._RESTORE_PAGE = 'RESTORE_PAGE';
  }

  get RESTORE_PAGE () {
    return this._RESTORE_PAGE;
  }
}

export default new RuntimeActionType();
