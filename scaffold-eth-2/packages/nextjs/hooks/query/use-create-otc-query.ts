/* eslint-disable prettier/prettier */
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useCreateOtcQuery = () => {
    return useQuery({
        queryKey: ["get-otc"],
        queryFn: async () => {
            return await axios.post('http://localhost:3001/create', {
                key: "kawi_code"
            }, {
                headers: {
                    "x-user-email": "kingdruid1962@gmail.com"
                }
            }).then(data => data.data);
        }
    })
} 
