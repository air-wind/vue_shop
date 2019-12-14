<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--角色权限卡片区-->
    <el-card>
      <!--添加角色按钮区-->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!--角色列表区-->
      <el-table :data="rolesList" border stripe>
        <!--展开页-->
        <el-table-column type="expand">
          <template slot-scope="scope">
             <el-row
               v-for="(item1, index1) in scope.row.children"
               :key="item1.id"
               :class="['borderbottom', index1 === 0 ? 'bordertop': '']"
               class="vcenter"
             >
               <!--一级权限-->
               <el-col :span="5">
                 <el-tag closable @close="removeRightById(scope.row, item1.id)">
                   {{item1.authName}}
                 </el-tag>
                 <i class="el-icon-caret-right"></i>
               </el-col>
               <!--二级和三级权限-->
               <el-col :span="19">
                 <el-row
                   v-for="(item2, index2) in item1.children"
                   :key="item2.id"
                   :class="[index2 !== 0 ? 'bordertop': '']"
                   class="vcenter"
                 >
                   <!--二级权限-->
                   <el-col :span="6">
                     <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">
                       {{item2.authName}}
                     </el-tag>
                     <i class="el-icon-caret-right"></i>
                   </el-col>
                   <!--三级权限-->
                   <el-col :span="18">
                     <el-tag
                       closable
                       type="warning"
                       @close="removeRightById(scope.row, item3.id)"
                       v-for="item3 in item2.children"
                       :key="item3.id"
                     >
                       {{item3.authName}}
                     </el-tag>
                   </el-col>
                 </el-row>
               </el-col>
             </el-row>
          </template>
        </el-table-column>
        <!--索引页-->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" prop="level" width="290px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showPowerDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--角色权限分配dialog-->
    <el-dialog
      title="分配权限"
      :visible.sync="distrivutePowerVisible"
      width="50%"
      @close="clearDefaultCheckedKeys"
    >
      <!--权限树-->
      <el-tree
        :data="powerTreeList"
        :props="powerProps"
        node-key="id"
        :default-checked-keys="defaultCheckedKeys"
        ref="powerTreeRef"
        default-expand-all
        show-checkbox
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="distrivutePowerVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRolePower">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  created () {
    this.getRolesList()
  },
  data () {
    return {
      // Roles列表
      rolesList: [],
      // 分配权限dialog是否可视
      distrivutePowerVisible: false,
      // 权限tree数据
      powerTreeList: [],
      // 权限tree节点配置
      powerProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中节点
      defaultCheckedKeys: [],
      // 当前用户id
      roleId: ''
    }
  },
  methods: {
    // 获取Roles列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      this.rolesList = res.data
    },
    // 删除Role
    async removeRightById (roleData, rightId) {
      const choice = await this.$confirm('此操作将永久删除此权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (choice !== 'confirm') return this.$message.info('取消了此操作')
      // 发送删除请求
      const { data: res } = await this.$http.delete(`roles/${roleData.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功!')
      roleData.children = res.data
    },
    // 打开分配权限列表
    async showPowerDialog (roles) {
      this.roleId = roles.id
      // 获取权限tree数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      this.powerTreeList = res.data
      // 递归获取所用三级节点
      this.getAllCheckedKeys(roles, this.defaultCheckedKeys)
      // 打开对话框
      this.distrivutePowerVisible = true
    },
    // 递归获取所用三级节点
    getAllCheckedKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getAllCheckedKeys(item, arr))
    },
    // 清空当前用户的默认选中节点
    clearDefaultCheckedKeys () {
      this.defaultCheckedKeys = []
    },
    // 角色授权
    async addRolePower () {
      const isStr = [
        ...this.$refs.powerTreeRef.getCheckedKeys(),
        ...this.$refs.powerTreeRef.getHalfCheckedKeys()
      ].join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: isStr
      })
      if (res.meta.status !== 200) return this.$message.error('修改失败！')
      this.distrivutePowerVisible = false
      this.getRolesList()
      this.$message.success('修改成功')
    }
  }
}
</script>

<style lang="less" scoped>
  .el-tag{
    margin: 7px;
  }
  .bordertop{
    border-top: 1px solid #eee;
  }
  .borderbottom{
    border-bottom: 1px solid #eee;
  }
  .vcenter{
    display: flex;
    align-items: center;
  }
</style>
