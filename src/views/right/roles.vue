<template>
    <div>
        <!--面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--        卡片视图-->
        <el-card>
            <!--            添加角色列表区域-->
            <el-row>
                <el-col>
                    <el-button type="primary">添加角色</el-button>
                </el-col>
            </el-row>

            <el-table :data="roleList" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom',index1===0?'bdtop':'','vcenter']"
                                v-for="(item1, index1) in scope.row.children" :key="item1.id">
                            <!--渲染一级权限-->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}
                                </el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级三级权限-->
                            <el-col :span="19">
                                <el-row :class="[index2===0?'':'bdtop','vcenter']"
                                        v-for="(item2,index2) in item1.children"
                                        :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag closable @close="removeRightById(scope.row,item2.id)" type="success">
                                            {{item2.authName}}
                                        </el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag closable @close="removeRightById(scope.row,item3.id)" type="warning"
                                                v-for="(item3,index3) in item2.children" :key="item3.id">
                                            {{item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>

                    </template>
                </el-table-column>
                <el-table-column align="center" type="index"></el-table-column>
                <el-table-column align="center" label="角色名称" prop="roleName"></el-table-column>
                <el-table-column align="center" label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column align="center" label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting"
                                   @click="showSetRightDialog(scope.row)">编辑权限
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!--分配权限对话框-->
        <el-dialog
                title="分配权限"
                :visible.sync="setRightDialogVisible"
                width="50%"
                @close="defKeys=[]"
        >
            <!--树形控件-->
            <el-tree :data="rightsList" :props="treeProps"
                     ref="treeRef"
                     show-checkbox
                     node-key="id"
                     default-expand-all
                     :default-checked-keys="defKeys"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click=" allotRights">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>

<script>
  export default {
    name: 'roles',
    data() {
      return {
        //所有角色列表数据
        roleList: [],
        //控制分配权限对话框的显示隐藏
        setRightDialogVisible: false,
        //所有权限列表
        rightsList: [],
        //树形控件的属性绑定对象
        treeProps: {
          label: 'authName',
          children: 'children'
        },
        defKeys: [],
        roleId: ''
      }
    },
    created() {
      this.getRolesList()
    },
    methods: {
      async getRolesList() {
        const { data: res } = await this.$http.get('roles')
        if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
        this.roleList = res.data
      },
      removeRightById(role, rightId) {
        this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
          console.log(res)
          if (res.meta.status !== 200) return this.$message.error('删除权限失败')
          this.$message.success('删除权限成功')
          role.children = res.data
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })

        })
      },
      //展示分配权限的对话框
      async showSetRightDialog(role) {
        //获取多有权限的列表
        const { data: res } = await this.$http.get('rights/tree')
        if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
        this.rightsList = res.data    //获取到的权限列表
        this.roleId = role.id
        this.getLeafKeys(role, this.defKeys)
        this.setRightDialogVisible = true
      },
      //通过递归的形式获取角色下所有三级权限下的id并保存到数组中
      getLeafKeys(node, arr) {

        //如果当前node节点不包含children属性
        // 则是三级节点
        if (!node.children) {
          return arr.push(node.id)
        }
        node.children.forEach(item =>
          this.getLeafKeys(item, arr))
      },
      async allotRights() {
        // console.log(this.$refs.treeRef.getCheckedKeys());
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        // console.log(keys)
        const idStr = keys.join(',')

        const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
        if (res.meta.status !== 200) return this.$message.error('分配权限失败')
        this.$message.success('分配权限成功')
        await this.getRolesList()
        this.setRightDialogVisible = false
      }
    }

  }
</script>

<style scoped>
    .el-tag {
        margin: 7px;
    }

    .bdtop {
        border-top: 1px solid #eee;
    }

    .bdbottom {
        border-bottom: 1px solid #eee;
    }

    .vcenter {
        display: flex;
        align-items: center;
    }
</style>