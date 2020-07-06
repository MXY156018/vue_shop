<template>

    <el-container class="home-container">
        <!--头部区域-->
        <el-header>
            <div>
                <img src="../../assets/imgs/heima.png" alt="">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <!--页面主体区域-->
        <el-container>
            <el-aside :width="isCollapse?'64px':'200px'">
                <div class="toggle-button" @click="toggleCollapse">
                    |||
                </div>
                <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff"
                         :unique-opened="true" :collapse="isCollapse" :collapse-transition="false"
                         :router="true" router default-active="activePath">
                    <!-- 一级菜单 -->
                    <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
                        <!--一级菜单的模板区域-->
                        <template slot="title">
                            <!--图标-->
                            <i :class="iconsObject[item.id]"></i>
                            <!--文本-->
                            <span>{{item.authName}}</span>
                        </template>
                        <!--二级菜单-->
                        <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id"
                                      @click="saveNavStatus('/'+subItem.path)">
                            <!--二级菜单的模板区域-->
                            <template slot="title">
                                <!--图标-->
                                <i class="el-icon-menu"></i>
                                <!--文本-->
                                <span>{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>

                    </el-submenu>
                </el-menu>
            </el-aside>
            <el-main>
                <!--路由占位符-->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>


</template>

<script>
    export default {
        name: "index",
        created() {
            this.getMenuList();
            this.activePath = window.sessionStorage.getItem('activePath')
        },
        data() {
            return {
                menulist: [],
                iconsObject: {
                    '125': 'iconfont icon-user',
                    '103': 'iconfont icon-tijikongjian',
                    '101': 'iconfont icon-shangpin',
                    '102': 'iconfont icon-danju',
                    '145': 'iconfont icon-baobiao'
                },
                //是否折叠菜单
                isCollapse: false,

                activePath: ''
            }
        },
        methods: {
            logout() {
                window.sessionStorage.clear();
                this.$router.push('/login');
            },
            //获取所有菜单
            async getMenuList() {
                const {data: res} = await this.$http.get('menus');
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
                this.menulist = res.data;
            },
            //点击按钮切换菜单的折叠和展开
            toggleCollapse() {
                this.isCollapse = !this.isCollapse;
            },
            saveNavStatus(activePath) {
                this.activePath = activePath;
                window.sessionStorage.setItem('activePath', activePath);
            }
        }
    }
</script>

<style scoped>
    .home-container {
        height: 100%;
    }

    .el-header {
        background-color: #343d41;
        display: flex;
        justify-content: space-between;
        padding-left: 0;
        align-content: center;
        color: #fff;
        font-size: 20px;
    }

    .el-header > div {
        display: flex;
        align-items: center;
    }

    .el-header > div > span {
        margin-left: 15px;
    }

    .el-aside {
        background-color: #333744;

    }

    .el-menu {
        border-right: none;

    }

    .el-main {
        background-color: #EAEDF1;
    }

    .iconfont {
        padding-right: 10px;
    }

    .toggle-button {
        background-color: #4a5064;
        font-size: 10px;
        line-height: 24px;
        color: #fff;
        text-align: center;
        letter-spacing: 0.2em;
        cursor: pointer;
    }
</style>