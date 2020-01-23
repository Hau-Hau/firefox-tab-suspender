class ContextMenuActionType {
  constructor () {
    this._SUSPEND = 'SUSPEND';
    this._SUSPEND_OTHERS = 'SUSPEND_OTHERS';
    this._SUSPEND_LEFT = 'SUSPEND_LEFT';
    this._SUSPEND_RIGHT = 'SUSPEND_RIGHT';
    this._SUSPEND_ALL = 'SUSPEND_ALL';
  }

  get SUSPEND () {
    return this._SUSPEND;
  }

  get SUSPEND_OTHERS () {
    return this._SUSPEND_OTHERS;
  }

  get SUSPEND_LEFT () {
    return this._SUSPEND_LEFT;
  }

  get SUSPEND_RIGHT () {
    return this._SUSPEND_RIGHT;
  }

  get SUSPEND_ALL () {
    return this._SUSPEND_ALL;
  }
}

export default new ContextMenuActionType();
