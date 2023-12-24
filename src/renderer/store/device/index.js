import apiClient from '@/services/axios';
import { notification } from 'ant-design-vue'
import router from '@/router'
import { encrypt64, decrypt64 } from '~/encryption'

const apiPrefix = '/devices';
const targetapiPrefix = '/targets';
export default {
  namespaced: true,
  state: {
    list: [],
    count: 0,
    device: {
      os_info: {},
      installed_apps: []
    },
    os_type: ''
  },
  mutations: {
    SET_STATE(state, payload) {
      Object.assign(state, {
        ...payload,
      })
    },
  },
  actions: {
    SET_TYPE( { commit, dispatch }, {payload}) {
      commit('SET_STATE', { os_type: payload })
    },
    SET_CATEGORY( { commit, dispatch }, {payload}) {
      commit('SET_STATE', { category_id: payload })
    },
    GET_ALL({commit, rootState}, {payload}) {
      const { system_id, pageNumber = 1, itemsPerPage = 10, query_search = '', catquery_search = '', sortKey = '', descSort = ''} = payload;
      commit('user/SET_STATE', {fetchLoading: true}, {root: true});
      apiClient.get(`${targetapiPrefix}/system/${system_id}?pageNumber=${pageNumber}&itemsPerPage=${itemsPerPage}&query_search=${query_search}&catquery_search=${catquery_search}&sortKey=${sortKey}&descSort=${descSort}`).then(response => {
        const {result, statusCode} = response.data
        // console.log("result: ", result);
        if (statusCode == 200) {
          commit('SET_STATE', {list: result.rows, count: result.count})
        }
        commit('user/SET_STATE', {fetchLoading: false}, {root: true})
      }).catch(err => {
        commit('user/SET_STATE', {fetchLoading: false}, {root: true})
      })
    },
    GET_BY_ID({commit, rootState}, {payload}) {
      const {id} = payload;
      if(id == 'new'){
        commit('SET_STATE', { device:{}})
        return 
      }
      commit('user/SET_STATE', {fetchLoading: true}, {root: true});
      apiClient.get(`${apiPrefix}/${id}`).then(response => {
        const {result, statusCode} = response.data
        if (statusCode == 200) {
          var Result = result
          if(result.info!=null){
          Result.categoryname = result.info.CATEGORYNAME
          }
          if(result.os_info==null){
            Result.os_info = {}
            }
          if(result.password!=""){
            Result.password = decrypt64(result.password); 
          }
          commit('SET_STATE', {device: Result, os_type: result.os_type})
        }
        commit('user/SET_STATE', {fetchLoading: false}, {root: true})
      }).catch(err => {
        commit('user/SET_STATE', {fetchLoading: false}, {root: true})
      })
    },
    ADD({commit, rootState}, {payload}) {
      const data = payload;
      commit('user/SET_STATE', {fetchLoading: true}, {root: true});
      apiClient.post(`${apiPrefix}`, data).then(response => {
        const {result, statusCode} = response.data
        if (statusCode == 200) {
          router.push(`/device/profile/${result.id}`)
          notification.success({
            message: `Successfully added the device`,
            description: ``,
          })
        }
        commit('user/SET_STATE', {fetchLoading: false}, {root: true})
      }).catch(err => {
        commit('user/SET_STATE', {fetchLoading: false}, {root: true})
      })
    },
    UPDATE({commit, rootState}, {payload}) {
      const {id, ...data} = payload;
      commit('user/SET_STATE', {fetchLoading: true}, {root: true});
      apiClient.put(`${apiPrefix}/${id}`, data).then(response => {
        const {result, statusCode} = response.data
        if (statusCode == 200) {
          notification.success({
            message: 'Successfully updated the device',
            description: '',
          })
        }
        commit('user/SET_STATE', {fetchLoading: false}, {root: true})
      }).catch(err => {
        commit('user/SET_STATE', {fetchLoading: false}, {root: true})
      })
    },
    DELETE({commit, rootState}, {payload}) {
      const {id} = payload;
      commit('user/SET_STATE', {fetchLoading: true}, {root: true});
      apiClient.delete(`${apiPrefix}/${id}`).then(response => {
        const {result, statusCode} = response.data
        if (statusCode == 200) {
          notification.success({
            message: 'Successfully deleted the device',
            description: '',
          })
        }
        commit('user/SET_STATE', {fetchLoading: false}, {root: true})
      }).catch(err => {
        commit('user/SET_STATE', {fetchLoading: false}, {root: true})
      })
    },

  },
  getters: {
    device: (state) => state,
  },
}
