<template>
    <div>
        <div>首页</div>
        <button @click="handleCheckStart">测试连通性</button>
        <button @click="handleLogin">登录</button>
        <button @click="handleGetUserInfo">获取用户信息</button>
    </div>
</template>

<script setup lang="ts">
import { ApiSystem, ApiUser } from "@/network";

function handleCheckStart() {
  ApiSystem.checkStart().then();
}

function handleLogin() {
    ApiUser.login().then();
}

function handleGetUserInfo() {
    ApiUser.getUserInfo().then();
}
</script>

<style scoped lang="scss"></style>
