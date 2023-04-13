<template>
  <div>
    <GraphHeader class="graph-header"></GraphHeader>
    <div class="main">
      <router-view></router-view>
    </div>
    <!-- <Footer></Footer> -->
  </div>
</template>

<script>
import GraphHeader from "@/components/GraphHeader";
// import Footer from "@/components/Footer";
export default {
  name: "graphentry",
  components: {
    GraphHeader,
    // Footer,
  },
  computed: {
    key() {
      return this.$route.name !== undefined? this.$route.name + +new Date(): this.$route + +new Date()
    }
    // 保证路由切换时都会重新渲染触发钩子了
  },
  data() {
    return {
      height:0
    };
  },
  created(){
    this.height = document.documentElement.clientHeight - 65
  },
  methods:{
    handleClick(index){
      if (index === 1) {
        this.$router.push({
          name:'graph'
        })
      } else if (index === 0) {
        this.$router.push({
          name:'planadmin'
        })
      }
    }
  }
};
</script>

<style lang="scss" scoped>

.main {
  width: 100%;
  overflow: auto;
  margin-top: .7rem;
  margin-bottom: 60px;
}
.graph-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
}
</style>