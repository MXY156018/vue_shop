<template>
    <div>
        <!--面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图区域-->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加商品分类</el-button>
                </el-col>
            </el-row>
            <!--表格-->
            <tree-table :data="cateList"
                        :columns="columns"
                        :selection-type="false"
                        :expand-type="false"
                        show-index
                        index-text="#"
                        border
                        class="treeTable"

            >
                <!-- 是否有效 -->
                <template v-slot:isOk="scope">
                    <i class="el-icon-success"
                       v-if="scope.row.cat_deleted===false"
                       style="color: lightgreen"></i>
                    <i class="el-icon-error" v-else
                       style="color: #ff0000"></i>
                </template>
                <!-- 排序 -->
                <template v-slot:order="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
                    <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
                    <el-tag type="warning" size="mini" v-else>三级</el-tag>
                </template>
                <!-- 操作 -->
                <template v-slot:opt="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                </template>
            </tree-table>
            <!--分页区域--->
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum"
                    :page-sizes="[3, 5, 10, 15]"
                    :page-size="queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total=total>
            </el-pagination>
        </el-card>
        <el-dialog
                title="添加分类"
                :visible.sync="addCateDialogVisible"
                width="50%"
                @close="addCateDialogClose"
        >
            <span>
                <!--添加分类的表单-->
                <el-form :model="addCateForm" :rules="addCateFormRules"
                         ref="addCateFormRef"
                         label-width="100px"
                         class="demo-ruleForm">
                      <el-form-item label="分类名称" prop="cat_name">
                        <el-input v-model="addCateForm.cat_name"></el-input>
                      </el-form-item>
                    <el-form-item label="父级分类">
                        <el-cascader
                                v-model="selectedKeys"
                                :options="parentCateList"
                                :props="{ expandTrigger: 'hover',
                                value:'cat_id',
                                label:'cat_name',
                                children:'children',
                                checkStrictly: true}"
                                clearable
                                @change="parentCateChanged">
                        </el-cascader>
                      </el-form-item>
                </el-form>
            </span>

            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>

<script>
  export default {
    name: 'Cate',
    data() {
      return {
        //查询条件
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        //商品分类的数据列表
        cateList: [],
        total: 0,   //总数据条数
        //为table指定列的定义
        columns: [
          {
            label: '分类名称',
            prop: 'cat_name'

          },
          {
            label: '是否有效',
            type: 'template',    //将当前列设置为自定义模板列
            template: 'isOk'     //模板名称
          },
          {
            label: '排序',
            type: 'template',    //将当前列设置为自定义模板列
            template: 'order'     //模板名称
          },
          {
            label: '操作',
            type: 'template',    //将当前列设置为自定义模板列
            template: 'opt'     //模板名称
          }
        ],
        addCateDialogVisible: false,  //控制添加分类对话框的显示与隐藏
        addCateForm: {
          cat_name: '',     //将要添加的分类的名称
          cat_pid: 0,     //默认分类ID
          cat_level: 0     //默认分类等级

        },
        addCateFormRules: {
          cat_name: [
            { required: true, message: '请输入分类名称', trigger: 'blur' }
          ]
        },
        parentCateList: [],   //父级分类的列表
        cascaderProps: {       //指定级联选择器的配置对象
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        selectedKeys: []       //选中的父级分类的ID数组
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      async getCateList() {
        const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
        if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
        console.log(res)
        this.cateList = res.data.result  //数据列表赋值给catelist
        this.total = res.data.total      //总数据条数
      },
      //监听pagesize变化
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getCateList()
      },
      //监听pagenum变化
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getCateList()
      },
      //点击按钮显示添加分类的对话框
      showAddCateDialog() {
        //先获取父级分类的列表
        this.getParentCateList()
        //展示出对话框
        this.addCateDialogVisible = true
      },
      //获取父级分类的数据列表
      async getParentCateList() {
        const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
        if (res.meta.status !== 200) return this.$message.error('获取父级分类失败')
        this.parentCateList = res.data
      },
      //选择项发生变化时触发
      parentCateChanged() {
        console.log(this.selectedKeys)
        //如果this.selectedKeys的长度>0说明选择了分类
        if (this.selectedKeys.length > 0) {
          //父级分类ID
          this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
          //为当前分类等级赋值
          this.addCateForm.cat_level = this.selectedKeys.length
        } else {
          this.addCateForm.cat_pid = 0
          //为当前分类等级赋值
          this.addCateForm.cat_level = 0
        }
      },
      //点击确定按钮
      addCate() {
        console.log(this.addCateForm)
        this.$refs.addCateFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post('categories', this.addCateForm)
          if (res.meta.status !== 201) return this.$message.error('添加分类失败')
          this.$message.success('添加分类成功')
          await this.getCateList()
          this.addCateDialogVisible = false
        })
      },
      //监听添加分类的关闭事件，重置表单
      addCateDialogClose() {
        this.$refs.addCateFormRef.resetFields()
        this.selectedKeys = []
        this.addCateForm.cat_level = 0
        this.addCateForm.cat_level = 0
      }
    }
  }
</script>

<style scoped>
    .treeTable {
        margin-top: 20px;
    }

    .el-cascader {
        width: 100%;
    }

</style>