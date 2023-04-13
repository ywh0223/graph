<template>
  <el-select
    @change="handleSelect"
    v-model="value"
    filterable
    remote
    placeholder="请输入关键词"
    :remote-method="getEntityByKeywordAndCategory"
    :loading="loading"
  >
    <el-option
      v-for="item in options"
      :key="item.rowKey"
      :label="item.entityName"
      :value="item.entityName"
    >
    </el-option>
  </el-select>
</template>

<script>
import { eksApi } from "@/api";
export default {
  name: "SearchEntity",
  data() {
    return {
      value: "",
      options: [],
      loading: false,
      currentPage: 0,
      pageSize: 20,
    };
  },
  props: {
    entityType: {
      type: String,
      default: "",
    },
  },
  methods: {
    async getEntityByKeywordAndCategory(query) {
      if (query !== "") {
        this.loading = true;
        const _params = {
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          keyword: query,
          entityType: this.entityType,
        };
        let res = await eksApi.getEntityByKeywordAndCategory(_params);
        if (res.data.code == "200") {
          this.loading = false;
          this.options = res.data.data.content;
        }
      } else {
        this.options = [];
      }
    },
    handleSelect(item) {
      this.$emit("selectEntity", item);
    }
  },
};
</script>

<style>
</style>