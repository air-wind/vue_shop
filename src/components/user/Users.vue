<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card>
      <!--搜索于添加用户区-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addUserDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!--用户数据表格区-->
      <el-table
        :data="users"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="role_name" label="用户类型"></el-table-column>
        <el-table-column prop="mobile" label="手机号"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="create_time" label="创建时间"></el-table-column>
        <el-table-column label="用户状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editUserShow(scope.row)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)"></el-button>
            <el-tooltip effect="dark" content="设置权限" placement="top-end" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showDirstributeroleDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!--添加用户对话框-->
    <div>
      <el-dialog
        title="添加用户"
        :visible.sync="addUserDialogVisible"
        width="50%"
        @close="addUserClosed"
      >
        <!--主体表单区域-->
        <el-form
          :model="addUserForm"
          :rules="addUserRules"
          ref="addUserForm"
          label-width="70px"
        >
          <el-form-item label="用户名" prop="userName">
            <el-input v-model="addUserForm.userName"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="userPassword">
            <el-input v-model="addUserForm.userPassword"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="userEmail">
            <el-input v-model="addUserForm.userEmail"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="userMobile">
            <el-input v-model="addUserForm.userMobile"></el-input>
          </el-form-item>
        </el-form>
        <!--按钮区域-->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addUserDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
    </div>

    <!--修改用户对话框-->
    <el-dialog
      title="修改用户"
      :visible.sync="editUserVisible"
      width="50%"
      @close="editUserClosed"
    >
      <el-form
        ref="editUserFormRef"
        :model="editUserFormForm"
        :rules="editUserFormRules"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="user">
          <el-input v-model="editUserFormForm.user" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserFormForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editUserFormForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editUserVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!--分配角色对话框-->
    <el-dialog
      title="提示"
      :visible.sync="distributeRoleVisible"
      width="50%"
      @close="clearSelectedRoleId"
    >
      <div>
        <!--当前用户信息-->
        <p>
          <span>用户名：</span>
          <span>{{userInfo.username}}</span>
        </p>
        <p>
          <span>当前所属角色：</span>
          <span>{{userInfo.role_name}}</span>
        </p>
        <!--选择器-->
        <p>设置新的角色:
          <el-select v-model="selectedRoleId" placeholder="请选择:">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="distributeRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
export default {
  name: 'Users',
  data () {
    // 添加用户表单自定义验证规则
    // 验证邮箱
    const validateEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+\.([a-zA-Z0-9_-])+$/
      if (regEmail.test(value)) return callback()
      return callback(new Error('请输入正确的邮箱！'))
    }
    // 验证手机
    const validateMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) return callback()
      return callback(new Error('请输入正确的手机！'))
    }
    return {
      queryInfo: {
        query: '',
        // 当前页
        pagenum: 1,
        // 每页 数量
        pagesize: 2
      },
      users: [],
      total: 0,
      // 添加用户对话框是否显示
      addUserDialogVisible: false,
      // 添加用户表单绑定对象
      addUserForm: {
        userName: 'admin',
        userPassword: 'qw',
        userEmail: '123@qq.com',
        userMobile: '13888888888'
      },
      // 添加用户表单验证规则
      addUserRules: {
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        userPassword: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        userEmail: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        userMobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' }
        ]
      },
      // 修改用户对话框是否显示
      editUserVisible: false,
      // 修改用户表单绑定对象
      editUserFormForm: {
        id: '',
        user: '',
        email: '',
        mobile: ''
      },
      // 修改用户表单验证规则
      editUserFormRules: {
        user: [
          { required: true, message: '请输入', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' }
        ]
      },
      // 分配角色对话框是否显示
      distributeRoleVisible: false,
      // 分配角色的用户信息
      userInfo: {},
      // 所有角色列表
      rolesList: [],
      // 已选中的角色id值
      selectedRoleId: ''
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 发送请求获取用户列表
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.users = res.data.users
      this.total = res.data.total
    },
    // 监听页码数改变
    handleSizeChange (newPageSize) {
      this.queryInfo.pagesize = newPageSize
      this.getUserList()
    },
    // 监听页数改变
    handleCurrentChange (crutentPage) {
      this.queryInfo.pagenum = crutentPage
      this.getUserList()
    },
    // 监听用户状态改变
    async userStateChange (userInfo) {
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
    },
    // 监听添加用户表单关闭
    addUserClosed () {
      this.$refs.addUserForm.resetFields()
    },
    // 提交添加用户表单
    async addUser () {
      this.$refs.addUserForm.validate(valid => {
        if (!valid) return null
      })
      // 发送添加用户请求
      const { data: res } = await this.$http.post('users', {
        username: this.addUserForm.userName,
        password: this.addUserForm.userPassword,
        email: this.addUserForm.userEmail,
        mobile: this.addUserForm.userMobile
      })
      if (res.meta.status === 201) {
        // 隐藏对话框
        this.addUserDialogVisible = false
        // 刷新列表
        this.getUserList()
        return this.$message.success(res.meta.msg)
      }
      return this.message.error(res.meta.msg)
    },
    // 控制修改用户dialog打开
    editUserShow (data) {
      this.editUserVisible = true
      console.log(data)
      this.editUserFormForm.id = data.id
      this.editUserFormForm.user = data.username
      this.editUserFormForm.mobile = data.mobile
      this.editUserFormForm.email = data.email
    },
    // 修改用户并提交
    editUser () {
      this.$refs.editUserFormRef.validate(async valid => {
        if (!valid) return null
        const { data: res } = await this.$http.put(`users/${this.editUserFormForm.id}`, {
          email: this.editUserFormForm.email,
          mobile: this.editUserFormForm.mobile
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.editUserVisible = false
        this.getUserList()
        this.$message.success(res.meta.msg)
      })
    },
    // 监听修改用户表单关闭
    editUserClosed () {
      this.$refs.editUserFormRef.resetFields()
    },
    // 删除用户提示框
    async deleteUser (id) {
      const ret = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (ret !== 'confirm') {
        return this.$message.info('取消删除！')
      }
      const { data: res } = await this.$http.delete(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.getUserList()
      return this.$message.success('删除成功！')
    },
    // 显示修改权限对话框
    async showDirstributeroleDialog (role) {
      this.userInfo.id = role.id
      this.userInfo.username = role.username
      this.userInfo.role_name = role.role_name
      // 获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      this.rolesList = res.data
      this.distributeRoleVisible = true
    },
    // 保存用户修改的权限
    async saveRoleInfo () {
      if (!this.selectedRoleId) return this.$message.error('请选择需要修改的权限!')
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })
      console.log(this.userInfo.id, this.selectedRoleId)
      if (res.meta.status !== 200) return this.$message.error('修改失败')
      this.distributeRoleVisible = false
      this.getUserList()
      this.$message.success('修改成功!')
    },
    // 关闭时清除已选择的id
    clearSelectedRoleId () {
      this.selectedRoleId = ''
      this.userInfo = []
    }
  }
}
</script>

<style scoped>

</style>
