<template>
  <div class="main">
    <div
      v-for="(item, index) in list"
      :key="index"
      :style="'background:' + item.color"
      class="card"
      @click="handleClick(index)"
    >
      {{ item.title }}
    </div>
    <router-view />
  </div>
</template>

<script>

export default {
  name: "entry",
  data() {
    return {
      list: [
        {
          title: "知识图谱探索",
          color: "#5AA8A0",
        },
        {
          title: "知识图谱维护",
          color: "#1066CC",
        },
        {
          title: "智能问答示例",
          color: "#7D78C8",
        },
        // {
        //   title: "预案处置知识补充",
        //   color: "#C1B5B1",
        // },
      ]
    };
  },
   created() {
    !(function () {
      var timer,
        rem = function rem() {
          document.querySelector("html").style.fontSize =
            parseInt((window.innerWidth / 1920) * 100) + "px";
          // handleScreen()
          console.log(window.innerWidth);
        };
      // function handleScreen() {
      //   const m = detectZoom();
      //   document.body.style.zoom = 100 / Number(m);
      // }
      // function detectZoom() {
      //   let ratio = 0,
      //     screen = window.screen,
      //     ua = navigator.userAgent.toLowerCase();
      //   if (window.devicePixelRatio !== undefined) {
      //     ratio = window.devicePixelRatio;
      //   } else if (~ua.indexOf("msie")) {
      //     if (screen.deviceXDPI && screen.logicalXDPI) {
      //       ratio = screen.deviceXDPI / screen.logicalXDPI;
      //     }
      //   } else if (
      //     window.outerWidth !== undefined &&
      //     window.innerWidth !== undefined
      //   ) {
      //     ratio = window.outerWidth / window.innerWidth;
      //   }
      //   if (ratio) {
      //     ratio = Math.round(ratio * 100);
      //   }
      //   return ratio;
      // }
      // window.onresize = function(){
      // 	handleScreen()
      // }
      window.addEventListener("resize", function () {
        if (window.innerWidth >= 1200) {
          timer && clearTimeout(timer);
          timer = setTimeout(rem, 100);
        }
      });
      rem();
    })();
  },
  methods: {
    handleClick(index) {
      if (index === 1) {
        this.$router.push({
          name: "graph",
          params:{
            type:'edit'
          }
        });
      } else if (index === 2) {
        this.$router.push({
          name: "planadmin",
        });
      } else if(index === 0) {
        this.$router.push({
          name: "graph",
          params:{
            type:'default'
          }
        })
      } 
      else {
        this.$router.push({
          name: "graph",
          params:{
            type:'edit'
          }
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.main {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: absolute;
  // top: -0.7rem;
  bottom: 0;
  left: 0;
  right: 0;
}
.card {
  width: 2.88rem;
  height: 1.67rem;
  border-radius: 8px;
  font-size: .18rem;
  line-height: 1.67rem;
  color: #fff;
  text-align: center;
  cursor: pointer;
  // font-family: Roboto;
}
</style>