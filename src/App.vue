<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from './components/HelloWorld.vue'
import TitleLayout from "./components/TitleLayout.vue";
import {onMounted, ref} from "vue";
import LSKEYS from "./localStorageKeys.js";
import Prompt from "./prompt.js";
import {ElMessage, ElNotification} from "element-plus";
import Clipboard from 'clipboard';

const url = ref("/tags.txt");

const promptText = ref("");
const promptStr = ref(localStorage.getItem(LSKEYS.__LSKEY_PROMPT_SOURCE_STR__) || "");
let savedPromptStr = ref(promptStr.value);
let promptSource = {notes: [], data: {}, categoryList: []};
const categoryList = ref([]);
const currCategory = ref("");
const data = ref({});
const selected = ref(JSON.parse(localStorage.getItem(LSKEYS.__LSKEY_PROMPT_SELECTED__) || "{}"));
selectedPromptToText();

if (promptStr.value) {
  parsePromptSource();
}


onMounted(() => {
  const clipboard = new Clipboard('.copyBtn');
  // 复制成功后执行的回调函数
  clipboard.on('success', function(e) {
    ElMessage.success("复制成功！")
  });

// 复制失败后执行的回调函数
  clipboard.on('error', function(e) {
    ElMessage.error("复制失败！")
  });

})

// 保存prompt source到localStorage
function savePromptSource() {
  localStorage.setItem(LSKEYS.__LSKEY_PROMPT_SOURCE_STR__, promptStr.value);
  savedPromptStr.value = promptStr.value;
  ElNotification({
    title: 'QwQ',
    message: '已保存',
    type: 'success',
  })
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
}

function tagClick(prompt) {
  const key = prompt.category+'^'+prompt.key;
  if (selected.value[key]) {
    delete selected.value[key];
  } else {
    selected.value[key] = prompt;
  }
  selectedPromptToText();
}

function clearSelect() {
  selected.value = {};
  selectedPromptToText();
}


function selectedPromptToText() {
  promptText.value = Object.keys(selected.value).join(", ").replace(/, \S+\^/g, ", ").replace(/^\S+\^/g, "");
}

function loadUrl() {
  const uri = url.value;
  console.log(uri);
  fetch(uri).then(value => {
    return value.text();
  }).then(text => {
    promptStr.value = text;
  }).catch(e => {
    ElNotification({
      title: 'Error',
      message: '请求失败！',
      type: 'error',
    })
  })
}

function copyText() {

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
                <el-button type="info" round @click="loadUrl">加载默认</el-button>
                <el-button :type="promptStr == savedPromptStr ? 'info' : 'success'" round @click="savePromptSource">保存</el-button>
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
                    :class="`tags ${currCategory === prompt.category ? 'active' : ''}`"
                    @click="tagClick(prompt)"
                >
                  <div>
                    <div class="desc">{{ prompt.desc }}</div>
                    <div class="key">{{prompt.key}}</div>
                  </div>
                </div>
              </div>
              <div class="custom-form">
                  <div>
                    <el-input v-model="promptText" id="prompt_text" placeholder="将你的关键词粘贴到此处可以反向解析" size="small" style="width: 100%"/>
                  </div>
                  <el-button type="warning" @click="clearSelect" size="small">清空</el-button>
                  <el-button type="primary" @click="saveSelectedPrompt" size="small">保存</el-button>
                  <el-button type="success" class="copyBtn" data-clipboard-target="#prompt_text" size="small">复制</el-button>
                  <el-button type="info" @click="parseTextToSelected" size="small">解析</el-button>
                  <el-button type="info" @click="favorites" size="small">收藏</el-button>
                  <el-button type="info" @click="readFavorites" size="small">读取收藏</el-button>
              </div>
              <el-alert title="请从下方选择想要的Prompt" type="info" :closable="false" style="margin:  10px 0;" />
              <div class="select-prompts">
                <div class="select-prompts-container">
                  <el-tabs v-model="currCategory" tab-position="top" style="height: 300px;" class="demo-tabs">
                    <el-tab-pane :label="category" :name="category" v-for="category in categoryList" v-bind:key="category" style="height: 100%" lazy>
                      <div class="select-prompts-list">
                        <div
                            v-for="prompt in Object.values(data[category])"
                            :key="prompt.key"
                            :class="`tags ${selected[category+'^'+prompt.key] ? 'active' : ''}`"
                            @click="tagClick(prompt)"
                        >
                          <div>
                            <div class="desc">{{ prompt.desc }}</div>
                            <div class="key">{{prompt.key}}</div>
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
  height: 246px;
  border-radius: 4px;
  border: #f1f1f1 1px solid;
  overflow-y: auto;
  overflow-x: hidden;
}

.select-prompts {
  height: 300px;
  /*background-color: #66666611;*/
  border-radius: 4px;
  border: #f1f1f1 1px solid;
}

.select-prompts-container {
  /*width: 500px;*/
}

.select-prompts-list {
  width: 100%;
  height: 230px;
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
}

.select-prompts-list .tags .desc {
  color: #0098ff;
}

.select-prompts-list .tags .key {
  color: #999;
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
}

.selected-prompts-list .tags .desc {
  color: #0098ff;
}

.selected-prompts-list .tags .key {
  color: #999;
  font-size: 9px;
}

.selected-prompts-list .tags.active {
  border-color: #ffa600;
}

.selected-prompts-list .tags.active .desc {
  color: #ffa600;
}

.selected-prompts-list .tags.active .key {
  color: #82ccff;
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
