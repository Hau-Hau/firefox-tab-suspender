class EventType {
  constructor () {
    this._TABS_ON_ACTIVATED = 0;
    this._WINDOWS_ON_CREATED = 1;
    this._WINDOWS_ON_REMOVED = 2;
    this._TABS_ON_CREATED = 3;
    this._TABS_ON_UPDATED = 4;
    this._TABS_ON_REMOVED = 5;
    this._DISCARD_TABS = 6;
  }

  get TABS_ON_ACTIVATED () {
    return this._TABS_ON_ACTIVATED;
  }

  get WINDOWS_ON_CREATED () {
    return this._WINDOWS_ON_CREATED;
  }

  get WINDOWS_ON_REMOVED () {
    return this._WINDOWS_ON_REMOVED;
  }

  get TABS_ON_CREATED () {
    return this._TABS_ON_CREATED;
  }

  get TABS_ON_UPDATED () {
    return this._TABS_ON_UPDATED;
  }

  get TABS_ON_REMOVED () {
    return this._TABS_ON_REMOVED;
  }

  get DISCARD_TABS () {
    return this._DISCARD_TABS;
  }
}

export default new EventType();
