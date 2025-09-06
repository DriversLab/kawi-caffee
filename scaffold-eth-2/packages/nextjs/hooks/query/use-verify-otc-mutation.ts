import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useVerifyOtcMutation = () => {
    return useMutation({
        mutationKey: ["verify", "otc"],
        mutationFn: async (code: string) => {
            return await axios.post("http://localhost:3001/verify", {
                code: code,
                key: "kawi_code",
            });
        },
    });
};
