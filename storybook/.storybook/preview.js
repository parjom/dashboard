import Vue from 'vue';
import Vuex from 'vuex';
import vSelect from 'vue-select';
import VTooltip from 'v-tooltip';
import { themes } from '@storybook/theming';
import { get } from '../../shell/utils/object';
import IntlMessageFormat from 'intl-messageformat';
import installShortcut from './theme-shortcut';
import withEvents from 'storybook-auto-events';
const i18nStrings = require('../../shell/assets/translations/en-us.yaml');
import cleanTooltipDirective  from '@shell/directives/clean-tooltip';
import ShortKey from 'vue-shortkey';
import trimWhitespaceDirective from '@shell/directives/trim-whitespace';
import cleanHtmlDirective from '@shell/directives/clean-html';


// Store modules
import growl from './store/growl';
import codeMirror from './store/codeMirror';
import table from './store/table';


// Register custom i18n plugin
require('../../shell/plugins/i18n');

Vue.use(Vuex);
Vue.use(ShortKey, { prevent: ['input', 'textarea', 'select'] });
Vue.component('v-select', vSelect);
Vue.use(VTooltip);

Vue.component('router-link', {
  props:   ['to'],
  template: '<a>link</a>',
})

Vue.directive('clean-tooltip', cleanTooltipDirective);
Vue.directive('trim-whitespace', trimWhitespaceDirective);
Vue.directive('clean-html', cleanHtmlDirective);

window.__codeMirrorLoader = () => import(/* webpackChunkName: "codemirror" */ '@shell/plugins/codemirror');

// Defines namespaced modules for the Store.
export const store = new Vuex.Store({
  getters: {
    'i18n/exists': key => store.getters['i18n/t'],
    'i18n/t': state => (key, args) => {
      const msg = get(i18nStrings, key) || key;

      if (msg?.includes('{')) {
        const formatter = new IntlMessageFormat(msg, state.selected);
        return formatter.format(args);
      }

      return msg;
    },
  },
  modules: {
    growl,
    codeMirror,
    table
  }
});


const storePlugin = {
  store,
  install (Vue, options) {
    Vue.prototype.$store = store
  }
};

Vue.use(storePlugin);

export const parameters = {
  options: {
    storySort: {
      order: ['Foundation', 'Form', 'Components', 'Examples'],
    },
  },
  previewTabs: {
    canvas: { hidden: false },
  },
  actions: { argTypesRegex: "^on[A-Z].*" },
  layout: 'centered',
  // viewMode: 'docs',
  // Auto set controls based on the property name
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  darkMode: {
    dark: {
      ...themes.dark,
      brandTitle: 'Rancher Storybook',
      brandImage: 'dark/rancher-logo.svg'
    },
    light: {
      ...themes.normal,
      brandTitle: 'Rancher Storybook',
      brandImage: 'rancher-logo.svg'
    },
    darkClass: 'theme-dark',
    lightClass: 'theme-light',
    stylePreview: true
  }
}

export const decorators = [
  withEvents
];

// Add keyboard shortcut to toggle between dark and light modes
window.onload = () => {
  installShortcut();
}

export default store
