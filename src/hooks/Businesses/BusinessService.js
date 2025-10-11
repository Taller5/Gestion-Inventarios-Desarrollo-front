import { fetchBusinesses } from "./BusinessApi";

export const getBusinesses = async () => {
    return await fetchBusinesses();
};