<template>
  <div class="container">
    <div class="main">
      <div class="header">
        <el-button type="primary" @click="$router.push({ name: 'index' })"
          >隐藏</el-button
        >
        <el-input
          placeholder="请输入内容"
          suffix-icon="el-icon-search"
          v-model="searchInput"
          @change="getPlanProcessInfo(0, pageSize, searchInput)"
        >
        </el-input>
      </div>
      <el-table
        :data="tableData"
        style="width: 100%"
        :header-row-style="{ color: '#101010', fontWeight: 'bold' }"
      >
        <el-table-column prop="planServiceType" label="业务类别" align="center">
        </el-table-column>
        <el-table-column label="预案名称" width="400" align="center">
          <template slot-scope="scope">
            <el-link type="primary" @click="handleTitleClick(scope.row)">{{
              scope.row.planTitle
            }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="planType" label="预案类型" align="center">
        </el-table-column>
        <el-table-column prop="processName" label="状态" align="center">
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" align="center">
        </el-table-column>
        <el-table-column prop="operate" label="操作" align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="handleClick(scope.row)"
              :disabled="
                scope.row.processStatus == -1 || scope.row.processStatus == -2
              "
              >{{ operateButton[scope.row.processStatus][0] }}</el-button
            >
            <el-button
              type="text"
              style="color: red"
              size="small"
              v-if="operateButton[scope.row.processStatus].length > 1"
              @click="handleDelete(scope.row)"
              >{{ operateButton[scope.row.processStatus][1] }}</el-button
            >
            <el-button
              type="text"
              size="small"
              v-if="operateButton[scope.row.processStatus].length > 1"
              @click="handleSubmit(scope.row)"
              >{{ operateButton[scope.row.processStatus][2] }}</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        class="page-pagination"
        layout="prev, pager, next"
        background
        :page-count="totalPages"
        :page-size="pageSize"
        @next-click="nextPage"
        @prev-click="prevPage"
        @current-change="gotoPage"
      ></el-pagination>
      <!-- 弹窗 -->
      <el-dialog
        :visible.sync="dialogTableVisible"
        :center="true"
        destroy-on-close
      >
        <div slot="title" class="dialog-title">
          {{ currentTableRow && currentTableRow.planTitle }}
        </div>
        <div slot="title" class="dialog-title">政府机构</div>
        <div style="width: 100%; text-align: right">
          <el-select
            v-model="syncFlag"
            placeholder="状态"
            style="width: 10%"
            size="small"
            @change="getEntityAlignmentByFlag"
          >
            <el-option label="全部" :value="null"></el-option>
            <el-option label="未处理" value="0"></el-option>
            <el-option label="已确认" value="1"></el-option>
            <el-option label="已修改" value="2"></el-option>
            <el-option label="已删除" value="3"></el-option>
          </el-select>
          <el-input
            placeholder="请输入内容"
            suffix-icon="el-icon-search"
            v-model="dialogInput"
            style="width: 20%; margin-left: 10px"
            size="small"
            @change="getEntityAlignmentByFlag"
          >
          </el-input>
        </div>

        <el-table :data="gridData">
          <el-table-column
            property="_syncStatus"
            label="状态"
            width="150"
            align="center"
          ></el-table-column>
          <el-table-column
            property="entityName"
            label="机构名称"
            width="200"
            align="center"
          ></el-table-column>
          <el-table-column
            property="standardName"
            label="标准名称"
            align="center"
            width="300"
          >
            <template slot-scope="scope">
              <el-autocomplete
                v-model="scope.row.entityAlignmentReflection"
                :disabled="scope.row.syncFlag != 0"
                :fetch-suggestions="querySearch(scope.row)"
              ></el-autocomplete>
            </template>
          </el-table-column>
          <el-table-column property="opetate" label="操作" align="center">
            <template slot-scope="scope">
              <el-button
                type="text"
                size="small"
                @click="agencyEntityAlignment(scope.row, 'confirm')"
                :disabled="scope.row.syncFlag != 0"
                >{{
                  !scope.row.entityAlignmentReflection ? "确认" : "更改"
                }}</el-button
              >
              <el-button
                type="text"
                size="small"
                :disabled="scope.row.syncFlag != 0"
                @click="agencyEntityAlignment(scope.row, 'delete')"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          layout="prev, pager, next"
          :page-count="gridTotalPages"
          :page-size="gridPageSize"
          @next-click="nextGridPage"
          @prev-click="prevGridPage"
          @current-change="gotoGridPage"
          background
        ></el-pagination>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { eesApi } from "@/api";
export default {
  name: "planadmin",
  data() {
    return {
      currentPage: 0,
      pageSize: 10,
      totalPages: 0,
      input: "",
      tableData: [],
      operateButton: {
        0: ["编辑", "删除", "提交"],
        1: ["实体抽取"],
        2: ["知识抽取"],
        3: ["事件抽取"],
        4: ["实体详情"],
        5: ["图谱构建"],
        6: ["图谱查看"],
        "-1": ["分析中"],
        "-2": ["构建中"],
      },
      gridData: [],
      dialogTableVisible: false,
      currentTableRow: null,
      searchInput: "",
      dialogInput: "",
      syncFlag: null,
      gridCurrentPage: 0,
      gridPageSize: 5,
      gridTotalPages: 0,
    };
  },
  created() {
    this.getPlanProcessInfo(0, this.pageSize);
  },
  methods: {
    async getPlanProcessInfo(page, pageSize, keyWord = null) {
      try {
        let res = await eesApi.getPlanProcessInfo({
          page: page,
          pageSize: pageSize,
          keyWord: keyWord,
        });
        if (res.data.code == "200") {
          this.tableData = res.data.data;
          this.totalPages = res.data.data[0].totalPages;
        } else {
          this.$message.error(res.data.msg);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async getEntityAlignment(data,row) {
      console.log(row)
      try {
        let res = await eesApi.getEntityAlignment(data);
        if (res.data.code == "200") {
          if(!res.data.data.length) {
            row.processStatus = 5
          }
          this.gridData = res.data.data.map((item) => {
            if (item.syncFlag == 0) {
              item._syncStatus = "未处理";
            } else if (item.syncFlag == 1) {
              item._syncStatus = "已确认";
            } else if (item.syncFlag == 2) {
              item._syncStatus = "已更改";
            } else if (item.syncFlag == 3) {
              item._syncStatus = "已删除";
            }
            return item;
          });
          this.dialogTableVisible = true;
          if (res.data.data.length != 0) {
            this.gridTotalPages = res.data.data[0].totalPages;
          } else {
            this.gridTotalPages = 0;
          }
        } else {
          this.$message.error(res.data.msg);
        }
      } catch (error) {
        console.log(error);
      }
    },
    handleTitleClick(data) {
      this.$router.push({
        name: "addPlan",
        query: {
          planTitle: data.planTitle,
          processStatus: data.processStatus,
        },
      });
    },
    handleClick(data) {
      const status = data.processStatus;
      if (status == 0) {
        this.$router.push({
          name: "addPlan",
          query: {
            planTitle: data.planTitle,
            processStatus: data.processStatus,
          },
        });
      } else if (status == 1) {
        const _data = Object.assign({}, data);

        this.entityExtract(_data);
        // 获取实体对齐列表
      } else if (status == 2) {
        this.knowledgeExtract(data);
        // 知识抽取
      } else if(status == 3) {
        // 责任事件抽取
        this.dutyEventExtract(data)
      } else if (status == 4) {
        const _data = Object.assign({}, data);
        _data.keyWord = _data.planTitle;
        _data.currentPage = this.gridCurrentPage;
        _data.pageSize = this.gridPageSize;
        this.currentTableRow = _data;
        this.currentTableRow.sortName = "sync_flag";
        this.currentTableRow.search = this.dialogInput || null;
        this.currentTableRow.syncFlag = this.syncFlag;
        this.getEntityAlignment(this.currentTableRow,data);
      } else if (status == 5) {
        this.synchronizeDataToNeo4j(data)
      } else if (status == 6) {
        this.$router.push({
          name:'graph',
          params:{
            type:'default'
          },
          query:{
            planTitle:data.planTitle
          }
        })
      }
      
    },
    handleDelete(data) {
      console.log(data.planTitle);
      this.$confirm("确认删除？", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            let res = await eesApi.deletePlanContent(data.planTitle);
            console.log(res.data);
            if (res.data.code == "200") {
              this.getPlanProcessInfo(this.currentPage, this.pageSize);
              this.$message.success("删除成功");
            } else {
              this.$message.error(res.data.msg);
            }
          } catch (err) {
            this.$message.error("删除失败");
          }
        })
        .catch(() => {});
    },
    async initPlanContent(planTitle) {
      try {
        let res = await eesApi.initPlanContent({
          planTitle: planTitle,
        });
        if (res.data.code == "200") {
          this.$message.success(res.data.msg);
          this.getPlanProcessInfo(this.currentPage, this.pageSize);
        } else {
          this.$message.error(res.data.msg);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async entityExtract(data) {
      try {
        let res = await eesApi.entityExtract(data);
        if (res.data.code == "200") {
          this.$message.success(res.data.msg);
          this.getPlanProcessInfo(this.currentPage, this.pageSize);
        } else {
          this.$message.error(res.data.msg);
        }
      } catch (error) {
        this.$message.error("服务器开小差了");
        console.log(error);
      }
    },
    async dutyEventExtract(data) {
      try {
        let res = await eesApi.dutyEventExtract(data);
        if (res.data.code == "200") {
          this.$message.success(res.data.msg);
          this.getPlanProcessInfo(this.currentPage, this.pageSize);
        } else {
          this.$message.error(res.data.msg);
        }
      } catch (error) {
        this.$message.error("服务器开小差了");
        console.log(error);
      }
    },
    async knowledgeExtract(data) {
      try {
        let res = await eesApi.knowledgeExtract(data);
        if (res.data.code == "200") {
          this.$message.success(res.data.msg);
          this.getPlanProcessInfo(this.currentPage, this.pageSize);
        } else {
          this.$message.error(res.data.msg);
        }
      } catch (error) {
        this.$message.error("服务器开小差了");
        console.log(error);
      }
    },
    async synchronizeDataToNeo4j(data) {
      try {
        let res = await eesApi.synchronizeDataToNeo4j(data);
        if (res.data.code == "200") {
          this.$message.success('图谱构建已提交');
          this.getPlanProcessInfo(this.currentPage, this.pageSize);
        } else {
          this.$message.error(res.data.msg);
        }
      } catch (error) {
        this.$message.error(error);
        console.log(error);
      }
    },
    handleSubmit(data) {
      this.$confirm("预案提交后不可修改，确认提交？", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.initPlanContent(data.planTitle);
        })
        .catch(() => {});
    },
    getEntityAlignmentByFlag() {
      console.log("change");
      this.currentTableRow.sortName = "sync_flag";
      this.currentTableRow.search = this.dialogInput || null;
      this.currentTableRow.syncFlag = this.syncFlag;
      this.currentTableRow.page = this.gridCurrentPage;
      this.currentTableRow.pageSize = this.gridPageSize;
      this.getEntityAlignment(this.currentTableRow);
    },
    // 获取实体对齐的候选列表
    async querySearch(row,cb) {
      let res = await eesApi.getRecommendAgencyList({
        planName:this.currentTableRow.planTitle,
        entityName:row.entityName
      })
      if(res.data.code == 200) {
        let results = res.data.data.map(i => {return {value:i.targetName}})
        cb(results)
      } else {
        cb([])
      }
      
    },
    async nextPage() {
      await this.getPlanProcessInfo(this.currentPage + 1, this.pageSize);
      this.currentPage = this.currentPage + 1;
    },
    async prevPage() {
      await this.getPlanProcessInfo(this.currentPage - 1, this.pageSize);
      this.currentPage = this.currentPage - 1;
    },
    async gotoPage(arg) {
      console.log(arg);
      await this.getPlanProcessInfo(arg - 1, this.pageSize);
      this.currentPage = arg - 1;
    },
    async nextGridPage() {
      this.currentTableRow.page = this.currentTableRow.page + 1;
      await this.getEntityAlignment(this.currentTableRow);
      // this.gridCurrentPage = this.gridCurrentPage + 1;
    },
    async prevGridPage() {
      this.currentTableRow.page = this.currentTableRow.page - 1;
      await this.getEntityAlignment(this.currentTableRow);
      // this.gridCurrentPage = this.gridCurrentPage - 1;
    },
    async gotoGridPage(arg) {
      this.currentTableRow.page = arg - 1;
      await this.getEntityAlignment(this.currentTableRow);
      // this.gridCurrentPage = arg - 1;
    },

    async agencyEntityAlignment(data, operate) {
      console.log(data);
      const _data = Object.assign({}, data);
      // _data.entityAlignmentReflection = _data._entityAlignmentReflection
      if (operate == "confirm") {
        if (_data.entityAlignmentReflection) {
          _data.syncFlag = 2;
        } else {
          _data.syncFlag = 1;
        }
      } else if (operate == "delete") {
        _data.syncFlag = 3;
      }

      try {
        let res = await eesApi.agencyEntityAlignment(_data);
        if (res.data.code == "200") {
          this.$message.success(res.data.msg);
          this.getEntityAlignment(this.currentTableRow);
        } else {
          this.$message.error(res.data.msg);
        }
      } catch (error) {
        console.log(error);
      }

      // this.$axios({
      //   method: "post",
      //   url: "/plan/EmergencyPlanKnowledgeService/agencyEntityAlignment",
      //   params: _data,
      // }).then((res) => {
      //   console.log(res);
      //   if (res.status == 200) {
      //     data.entityAlignmentReflection = _data.entityAlignmentReflection;
      //     data.syncFlag = _data.syncFlag;
      //   }
      // });
    },
  },
};
</script>

<style lang='scss' scoped>
.container {
  width: 100%;
  height: 100%;
}
.main {
  padding: 0.4rem;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .el-input {
      width: 2rem;
    }
    .el-button {
      font-size: 0.14rem;
    }
  }
  .el-table {
    margin-top: 0.2rem;
    font-size: 0.14rem;
    .cell {
      line-height: 1.5 !important;
    }
    .el-button {
      font-size: 0.14rem;
    }
  }
  .page-pagination {
    text-align: center;
    margin-top: 50px;
    // position: fixed;
    // bottom: 1rem;
    // left: 50%;
    // transform: translateX(-50%);
  }
}

.el-dialog {
  .el-table {
    margin-top: 0;
  }
  .el-pagination {
    margin-top: 0.2rem;
    text-align: center;
  }
}
::v-deep .el-dialog .el-input__inner {
  text-align: center !important;
  font-size: 0.14rem !important;
}
::v-deep .el-link--primary {
  font-size: 0.14rem;
}
.dialog-title {
  font-size: 0.18rem;
  color: #101010;
}
.dialog-title:first-of-type {
  margin-bottom: 0.2rem;
}
</style>