import axios from 'axios'
import { API_BASE_URL } from '@/constants/api.constants'
import { setupInterceptors } from './interceptors'

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

setupInterceptors(httpClient)
