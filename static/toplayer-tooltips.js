
/*! TopLayer Tooltips v1.0
 *  Mouseover tooltips that always render on top by portaling to a fixed overlay root.
 *  Works with containers having class "parent" and child tooltip elements
 *  with one of: .parent-title, .parent-read, .parent-black, .parent-left, .parent-right
 *  Usage:
 *    TopLayerTooltips.init({ selectors: ['parent-title','parent-read','parent-black','parent-left','parent-right'], margin: 8 });
 */
(function (global) {
  var DEFAULTS = {
    parentSelector: '.parent',
    selectors: ['parent-title','parent-read','parent-black','parent-left','parent-right'],
    margin: 8,
  };

  function px(n){ return (Math.round(n)) + 'px'; }

  function ensureOverlayRoot(){
    var root = document.getElementById('overlay-root');
    if(!root){
      root = document.createElement('div');
      root.id = 'overlay-root';
      root.style.position = 'fixed';
      root.style.inset = '0';
      root.style.pointerEvents = 'none';
      root.style.zIndex = '2147483647';
      document.body.appendChild(root);
    }
    return root;
  }

  function portalTooltip(root, el){
    if(!el) return;
    if(!el.__orig){
      el.__orig = { parent: el.parentNode, next: el.nextSibling, style: el.getAttribute('style') || '' };
    }
    // neutralize positioned context and show
    el.style.position = 'fixed';
    el.style.display = 'block';
    el.style.opacity = '1';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '2147483647';
    root.appendChild(el);
  }

  function restoreTooltip(el){
    if(!el || !el.__orig) return;
    try {
      el.style.cssText = el.__orig.style;
      if(el.__orig.next && el.__orig.next.parentNode === el.__orig.parent){
        el.__orig.parent.insertBefore(el, el.__orig.next);
      } else {
        el.__orig.parent.appendChild(el);
      }
    } catch(e){ /* noop */ }
  }

  function positionTooltip(el, parentRect, kind, margin){
    if(!el) return;
    var top, left, transform;
    if(kind === 'parent-left'){
      top = parentRect.top + parentRect.height/2;
      left = parentRect.left - margin;
      transform = 'translate(-100%, -50%)';
    } else if(kind === 'parent-right'){
      top = parentRect.top + parentRect.height/2;
      left = parentRect.right + margin;
      transform = 'translate(0, -50%)';
    } else {
      // default below, centered
      top = parentRect.bottom + margin;
      left = parentRect.left + parentRect.width/2;
      transform = 'translate(-50%, 0)';
    }
    el.style.top = px(top);
    el.style.left = px(left);
    el.style.transform = transform;
  }

  function wireParent(parent, opts){
    var root = ensureOverlayRoot();
    var kinds = opts.selectors.slice();

    function getTooltip(kind){
      return parent.querySelector('.' + kind);
    }

    function showAll(){
      var rect = parent.getBoundingClientRect();
      kinds.forEach(function(kind){
        var el = getTooltip(kind);
        if(el){
          portalTooltip(root, el);
          positionTooltip(el, rect, kind, opts.margin);
          el.classList.add('overlayed-tooltip');
        }
      });
    }

    function moveAll(){
      var rect = parent.getBoundingClientRect();
      kinds.forEach(function(kind){
        var el = root.querySelector('.' + kind + '.overlayed-tooltip');
        if(el){
          positionTooltip(el, rect, kind, opts.margin);
        }
      });
    }

    function hideAll(){
      kinds.forEach(function(kind){
        var el = document.querySelector('.' + kind + '.overlayed-tooltip');
        if(el){
          el.classList.remove('overlayed-tooltip');
          restoreTooltip(el);
        }
      });
    }

    parent.addEventListener('mouseenter', showAll);
    parent.addEventListener('mousemove', moveAll);
    parent.addEventListener('mouseleave', hideAll);
  }

  var TopLayerTooltips = {
    init: function(options){
      var opts = Object.assign({}, DEFAULTS, options || {});
      ensureOverlayRoot();
      var parents = Array.prototype.slice.call(document.querySelectorAll(opts.parentSelector));
      parents.forEach(function(p){ wireParent(p, opts); });
    }
  };

  // Expose
  global.TopLayerTooltips = TopLayerTooltips;

  // Auto-init on DOMContentLoaded with defaults
  document.addEventListener('DOMContentLoaded', function(){
    TopLayerTooltips.init();
  });
})(window);
