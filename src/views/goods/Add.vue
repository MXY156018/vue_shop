<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card>
      <!--提示区域-->
      <el-alert
              title="添加商品信息"
              type="info"
              center
              show-icon
              :closable="false">
      </el-alert>
      <!--步骤条-->
      <el-steps :space="200" :active="activeIndex - 0"
                finish-status="success"
                align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品照片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      
      </el-steps>
      <!--Form表单-->
      <el-form :model="addForm"
               :rules="addFormRules"
               ref="addFormRef"
               label-width="100px"
               label-position="top">
        <!--tab栏-->
        <el-tabs v-model="activeIndex"
                 :tab-position="'left'"
                 :before-leave="beforeTabLeave"
                 @tab-click="tabClick">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                      v-model="addForm.goods_cat"
                      :options="cateList"
                      :props="{ expandTrigger: 'hover' ,
                      label:'cat_name',
                      value:'cat_id',
                      children:'children',
                      }"
                      
                      @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!--渲染表单的item项-->
            <el-form-item v-for="item in manyTableData"
                          :key="item.attr_id"
                          :label="item.attr_name">
              <!--复选框-->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb"
                             v-for="(cb,index) in item.attr_vals"
                             :key="index"
                             border>
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name"
                          v-for="item in onlyTableData"
                          :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!--action:图片要上传的后台api地址-->
            <!--preview:图片预览-->
            <!--list-type:图片渲染的方式-->
            <el-upload
                    action="http://127.0.0.1:8888/api/private/v1/upload"
                    :on-preview="handlePreview"
                    :on-remove="handleRemove"
                    :headers="headerObj"
                    :on-success="handleSuccess"
                    list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
            
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!--富文本编辑器组件-->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btn_Add" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!--图片预览-->
    <el-dialog
            title="图片预览"
            :visible.sync="previewVisible"
            width="50%"
    >
      <span><img :src="previewPath" alt="" class="previewImg"></span>
    
    </el-dialog>
  </div>
</template>

<script>
  import _ from 'lodash'
  
  export default {
    name: 'Add',
    data() {
      return {
        activeIndex: '0',
        addForm: {        //添加商品的数据表单对象
          goods_name: '',
          goods_price: 0,
          goods_weight: 0,
          goods_number: 0,
          goods_cat: [],           //商品所属分类数组
          pics: [                    //图片路径数组
          
          ],
          goods_introduce: '',       //商品详情描述
          attrs: [                   //
          
          ]
        },
        addFormRules: {     //表单校验规则
          goods_name: [
            { required: true, message: '请输入商品名称', trigger: 'blur' }
          ],
          goods_price: [
            { required: true, message: '请输入商品价格', trigger: 'blur' }
          ],
          goods_weight: [
            { required: true, message: '请输入商品重量', trigger: 'blur' }
          ],
          goods_number: [
            { required: true, message: '请输入商品数量', trigger: 'blur' }
          ],
          goods_cat: [
            { required: true, message: '请输入商品分类', trigger: 'blur' }
          ]
        },
        cateList: [],       //商品分类列表
        manyTableData: [],    //动态参数数组
        onlyTableData: [],     //静态属性数组
        headerObj: {            //图片上传的请求头
          Authorization: window.sessionStorage.getItem('token')
        },
        previewPath: '',         //预览图片的地址图片
        previewVisible: false   //控制预览图片对话框的显示隐藏
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      //获取商品分类
      async getCateList() {
        const { data: res } = await this.$http.get('categories')
        if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
        this.cateList = res.data
      },
      //级联选择器变化,触发此函数
      handleChange() {
        if (this.addForm.goods_cat.length !== 3) {
          this.addForm.goods_cat = []
        }
        console.log(this.addForm.goods_cat)
      },
      beforeTabLeave(activeName, oldActiveName) {
        if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
          this.$message.error('请选择商品分类')
          return false
        }
      },
      //tab标签点击时触发
      async tabClick() {
        
        if (this.activeIndex === '1') {//证明访问的是动态参数面板
          const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
            { params: { sel: 'many' } })
          if (res.meta.status !== 200) return this.$message.error('获取动态参数失败')
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
          })
          this.manyTableData = res.data
        } else if (this.activeIndex === '2') {
          const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
            { params: { sel: 'only' } })
          if (res.meta.status !== 200) return this.$message.error('获取静态属性失败')
          this.onlyTableData = res.data
        }
      },
      //图片预览
      handlePreview(file) {
        this.previewPath = file.response.data.url
        this.previewVisible = true
      },
      //处理移除图片
      handleRemove(file, fileList) {
        const filePath = file.response.data.tmp_path
        const i = this.addForm.pics.findIndex(x =>
          x.pic === filePath
        )
        this.addForm.pics.splice(i, 1)
        
      },
      //监听图片上传成功的事件
      handleSuccess(response) {
        //1、拼接得到一个图片信息对象
        const picInfo = {
          pic: response.data.tmp_path
        }
        //2、将图片信息对象push到pics数组中
        this.addForm.pics.push(picInfo)
        
      },
      //添加商品按钮
      add() {
        this.$refs.addFormRef.validate( async valid => {
          if (!valid) return this.$message.error('请填写需要的表单项')
          //1、执行添加的逻辑
          //1、1 把数组改为以','分割的字符串
          //lodash   cloneDeep(obj)
          const form = _.cloneDeep(this.addForm)
          form.goods_cat = form.goods_cat.join(',')
          //处理动态参数
          this.manyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' ')
            }
            this.addForm.attrs.push(newInfo)
          })
          //处理静态属性
          this.onlyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            this.addForm.attrs.push(newInfo)
          })
          form.attrs = this.addForm.attrs
          //发起添加商品的请求
          
          
          console.log(form)
          const {data:res} = await this.$http.post('goods',form)
          console.log(res)
          if(res.meta.status!==201) return this.$message.error('添加商品失败')
          this.$message.success('添加商品成功')
          this.$router.push('/goods')
        })
      }
    },
    computed: {
      cateId() {
        if (this.addForm.goods_cat.length === 3) {
          return this.addForm.goods_cat[2]
        }
        return null
      }
    }
  }
</script>

<style scoped>
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }
  
  .previewImg {
    height: 100%;
    width: 100%;
  }
</style>