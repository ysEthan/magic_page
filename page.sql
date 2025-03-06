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




"04 商品管理============================="
git checkout -b b04_product
git add . && git commit -m "b04_product" && git push


"05 生产管理============================="
git checkout -b b05_production
git add . && git commit -m "b05_production" && git push

git add . && git commit -m "test" && git checkout b04_product && git branch -D b05_production