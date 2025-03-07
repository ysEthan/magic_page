"00 创建项目============================="
npm create vue@3.14.1
--关联远程仓库
	git init && git add . && git commit -m "first commit" && git branch -M main && git remote add origin https://github.com/ysEthan/magic_page.git && git push -u origin main

"01 提交默认分支============================="
git checkout -b b01_init
git add . && git commit -m "init" && git push

npm install
npm run dev




"03 用户认证============================="
git checkout -b b03_user_auth
git add . && git commit -m "user_auth" && git push

我要搭建一个ERP系统，主要满足供应链管理、和生产管理的需求，采用前后端分离的架构来设计。
本项目是基于Vue3框架的前端项目，后端采用Django框架

系统主要包含：用户认证、商品管理、生产管理，采购管理、库存管理、销售管理、物流管理。以及一些报表页面

注意，我们已经在Vue的项目根目录下，后端已经完成了用户认证功能，接下来，让我们在前端也实现用户认证相关的功能

以下是关于后端接口的说明文档，

以下是Django用户认证相关的模型文件：
以下是Django用户认证相关的视图函数：



"04 商品管理============================="
git checkout -b b04_product
git add . && git commit -m "b04_product" && git push


我们已经完成了用户认证的部分

接下来，我们要继续完成商品管理的部分，请先帮我新建4个基础的空白页面，品牌管理/分类管理/SPU管理/SKU管理，页面上暂时不需要任何内容

四个页面文件都放在views/product下即可，避免目录层级太多



"05 生产管理============================="
git checkout -b b05_production
git add . && git commit -m "b05_production" && git push

git add . && git commit -m "test" && git checkout b04_product && git branch -D b05_production