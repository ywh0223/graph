import { axiosEks } from './config'
import qs from 'qs'

const eksApi = {}

eksApi.createPlanEntity = (params) => {
  return axiosEks({
    url: '/createPlanEntity',
    method: 'put',
    params
  })
}
eksApi.createPlanRelation = (params) => {
  return axiosEks({
    url: '/createPlanRelation',
    method: 'put',
    params
  })
}
eksApi.getEntityByKeywordAndCategory = (params) => {
  return axiosEks({
    url: '/getEntityByKeywordAndCategory',
    method: 'get',
    params
  })
}
eksApi.getFirstDetailsWithServiceCategory = (params) => {
  return axiosEks({
    url: '/getFirstDetailsWithServiceCategory',
    method: 'get',
    params
  })
}
// 模糊查询业务类别或预案
eksApi.getCategoryOrPlanLikeKeyword = (params) => {
  return axiosEks({
    url: '/getCategoryOrPlanLikeKeyword',
    method: 'get',
    params
  })
}
eksApi.getCategoryByPlanName = (params) => {
  return axiosEks({
    url: '/getCategoryByPlanName',
    method: 'get',
    params
  })
}
eksApi.getServiceCategoryByEmergencyEvent = (params) => {
  return axiosEks({
    url: '/getServiceCategoryByEmergencyEvent',
    method: 'get',
    params,
    paramsSerializer: function(p) { //固定写法
      return qs.stringify(p, {arrayFormat: 'repeat'})
    }
  })
}
eksApi.getFirstDetailsWithEmergencyPlan = (params) => {
  return axiosEks({
    url: '/getFirstDetailsWithEmergencyPlan',
    method: 'get',
    params
  })
}
eksApi.getFirstDetailsWithGovernmentAgency = (params) => {
  return axiosEks({
    url: '/getFirstDetailsWithGovernmentAgency',
    method: 'get',
    params
  })
}
eksApi.deletePlanEntity = (params) => {
  return axiosEks({
    url: '/deletePlanEntity',
    method: 'delete',
    params
  })
}
eksApi.updateServiceCategoryAttributes = (params) => {
  return axiosEks({
    url: '/updateServiceCategoryAttributes',
    method: 'post',
    params
  })
}
eksApi.updateEmergencyPlanAttributes = (params) => {
  return axiosEks({
    url: '/updateEmergencyPlanAttributes',
    method: 'post',
    params
  })
}
eksApi.updateDisposalElementAttributes = (params) => {
  return axiosEks({
    url: '/updateDisposalElementAttributes',
    method: 'post',
    params
  })
}
eksApi.updateGovernmentAgencyAttributes = (params) => {
  return axiosEks({
    url: '/updateGovernmentAgencyAttributes',
    method: 'post',
    params
  })
}
eksApi.updateServiceOrganizationAttributes = (params) => {
  return axiosEks({
    url: '/updateServiceOrganizationAttributes',
    method: 'post',
    params
  })
}
eksApi.updateStandardDefinitionAttributes = (params) => {
  return axiosEks({
    url: '/updateStandardDefinitionAttributes',
    method: 'post',
    params
  })
}

// 根据事件类别查询业务类别
eksApi.getServiceCategoryWithEventLabel = (params) => {
  return axiosEks({
    url: '/getServiceCategoryWithEventLabel',
    method: 'get',
    params
  })
}
// 根据业务类别实体编号绑定事件类别
eksApi.setEventLabelWithServiceCategoryEntityId = (params) => {
  return axiosEks({
    url: '/setEventLabelWithServiceCategoryEntityId',
    method: 'post',
    params
  })
}
// 处置要素为中心实体索引一度关系
eksApi.getFirstDetailsWithPlanElement = (params) => {
  return axiosEks({
    url: '/getFirstDetailsWithPlanElement',
    method: 'get',
    params
  })
}
export default eksApi