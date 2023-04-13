<template>
  <div class="container">
    <!-- <div class="hint">预案提交后不可修改</div> -->
    
      <el-button
        class="goback"
        size="mini"
        icon="el-icon-arrow-left"
        style="margin-right: 10px"
        @click="$router.go(-1)"
        >返回</el-button
      >
    <el-form
      ref="form"
      :model="form"
      label-width="80px"
      size="small"
      :rules="rules"
    >
      <el-form-item label="预案标题" prop="planTitle">
        <el-input
          v-model="form.planTitle"
          placeholder="填写应急预案标题"
          :readonly="readonlyTitle"
        ></el-input>
      </el-form-item>

      <el-row>
        <el-col :span="8">
          <el-form-item label="发布年限" prop="publish">
            <el-date-picker
              :readonly="readonly"
              type="year"
              placeholder="选择年份"
              v-model="form.publish"
              style="width: 100%"
              value-format="yyyy"
            ></el-date-picker>
          </el-form-item>
        </el-col>

        <!-- <el-col class="line" :span="2">&nbsp;</el-col> -->
        <el-col :span="8">
          <el-form-item label="预案类别" prop="planType">
            <el-select
              v-model="form.planType"
              placeholder="请选择预案类别"
              style="width: 100%"
              :disabled="readonly"
            >
               <el-option
                :label="item"
                :value="item"
                v-for="(item, index) in planTypeList"
                :key="index"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="业务类别" prop="planServiceType">
            <el-select
              :disabled="readonly"
              v-model="form.planServiceType"
              placeholder="请选择业务类别"
              style="width: 100%"
              filterable
            >
              <el-option
                :label="item"
                :value="item"
                v-for="(item, index) in planCategoryList"
                :key="index"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-collapse v-model="activeName">
        <el-collapse-item title="预案总体" name="1">
          <el-form-item label="总体总则">
            <el-input
              :readonly="readonly"
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 30 }"
              v-model="form.summary"
              placeholder="总则：编制依据、适用范围、工作原则、事件分级、事件分类分级、事故分级、运营突发事件分级、基本情况、分级标准、分类分级等；"
            ></el-input>
          </el-form-item>
          <el-form-item label="组织体系">
            <el-input
              :readonly="readonly"
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 30 }"
              v-model="form.institution"
              placeholder="组织体系：领导机构、应急联动机构、指挥机构、职能部门、专家机构、工作机构、专家咨询机构、现场指挥部、市应急处置指挥部、应急处置指挥机构、现场指挥机构、联动机构、市工作组成员单位及职责、办事机构等；"
            ></el-input>
          </el-form-item>
          <el-form-item label="总体评估">
            <el-input
              :readonly="readonly"
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 30 }"
              v-model="form.evaluation"
              placeholder="总结与评估、恢复评估、突发事件成因评估"
            ></el-input>
          </el-form-item>
        </el-collapse-item>
        <el-collapse-item title="事前阶段" name="2">
          <el-form-item label="预警预防">
            <el-input
              :readonly="readonly"
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 30 }"
              v-model="form.forecastAlarm"
              placeholder="预测预防、预警行动、风险分析、预警级别与发布、预警解除、预防措施、预警级别划分、预警响应、预警响应行动、信息报告、预警、预警分级、信息收集、预测预警、举报制度、预防预警信息、预防预警行动、主要防御方案、预警与发布、预防、预警信息发布、分类处置、应急资源调查、航空器事故预警、气象灾害预警、其它预警、预防预测、预警发布与解除"
            ></el-input>
          </el-form-item>
          <el-form-item label="监测预警">
            <el-input
              :readonly="readonly"
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 30 }"
              v-model="form.monitoringPrevention"
              placeholder="信息监测、预警机制、监测和预警、监测预报、监测预警、信息监测与通报、预警级别、预警发布、预防监测、预警监测、预警信息发布、预警级别与发布、信息监测与监控、预警分级、预警解除、预警变更和解除、预警监测、预警级别调整、监测、监测预防、趋势预测、预防行动、监测与评估"
            ></el-input>
          </el-form-item>
          <el-form-item label="应急准备">
            <el-input
              :readonly="readonly"
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 30 }"
              v-model="form.emergencyPrepare"
              placeholder="预案及方案制订、培训和演练、物资准备、宣传教育、督导与评估"
            ></el-input>
          </el-form-item>
        </el-collapse-item>
        <el-collapse-item title="事中阶段" name="3">
          <el-form-item label="信息处置">
            <el-input
              :readonly="readonly"
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 30 }"
              v-model="form.infoProcess"
              placeholder="信息报送、信息报告、信息通报与发布、灾情报告、信息发布、监测预报、信息报告与通报、信息发布、事故报告与通报、事故评估、检测分析评估"
            ></el-input>
          </el-form-item>
          <el-form-item label="应急处置">
            <el-input
              :readonly="readonly"
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 30 }"
              v-model="form.emergencyProcess"
              placeholder="先期处置、应急响应、应急指挥与协调、应急结束、分级响应、信息报告与通报、专业处置措施、区域隔离与防备、响应措施、即时处置、安全防护、指挥与协调、新闻发布、医疗卫生救助、环境监测、应急人员的安全防护、群众的安全防护、动员社会力量参与、事故现场检测与评估、专业处置、应急处置措施、响应级别调整及终止、响应分级、社会力量动员、现场指挥与处置、信息共享与处理、应急指挥、疏散撤离、避难场所启用、应急联动处置、应急指令、现场组织、现场指挥所标识、现场管理、机场关闭与开放、运行区域保护、通信组织、公共交通保障"
            ></el-input>
          </el-form-item>
          <el-form-item label="应急响应">
            <el-input
              :readonly="readonly"
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 30 }"
              v-model="form.emergencyResponse"
              placeholder="应急响应措施、应急安全防护、启动条件、启动程序、响应措施、响应终止、报告与通报、分级响应、应急处置、人员防护、响应等级、先期处置、现场处置、扩大响应与应急处置、信息共享和处理、应急结束、响应分级、响应启动、应急响应终止、应急终止、响应升级、应急响应启动、现场医疗卫生救援、医疗机构救治、疾病预防控制和卫生监督、信息报告及通报、应急响应原则、IV级应急响应阶段、III级应急响应阶段、II级应急响应阶段、I级应急响应阶段、应急响应的级别调整与终止、应急响应执行与监督、应急响应总体要求、应急响应分级与行动、主要应急响应措施、应急响应的组织工作、技术实施、分级响应和应急处置、地方政府财政重整计划、舆论引导"
            ></el-input>
          </el-form-item>
          <el-form-item label="风险评估">
            <el-input
              :readonly="readonly"
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 30 }"
              v-model="form.riskAnalysis"
              placeholder="区内企业、重大危险源、周边区域、预案培训和风险演练评估，风险评估、风险防控、债务风险事件级别划分"
            ></el-input>
          </el-form-item>
        </el-collapse-item>
        <el-collapse-item title="事后阶段" name="4">
          <el-form-item label="应急保障">
            <el-input
              :readonly="readonly"
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 30 }"
              v-model="form.safeguard"
              placeholder="资金保障、物资保障、通信和信息保障、装备和设施保障、人员保障、社会动员保障、科技保障、应急队伍保障、经费保障、科技支撑、人员安全防护、应急资源保障、通信保障、医疗保障、治安保障、安全保障、通信/文电/技术/人力资源保障、完善规定、社会监督、宣传教育、队伍保障、交通保障、技术保障、交通运输保障、装备物资保障、医疗卫生保障、紧急安置场所保障、社会动员、治安维护、信息保障、工程保障、医疗救治保障、装备保障、救援装备保障、技术储备与保障、应急物资和设备保障、宣传、培训和演练、物资装备保障、信息通信保障、人员及技术保障、物资与经费保障、监测与预警能力保障、通信与信息保障、医疗和治安保障、指挥平台保障、物资与资金保障、避难场所保障、基础设施保障、公共信息保障、自然环境监测、宣传与演练、抢险与救援保障、专业保障、治安与医疗保障、通信与装备保障、气象技术保障、应急物资保障、治安维护保障、通信信息保障、人力保障、资源保障、责任追究、信息系统保障、基本生活保障、人员防护、通讯保障、工程维护、信息通讯保障"
            ></el-input>
          </el-form-item>
          <el-form-item label="后期处置">
            <el-input
              :readonly="readonly"
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 30 }"
              v-model="form.afterwardsProcess"
              placeholder="后期处置、调查评估、过渡期生活救助、倒损住房恢复重建、善后处置、调查总结、新闻发布、获救人员安置、遇难人员处置、船舶、民用航空器残骸打捞、社会救助、保险理赔、调查评估、信息发布、现场清理、善后工作、事件调查、调查与评估、保险、事故调查、火灾事故调查、污染损害赔偿、回收污染物处置、恢复与重建、环境损害评估和调查、生态环境恢复、善后处理、征用补偿、事故调查与总结、救助与补偿、调查和总结、总结评估、恢复生产、灾害补偿、后期评估、抚恤和补助、征用物资、劳务补偿、奖惩、总结、赔偿与补偿、保险与理赔、灾后救助、抢险物资补充、水毁工程修复、灾后重建、保险与补偿、总结与评估、人员返回、债务风险事件应急处置记录及总结、评估分析、保险与救助、人员安置和家属接待、受损设施恢复、调查与总结、新闻和信息管理"
            ></el-input>
          </el-form-item>
        </el-collapse-item>
        <el-collapse-item title="附件" name="5">
          <el-form-item label="附则">
            <el-input
              :readonly="readonly"
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 30 }"
              v-model="form.addition"
              placeholder="事故特征分类、名词术语解释、名词定义、预案解释"
            ></el-input>
          </el-form-item>
          <el-form-item label="附件">
            <el-input
              :readonly="readonly"
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 30 }"
              v-model="form.appendix"
              placeholder="分级标准、相关单位及职责"
            ></el-input>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>
    <div class="btn" v-if="$route.query.processStatus == 0 || !$route.query.processStatus">
      <!-- <el-button type="primary" @click="init">提交</el-button> -->
      <el-button @click="save" type="primary">保存</el-button>
      <el-button @click="clear" type="danger">清空</el-button>
      <el-button @click="$router.go(-1)">取消</el-button>
    </div>
  </div>
</template>

<script>
import { eesApi, ecrApi } from "@/api";
export default {
  name: "addPlan",
  data() {
    return {
      form: {},
      readonly: false,
      readonlyTitle: false,
      activeName: "1",
      planTypeList:[],
      planCategoryList: [],
      rules: {
        planTitle: [
          { required: true, message: "请输入预案标题", trigger: "change" },
        ],
        planServiceType: [
          { required: true, message: "请选择业务类别", trigger: "change" },
        ],
        planType: [
          { required: true, message: "请选择预案类别", trigger: "change" },
        ],
        publish: [
          { required: true, message: "请选择发布年限", trigger: "change" },
        ],
      },
    };
  },
  created() {
    this.init();
    this.getPlanTypeTable()
    this.getPlanCategoryList();
  },
  methods: {
    init() {
      if (this.$route.query.planTitle) {
        this.getPlanContent();
        // this.readonlyTitle = true;
        if (this.$route.query.processStatus == 0) {
          this.readonlyTitle = true;
        } else {
          this.readonlyTitle = true;
          this.readonly = true;
        }
      }
      if(this.$route.query.serviceCategory) {
        this.form.planServiceType = this.$route.query.serviceCategory
      }
    },
    async getPlanTypeTable() {
      try {
        let res = await ecrApi.getPlanTypeTable();
        if (res.data.code == "200") {
          this.planTypeList = res.data.data.map((item) => {
            return item.planType
          });
        } else {
          this.$message.error(res.data.msg);
        }
      } catch (error) {
        console.log(error);
        this.$message.error("获取预案类别列表失败");
      }
    },
    async getPlanCategoryList() {
      try {
        let res = await eesApi.getPlanCategoryList();
        if (res.data.code == "200") {
          this.planCategoryList = res.data.data;
        } else {
          this.$message.error(res.data.msg);
        }
      } catch (error) {
        console.log(error);
        this.$message.error("获取业务类别列表失败");
      }
    },
    async getPlanContent() {
      try {
        let res = await eesApi.getPlanContent({
          planTitle: this.$route.query.planTitle,
        });
        if (res.data.code == "200") {
          this.$message.success(res.data.msg);
          this.$nextTick(() => {
            this.form = res.data.data;
            this.form.publish = new Date(res.data.data.publish.toString());
            delete this.form.updateTime;
            delete this.form.createTime;
          });
        } else {
          this.$message.error(res.data.msg);
        }
      } catch (error) {
        this.$message.error("获取失败");
      }
    },
    async savePlanContent() {
      const _form = Object.assign({}, this.form);
      console.log(typeof _form.publish);
      if (typeof _form.publish != "string") {
        // 弃用getYear
        _form.publish = _form.publish.getFullYear();
        console.log(_form.publish);
      }
      try {
        let res = await eesApi.savePlanContent(_form);
        if (
          res.data.code == "200" ||
          res.data.code == "201" ||
          res.data.code == "203"
        ) {
          this.$message.success(res.data.msg);
          this.$router.push({ name: "planadmin" });
        } else {
          this.$message.error(res.data.msg);
        }
      } catch (error) {
        this.$message.error("保存失败");
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$confirm("确认保存？", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              this.savePlanContent();
            })
            .catch(() => {});
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName] && this.$refs[formName].resetFields();
    },
    cancel(formName) {
      this.resetForm(formName);
    },
    save() {
      // const _form =
      this.submitForm("form");
    },
    clear() {
      // this.$nextTick(() => {
      //   this.resetForm("form");
      // })
      const _planTitle = this.form.planTitle
      this.form={}
      this.form.planTitle = _planTitle
    },
  },
};
</script>

<style lang='scss' scoped>
.container {
  margin: 0 auto;
  width: 50%;
  margin-top: 40px;
  text-align: center;
  font-size: 0.14rem;
  .goback {
    position: fixed;
    top: 0.8rem;
    left: 30px;
  }
  .btn {
    height: 70px;
    line-height: 70px;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    z-index: 1;
  }
}
// ::v-deep .el-form {
//   font-size: .14rem;
// }
.el-collapse {
  border: none;
}
::v-deep .el-collapse-item__wrap {
  border: none;
}
::v-deep .el-collapse-item__header {
  justify-content: center;
  color: #1890ff;
  border-bottom: none;
  font-size: 16px;
}
::v-deep .el-collapse-item__arrow {
  margin: 0;
}
::-webkit-scrollbar { width: 0 }
</style>