import Component from '@ember/component';
import InViewportMixin from 'ember-in-viewport';
import SendEventMixin from '@base-cms/id-me-manage/mixins/send-event';
import { setProperties }  from '@ember/object';

export default Component.extend(InViewportMixin, SendEventMixin, {
  init() {
    this._super(...arguments);
    setProperties(this, { viewportSpy: true });
  },

  didEnterViewport() {
    this.sendEvent('on-viewport-enter');
  },

  didExitViewport() {
    this.sendEvent('on-viewport-exit');
  },
});
