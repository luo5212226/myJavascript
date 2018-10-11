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
      searchId: 'my_search',
      searchClass: 'search',
      inputId: 'my_input',
      inputClass: 'input',
      spanId: ['my_span1', 'my_span2', 'my_span3'],
      spanClass: 'span',
      lineId: 'my_line',
      lineClass: 'line1',
      buttonId: ['my_button1', 'my_button2', 'my_button3', 'my_button4'],
      buttonClass: ['button1', 'button2', 'button3', 'button4'],
      title: ['查找', '下一个', '上一个', '关闭'],
      clickFn: ['select', 'next', 'last', 'reset'],
      // 当前元素高亮
      now: {
        index: 0
      },
      // 插件是否打开
      flag: false,
      // 高亮颜色
      otherColor: 'yellow',
      nowColor: 'lightsalmon'
    };
    // 加载数据
    var options = $.extend(setOption, options);
    // 初始化插件
    (function () {
      $('body').prepend($('<div mystatus="1" id="my_search" class="search" style="width: 30px;"><input id="my_input" mystatus="1" class="input" style="display: none;"></input><span id="my_span1" mystatus="1" class="span" style="display: none;"></span><span id="my_span2" mystatus="1" class="span" style="display: none;"></span><span id="my_span3" mystatus="1" class="span" style="display: none;"></span><div mystatus="1" id="my_line" class="line1" style="display: none;"></div><button id="my_button1" title="查找" class="button1" style="display: none;"></button><button id="my_button2" title="下一个" class="button2" style="display: none;"></button><button id="my_button3" title="上一个" class="button3" style="display: none;"></button><button id="my_button4" title="关闭" class="button4""></button></div>'));
      // 添加点击事件
      for (var j = 0; j < options.buttonId.length; j++) {
        document.getElementById(options.buttonId[j]).setAttribute('number', j);
        document.getElementById(options.buttonId[j]).addEventListener('click', function () {
          init(options.clickFn[$(this).attr('number')]); // $(this)是当前添加事件的元素
        });
      }
      // input回车事件
      keyPress(options.inputId, options.clickFn[0]);
    }());
    /**
    * 获取指定字符
    * @param body document.body
    * @param search 输入框的值
    * @param now 当前位置
    */
    function select (body, search, now) {
      // 刷新页面
      clear();
      // 记录当前显示字符的index
      now.index = 0;
      // 需要查询的字符
      var value = search.value.trim();
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
        // 未转义前的搜索值
        var value1 = value;
        // 需要转义的字符
        var str = ['\\', '*', '+', '|', '{', '}', '(', ')', '^', '$', '[', ']', '?', ',', '.', '&'];
        for (var i = 0; i < str.length; i++) {
          value = value.replace(str[i], '\\' + str[i]);
        }
        var reg = new RegExp(value, 'gim');
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
      // 循环替换text元素的值
      for (var i = 0; i < temp.length; i++) {
        var html1 = temp[i].nodeValue;
        // 如果不包含该字符串，跳出当前循环
        if (html1.toLowerCase().indexOf(value1.toLowerCase()) == -1) {
          continue;
        } else {
          var newHtml = html1.replace(reg, '<span class="highlight">$&</span>');
          // 创建新的span节点，转换textnode的样式
          var newNode = document.createElement('span');
          newNode.setAttribute('replaceTag', options.replaceTag);
          newNode.innerHTML = newHtml;
          var pHtml = temp[i].parentNode.innerHTML;
          // 如果有兄弟节点，则用span替换当前textnode，直接替换innerHtml会把其他节点删除
          if (temp[i].nextSibling || temp[i].previousSibling) {
            temp[i].parentNode.replaceChild(newNode, temp[i]);
            // temp[i].parentNode.insertBefore(newNode, temp[i].nextSibling);
            // temp[i].parentNode.removeChild(temp[i]);
          } else {
            // 无兄弟节点直接替换HTML内容
            temp[i].parentNode.innerHTML = pHtml.replace(html1, newHtml);
          }
        }
      }
      // 通过高亮读取查询信息
      if ($('.highlight').size() > 0) {
        $('#my_span3').html($('.highlight').size());
        $('#my_span2').html('/');
        $('#my_span1').html(now.index + 1);
        $('.highlight')[now.index].style.backgroundColor = options.nowColor;
        move(now);
        btnDisabled(false);
      } else {
        $('#my_span1').html(0);
        $('#my_span2').html('/');
        $('#my_span3').html(0);
      }
    };
    // 重置
    function reset () {
      // 刷新页面
      clear();
      $('#my_input').val('');
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
      $('#my_button4').css('display', 'block');
      $('#my_search').animate({
        width: '30px'
      }, 200);
    };
    // 打开搜索框
    function clickOn () {
      options.flag = true;
      btnDisabled(true);
      for (var i = 0; i < options.spanId.length; i++) {
        $('#' + options.spanId[i]).html('');
      }
      displaySwitch(options.searchId, 'block');
      $('#my_search').animate({
        width: '370px'
      }, 200);
    };
    /**
    * 下一个高亮字符
    * @param now 当前位置
    */
    function next (now) {
      // 高亮index小于总元素个数
      indexChange(now, $('.highlight').size() - 1, now.index + 1, 0);
      move(now);
    };
    /**
    * 上一个高亮字符
    * @param now 当前位置
    */
    function last (now) {
      // 高亮index小于1
      indexChange(now, 1, $('.highlight').size() - 1, now.index - 1);
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
        $('.highlight')[now.index].style.backgroundColor = options.otherColor;
        now.index = size;
        $('#my_span1').html(now.index + 1);
        $('.highlight')[now.index].style.backgroundColor = options.nowColor;
      } else {
        $('.highlight')[now.index].style.backgroundColor = options.otherColor;
        now.index = index;
        $('#my_span1').html(now.index + 1);
        $('.highlight')[now.index].style.backgroundColor = options.nowColor;
      }
    };
    /**
    * 窗口移动到当前高亮元素
    * @param now 当前位置
    */
    function move (now) {
      var move = $('.highlight')[now.index].offsetTop;
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
      var search = document.getElementById('my_input');
      if (status == 'select') {
        select(body, search, options.now);
        return;
      } else if (status == 'reset') {
        reset(body, search);
        return;
      } else if (status == 'next') {
        next(options.now);
        return;
      } else if (status == 'last') {
        last(options.now);
        return;
      }
    };
    // 刷新
    function clear () {
      var pNode = '';
      var len = $('.highlight').length;
      if (len > 0) {
        for (var i = 0; i < len; i++) {
          // 父元素是否为替换的span标签
          if ($('.highlight')[0].parentElement.attributes.replaceTag) {
            $('.highlight')[0].parentElement.outerHTML = $('.highlight')[0].parentElement.innerHTML;
          }
          var pNode = $('.highlight')[0].parentNode;
          var outHtml = $('.highlight')[0].outerHTML;
          var text = $('.highlight')[0].innerText;
          pNode.innerHTML = pNode.innerHTML.replace(outHtml, text);
        }
      }
    };
    /**
    * 按钮是否可用
    * @param b true or false
    */
    function btnDisabled (b) {
      $('#my_button2').attr('disabled', b);
      $('#my_button3').attr('disabled', b);
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
    }
    // 链式传递，返回当前对象
    return $(this);
  };
}(jQuery));