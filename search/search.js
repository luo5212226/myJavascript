/**
 * 高亮插件
 * created by luoshun 2018-9-28
 */
; (function ($) {
  // 参数options可以动态设置高亮颜色
  $.fn.selectFn = function (options) {
    // 配置参数
    var setOption = {
      // 标志搜索插件中的元素
      myStatus: '1',
      // 标志替换的span标签
      replaceTag: '1',
      // 搜索框ID
      searchId: 'MY_SEARCH',
      // 搜索框Class
      searchClass: 'search',
      // 输入框ID
      inputId: 'MY_INPUT',
      // 输入框Class
      inputClass: 'input',
      // 记录高亮个数span标签ID
      spanId: ['LAST_INDEX_SPAN', 'LINE_SPAN', 'NEXT_INDEX_SPAN'],
      // 记录高亮个数span标签的Class
      spanClass: 'span',
      // 分割线ID
      lineId: 'MY_LINE',
      // 分割线Class
      lineClass: 'line1',
      // 操作按钮ID
      buttonId: ['SEARCH_BUTTON', 'NEXT_BUTTON', 'LAST_BUTTON', 'RESET_BUTTON'],
      // 操作按钮Class
      buttonClass: ['button1', 'button2', 'button3', 'button4'],
      // 操作按钮title
      title: ['查找', '下一个', '上一个', '重置'],
      // 函数调用区分参数
      clickFn: ['search', 'next', 'last', 'reset'],
      // 当前元素高亮index及高亮Class
      now: {
        index: 0,
        lightClass: 'highlight'
      },
      // 插件是否打开
      flag: false,
      // 一次性存放一个页面的文本节点
      textNode: [],
      // 高亮颜色
      otherColor: 'yellow',
      nowColor: 'lightsalmon'
    };
    // 加载数据
    var options = $.extend(setOption, options);
    // 初始化插件
    initElement();
    /**
    * 获取指定字符
    * @param body document.body
    * @param search 输入框的值
    * @param now 当前位置
    */
    function search (body, search, now) {
      // 刷新页面
      clear(now);
      // 记录当前显示字符的index
      now.index = 0;
      // 需要查询的字符
      var value = search.value.trim();
      // 未转义前的搜索值
      var value1 = value;
      // 需要转义的字符
      var str = ['\\', '*', '+', '|', '{', '}', '(', ')', '^', '$', '[', ']', '?', ',', '.', '&'];
      for (var i = 0; i < str.length; i++) {
        value = value.replace(str[i], '\\' + str[i]);
      }
      // 正则全局匹配转义后的字符
      var reg = new RegExp(value, 'gim');
      // 存放text元素
      options.textNode = eachDom(body, value);
      // 循环替换text元素的值
      for (var i = 0; i < options.textNode.length; i++) {
        var html1 = options.textNode[i].nodeValue;
        // 如果不包含该字符串，跳出当前循环
        if (html1.toLowerCase().indexOf(value1.toLowerCase()) == -1) {
          continue;
        } else {
          var newHtml = html1.replace(reg, '<span class="highlight">$&</span>');
          // 创建新的span节点，转换textnode的样式
          var newNode = document.createElement('span');
          newNode.setAttribute('replaceTag', options.replaceTag);
          newNode.innerHTML = newHtml;
          var pHtml = options.textNode[i].parentNode.innerHTML;
          // 如果有兄弟节点，则用span替换当前textnode，直接替换innerHtml会把其他节点删除
          if (options.textNode[i].nextSibling || options.textNode[i].previousSibling) {
            options.textNode[i].parentNode.replaceChild(newNode, options.textNode[i]);
            // options.textNode[i].parentNode.insertBefore(newNode, options.textNode[i].nextSibling);
            // options.textNode[i].parentNode.removeChild(options.textNode[i]);
          } else {
            // 无兄弟节点直接替换HTML内容
            options.textNode[i].parentNode.innerHTML = pHtml.replace(html1, newHtml);
          }
        }
      }
      // 通过高亮读取查询信息
      if ($('.' + now.lightClass).size() > 0) {
        $('#' + options.spanId[2]).text($('.' + now.lightClass).size());
        $('#' + options.spanId[1]).text('/');
        $('#' + options.spanId[0]).text(now.index + 1);
        $('.' + now.lightClass)[now.index].style.backgroundColor = options.nowColor;
        move(now);
        btnDisabled(false);
      } else {
        $('#' + options.spanId[2]).text(0);
        $('#' + options.spanId[1]).text('/');
        $('#' + options.spanId[0]).text(0);
      }
    };
    /**
    * 重置
    * @param now 当前元素高亮index及高亮Class
    */
    function reset (now) {
      // 刷新页面
      clear(now);
      $('#' + options.inputId).val('');
      if (options.flag == true) {
        clickOff();
      } else {
        clickOn();
      }
    };
    // 关闭搜索框
    function clickOff () {
      options.flag = false;
      displaySwitch(options.searchId, 'none');
      $('#' + options.buttonId[3]).show();
      // $('#' + options.buttonId[3]).css('display', 'block');
      $('#' + options.searchId).animate({
        width: '30px'
      }, 200);
    };
    // 打开搜索框
    function clickOn () {
      options.flag = true;
      btnDisabled(true);
      for (var i = 0; i < options.spanId.length; i++) {
        $('#' + options.spanId[i]).text('');
      }
      displaySwitch(options.searchId, 'block');
      $('#' + options.searchId).animate({
        width: '370px'
      }, 200);
    };
    /**
    * 下一个高亮字符
    * @param now 当前位置
    */
    function next (now) {
      // 高亮index小于总元素个数
      indexChange(now, $('.' + now.lightClass).size() - 1, now.index + 1, 0);
      move(now);
    };
    /**
    * 上一个高亮字符
    * @param now 当前位置
    */
    function last (now) {
      // 高亮index小于1
      indexChange(now, 1, $('.' + now.lightClass).size() - 1, now.index - 1);
      move(now);
    };
    /**
    * 改变当前高亮
    * @param now 当前位置
    * @param count 高亮元素的最大最小临界值
    * @param size 当前高亮位置改变
    * @param index 当前高亮位置改变
    */
    function indexChange (now, count, size, index) {
      if (now.index < count) {
        $('.' + now.lightClass)[now.index].style.backgroundColor = options.otherColor;
        now.index = size;
        $('#' + options.spanId[0]).text(now.index + 1);
        $('.' + now.lightClass)[now.index].style.backgroundColor = options.nowColor;
      } else {
        $('.' + now.lightClass)[now.index].style.backgroundColor = options.otherColor;
        now.index = index;
        $('#' + options.spanId[0]).text(now.index + 1);
        $('.' + now.lightClass)[now.index].style.backgroundColor = options.nowColor;
      }
    };
    /**
    * 窗口移动到当前高亮元素
    * @param now 当前位置
    */
    function move (now) {
      var move = $('.' + now.lightClass)[now.index].offsetTop;
      $('html,body').animate({
        'scrollTop': move
      }, 200);
    };
    /**
    * 调用事件绑定的函数
    * @param status 函数状态
    */
    function init (status) {
      var body = document.body;
      var searchValue = document.getElementById(options.inputId);
      if (status == 'search') {
        search(body, searchValue, options.now);
      } else if (status == 'reset') {
        reset(options.now);
      } else if (status == 'next') {
        next(options.now);
      } else if (status == 'last') {
        last(options.now);
      }
    };
    // 刷新
    function clear (now) {
      var pNode = '';
      var len = $('.' + now.lightClass).length;
      if (len > 0) {
        for (var i = 0; i < len; i++) {
          // 父元素是否为替换的span标签
          if ($('.' + now.lightClass)[0].parentElement.attributes.replaceTag) {
            $('.' + now.lightClass)[0].parentElement.outerHTML = $('.' + now.lightClass)[0].parentElement.innerHTML;
          }
          var pNode = $('.' + now.lightClass)[0].parentNode;
          var outHtml = $('.' + now.lightClass)[0].outerHTML;
          var text = $('.' + now.lightClass)[0].innerText;
          pNode.innerHTML = pNode.innerHTML.replace(outHtml, text);
        }
      }
    };
    /**
    * 按钮是否可用
    * @param b true or false
    */
    function btnDisabled (b) {
      $('#' + options.buttonId[1]).attr('disabled', b);
      $('#' + options.buttonId[2]).attr('disabled', b);
    };
    /**
    * 插件元素是否可见
    * @param id 不可见元素id
    * @param a display属性值
    */
    function displaySwitch (id, a) {
      document.getElementById(id).childNodes.forEach(function (item) {
        item.style.display = a;
      });
    };
    /**
    * 添加input回车事件
    * @param id 回车事件绑定id
    * @param status 按钮功能
    */
    function keyPress (id, status) {
      $('#' + id).bind('keypress', function (event) {
        if (event.keyCode == 13) {
          init(status);
        }
      });
    };
    // 初始化插件
    function initElement () {
      $('body').prepend($('<div mystatus="1" id="MY_SEARCH" class="search" style="width: 30px;"><input id="MY_INPUT" mystatus="1" class="input" style="display: none;"></input><span id="LAST_INDEX_SPAN" mystatus="1" class="span" style="display: none;"></span><span id="LINE_SPAN" mystatus="1" class="span" style="display: none;"></span><span id="NEXT_INDEX_SPAN" mystatus="1" class="span" style="display: none;"></span><div mystatus="1" id="MY_LINE" class="line1" style="display: none;"></div><button id="SEARCH_BUTTON" title="查找" class="button1" style="display: none;"></button><button id="NEXT_BUTTON" title="下一个" class="button2" style="display: none;"></button><button id="LAST_BUTTON" title="上一个" class="button3" style="display: none;"></button><button id="RESET_BUTTON" title="关闭" class="button4""></button></div>'));
      // 添加点击事件
      for (var j = 0; j < options.buttonId.length; j++) {
        document.getElementById(options.buttonId[j]).setAttribute('number', j);
        document.getElementById(options.buttonId[j]).addEventListener('click', function () {
          init(options.clickFn[$(this).attr('number')]); // $(this)是当前添加事件的元素
        });
      }
      // input回车事件
      keyPress(options.inputId, options.clickFn[0]);
    };
    /**
    * 遍历dom树，找出文本节点
    * @param body document.body
    * @param value 搜索的目标值
    */
    function eachDom (body, value) {
      // 存放text元素
      var temp = [];
      // 过滤遍历结果
      var filter = function (node) {
        // 过滤插件元素
        if (node.parentNode.attributes.mystatus) {
          return NodeFilter.FILTER_REJECT;
        } else if (node.parentNode.nodeName.toLowerCase() == 'script') { // 过滤script元素
          return NodeFilter.FILTER_REJECT;
        } else if (node.nodeValue.replace(/[\r\n]/gm, '').replace(/[ ]/g, '') == '') { // 过滤换行或者空元素
          return NodeFilter.FILTER_REJECT;
        } else if (node.parentNode.nodeName.toLowerCase() == 'style') { // 过滤style元素
          return NodeFilter.FILTER_REJECT;
        } else {
          return NodeFilter.FILTER_ACCEPT;
        }
      };
      /** 用NodeIterator进行遍历dom树
       * @param body 查找范围
       * @param NodeFilter.SHOW_TEXT 定义只显示文本
       * @param filter 是否进行过滤
       * @param false 默认false
       */
      var iterator = document.createNodeIterator(body, NodeFilter.SHOW_TEXT, filter, false);
      var node = iterator.nextNode();
      // 遍历dom树
      if (value) {
        while (node) {
          // 输入值是否为空
          var html = node.nodeValue;
          // text元素的值不为空则存入数组
          if (html.trim()) {
            temp.push(node);
          }
          node = iterator.nextNode();
        }
      }
      return temp;
    };
    // 链式传递，返回当前对象
    return $(this);
  };
}(jQuery));