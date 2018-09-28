; (function ($) {
  var setOption = {
    myStatus: '1',
    searchId: 'my_search',
    searchClass: 'search',
    inputId: 'my_input',
    inputClass: 'input',
    spanId: ['my_span1', 'my_span2', 'my_span3'],
    spanClass: 'span',
    lineId: 'my_line',
    buttonId: ['my_button1', 'my_button2', 'my_button3', 'my_button4'],
    buttonClass: ['button1', 'button2', 'button3', 'button4'],
    title: ['查找', '下一个', '上一个', '关闭'],
    clickFn: ['select', 'next', 'last', 'reset'],
    now: {
      index: 0
    },
    flag: true
  };
  var options = $.extend(setOption, options);
  var selectFn = {
    // node2fragment: function (node) {
    //   var fgm = document.createDocumentFragment(), firstChild;
    //   while (firstChild = node.firstChild) {
    //     fgm.appendChild(firstChild);
    //   }
    //   return fgm;
    // },
    // regReplace: function (node, reg, val) {
    //   var l = node.childNodes, _this = this;
    //   l.forEach(function (node) {
    //     if (node.nodeType == 1 && node.childNodes.length > 1) {
    //       _this.regReplace(node, reg, val);
    //     } else if (node.nodeType == 1 && node.childNodes.length < 2) {
    //       node.innerHTML = node.innerHTML.replace(reg, '<span class="highlight">' + val + '</span>');
    //     }
    //   });
    // },
    // search: function () {
    //   var value = document.getElementById('my_input').value.trim();
    //   if (value && value.length > 0) {
    //     var fgm = this.node2fragment(document.body);
    //     var reg = new RegExp(value, 'g');
    //     this.regReplace(fgm, reg, value);
    //     document.body.appendChild(fgm);
    //   }
    // },
    init: function (status) {
      var body = document.body;
      var search = document.getElementById('my_input');
      if (status == 'select') {
        // this.search();
        this.temp(body, search, options.now);
        return;
      } else if (status == 'reset') {
        this.reset(body, search);
        return;
      } else if (status == 'next') {
        this.next(options.now);
        return;
      } else if (status == 'last') {
        this.last(options.now);
        return;
      }
    },
    temp: function (body, search, now) {
      // 刷新页面
      var pNode = '';
      var len = $('.highlight').length;
      if (len > 0) {
        for (var i = 0; i < len; i++) {
          var pNode = $('.highlight')[0].parentNode;
          var outHtml = $('.highlight')[0].outerHTML;
          var text = $('.highlight')[0].innerText;
          // $('.highlight')[0].replaceWith(text);
          pNode.innerHTML = pNode.innerHTML.replace(outHtml, text);
        }
      }
      // 记录当前显示字符的index
      now.index = 0;
      // 需要查询的字符
      var value = search.value.trim();
      // 存放text元素
      var temp = [];
      // 过滤遍历结果
      var filter = function (node) {
        if (node.parentNode.attributes.mystatus) {
          return NodeFilter.FILTER_REJECT;
        } else if (node.nodeValue.replace(/[\r\n]/gm, '').replace(/[ ]/g, '') == '') {
          return NodeFilter.FILTER_REJECT;
        } else {
          return NodeFilter.FILTER_ACCEPT;
        }
      };
      /** 用NodeIterator进行遍历dom树
       * @body 查找范围
       * @NodeFilter.SHOW_TEXT 定义只显示文本
       * @null 是否进行过滤
       * @false 默认false
       */
      var iterator = document.createNodeIterator(body, NodeFilter.SHOW_TEXT, filter, false);
      var node = iterator.nextNode();
      // 遍历dom树
      if (value) {
        // var reg = new RegExp('(<[^<>]+>)?' + value, 'gim');
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
        if (html1.toLowerCase().indexOf(value.toLowerCase()) == -1) {
          continue;
        } else {
          var newHtml = html1.replace(reg, '<span class="highlight">$&</span>');
          // if (temp[i].parentNode.childNodes.length > 1) {
          //   html1.indexOf(value) ? temp[i].parentNode.innerHTML = temp[i].parentNode.innerHTML.replace(html1, html1.replace(reg, '<span class="highlight">$&</span>')) : '';
          // } else {
          //   temp[i].parentNode.innerHTML = temp[i].parentNode.innerHTML.replace(reg, '<span class="highlight">$&</span>');
          // }

          // 创建新的span节点，转换textnode的样式
          var newNode = document.createElement('span');
          newNode.innerHTML = newHtml;
          var pHtml = temp[i].parentNode.innerHTML;
          // 如果有兄弟节点，则用span替换当前textnode，直接替换innerHtml会把其他节点删除
          if (temp[i].nextSibling || temp[i].previousSibling) {
            temp[i].parentNode.insertBefore(newNode, temp[i].nextSibling);
            temp[i].parentNode.removeChild(temp[i]);
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
        $('.my_button2').attr('disabled', false);
        $('.my_button3').attr('disabled', false);
        $('.highlight')[now.index].style.backgroundColor = 'lightsalmon';
        selectFn.move(now);
      } else {
        $('#my_span1').html(0);
        $('#my_span2').html('/');
        $('#my_span3').html(0);
      }
    },
    // 重置
    reset: function () {
      // 刷新页面
      var pNode = '';
      var len = $('.highlight').length;
      if (len > 0) {
        for (var i = 0; i < len; i++) {
          var pNode = $('.highlight')[0].parentNode;
          var outHtml = $('.highlight')[0].outerHTML;
          var text = $('.highlight')[0].innerText;
          // $('.highlight')[0].replaceWith(text);
          pNode.innerHTML = pNode.innerHTML.replace(outHtml, text);
        }
      }
      if (options.flag == true) {
        options.flag = false;
        $('my_input').attr('value', '');
        $('#my_span1').html(0);
        $('#my_span2').html('/');
        $('#my_span3').html(0);

        $('#my_input').css('display', 'none');
        $('#my_span1').css('display', 'none');
        $('#my_span2').css('display', 'none');
        $('#my_span3').css('display', 'none');
        $('#my_line').css('display', 'none');
        $('#my_button1').css('display', 'none');
        $('#my_button2').css('display', 'none');
        $('#my_button3').css('display', 'none');
        $('#my_search').animate({
          width: '30px'
        }, 300);
      } else {
        options.flag = true;
        $('#my_input').css('display', 'block');
        $('#my_span1').css('display', 'block');
        $('#my_span2').css('display', 'block');
        $('#my_span3').css('display', 'block');
        $('#my_line').css('display', 'block');
        $('#my_button1').css('display', 'block');
        $('#my_button2').css('display', 'block');
        $('#my_button3').css('display', 'block');
        $('#my_search').animate({
          width: '370px'
        }, 300);
      }
      // $('.search').css('display', 'none');
    },
    // 下一个
    next: function (now) {
      // 高亮index小于总元素个数
      if (now.index < $('.highlight').size() - 1) {
        $('.highlight')[now.index].style.backgroundColor = 'yellow';
        now.index++;
        $('#my_span1').html(now.index + 1);
        $('.highlight')[now.index].style.backgroundColor = 'lightsalmon';
      } else {
        $('.highlight')[now.index].style.backgroundColor = 'yellow';
        now.index = 0;
        $('#my_span1').html(now.index + 1);
        $('.highlight')[now.index].style.backgroundColor = 'lightsalmon';
      }
      this.move(now);
    },
    // 上一个
    last: function (now) {
      // 高亮index小于1
      if (now.index < 1) {
        $('.highlight')[now.index].style.backgroundColor = 'yellow';
        now.index = $('.highlight').size() - 1;
        $('#my_span1').html(now.index + 1);
        $('.highlight')[now.index].style.backgroundColor = 'lightsalmon';
      } else {
        $('.highlight')[now.index].style.backgroundColor = 'yellow';
        now.index--;
        $('#my_span1').html(now.index + 1);
        $('.highlight')[now.index].style.backgroundColor = 'lightsalmon';
      }
      this.move(now);
    },
    // 窗口移动到当前高亮元素
    move: function (now) {
      var move = $('.highlight')[now.index].offsetTop;
      $('html,body').animate({
        'scrollTop': move
      }, 200);
    }
  };
  var keypress = function () {
    // 回车事件
    $('.input').bind('keypress', function (event) {
      if (event.keyCode == 13) {
        selectFn.temp(document.body, document.getElementById('my_input'), options.now);
      }
    });
  };
  (function () {
    var _div = document.createElement('div');
    _div.setAttribute('mystatus', options.myStatus);
    _div.id = options.searchId;
    _div.className = 'search';
    var _input = document.createElement('input');
    _input.id = options.inputId;
    _input.setAttribute('mystatus', options.myStatus);
    _div.appendChild(_input);
    _input.className = 'input';
    var _span = [], _button = [];
    for (var i = 0; i < options.spanId.length; i++) {
      _span.push(document.createElement('span'));
      _span[i].id = options.spanId[i];
      _span[i].setAttribute('mystatus', options.myStatus);
      _span[i].className = 'span';
      _span[i].style.display = 'block';
      _div.appendChild(_span[i]);
    }
    var _line = document.createElement('div');
    _line.setAttribute('mystatus', options.myStatus);
    _line.id = options.lineId;
    _div.appendChild(_line);
    _line.className = 'line1';
    for (var j = 0; j < options.buttonId.length; j++) {
      _button.push(document.createElement('button'));
      _button[j].id = options.buttonId[j];
      _button[j].title = options.title[j];
      _div.appendChild(_button[j]);
    }
    _button[0].addEventListener('click', function () {
      selectFn.init(options.clickFn[0]);
    });
    _button[1].addEventListener('click', function () {
      selectFn.init(options.clickFn[1]);
    });
    _button[2].addEventListener('click', function () {
      selectFn.init(options.clickFn[2]);
    });
    _button[3].addEventListener('click', function () {
      selectFn.init(options.clickFn[3]);
    });
    _button[0].className = 'button1';
    _button[1].className = 'button2';
    _button[2].className = 'button3';
    _button[3].className = 'button4';
    $('body').prepend(_div);
  }());
  keypress();
}(jQuery));
