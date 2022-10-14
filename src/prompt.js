/**
 * @typedef {{desc: string, uniqueId: (string|null), category: string, key: string}} PromptItem
 * @typedef {{[category: string]: {[key: string]: PromptItem}}} PromptItemData
 * @typedef {{notes: string[], data: PromptItemData, categoryList: string[], noCategoryData: {[key: string]: PromptItem}}} PromptSource
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
        /** @type {PromptItemData} */
        const data = {};
        /** @type {[key: string]: PromptItem} */
        const noCategoryData = {};
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
            const item = word.replace(/([a-z0-9A-Z]) ([a-z0-9A-Z])/g, "$1^$2").split(/\s*,\s*/);
            if (item.length <= 0 || !item[0]) {
                continue;
            }
            // 可能存在多个key （使用/分隔）
            const keys = item[0].replaceAll("^", " ").split("/");
            const desc = item[1] || null;
            const uniqueId = item[2] || null;
            for (const key of keys) {
                const tmp = {
                    key,
                    desc: desc || key,
                    uniqueId,
                    category: currCategory,
                };
                if (noCategoryData[key]) {
                    // 如果key已存在， 则从原本的分类中删除， 添加到当前分类中，如果使用desc使用 * 结尾，则以带*结尾的优先， 多个带*的结尾时，以最后一个为准
                    const oldCategory = noCategoryData[key].category;
                    const oldDesc = noCategoryData[key].desc;
                    if (!desc) {
                        tmp.desc = oldDesc;
                    }
                    if (oldDesc.endsWith("*") && !desc.endsWith("*")) {
                        continue;
                    }
                    delete data[oldCategory][key];
                } else {
                    noCategoryData[key] = tmp
                }
                data[currCategory][key] = tmp


            }

        }


        return {
            notes,
            categoryList,
            data,
            noCategoryData,
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
        const notes = [];
        const notesUniqueHash = {};
        for (const str of promptSource.notes) {
            if (str !== note) {
                notesUniqueHash[str] = 1;
            }
        }
        notes.push(note, ...Object.keys(notesUniqueHash));
        str += notes.join("\n") + "\n\n";

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
