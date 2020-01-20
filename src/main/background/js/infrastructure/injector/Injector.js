import {helpers} from 'inversify-vanillajs-helpers';
import * as inversify from 'inversify';
import 'reflect-metadata';

class Injector {
  constructor () {
    this._container = new inversify.Container();
    this._register = helpers.registerSelf(this._container);
  }

  get (clazz) {
    return this._container.get(clazz);
  }

  get register () {
    return this._register;
  }
}

// noinspection JSUnusedGlobalSymbols
export default new Injector();
