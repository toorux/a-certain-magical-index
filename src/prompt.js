/**
 * @typedef {{desc: string, uniqueId: (string|null), category: string, key: string}} PromptItem
 * @typedef {{[p: string]: {[p: string]: PromptItem}}} PromptItemData
 * @typedef {{notes: string[], data: PromptItemData, categoryList: string[]}} PromptSource
 */

class Prompt {

    /**
     * 解析PromptSource
     * @param str {string}
     * @returns {PromptSource}
     */
    static parsePromptSource(str) {
        /** @type {string[]} */
        const words = str.trim().replace(/，/g, ",").split(/[\r\n]+/);
        let currCategory = "无分类";
        /** @type {{[category: string]: {[key: string]: {desc: string, uniqueId: string | null, category: string, key: string}}}} */
        const data = {};
        const categoryList = [];
        const notes = [];
        for (const word of words) {
            // 去掉注释
            if (word.startsWith("//")) {
                notes.push(word);
                continue;
            }

            // 以#开头的处理为分类， 一直到下一个分类为止，所有的prompt都归到当前分类下
            if (word.startsWith("#")) {
                const category = word.replace("#", "");
                currCategory = category;
                if (!data[category]) {
                    categoryList.push(category);
                }
                data[category] = data[category] || {};
                continue;
            }

            // 处理prompt
            if (!word) {
                continue;
            }
            const item = word.replace(/([a-z0-9A-Z]) ([a-z0-9A-Z])/g, "$1^$2").split(/[,\s]+/);
            if (item.length <= 0 || !item[0]) {
                continue;
            }
            // 可能存在多个key （使用/分隔）
            const keys = item[0].replaceAll("^", " ").split("/");
            const desc = item[1] || null;
            const uniqueId = item[2] || null;
            for (const key of keys) {
                data[currCategory][key] = {
                    key,
                    desc: desc || key,
                    uniqueId,
                    category: currCategory,
                }
            }

        }


        return {
            notes,
            categoryList,
            data
        }

    }


    /**
     * 将解析过的prompt source转为字符串
     * @param promptSource {PromptSource}
     * @return {string}
     */
    static toString(promptSource) {
        const note = "// 数据使用http://ai.uremy.world格式化导出";
        let str = "";
        if (promptSource.notes[0] !== note) {
            promptSource.notes.unshift(note);
        }
        str += promptSource.notes.join("\n") + "\n\n";

        for (const category of promptSource.categoryList) {
            str += `#${category}\n`
            for (const item of Object.values(promptSource.data[category])) {
                str += `${item.key}, ${item.desc}`
                if (item.uniqueId) {
                    str += `, ${item.uniqueId}`
                }
                str += "\n";
            }
            str += "\n";
        }

        return str;
    }

}


export default Prompt
