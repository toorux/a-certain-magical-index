<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from './components/HelloWorld.vue'
import TitleLayout from "./components/TitleLayout.vue";
import {onMounted, ref, watch} from "vue";
import LSKEYS from "./localStorageKeys.js";
import Prompt from "./prompt.js";
import {ElMessage, ElNotification} from "element-plus";
import Clipboard from 'clipboard';
import {
  Edit,
  Plus,
  Check,
  CopyDocument,
  Delete,
} from '@element-plus/icons-vue'

const url = ref("/tags.txt");

// 已选prompt中被选中的prompt key
const currPrompt = ref("");
const promptText = ref("");
const promptStr = ref(localStorage.getItem(LSKEYS.__LSKEY_PROMPT_SOURCE_STR__) || "");
let savedPromptStr = ref(promptStr.value);
let promptSource = {notes: [], data: {}, categoryList: [], noCategoryData: {}};
const categoryList = ref([]);
const currCategory = ref("");
const data = ref({});
const selected = ref(JSON.parse(localStorage.getItem(LSKEYS.__LSKEY_PROMPT_SELECTED__) || "{}"));
// 最近使用的标签
const history = ref(JSON.parse(localStorage.getItem(LSKEYS.__LSKEY_PROMPT_HISTORY__) || "[]"));
selectedPromptToText();

if (promptStr.value) {
  parsePromptSource();
}


onMounted(() => {

  watch(history.value, () => {
    // const hash = {};
    // const i = history.value.findIndex((p, i, o) => {
    //   const key = getPromptKey(p);
    //   // console.log(v,i,o);
    //   hash[key] = hash[key] || 0;
    //   hash[key]++;
    //   if (hash[key] === 2) {
    //     return i;
    //   }
    //   return -1;
    // });
    // console.log(i)
    // if (i > -1) {
    //   history.value.splice(i, 1);
    // }
    history.value.splice(50)
    localStorage.setItem(LSKEYS.__LSKEY_PROMPT_HISTORY__, JSON.stringify(history.value));
  })

  const clipboard = new Clipboard('.copyBtn');
  // 复制成功后执行的回调函数
  clipboard.on('success', function(e) {
    ElMessage.success("复制成功！")
  });

// 复制失败后执行的回调函数
  clipboard.on('error', function(e) {
    ElMessage.error("复制失败！")
  });

  const clipboard2 = new Clipboard('.copyTag');
  // 复制成功后执行的回调函数
  clipboard2.on('success', function(e) {
    ElMessage.success("复制成功！")
  });

// 复制失败后执行的回调函数
  clipboard2.on('error', function(e) {
    ElMessage.error("复制失败！")
  });

  loadUrl();

})

// 保存prompt source到localStorage
function savePromptSource() {
  localStorage.setItem(LSKEYS.__LSKEY_PROMPT_SOURCE_STR__, promptStr.value);
  savedPromptStr.value = promptStr.value;
  // ElNotification({
  //   title: 'QwQ',
  //   message: '已保存',
  //   type: 'success',
  // })
}

// 保存已选prompt到localStorage
function saveSelectedPrompt() {
  localStorage.setItem(LSKEYS.__LSKEY_PROMPT_SELECTED__, JSON.stringify(selected.value));
  ElNotification({
    title: 'QwQ',
    message: '已保存',
    type: 'success',
  })
}

// 解析输入框中的prompt source string
function parsePromptSource() {
  promptSource = Prompt.parsePromptSource(promptStr.value);
  categoryList.value = promptSource.categoryList;
  data.value = promptSource.data;
  currCategory.value = promptSource.categoryList[0] || "";
  promptsToString();
}
// 将解析后的prompt source数据转换回字符串并更新输入框的值
function promptsToString() {
  const str = Prompt.toString(promptSource);
  promptStr.value = str;
  savePromptSource();
}

function tagClick(prompt, event) {
  if (event) {
    if (event.target.localName === "button" || event.target.localName === "svg") {
      return;
    }
  }
  const key = prompt.key;
  if (selected.value[key]) {
    delete selected.value[key];
  } else {
    selected.value[key] = prompt;
    history.value.unshift(prompt);
  }
  selectedPromptToText();
}

function tagSelect(prompt) {

  // if (currPrompt.value) {
  //   const p = selected.value[currPrompt.value];
  //   if (p && p.modifier) {
  //     const index = history.value.indexOf(p);
  //     if (index > -1) {
  //       history.value.splice(index, 1);
  //     }
  //     history.value.unshift(p);
  //   }
  // }

  const key = prompt.key;
  if (currPrompt.value === key) {
    currPrompt.value = "";
  } else {
    currPrompt.value = key;
  }
}

function clearSelect() {
  selected.value = {};
  selectedPromptToText();
}


function selectedPromptToText() {
  const list = [];
  for (const key in selected.value) {
    const p = selected.value[key];
    list.push(getPromptKey(p));
  }
  promptText.value = list.join(", ");
}

function getPromptKey(p) {
  if (!p.modifier) {
    return p.key;
  }
  const keys = [];
  for (const item of [...p.modifier.left, {key: p.key}, ...p.modifier.right]) {
    keys.push(item.key);
  }
  return keys.join(" ");
}

function loadUrl() {
  const uri = url.value;
  fetch(uri).then(value => {
    return value.text();
  }).then(text => {
    promptStr.value = text + promptStr.value;
    parsePromptSource();
  }).catch(e => {
    ElNotification({
      title: 'Error',
      message: '请求失败！',
      type: 'error',
    })
  })
}

function copyText() {
  tagSelect(currPrompt.value);
}

function parseTextToSelected() {
  ElNotification({
    title: 'QwQ',
    message: '还没写呢 qwq',
    type: 'info',
  })
}

function favorites() {
  ElNotification({
    title: 'QwQ',
    message: '还没写呢 qwq',
    type: 'info',
  })
}

function readFavorites() {
  ElNotification({
    title: 'QwQ',
    message: '还没写呢 qwq',
    type: 'info',
  })
}


// type: 0 left 1 right
function addModifier(prompt, type) {
  if (currPrompt.value === "") {
    return;
  }
  selected.value[currPrompt.value].modifier = selected.value[currPrompt.value].modifier || {left: [], right: []};
  // const p = JSON.parse(JSON.stringify(prompt));
  const p = prompt;
  if (type) {
    selected.value[currPrompt.value].modifier.right.push(p);
  } else {
    selected.value[currPrompt.value].modifier.left.push(p)
  }
}

function removeModifier(key, prompt, type) {
  selected.value[key].modifier = selected.value[key].modifier || {left: [], right: []};
  /** @type {*[]} */
  const arr = type ? selected.value[key].modifier.right : selected.value[key].modifier.left;
  arr.splice(arr.indexOf(prompt), 1);
  if (type) {
    selected.value[key].modifier.right = arr;
  } else {
    selected.value[key].modifier.left = arr;
  }
  if (selected.value[key].modifier.right.length === 0 && selected.value[key].modifier.left.length === 0) {
    selected.value[key].modifier = undefined;
  }
}

</script>

<template>
  <div class="container">
    <div class="card">
      <div class="prompt-source">
        <div>
          <title-layout>
            <!--      左侧 prompt source      -->
            <template #title>Prompt Source</template>
            <div class="prompt-form">
              <el-alert title="请将TAG粘贴在下方" type="info" :closable="false" style="margin-bottom: 10px" />
              <el-input
                  v-model="promptStr"
                  type="textarea"
                  rows="28"
                  placeholder="Please input"
                  resize="none"
              />
              <div style="text-align: right;padding-top: 10px">
                <el-button type="success" round @click="loadUrl">加载默认</el-button>
<!--                <el-button :type="promptStr == savedPromptStr ? 'info' : 'success'" round @click="savePromptSource">保存</el-button>-->
                <el-button type="primary" round @click="parsePromptSource">解析Prompt</el-button>
              </div>
            </div>
            <!--      ==== 左侧 prompt source 结束 ====      -->
          </title-layout>
        </div>
      </div>
      <div class="prompt">
        <div>
          <title-layout>
            <!--      右侧 prompt      -->
            <template #title>Prompt</template>
            <div class="prompt-form">
              <el-alert title="下方为已选的Prompt" type="info" :closable="false" style="margin-bottom: 10px" />
              <div class="selected-prompts-list">
                <div
                    v-for="prompt in Object.values(selected)"
                    :key="prompt.key"
                    :class="`tags ${currCategory === prompt.category ? 'active' : ''} ${currPrompt === prompt.key ? 'selected' : ''}`"
                    @dblclick.stop="tagClick(prompt)"
                    @click.stop="tagSelect(prompt)"
                    style="white-space: nowrap"
                >
                  <div>
                    <template v-if="!prompt.modifier">
                      <div class="desc">{{ prompt.desc }}</div>
                      <div class="key">{{prompt.key}}</div>
                    </template>
                    <template v-else>
                      <el-tag closable v-for="item in prompt.modifier.left" @close="removeModifier(prompt.key, item, 0)">
                        <div class="desc">{{ item.desc }}</div>
                        <div class="key">{{item.key}}</div>
                      </el-tag>
                      <el-tag>
                        <div class="desc">{{ prompt.desc }}</div>
                        <div class="key">{{prompt.key}}</div>
                      </el-tag>
                      <el-tag closable v-for="item in prompt.modifier.right" @close="removeModifier(prompt.key, item, 1)">
                        <div class="desc">{{ item.desc }}</div>
                        <div class="key">{{item.key}}</div>
                      </el-tag>
                    </template>
                  </div>
                </div>
              </div>
              <div class="custom-form">
                  <div>
                    <el-input v-model="promptText" id="prompt_text" placeholder="" size="small" style="width: 100%"/>
                  </div>
                  <el-button type="warning" @click="clearSelect" size="small">清空</el-button>
                  <el-button type="primary" @click="saveSelectedPrompt" size="small">保存</el-button>
                  <el-button type="success" class="copyBtn" @click="copyText" data-clipboard-target="#prompt_text" size="small">复制</el-button>
<!--                  <el-button type="info" @click="parseTextToSelected" size="small">解析</el-button>-->
<!--                  <el-button type="info" @click="favorites" size="small">收藏</el-button>-->
<!--                  <el-button type="info" @click="readFavorites" size="small">读取收藏</el-button>-->
              </div>
              <el-alert title="请从下方选择想要的Prompt" type="info" :closable="false" style="margin:  10px 0;" />
              <div class="select-prompts">
                <div class="select-prompts-container">
                  <el-tabs v-model="currCategory" tab-position="top" style="height: 100%;" class="demo-tabs">

                    <el-tab-pane label="最近使用" name="最近使用" style="height: 100%" lazy>
                      <div class="select-prompts-list">
                        <div
                            v-for="prompt in history"
                            :key="prompt.key"
                            :class="`tags ${selected[prompt.key] ? 'active' : ''}`"
                            @click="tagClick(prompt, $event)"
                        >
                          <div>
                            <div class="desc">
                              <span v-if="prompt.modifier" v-for="p in prompt.modifier.left">{{p.desc}}_</span>
                              <span>{{ prompt.desc }}</span>
                              <span v-if="prompt.modifier" v-for="p in prompt.modifier.right">_{{p.desc}}</span>
                            </div>
                            <div class="key">
                              <span v-if="prompt.modifier" v-for="p in prompt.modifier.left">{{p.key}}_</span>
                              <span>{{ prompt.key }}</span>
                              <span v-if="prompt.modifier" v-for="p in prompt.modifier.right">_{{p.key}}</span>
                            </div>
                            <input type="hidden" :value="prompt.key + ', '" :id="'hidden-copy-input-'+prompt.key" />
                            <div class="operate">
                              <el-tooltip
                                  class="box-item"
                                  effect="dark"
                                  content="设置为所选tag的前缀"
                                  placement="bottom"
                                  v-if="!prompt.modifier && currPrompt"
                              >
                                <el-button type="primary" @click.stop="addModifier(prompt, 0)" :icon="Plus" size="small" plain circle />
                              </el-tooltip>
                              <el-tooltip
                                  class="box-item"
                                  effect="dark"
                                  :content="selected[prompt.key] ? '移除该标签' : '使用该标签'"
                                  placement="bottom"
                              >
                                <el-button :type="selected[prompt.key] ? 'danger' :'success'" title="" :icon="selected[prompt.key] ? Delete : Check" size="small" @click.stop="tagClick(prompt)" plain circle />
                              </el-tooltip>
                              <el-tooltip
                                  class="box-item"
                                  effect="dark"
                                  content="复制tag到剪贴板(带逗号)"
                                  placement="bottom"
                              >
                                <el-button type="info" title="" :icon="CopyDocument" size="small" class="copyBtn" :data-clipboard-target="'#hidden-copy-input-'+prompt.key" plain circle />
                              </el-tooltip>
                              <el-tooltip
                                  class="box-item"
                                  effect="dark"
                                  content="设置为所选tag的后缀"
                                  placement="bottom"
                                  v-if="!prompt.modifier && currPrompt"
                              >
                                <el-button type="primary" title="" @click.stop="addModifier(prompt, 1)" :icon="Plus" size="small" plain circle />
                              </el-tooltip>
                            </div>
                          </div>
                        </div>
                      </div>
                    </el-tab-pane>


                    <el-tab-pane :label="category" :name="category" v-for="category in categoryList" v-bind:key="category" style="height: 100%" lazy>
                      <div class="select-prompts-list">
                        <div
                            v-for="prompt in Object.values(data[category])"
                            :key="prompt.key"
                            :class="`tags ${selected[prompt.key] ? 'active' : ''}`"
                            @click="tagClick(prompt, $event)"
                        >
                          <div>
                            <div class="desc">{{ prompt.desc }}</div>
                            <div class="key">{{prompt.key}}</div>
                            <input type="hidden" :value="prompt.key + ', '" :id="'hidden-copy-input-'+prompt.key" />
                            <div class="operate">
                              <el-tooltip
                                  class="box-item"
                                  effect="dark"
                                  content="设置为所选tag的前缀"
                                  placement="bottom"
                              >
                                <el-button type="primary" @click.stop="addModifier(prompt, 0)" :icon="Plus" :disabled="!currPrompt" size="small" plain circle />
                              </el-tooltip>
                              <el-tooltip
                                  class="box-item"
                                  effect="dark"
                                  :content="selected[prompt.key] ? '移除该标签' : '使用该标签'"
                                  placement="bottom"
                              >
                                <el-button :type="selected[prompt.key] ? 'danger' :'success'" title="" :icon="selected[prompt.key] ? Delete : Check" size="small" @click.stop="tagClick(prompt)" plain circle />
                              </el-tooltip>
                              <el-tooltip
                                  class="box-item"
                                  effect="dark"
                                  content="复制tag到剪贴板(带逗号)"
                                  placement="bottom"
                              >
                                <el-button type="info" title="" :icon="CopyDocument" size="small" class="copyBtn" :data-clipboard-target="'#hidden-copy-input-'+prompt.key" plain circle />
                              </el-tooltip>
                              <el-tooltip
                                  class="box-item"
                                  effect="dark"
                                  content="设置为所选tag的后缀"
                                  placement="bottom"
                              >
                                <el-button type="primary" title="" @click.stop="addModifier(prompt, 1)" :icon="Plus" :disabled="!currPrompt" size="small" plain circle />
                              </el-tooltip>
                            </div>
                          </div>
                        </div>
                      </div>
                    </el-tab-pane>

                  </el-tabs>
                </div>
              </div>
            </div>
            <!--      ==== 右侧 prompt 结束 ====      -->
          </title-layout>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container > .card {
  width: 1280px;
  height: 800px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow:  20px 20px 60px #d9d9d9,
  -20px -20px 60px #ffffff;
  overflow: hidden;

  display: flex;
}


.prompt-source {
  width: 400px;
  background: #fefefe;
  box-shadow:  0 0 10px #dadada;
}

.prompt {
  flex: 1;
}

.prompt-source, .prompt {
  height: 100%;
  position: relative;
}


.prompt-source > div, .prompt > div {
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
}

.prompt > div {
  left: 10px;
}

.prompt-form {
  height: 100%;
}

.selected-prompts-list {
  height: 160px;
  border-radius: 4px;
  border: #f1f1f1 1px solid;
  overflow-y: auto;
  overflow-x: hidden;
  user-select: none;
}

.select-prompts {
  height: 400px;
  /*background-color: #66666611;*/
  border-radius: 4px;
  border: #f1f1f1 1px solid;
}

.select-prompts-container {
  /*width: 500px;*/
  height: 100%;
}

.select-prompts-list {
  width: 100%;
  height: 340px;
  padding: 0 0;
  overflow-y: auto;
}

.select-prompts-list .tags {
  display: inline-block;
  width: calc(33.33% - 22px);
  margin: 10px;
  border-radius: 8px;
  border: #f1f1f1 1px solid;
  padding: 8px 0;
  text-align: center;
  cursor: pointer;
  transition: all 400ms;
}

.select-prompts-list .tags .desc {
  color: #0098ff;
}

.select-prompts-list .tags .key {
  color: #999;
}

.select-prompts-list .tags .operate {
  margin-top: 10px
}

.select-prompts-list .tags.active {
  border-color: #ffa600;
}

.select-prompts-list .tags.active .desc {
  color: #ffa600;
}

.select-prompts-list .tags.active .key {
  color: #0098ff;
}

.selected-prompts-list .tags {
  display: inline-block;
  margin: 2px 4px;
  border-radius: 4px;
  border: #f1f1f1 1px solid;
  padding: 2px 8px;
  text-align: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 400ms;
  vertical-align: top;
}

.selected-prompts-list .tags .desc {
  color: #0098ff;
  user-select: none;
  transition: all 400ms;
}

.selected-prompts-list .tags .key {
  color: #999;
  font-size: 9px;
  user-select: none;
  transition: all 400ms;
}

.selected-prompts-list .tags.active {
  border-color: #ffa600;
  transition: all 400ms;
}

.selected-prompts-list .tags.active .desc {
  color: #ffa600;
  transition: all 400ms;
}

.selected-prompts-list .tags.active .key {
  color: #82ccff;
  transition: all 400ms;
}

.selected-prompts-list .tags.selected {
  border-color: #ff0000;
  transition: all 400ms;
}

.selected-prompts-list .tags.selected .desc {
  color: #ff0000;
  transition: all 400ms;
}

.custom-form {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}

.custom-form > div {
  flex: 1;
  margin-right: 10px;
}

</style>
