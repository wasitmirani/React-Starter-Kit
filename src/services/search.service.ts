import axios from "axios";


export const searchService = {

    async search(url: string, query: string) {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/${url}?${query}`);
        return response.data;
    }
}