import Component from '@ember/component';

export default Component.extend({
  tagName: 'label',
  attributeBindings: [
    'for',
  ],

  required: false,
});
