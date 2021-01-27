# simpleBundler
一个基于babel的简单的打包器
1. parse解析 2. transfrom转化 3. generate生成

### 文件模块分析

> @babel/parser 将源码分析成AST

从ast.program.body程序体中分析出引用的模块(type: ImportDeclaration)
api: parser.parse()

> @babel/traverse 用于分析ast，通过遍历找出特定内容

用@babel/traverse 找出type: ImportDeclaration的ast节点，分析出节点从哪些文件引入的
api: travers(ast, {})

### 对ast进行转换
> @babel/core    

> @babel/preset-env es6转es5的预设

将es6代码转换成浏览器能够执行的代码，进行转换操作  api: babel.transformFromAst()
最后得到一个模块的转换后的代码，其内部引入的依赖文件


### dependence gragh 依赖图谱

### 根据依赖图谱生成代码

代码是字符串形式，内部是闭包，避免污染全局环境

