// 自动检查指定目录下的所有导出语句，然后构建所有目录的 index.ts  文件
import fs, { Stats } from "node:fs";
import path from "node:path";
import * as process from "node:process";

const builderModuleIndex = (sourceUrl: string) => {
    // 确保该目录存在
    if (!fs.existsSync(sourceUrl)) {
        console.log("目录不存在");
        return;
    }

    // 路径列表
    const typeDirList: string[] = [];
    recursive(sourceUrl, typeDirList);
};

// 执行递归操作，若目录中有子目录，则创建 index.js，并导入它们，然后导入当前目录的文件，再进入这些子目录
// 对于当前目录的文件,会对它们继续调用递归,但是此时只会检测它们的路径的文件内容,是否有导出语句,若有返回true,没有则返回false
const recursive = (url: string, typeDirList?: string[]) => {
    if (!fs.existsSync(url)) {
        return;
    }

    // 检测路径是否为文件
    const fileInfo = fs.statSync(url);

    if (fileInfo.isDirectory()) {
        const files: string[] = fs.readdirSync(url);
        const dirList: string[] = [];
        const fileList: string[] = [];

        let writeStr: string = "";

        files.forEach((item: string) => {
            const itemUrl: string = path.join(url, item);
            if (item === "index.ts") {
                return;
            }
            const itemStats: Stats = fs.statSync(itemUrl);
            if (itemStats.isDirectory()) {
                if (!checkDirEmpty(itemUrl)) {
                    dirList.push(item);
                    if (typeDirList) {
                        typeDirList.push(itemUrl);
                    }
                    recursive(itemUrl, typeDirList);
                }
            } else {
                const result: boolean = checkExport(itemUrl);
                if (result) {
                    fileList.push(item);
                }
            }
        });

        if (dirList.length || fileList.length) {
            // 写入到当前目录的 index.ts 中
            // 导入目录索引
            dirList.forEach((item) => {
                writeStr += `export * from "./${item}/index.js";\n`;
            });
            if (dirList.length) {
                writeStr += "\n";
            }
            // 导入文件索引
            fileList.forEach((item: string) => {
                item = item.replace(".ts", ".js");
                writeStr += `export * from "./${item}";\n`;
            });
            fs.writeFileSync(path.join(url, "index.ts"), writeStr, "utf-8");
        }
    }
};

// 递归检测目录是否为空
const checkDirEmpty = (url: string): boolean => {
    let hasFile: boolean = true;
    const files = fs.readdirSync(url);
    files.forEach((item) => {
        const itemUrl: string = path.join(url, item);
        if (fs.statSync(itemUrl).isDirectory()) {
            if (!checkDirEmpty(itemUrl)) {
                hasFile = false;
                return;
            }
        } else {
            hasFile = false;
        }
    });
    return hasFile;
};

// 检测文件是否有导出语句
const checkExport = (url: string): boolean => {
    let hasExport: boolean = false;
    // 判断该文件是否至少导出了一个内容
    const fileStr = fs.readFileSync(url, "utf-8");
    // 捕获 export( \n\r)type、class、interface、enum、function、const、var、let
    const regexExport: RegExp[] = [
        /export\s*(type|class|interface|enum|function|const|var|let)/g,
        /export(\s*|\s*type\s*)\{([\s\S]*)}/,
    ];
    regexExport.forEach((item: RegExp) => {
        if (item.test(fileStr)) {
            hasExport = true;
        }
    });
    return hasExport;
};

const projectBasePath = path.join(process.cwd(), "../src");
const builPathList = ["utils"];

// 构建模块索引
builPathList.forEach((item) => {
    builderModuleIndex(path.join(projectBasePath, item));
});

console.log("模块索引构建完成");
