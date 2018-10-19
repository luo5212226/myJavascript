# 高亮插件

## 使用说明

1. 把 `search` 文件夹放在合适位置，在需要插件的页面中引入 `search.js`, `search.css`, `jquery.min.js`（根据HTML的执行顺序先引入jQuery！还需要注意css中的按钮图片路径配置）

2. 在需要插件的页面中添加 `<script>` 标签

   ```html
   <script type="text/javascript">
       $("body").selectFn();
   </script>
   ```
## Todo

- [ ] 字符搜索
- [ ] 绑定按键 Ctrl + F

