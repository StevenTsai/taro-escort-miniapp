import MarkdownIt from './utils/markdown-it.min.js';
import highlight from './utils/highlight.min.js';
import hljsJs from './utils/hljs_javascript.min.js';
import hljsCss from './utils/hljs_css.min.js';
import { addCustomClassPlugin,copy } from './utils/plugin'

/**
 * Sanitize rendered HTML to strip XSS vectors before passing to mp-html.
 * Defense-in-depth: the parser.js also filters, but this catches anything
 * that slips through or is injected after rendering.
 */
function sanitizeHtml(html) {
  if (!html) return html;
  // Strip javascript: protocol from href/src attributes
  html = html.replace(/((?:href|src)\s*=\s*)(["'])([\s]*javascript:[^"']*)\2/gi, '$1$2$2');
  // Strip inline event handlers (on*)
  html = html.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  return html;
}
Component({
  options: {
    virtualHost: true,
  },
  properties: {
    className: {
      type: String,
      value: '',
    },
    style: {
      type: String,
      value: '',
    },
    id: {
      type: String,
      value: '',
    },
    markdown: {
      type: String,
      value: '',
    },
    fontSize: {
      type: Number,
      value: 32
    },
    options: {
      type: Object,
      value: {},
    },
  },
  data: {
    __html: '',
    mdInstance: null,
  },
  methods: {
    init() {
      const { options } = this.data;

      const hljs = highlight();
      const javascript = hljsJs();
      const css = hljsCss();
      hljs.registerLanguage('javascript', javascript);
      hljs.registerLanguage('css', css);
      const md = new MarkdownIt({
        // 默认开启高亮
        highlight: function (str, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return (
                '<pre class="_pre"><code class="hljs">' +
                hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                '</code></pre>'
              );
            } catch (__) { }
          }
          return '<pre class="_pre"><code class="hljs">' + str + '</code></pre>';
        },
        ...options,
      });
      // console.log(md.renderer.rules)
      md.use(copy);
      addCustomClassPlugin(md)
      this.setData({ mdInstance: md });
      this.triggerEvent('onReady', { markdownInstance: md });
      this.setData({
        __html: sanitizeHtml(md.render(this.data.markdown)),
      });
    },
    updateWidgetAPI() {
      this.setReadonlyAttributes &&
        this.setReadonlyAttributes({
          value: this.properties.markdown,
          markdownInstance: this.data.mdInstance,
          updateMarkdownInstance: ({ markdownInstance }) => this.setData({ mdInstance: markdownInstance }),
        });
    },
  },
  observers: {
    markdown: function () {
      const { mdInstance } = this.data;
      if (!mdInstance) return;
      const html = sanitizeHtml(mdInstance.render(this.data.markdown));
      this.setData({
        __html: html,
      });
    },
    options: function () {
      this.init();
    },
    'markdown,mdInstance': function () {
      this.updateWidgetAPI();
    },
  },
  lifetimes: {
    attached() {
      this.init();
      this.updateWidgetAPI();
    },
  },
});
