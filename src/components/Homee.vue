<template>
  <el-container class="home_container">
    <!--侧边栏-->
    <el-aside :width="isCollapse ? '65px' : '201px'">
      <!--logo区域-->
      <div class="aside_logo">
        <img src="../assets/imgage/logo.png" alt="logo">
        <div :style="isCollapse ? 'display: none' : ''">怪人后台</div>
      </div>
      <!--菜单栏区-->
      <el-menu background-color="#f7f8fa"
               text-color="#000"
               active-text-color="#409eff"
               :unique-opened="true"
               :collapse="isCollapse"
               :collapse-transition="false"
               :router="true"
               :default-active="activePath"
      >
        <!--一级菜单-->
        <el-submenu :index="index+''" v-for="(item, index) in menuList" :key="item.id">
          <!--模板-->
          <template slot="title">
            <!--图标模板-->
            <i class="el-icon-location"></i>
            <!--文字模板-->
            <span>{{item.authName}}</span>
          </template>
          <!--          二级菜单-->
          <el-menu-item
            :index="'/'+subitem.path"
            v-for="subitem in item.children"
            :key="subitem.id"
            @click="saveActivePath('/'+subitem.path)"
          >
            <!--模板-->
            <template slot="title">
              <!--图标模板-->
              <i class="el-icon-menu"></i>
              <!--文字模板-->
              <span>{{subitem.authName}}</span>
            </template>
          </el-menu-item>
          <!--          <el-menu-item index="1-2">选项2</el-menu-item>-->
        </el-submenu>
      </el-menu>
      <!--折叠按钮-->
      <div class="collapse">
        <i :class="isCollapse ? 'el-icon-lock' : 'el-icon-unlock'" @click="toCollapse"></i>
      </div>
    </el-aside>
    <!--主体页面-->
    <el-container class="main_container">
      <!--主体头部-->
      <el-header>
        <div class="menu"></div>
        <div class="accout">
          <el-button type="info" @click="logout">退出</el-button>
        </div>
      </el-header>
      <!--主体面板-->
      <el-main>
        <router-view></router-view>
      </el-main>
      <!--主体底部-->
      <el-footer>Footer</el-footer>
    </el-container>
  </el-container>
</template>

<script>
export default {
  created: function () {
    this.getMeuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  data: function () {
    return {
      // 左侧菜单栏数据
      menuList: [],
      // 是否折叠
      isCollapse: false,
      // 激活的path
      activePath: ''
    }
  },
  methods: {
    logout: function () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    getMeuList: async function () {
      let { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    // 折叠
    toCollapse: function () {
      this.isCollapse = !this.isCollapse
    },
    // 储存激活的路径
    saveActivePath: function (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
  .home_container {
    height: 100%;
  }

  .el-aside {
    background-color: #f7f8fa;
    border-right: solid 1px #e6e6e6;

    .aside_logo {
      height: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;

      img {
        height: 48px;
      }

      > div {
        color: #000;
        font-size: 20px;
      }
    }

    /*去除菜单栏border*/

    .el-menu {
      border-right: none;
    }

    .collapse {
      font-size: 30px;
      height: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .main_container {
    .el-header {
      background-color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .el-main {
      background-color: #f7f8fa;
    }

    .el-footer {
      background-color: white;
    }
  }
</style>
