<template>
  <div class="container">
    <div class="logo"><img src="@/assets/logo@3x.png" alt=""></div>
    <div class="right">
      <div><i class="el-icon-search"></i></div>
      <div><i class="el-icon-bell"></i></div>
      <div><i class="el-icon-user"></i></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "GraphHeader"
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  justify-content: space-between;
  text-align: left;
  font-size: .18rem;
  color: #FFF;
  background-color: #001529;
  height: .7rem;
  line-height: .7rem;
  padding-right: .2rem;
  box-shadow: 0px 1px 4px 0px #ccc;
  align-items: center;
  .right {
    display: flex;
  }
  i {
    margin-right: .2rem;
  }
  .el-icon-user {
    margin-right: 0;
  }
  .logo {
    height: .5rem;
    margin-left: 0.1rem;
    text-align: center;
    background-color: #001529;
    img {
      // width: 100%;
      height: 100%;
    }
  }
}
</style>