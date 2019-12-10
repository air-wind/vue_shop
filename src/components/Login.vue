<template>
  <div class="login_container">
    <div class="login_box">
      <!--    登陆头像区-->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt=""/>
      </div>
      <!--      登陆表单区-->
      <div class="login_form">
        <el-form
          label-width="0px"
          :model="loginForm"
          :rules="loginFormRules"
          ref="loginFormRef"
        >
          <el-form-item prop="user">
            <el-input
              prefix-icon="iconfont icon-yonghu"
              v-model="loginForm.username"
            ></el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              prefix-icon="iconfont icon-mima"
              v-model="loginForm.password"
              type="password"
            ></el-input>
          </el-form-item>

          <!--        登陆按钮区-->
          <el-form-item class="btns">
            <el-button type="primary" @click="login">登陆</el-button>
            <el-button type="info" @click="resetLoginForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 定义表单绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 定义表单验证规则对象
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetLoginForm: function () {
      this.$refs.loginFormRef.resetFields()
    },
    login: function () {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message({ message: '账户名或密码错误！', type: 'error' })
        this.$message({ message: '登陆成功！', type: 'success' })
        // 登陆成功后设置sessionStorage保存token
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .login_container {
    background-color: #2b4b6b;
    height: 100%;
  }

  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avatar_box {
      width: 135px;
      height: 135px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #eee;
      background-color: white;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }

    .login_form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;

      .btns {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
</style>
