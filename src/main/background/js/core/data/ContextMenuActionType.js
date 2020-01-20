class ContextMenuActionType {
  constructor () {
    this._suspend = 'SUSPEND';
    this._suspendOthers = 'SUSPEND_OTHERS';
    this._suspendLeft = 'SUSPEND_LEFT';
    this._suspendRight = 'SUSPEND_RIGHT';
    this._suspendAll = 'SUSPEND_ALL';
  }

  get suspend () {
    return this._suspend;
  }

  get suspendOthers () {
    return this._suspendOthers;
  }

  get suspendLeft () {
    return this._suspendLeft;
  }

  get suspendRight () {
    return this._suspendRight;
  }

  get suspendAll () {
    return this._suspendAll;
  }
}

export default new ContextMenuActionType();
