<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!--警告区域-->
      <el-alert
              title="注意：只允许为第三级分类设置参数！"
              type="warning"
              :closable="false"
              show-icon>
      </el-alert>
      <!--选择商品分类区域-->
      <el-row class="catObj">
        <el-col>
                    <span>
                        选择商品分类：
                    </span>
          <!--选择商品分类的级联选择框-->
          <el-cascader
                  v-model="selectedCateKeys"
                  :options="cateList"
                  :props="{ expandTrigger: 'hover',
                            value:'cat_id',
                            label:'cat_name',
                            children:'children'
                            }"
                  @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <!--tab页签区域-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!--添加动态参数的面板-->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">
            添加参数
          </el-button>
          <!--动态参数表格-->
          <el-table :data="manyTableData" border stripe>
            <!--展开行-->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!--循环渲染tag标签-->
                <el-tag v-for="(item,index) in scope.row.attr_vals"
                        :key="index" closable
                        @close="handleClose(index,scope.row)"
                >{{item}}
                </el-tag>
                <!--input输入框-->
                <el-input
                        class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)"
                
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <!--分页区域-->
          
        </el-tab-pane>
        <!--添加静态属性的面板-->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">
            添加属性
          </el-button>
          <!--静态属性表格-->
          <el-table :data="onlyTableData" border stripe>
            <!--展开行-->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!--循环渲染tag标签-->
                <el-tag v-for="(item,index) in scope.row.attr_vals"
                        :key="index" closable
                        @close="handleClose(index,scope.row)"
                >{{item}}
                </el-tag>
                <!--input输入框-->
                <el-input
                        class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)"
                
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--添加参数对话框-->
    <el-dialog
            :title="'添加'+titleText"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed">
      <!--添加参数的对话框-->
      <el-form :model="addForm" :rules="addFormRules"
               ref="addFormRef"
               label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改参数的对话框-->
    <el-dialog
            :title="'修改'+titleText"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed">
      <!--添加参数的对话框-->
      <el-form :model="editForm" :rules="editFormRules"
               ref="editFormRef"
               label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        cateList: [],
        cateProps: {
          label: 'cat_id',
          value: 'cat_name',
          children: 'children'
        },
        selectedCateKeys: [],
        activeName: 'many',
        manyTableData: [],
        onlyTableData: [],
        addDialogVisible: false,
        addForm: {     //添加参数的表单数据对象
          attr_name: ''
        },
        addFormRules: {  //添加表单验证规则对象
          attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
        },
        editDialogVisible: false,      //控制修改参数对话框的显示隐藏
        editForm: {                 //修改的表单对象
        
        },
        //修改表单的验证规则对象
        editFormRules: {
          attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
        }
        
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      //获取所有的商品分类列表
      async getCateList() {
        const { data: res } = await this.$http.get('categories')
        if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
        this.cateList = res.data
        
      },
      //级联选择框选中调用
      handleChange() {
        
        this.getParamsData()
      },
      async getParamsData() {
        //如果选中的不是三级分类
        if (this.selectedCateKeys.length !== 3) {
          this.selectedCateKeys = []
          this.manyTableData = []
          this.onlyTableData = []
          return
        }
        //根据所选分类的ID  和当前所处的面板  获取参数列表
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
          { params: { sel: this.activeName } })
        if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          //控制文本框的显示与隐藏
          item.inputVisible = false
          item.inputValue = ''
        })
        
        if (this.activeName === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      },
      //tab页签点击事件
      handleTabClick() {
        this.getParamsData()
      },
      //监听对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      //点击按钮添加参数
      addParams() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`,
            {
              attr_name: this.addForm.attr_name,
              attr_sel: this.activeName
            })
          if (res.meta.status !== 201) return this.$message.error('添加参数失败')
          this.$message.success('添加参数成功')
          this.addDialogVisible = false
          await this.getParamsData()
        })
      },
      //点击按钮,展示修改的对话框
      async showEditDialog(attr_id) {
        //查询当前参数的信息
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,
          { params: { attr_sel: this.activeName } })
        if (res.meta.status !== 200) return this.$message.error('获取参数信息失败!')
        this.editForm = res.data
        this.editDialogVisible = true
      },
      //重置修改表单
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      //修改参数按钮点击
      editParams() {
        
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
            {
              attr_name: this.editForm.attr_name,
              attr_sel: this.activeName
            })
          console.log(res)
          if (res.meta.status !== 200) return this.$message.error('修改参数失败')
          this.$message.success('修改参数成功')
          await this.getParamsData()
          this.editDialogVisible = false
        })
      },
      //删除参数  根据Id
      removeParams(attr_id) {
        this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
          if (res.meta.status !== 200) return this.$message.error('删除参数失败!')
          this.$message.success('删除参数成功')
          await this.getParamsData()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      //文本框失去焦点 获取点击了Enter键 都会触发
      async handleInputConfirm(row) {
        if (row.inputValue.trim().length === 0) {
          row.inputValue = ''
          row.inputVisible = false
          return
        }
        //如果没有return 则用户输入的内容需要后续处理
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        await this.saveAttrVals(row)
        
      },
      //将对attr_vals 的操作保存到数据库
      async saveAttrVals(row) {
        //发起请求保存本次操作
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
          {
            attr_name: row.attr_name,
            attr_sel: row.attr_sel,
            attr_vals: row.attr_vals.join(' ')
          })
        if (res.meta.status !== 200) return this.$message.error('修改参数项失败')
        this.$message.success('修改参数项成功')
      },
      //展示文本输入框
      showInput(role) {
        role.inputVisible = true
        //$nextTick 方法作用   当页面元素重新渲染之后  才会执行回调函数中的代码
        this.$nextTick(_ => {    //让文本框自动获得焦点
          this.$refs.saveTagInput.$refs.input.focus()
        })
      },
      //删除对应的参数可选项
      handleClose(index, row) {
        row.attr_vals.splice(index, 1)
        this.saveAttrVals(row)
      }
    },
    computed: {
      //如果选择的分类等级不是三级   禁用添加button
      isBtnDisabled() {
        if (this.selectedCateKeys.length !== 3) {
          return true
        }
        return false
      },
      //当前选中的三级分类的ID
      cateId() {
        if (this.selectedCateKeys.length === 3) {
          return this.selectedCateKeys[2]
        }
        return null
      },
      titleText() {
        if (this.activeName === 'many') {
          return '动态参数'
        } else {
          return '静态属性'
        }
      }
    }
  }
</script>

<style scoped>
  .catObj {
    margin: 15px 0;
  }
  
  .el-tag {
    margin: 8px;
  }
  
  .input-new-tag {
    width: 100px;
  }
</style>