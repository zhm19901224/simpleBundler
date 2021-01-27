const fs = require('fs')
const parser = require('@babel/parser')
const travers = require('@babel/traverse').default;
const path = require('path')
const babel = require('@babel/core')

const moduleAnalyser = (filename) => {
    const content = fs.readFileSync(filename, 'utf-8');
    const ast = parser.parse(content, {
        sourceType: 'module'    // 源码是es6
    })

    const dependencies = {}
    travers(ast, {
        ImportDeclaration({ node }) {
            // node是根据这个type找到的节点，travers会自动遍历，找到几个就执行几次此函数
            // node.source.value是具体引入的文件 './home.js' './etc.js' 打包时需要既知道相对路径也知道绝对路径
            const dirname = path.dirname(filename)
            dependencies[node.source.value] = './' + path.join(dirname, node.source.value)
        }
    })

    // code是转换过后，可以在浏览器运行的代码
    const { code } =  babel.transformFromAst(ast, null, {     // 第二个参数是code，第三个参数是option，可以设置转换的预设
        presets: ["@babel/preset-env"]
    });

    return {
        filename,   // 入口文件
        dependencies,    // 引入的依赖文件
        code
    }
}

// 获取所有模块的依赖图谱
const makeDependenciesGraph = (entry) => {
    const entryModule = moduleAnalyser(entry);
    const graphArr = [entryModule];
    for (let i = 0; i < graphArr.length; i++) {
        let module = graphArr[i];
        if (module.dependencies) {
            for (let path in module.dependencies) {
                let betterPath = module.dependencies[path]
                graphArr.push(moduleAnalyser(betterPath))
            }
        }
    }


    const graph = {};
    graphArr.forEach(({ filename, dependencies, code}) => {
        graph[filename] = {
            dependencies,
            code
        }
    })

    return graph;
}


const generateCode = (entry) => {
	const graph = JSON.stringify(makeDependenciesGraph(entry));
	return `
		(function(graph){
			function require(module) { 
				function localRequire(relativePath) {
					return require(graph[module].dependencies[relativePath]);
				}
				var exports = {};
				(function(require, exports, code){
					eval(code)
				})(localRequire, exports, graph[module].code);
				return exports;
			};
			require('${entry}')
		})(${graph});
	`;
}

const code = generateCode('./src/index.js')
